require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');


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
	  lots = await azBlob.getFiles(lots,'img')
	  if(total<3){
		  total = 3;
	  }
	  total= total*10/100;
	  amount= parseInt(total *100);
	  
	  var paymentIntent = await stripe.paymentIntents.create({amount:amount,currency: 'gbp', payment_method_types: ['card'],capture_method: 'manual'});
	  console.log(paymentIntent)
	 
	res.render('portal/deposits',{customer,total:total,lots:lots,payments,paymentIntent:paymentIntent,total,menusel:5});
});

module.exports = router;