require('dotenv').config()
var request = require('request');
const router = require("express").Router();
const authCheck = require('../custom/authCheck');
const dbManager = require('../custom/dbManager');
var stripe = require('stripe')(process.env.STRIPE_KEY_SK);
router.get("/paymentdemo", async (req, res) => {
    var paymentIntent = await stripe.paymentIntents.create({amount:92019,currency: 'gbp', payment_method_types: ['card'],capture_method: 'manual'});
    console.log(paymentIntent)

    res.render('stripe/payments2',{paymentIntent:paymentIntent})
});


router.post("/processCard",authCheck, async (req, res) => {

    var c = req.body;
    console.log(c)

const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: c.number,
      exp_month: c.exp_month,
      exp_year: c.exp_year,
      cvc: c.cvc,
    },
  }).catch(err => {
    console.log("Error:", err);
  });
  console.log(paymentMethod)
  console.log(req.session.userid)
  dbManager.savePayment(paymentMethod.id,req.session.userid,c.properties)
  res.json({id:paymentMethod.id})
});

router.get('/payment/setup',async function(req,res){
  //  var token = req.body.stripeToken;
    var paymentIntent = await stripe.paymentIntents.create({amount:3200,currency: 'gbp', payment_method_types: ['card']});
    console.log(paymentIntent)
    res.json({status:paymentIntent})
})

router.post("/payment/accept", async function(req, res) {

    var token = req.body.stripeToken;
    const charge = await stripe.charges.create({
        amount: 999,
        currency: 'gbp',
        description: 'TAHID MIAH PAYMENT TEST',
        source: token,
        
      });
console.log('test')
console.log(charge)
    /*
    stripe.customers.create({
      card : req.body.stripeToken,
      email : "jsmith2018xx@gmail.com", // customer's email (get it from db or session)
      plan : "browserling_developer"
    }, function (err, customer) {
      if (err) {
        console.log(err)
        var msg = customer.error.message || "unknown";
        res.send("Error while processing your payment: " + msg);
      }
      else {
        var id = customer.id;
        console.log('Success! Customer with Stripe ID ' + id + ' just signed up!');
        // save this customer to your database here!
        res.send('ok');
      }
    });*/
  });
  

module.exports = router;
