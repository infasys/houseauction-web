const postcode = require("../custom/postCode");
const router = require("express").Router();



const mydelay = (req, res, nxt) => {
  setInterval(function(){
    nxt()
  },2000)
}


router.post("/postcode", async (req, res) => {
  var tmp = await postcode(req.body.postcode);
  console.log(tmp)
  res.json(tmp);
});
router.post("/postcodedetailed", async (req, res) => {
  var tmp = await postcode(req.body.postcode, req.body.door);
  res.json(tmp);
});
router.post("/postcodetst/:postcodeaddr/:houseaddr", async (req, res) => {
  var tmp = await postcode(req.params.postcodeaddr, req.params.houseaddr);
  res.json(tmp);
});
module.exports = router;
