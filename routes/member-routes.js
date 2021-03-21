require('dotenv').config()
const router = require('express').Router();
const db = require('../custom/dbManager');
const authCheck = require('../custom/authCheck');
const azBlob = require('../custom/storageManager');

router.post('/member/addmember',authCheck, async (req, res) => {
    var results = await db.getCustomerById(req.session.userid)
	var customer= results[0]
    var success = await db.addNewCompanyMember(req.body.email,customer.companyid);
	res.json({status:true})
});

module.exports = router;