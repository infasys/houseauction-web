require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const authCheckNoLogIn = require('../custom/authCheck').authCheckNoLogIn;
const smtpManager = require('../custom/smtpManager');
const crypto = require('crypto');
const { encrypt, decrypt } = require('../custom/mycrypto');
const { json } = require('express');
const { title } = require('process');
const validator = require("email-validator");
const {v4:uuidv4} = require('uuid');


router.get('/account/log-in',authCheckNoLogIn ,(req,res)=>{
	var msg = req.session.loginmessage? req.session.loginmessage : ''
	var tmpuser = req.session.tmpusername? req.session.tmpusername : ''
	
    res.render('site/authentication/login.ejs',{message:msg,tmpuser})
})
router.get('/account/forgotten-password',authCheckNoLogIn ,(req,res)=>{
		var tmpuser = req.session.tmpusername? req.session.tmpusername : ''

    res.render('site/authentication/forgot.ejs',{tmpuser})
})

router.get('/pwa:id' ,authCheckNoLogIn,async (req,res)=>{
	delete req.session.loginmessage
	var base64enc = req.params.id
	try{
	console.log(base64enc)
	var stringencrypted = Buffer.from(base64enc, 'base64').toString('ascii')
	var hash = JSON.parse(stringencrypted)
	var decryptedobj = decrypt(hash)
	var info = JSON.parse(decryptedobj)
	}catch(ex){
		req.session.loginmessage = 'invalid code'
		res.redirect('/account/log-in');
	}
	
	if(info.userid){
		console.log(info)
		var results = await db.verifypasswordreset(info.userid,info.code);
		if(results.status== true){
			var myissues = []
			res.render('site/password_reset.ejs',{userid:info.userid,code:info.code,myissues});
		}else{
			req.session.loginmessage = 'invalid code'
		res.redirect('/account/log-in');
		}
	}else{
		req.session.loginmessage = 'invalid code'
		res.redirect('/account/log-in');
	}
})
router.post('/account/password-reset',authCheckNoLogIn ,async (req,res)=>{
	var issues = []
	var password = req.body.password
	var userid = req.body.userid
	var code = req.body.code
	if(password.length<5){
		issues.push('Password Length does not meet minimum requirement')
		errors++
		res.render('site/password_reset.ejs',{userid:info.userid,code:info.code,myissues:issues});
	}else{
		let hash = crypto.createHash('md5').update(password).digest("hex");
		await db.updateForgotenPassword(userid,code,hash)
		res.redirect('/account/log-in');
	}
})



router.get('/account/register',authCheckNoLogIn ,(req,res)=>{
	delete req.session.loginmessage;
	var myissues = []
	if(req.session.issues){
	 myissues = req.session.issues;
	}
	delete req.session.issues;
    res.render('site/authentication/register.ejs',{myissues})
})


router.get('/account/register_success',authCheckNoLogIn ,(req,res)=>{
	delete res.locals.registration
    res.render('site/authentication/regsuccess.ejs')
})


router.post('/account/forgot-password',async (req,res)=>{
	delete req.session.loginmessage;
	var email = req.body.Email;
	if(validator.validate(email)){
		req.session.loginmessage = 'If the email address matches an account you will recieve an email to reset your password.'
		var isExist = await db.checkUsername(email);
		if(isExist){
			var customer = await db.getCustomerByEmail(email)
			var myuuid = uuidv4()
			await db.addCustomerResetPassword(customer.id,myuuid)
			var myobj = {userid:customer.id,code:myuuid}
			var hashuserid = encrypt(JSON.stringify(myobj))
			var stringhash = JSON.stringify(hashuserid)
			var base64enc = Buffer.from(stringhash).toString('base64')
			smtpManager.forgot_password(email,base64enc)
		}
	}else{
		req.session.loginmessage = 'You provided an invalid email address'
	}
	res.redirect('/account/log-in');
})

router.get('/veri:id' ,async (req,res)=>{
	var base64enc = req.params.id
	console.log(base64enc)
	var stringencrypted = Buffer.from(base64enc, 'base64').toString('ascii')
	var hash = JSON.parse(stringencrypted)
	var decryptedobj = decrypt(hash)
	var info = JSON.parse(decryptedobj)
	console.log(info)
	if(info.userid){
		var results = await db.verifycode(info.userid,info.code);
		if(results.status== true){
			res.render('site/verified');
		}
	}
	//var userid = decrypt(req.params.id)
	res.json({status:true})
})

router.post('/account/verification_link',authCheckNoLogIn ,async (req,res)=>{
	var verificationCode = await db.getUserVerificationLink()
	res.json({status:true})
})

function generate(n) {
	var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

	if ( n > max ) {
			return generate(max) + generate(n - max);
	}

	max        = Math.pow(10, n+add);
	var min    = max/10; // Math.pow(10, n) basically
	var number = Math.floor( Math.random() * (max - min + 1) ) + min;

	return ("" + number).substring(add); 
}


router.post('/account/resendverifycode',authCheck ,async (req,res)=>{
	var userid = req.session.userid;
	console.log(userid)
	var code = generate(6)
	await db.updateVerificationCode(userid,code)
	var myobj = {userid,code}
	var hashuserid = encrypt(JSON.stringify(myobj))
	var stringhash = JSON.stringify(hashuserid)
	var base64enc = Buffer.from(stringhash).toString('base64')
	var customers = await db.getCustomerById(userid)
	var email = customers[0].username
	await smtpManager.verification_code(email,code,base64enc)
	res.json({status:true})
})


router.post('/account/register',authCheckNoLogIn,async (req,res)=>{
	delete req.session.registermessage;
	delete req.session.issues;
	var reg = req.body;

	var username = req.body.Email;
	var errors = 0;
	var issues = []
	if(!validator.validate(username)){
		issues.push('E-Mail address is not valid')
		errors++
	}
	if(req.body.Password.length<5){
		issues.push('Password Length does not meet minimum requirement')
		errors++
	}
	var userstatus = await db.checkUsername(req.body.Email);
	if(!userstatus.status){
		issues.push('User Already Exists')
		errors++
	}
	var code = generate(6)
	if(!errors){
		await db.addnewCustomer(reg,code)

		let hash = crypto.createHash('md5').update(reg.Password).digest("hex");
		var results = await db.getLogin(username,hash)
		if (results.length > 0) {
			req.session.loggedin = true;
			req.session.username = results[0]['username'];
			req.session.userid = results[0]['id'];
			delete req.session.loginmessage;
			var myobj = {userid:req.session.userid,code:code}
			var hashuserid = encrypt(JSON.stringify(myobj))
			var stringhash = JSON.stringify(hashuserid)
			var base64enc = Buffer.from(stringhash).toString('base64')
			smtpManager.new_registration(req.session.username,code,base64enc)
			res.redirect('/portal/dashboard');
		}else{
			issues.push('Something Went Wrong')
			req.session.issues = issues
			res.redirect('/account/register');
		}
	}else{
		req.session.issues = issues
		res.redirect('/account/register');
	}
})

router.post('/account/updatepassword',authCheck ,async(req,res)=>{
	await db.updatePassword(req.session.userid,req.body.password)
    res.json({status:true})
})
router.get('/account/log-out', (req, res) => {
	delete req.session.userid;
	delete req.session.username;
	delete req.session.loginmessage;
	delete req.session.memberid;
	res.redirect('/account/log-in');
  });

  router.post('/account/authenticate',async function(request, response) {
	delete request.session.loginmessage;
    console.log(request.body)
	var username = request.body.Email;
    var password = request.body.Password;
    request.session.tmpusername = username;
	let hash = crypto.createHash('md5').update(password).digest("hex");
	if (username && password) {
		var results = await db.getLogin(username,hash)
		if (results.length > 0) {
			request.session.loggedin = true;
			request.session.username = results[0]['username'];
			request.session.userid = results[0]['id'];
			delete request.session.loginmessage;
			delete request.session.tmpusername;
			response.redirect('/portal/dashboard');
		}else{
			request.session.loginmessage = "Incorrect Username and Password Combination";
		response.redirect('/account/log-in');
		response.end();
		}
	} else {
		request.session.loginmessage = "Details missing";
		response.redirect('/account/log-in');
		response.end();
	}
	console.log(hash)
});

router.post('/account/login_auth',async function(request, response) {
	delete request.session.loginmessage;
    console.log(request.body)
	var username = request.body.username;
    var password = request.body.password;
    
	let hash = crypto.createHash('md5').update(password).digest("hex");
	if (username && password) {
		var results = await db.getLogin(username,hash)
		if (results.length > 0) {
			request.session.loggedin = true;
			request.session.username = results[0]['username'];
			request.session.userid = results[0]['id'];
			delete request.session.loginmessage;
			response.json({status:true,message:''});
			response.end();
		}else{
			request.session.loginmessage = "Incorrect Username and Password Combination";
		response.json({status:false,message:"Incorrect Username and Password Combination"});
		response.end();
		}
	} else {
		request.session.loginmessage = "Details missing";
		response.json({status:false,message:''});
		response.end();
	}
	console.log(hash)
});

module.exports = router;