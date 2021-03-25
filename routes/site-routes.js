require('dotenv').config()
const db = require('../custom/dbManager');
const router = require('express').Router();
const path = require('path');
const azBlob = require('../custom/storageManager');
const { json } = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_KEY_SK);

router.get('/',(req,res)=>{
    res.redirect('/home')
})
router.get('/home',(req,res)=>{
    res.render('site/home.ejs')
})
router.get('/valuation',(req,res)=>{
    console.log(req.query)
    var addr1 = req.query.addr1;
    var addr2 = req.query.addr2;
    var town = req.query.town;
    var county = req.query.county;
    var postcode = req.query.postcode;
    res.render('site/valuation.ejs',{addr1,addr2,town,county,postcode})
})
router.get('/guide',async(req,res)=>{
    var faqs = await db.getFAQs();
    res.render('site/guide.ejs',{faqs})
})

router.get('/contact',async(req,res)=>{
    console.log(req.query)
    var question = req.query.question
    res.render('site/contact.ejs',{question})
})
router.get('/about-us',async(req,res)=>{
    var members = await db.getMembers();
    res.render('site/about-us.ejs',{members})
})
router.get('/privacy-policy',async(req,res)=>{
    res.render('site/privacy-poilcy.ejs')
})
router.get('/contact-us',async(req,res)=>{
    var apikey = process.env.GOGGLEMAPS_API
    res.render('site/contact-us.ejs',{apikey})
})
router.get('/auction-upcoming',async (req,res)=>{
    var auctions = await db.getAuctions();
    res.render('site/upcoming',{auctions:auctions});
})
router.get('/thank-you',async (req,res)=>{
    res.render('site/thank-you');
})
router.get('/company/why-choose-auction-house',async (req,res)=>{
    res.render('site/choose-us');
})

router.post('/savequery',async(req,res)=>{
    console.log('TAHID')
    var q = req.body;
    console.log(q)
    await db.saveEnquriy(q.firstname,q.lastname,q.email,q.telephone,q.addr1,q.addr2,q.town,q.postcode,q.info)
    res.json({status:true})
})
router.get('/lot/details/:id',async (req,res)=>{
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
    if(req.session.userid){
        var dbres =  await db.getSellerFavourites(req.session.userid,req.params.id)
        if(dbres.length) isAdded = true;
    }
    res.render('site/viewlot',{property,images,details,isAdded,maps,catalogs,apikey});
})
router.get('/auction-lots',async (req, res) => {
    var lots = await db.getProperties();
    lots.forEach(p=>{
        if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
        p.uri = azBlob.generateSasToken(p.img).uri;
      })
	res.render('site/auction-lots',{lots,msg:''});
});
router.get('/auction-lots-list',async (req, res) => {
    var lots = await db.getProperties();
    lots.forEach(p=>{
        if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
        p.uri = azBlob.generateSasToken(p.img).uri;
      })
	res.render('site/auction-lots-list',{lots,msg:''});
});



router.get('/auction-maps',async (req,res)=>{
    var lots = await db.getProperties();
    lots.forEach(p=>{
        if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
        p.uri = azBlob.generateSasToken(p.img).uri;
      })
    res.render('site/auction-maps',{lots,msg:''});
})


router.post('/auction-lots8',async (req, res) => {
    var lots = await db.getPropertiesLimit8();
    lots.forEach(p=>{
        if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
        p.uri = azBlob.generateSasToken(p.img).uri;
      })
	res.render('site/auction-lots8',{lots,msg:''});
});

router.post('/addtofav',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.addToFavourties(req.session.userid,req.body.propertyid)
    res.json({succes:true})
})
router.post('/removefromfav',async (req,res)=>{
    var propertyid = req.body.propertyid;
    await db.removeFromFavourties(req.session.userid,req.body.propertyid)
    res.json({succes:true})
})

router.get('/auction-rooms',async (req,res)=>{
    var rooms = await db.getRooms()
    res.render('site/auction-rooms',{rooms});
})
router.get('/auction-online',async (req,res)=>{
    res.render('site/auction-online');
})
router.get('/auction-finance',async (req,res)=>{
    res.render('site/finance');
})
router.get('/auction-results',async (req,res)=>{
    var lots = await db.getProperties();
    lots.forEach(p=>{
        if(!p.img)p.img ='abc/b2c63fa2-dd22-498d-a5f9-162a2523a58b.jpg'
        p.uri = azBlob.generateSasToken(p.img).uri;
      })
    res.render('site/auction-results',{lots});
})
router.get('/thank-you',async (req,res)=>{
    res.render('site/thank-you');
})
module.exports = router;