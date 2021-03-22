require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');
var stripe = require('stripe')(process.env.STRIPE_KEY_SK);
const axios = require('axios');


router.post('/profile/updateCompany',authCheck,async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
    await db.changeAccountType(myuserid);
	res.json({status:true})
})

router.post('/profile/updatecustomer',authCheck,async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	await db.updateCustomerDetailsNoAddr(myuserid,c.title,c.forename,c.lastname,c.middlename,c.mobile)
	res.json({status:true})
})

router.post('/profile/addHistoryAddr',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	console.log(req.body.startMonth)
	var results = await db.addHistoryAddr(myuserid,req.body.address,req.body.startYear,req.body.startMonth)
	var addrs = await db.getAddressHistoryByUserId(myuserid)
	res.json({status:true,addrs})
});
router.post('/profile/updatecustomeraddress',authCheck,async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	await db.updateCustomerAddress(myuserid,c.address)
	res.json({status:true})
})


router.post('/profile/updateverificationcustomer',async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var mydob = null
	if(c.dob){
		mydob = c.dob
	}
	console.log(mydob)
	var results = await db.updateCustomerVerificationDetails(myuserid,mydob,c.nino,c.driving,c.passport)
	res.json({status:true})
})

router.post('/profile/deleteAddr',async(req,res)=>{
	var c = req.body
	var myuserid = req.session.userid;
	if(req.session.memberid){
		myuserid = req.session.memberid;	
	}
	var mydob = null
	if(c.dob){
		mydob = c.dob
	}
	console.log(mydob)
	var addrid = req.body.id;
	var results = await db.deleteCustomerAddressHistory(myuserid,addrid)
	var addrs = await db.getAddressHistoryByUserId(myuserid)
	res.json({status:true,addrs})
})

module.exports = router;