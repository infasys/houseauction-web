require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');
var stripe = require('stripe')(process.env.STRIPE_KEY_SK);
const axios = require('axios');
const ejs_helpers = require('../custom/helper_ejs.js')



router.get('/portal/properties',authCheck,async (req, res) => {
	var myuserid = req.session.userid;
	var results = await db.getCustomerById(myuserid)
	var customer = results[0]
	var lots = await db.getPropertiesByUserId(req.session.userid);

	  lots = await azBlob.getFiles(lots,'img')
	res.render('portal/myproperties',{lots:lots,menusel:2,customer});
});

router.get('/lot/details/:id',async (req,res)=>{
    var apikey = process.env.GOGGLEMAPS_API
    var lot = await db.getPropertyById(req.params.id)
    var images = await db.getPropertyImagesById(req.params.id)
    if(!images.length){
        images.push({filename:'abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'})
    }

    var maps = await db.getPropertyMapsById(req.params.id)
    
      var catalogs = await db.getPropertyCatalogById(req.params.id)
      images = await azBlob.getFiles(images,'filename')
      maps = await azBlob.getFiles(maps,'filename')
      catalogs = await azBlob.getFiles(catalogs,'filename')
    var details = await db.getPropertyDetailsById(req.params.id)
    var property = lot[0]
    var isAdded = false
    if(req.session.userid){
        var dbres =  await db.getSellerFavourites(req.session.userid,req.params.id)
        if(dbres.length) isAdded = true;
    }
    console.log(catalogs)
    res.render('site/viewlot',{property,images,details,isAdded,maps,catalogs,apikey,helper:ejs_helpers});
})



router.post('/auctionaction/biddeposit',authCheck,async (req, res) => {
  db.updateBidDeposit(req.body.myid,req.body.mycheck)
	res.json({status:true});
});
router.post('/auction/attendType',authCheck,async (req, res) => {
  var myuserid = req.session.userid;
  db.updateAuctionAttendance(req.body.choiceid,req.body.auctionid,myuserid)
	res.json({status:true});
});
module.exports = router;