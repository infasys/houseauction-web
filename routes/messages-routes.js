require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');
const ejs_helpers = require('../custom/helper_ejs.js')

router.get('/messages',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
    res.render('messages/messages',{helper:ejs_helpers});

});
router.get('/messages/:id',authCheck, async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var apikey = process.env.GOGGLEMAPS_API
	var property = await db.getPropertyById(req.params.id)
	property = property[0]
	var legal_documents = await db.getDocuments(req.params.id);
	legal_documents = await azBlob.getFiles(legal_documents,'file')
	if(property.img){
	  var mysasToken =  await azBlob.generateSasToken(property.img)
	  property.primaryimgurl=mysasToken.uri;
	}
    res.render('legalpack/legalpack',{property,legal_documents,customer,helper:ejs_helpers});

});





module.exports = router;