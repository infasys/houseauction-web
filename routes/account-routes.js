require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const authCheckNoLogIn = require('../custom/authCheck').authCheckNoLogIn;
const smtpManager = require('../custom/smtpManager');
const crypto = require('crypto');
const { json } = require('express');
const { title } = require('process');
const validator = require("email-validator");
router.get('/account/log-in',authCheckNoLogIn ,(req,res)=>{
	var msg = '';
	if(req.session.loginmessage){
		msg = req.session.loginmessage
	}
    res.render('site/login.ejs',{message:msg})
})
router.get('/account/forgotten-password',authCheckNoLogIn ,(req,res)=>{
    res.render('site/forgot.ejs')
})
router.get('/account/register',authCheckNoLogIn ,(req,res)=>{
	delete req.session.loginmessage;
	var myissues = []
	if(req.session.issues){
	 myissues = req.session.issues;
	}
	delete req.session.issues;
    res.render('site/register.ejs',{myissues})
})
router.get('/account/register_success',authCheckNoLogIn ,(req,res)=>{
	delete res.locals.registration
    res.render('site/regsuccess.ejs')
})
router.post('/account/forgot-password',authCheckNoLogIn ,(req,res)=>{
	console.log(req.body.Email)
	delete req.session.loginmessage;
	req.session.loginmessage = 'If the email address matches an account you will recieve an email to reset your password.'
	smtpManager.forgot_password(req.body.Email)
	res.redirect('/account/log-in');
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
	console.log(generate(7))
	if(!errors){
		await db.addnewCustomer(reg)

		let hash = crypto.createHash('md5').update(reg.Password).digest("hex");
		var results = await db.getLogin(username,hash)
		if (results.length > 0) {
			req.session.loggedin = true;
			req.session.username = results[0]['username'];
			req.session.userid = results[0]['id'];
			delete req.session.loginmessage;
			smtpManager.new_registration(req.session.username)
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
    
	let hash = crypto.createHash('md5').update(password).digest("hex");
	if (username && password) {
		var results = await db.getLogin(username,hash)
		if (results.length > 0) {
			request.session.loggedin = true;
			request.session.username = results[0]['username'];
			request.session.userid = results[0]['id'];
			delete request.session.loginmessage;
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