require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');
var stripe = require('stripe')(process.env.STRIPE_KEY_SK);
const axios = require('axios');
const ejs_helpers = require('../custom/helper_ejs.js')
router.get('/portal',authCheck, (req, res) => {
	
	res.redirect('/portal/dashboard');
});

router.get('/portal/dashboard',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var auctionsresults = await db.getAuctions()
	res.render('portal/dashboard',{msg:'',menusel:1,customer,auctions:auctionsresults});
});

router.get('/portal/company',authCheck, async (req, res) => {
	var results = await db.getCustomerById(req.session.userid)
	var customer= results[0]
	var company = null;
	var members = []
	if(customer.companyid){
		var companies = await db.getCompanyById(customer.companyid)
		company = companies[0];
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}

	res.render('portal/company',{customer:customer,company:company,members:members,menusel:4});
});
router.post('/member/addmember',authCheck, async (req, res) => {
    var results = await db.getCustomerById(req.session.userid)
	var customer= results[0]
    var success = await db.addNewCompanyMember(req.body.email,customer.companyid);
	res.json({status:true})
});

router.get('/portal/addCompanyMember',authCheck, async (req, res) => {
	var results = await db.getCustomerById(req.session.userid)
	var customer= results[0]
	res.render('portal/addMember',{customer})
});


router.get('/portal/property/:id',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var apikey = process.env.GOGGLEMAPS_API
    var lot = await db.getPropertyById(req.params.id)
    var images = await db.getPropertyImagesById(req.params.id)
	images = await getImages(images,'filename')
    var maps = await db.getPropertyMapsById(req.params.id)
    maps.forEach(i=>{
        i.uri = azBlob.generateSasToken(i.filename).uri;
      })
      var catalogs = await db.getPropertyCatalogById(req.params.id)
      catalogs.forEach(i=>{
        i.uri = azBlob.generateSasToken(i.filename).uri;
      })
    var details = await db.getPropertyDetailsById(req.params.id)
    var property = lot[0]
    var isAdded = false
    if(req.session.userid){
        var dbres =  await db.getSellerFavourites(req.session.userid,req.params.id)
        if(dbres.length) isAdded = true;
		biddeposit = dbres[0].bid_deposit;
    }
    res.render('portal/property',{biddeposit,property,images,details,isAdded,maps,catalogs,apikey,customer,helper:ejs_helpers});
});

router.get('/portal/properties',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var lots = await db.getPropertiesByUserId(req.session.userid);

	  lots = await getImages(lots,'img')
	res.render('portal/properties',{lots:lots,menusel:2,customer});
});
router.get('/portal/myaccount',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	res.render('portal/myaccount',{menusel:7,customer});
});

var config = {
	headers: { 'Authorization': 'Basic c2tfdGVzdF82Ym5DT1pkV3UxbEhyYjZIaUpHRVlpNjI6'}
  };
async function getPaymentDetails(paymentid){

	return new Promise((resolve,reject)=>{
		axios.get('https://api.stripe.com/v1/charges',config).then(function (response) {
			var mycharge = undefined
			var charges = response.data.data
			charges.forEach(c=>{
				if(c.payment_method==paymentid){
					mycharge = c;
				}
			})
			resolve(mycharge);
		})
		.catch(function (error) {
		//	console.log(error);
			resolve(error)
		});
	})
}


router.get('/portal/deposits',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	var payments = await db.getPayments(req.session.userid)
	for(var j = 0; j<payments.length; j++){
		var tmpPayment = payments[j];
		console.log(tmpPayment)
		if(tmpPayment.status){
		tmpPayment.details = await getPaymentDetails(tmpPayment.stripeid)
		console.log('==========================')
		console.log(tmpPayment)
		console.log('==========================')
		}
	}
	var lots = await db.getPropertiesByUserId(req.session.userid);
	var total = 0
    lots.forEach(p=>{
		if(p.bid_interest){		
			total+=p.price
		}
      })
	  lots = await getImages(lots,'img')
	  if(total<3){
		  total = 3;
	  }
	  total= total*10/100;
	  amount= parseInt(total *100);
	  
	  var paymentIntent = await stripe.paymentIntents.create({amount:amount,currency: 'gbp', payment_method_types: ['card'],capture_method: 'manual'});
	  console.log(paymentIntent)
	res.render('portal/deposits',{customer,total:total,lots:lots,payments,paymentIntent:paymentIntent,total,menusel:5});
});
router.get('/portal/amlchecks',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	if(members.length<=0){
		members = await db.getCustomerById(myuserid)
	}
	for(var i=0;i<members.length;i++){
		var m = members[i]
		m.amlCheck = await db.getAMLReportsByUser(m.id);
	}
	res.render('portal/amlchecks',{members,menusel:6});
});

router.get('/portal/solicitor',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	if(members.length<=0){
		console.log('less then')
		members = await db.getCustomerById(myuserid)
	}
	var results =await db.getSolcitors(req.session.userid)
	var solictorid = 0;
	var name = '';
	var firm = '';
	var telephone = '';
	var email = '';
	var address = '';
	if(results.length){
			solictorid = results[0].id;
			name = results[0].name;
			firm = results[0].firm;
			telephone = results[0].telephone;
			email = results[0].email;
			address = results[0].address;
	}
	res.render('portal/solicitordetails',{members,customer:customer,solictorid,name,firm,telephone,email,address,mysel:5,menusel:3});
});

router.post('/portal/updatesolictordetails',authCheck,async (req, res) => {
	console.log(req.body.solicitorid)
	var myid = req.body.solicitorid
	if(!Number(req.body.solicitorid)){
		console.log(req.session.userid)
		var results = await db.insertSolictorDetails(req.session.userid,req.body.firm,req.body.name,req.body.telephone,req.body.email,req.body.address)
		myid = results.insertId;
	}else{
		console.log('UPDATE SOLIC')
		var results = await db.updateSolictorDetails(req.body.solicitorid,req.body.firm,req.body.name,req.body.telephone,req.body.email,req.body.address)

	}
	res.json({status:true,solicitorid:myid});
});
router.get('/portal/profile',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	var addrs = await db.getAddressHistoryByUserId(myuserid)
	var amlchecks = await db.getAMLReportsByUser(myuserid)
	res.render('portal/profile',{customer,amlchecks,addrs,members:members,mysel:1,menusel:3});
});
router.get('/portal/profileedit',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	var addrs = await db.getAddressHistoryByUserId(myuserid)
	var amlchecks = await db.getAMLReportsByUser(myuserid)
	res.render('portal/profileedit',{customer,amlchecks,addrs,members:members,mysel:1,menusel:3});
});

router.get('/portal/verificationdetails',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	res.render('portal/verification_details',{customer:customer,members:members,mysel:3,menusel:3});
});
router.get('/portal/company',authCheck, async (req, res) => {
	var results = await db.getCustomerById(req.session.userid)
	var customer= results[0]
	var company = null;
	var members = []
	if(customer.companyid){
		var companies = await db.getCompanyById(customer.companyid)
		company = companies[0];
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}

	res.render('portal/company',{customer:customer,company:company,members:members,menusel:4});
});
router.post('/portal/changeactivemember',authCheck,async (req,res)=>{
	req.session.memberid = req.body.memberid;
	res.json({status:true})
})
router.get('/portal/addresshistory',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	var results = await db.getAddressHistoryByUserId(myuserid)
	res.render('portal/addresshistory',{addrs:results,members,customer,mysel:2,menusel:3});
});

router.get('/portal/addresshistory/:id',authCheck, async (req, res) => {
	var results = await db.getAddressHistoryById(req.params.id,req.session.userid)
	if(results[0]){
		res.render('portal/addresshistoryedit',{addr:results[0]});
	}else{
		res.json({'status':'NOT FOUND'})
	}
});
router.post('/portal/companyupdate',authCheck, async (req, res) => {
	var info = req.body;
	var results = await db.updateCompany(info.companyid,info.name,info.address,info.enitytype)
	res.json({status:true})
});
router.post('/portal/changeaccounttype',authCheck, async (req, res) => {
	var results = await db.changeAccountType(req.session.userid)
	res.json({status:true})
});
router.post('/portal/deleteHistoryAddr',authCheck,async (req,res)=>{
	var results = await db.delHistoryAddr(req.session.userid,req.body.id)
	res.json({status:true})
})
router.post('/portal/updateHistoryAddr',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.updateHistoryAddr(myuserid,req.body.id,req.body.address,req.body.startYear,req.body.startMonth)
	res.json({status:true})
});
router.get('/portal/addCompanyMember',authCheck, async (req, res) => {
	res.render('portal/addMember')
});


router.post('/addBidDeposit',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.addBidDeposit(req.session.userid,req.body.propertyid,1)
    res.json({succes:true})
})
router.post('/removeBidDeposit',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.addBidDeposit(req.session.userid,req.body.propertyid,0)
    res.json({succes:true})
})
router.post('/portal/fileuploaddetails',async(req,res)=>{
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	console.log('FILENAME:'+req.body.filename.name)
	var results = await db.addVerificationDocument(myuserid,req.body.doctype,req.body.filename.name)
	await db.updateCustomerDocusUploaded(myuserid);
	res.json({status:true})
})

router.post('/portal/updatecustomer',async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.updateCustomerDetails(myuserid,c.title,c.forename,c.surname,c.middlename,c.telephone,c.mobile,c.address)
	res.json({status:true})
})


router.get('/portal/lot/details/:id',async (req,res)=>{
    var apikey = process.env.GOGGLEMAPS_API
    var lot = await db.getPropertyById(req.params.id)
    var images = await db.getPropertyImagesById(req.params.id)
    if(!images.length){
        images.push({filename:'abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'})
    }
    images.forEach(i=>{
      i.uri = azBlob.generateSasToken(i.filename).uri;
    })
    var maps = await db.getPropertyMapsById(req.params.id)
    maps.forEach(i=>{
        i.uri = azBlob.generateSasToken(i.filename).uri;
      })
      var catalogs = await db.getPropertyCatalogById(req.params.id)
      catalogs.forEach(i=>{
        i.uri = azBlob.generateSasToken(i.filename).uri;
      })
    var details = await db.getPropertyDetailsById(req.params.id)
    var property = lot[0]
    var isAdded = false

	var biddeposit = false;
    if(req.session.userid){
        var dbres =  await db.getSellerFavourites(req.session.userid,req.params.id)
        if(dbres.length){ 
			isAdded = true;
		biddeposit = dbres[0].bid_deposit;
		}
    }
    res.render('portal/viewlot',{biddeposit,property,images,details,isAdded,maps,catalogs,apikey,menusel:2});
})
router.get('/portal/verificationdocs',authCheck, async (req, res) => {

	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var members = [];
	if(customer.companyid){
		members = await db.getCompanyMembersByCompanyId(customer.companyid)
	}
	var verificationDocTypes = await db.getVerificationDocumentTypes();
	var docs = await db.getVerificationDocument(myuserid)
	console.log(docs)
	docs = await getImages(docs,'name')
	console.log(docs)
	res.render('portal/verificationdocs',{verificationDocTypes,docs,members,customer,mysel:4,menusel:3});
});









async function getImages(list,key){
    for(var i=0;i<list.length;i++){
        var itm = list[i]
       // console.log(itm.img)
        if(!itm[key])itm[key] ='abc/fb2a4e95-d6e7-43e1-a438-c7889db6c029.jpg'
        var mytoken = await azBlob.generateSasToken(itm[key]);
        itm.uri =  mytoken.uri;
    }
    return list;
}




router.get('/legalpack/:id',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var apikey = process.env.GOGGLEMAPS_API
	var property = await db.getPropertyById(req.params.id)
	property = property[0]
	var legal_documents = await db.getDocuments(req.params.id);
	legal_documents = await getImages(legal_documents,'file')
	if(property.img){
	  var mysasToken =  await azBlob.generateSasToken(property.img)
	  property.primaryimgurl=mysasToken.uri;
	}
    res.render('legalpack/legalpack',{property,legal_documents,customer,helper:ejs_helpers});

});





module.exports = router;