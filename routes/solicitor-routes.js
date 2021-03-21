require('dotenv').config()
var request = require('request');
const router = require("express").Router();



function searchSolicitors(term){
    var apiKey = process.env.SRAKEY;
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'POST',
            url: 'https://sra-prod-apim.azure-api.net/datashare/api/V1/organisation/OrganisationSearch',
            headers: {
              'Cache-Control': 'no-cache',
              'Ocp-Apim-Subscription-Key': 'd6b996f08ecb42b9a12ba02473edd962',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({"SearchText":term,"NumberOfResults":10000,"Skip":0})
          
          };
      request(options, function (error, response) {
        var data = JSON.parse(response.body.trim())
        resolve(data);
      });
    })
}


function getAllSolicitors(){
    var apiKey = process.env.SRAKEY;
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: ' https://sra-prod-apim.azure-api.net/datashare/api/V1/organisation/GetAll',
            headers: {
              'Cache-Control': 'no-cache',
              'Ocp-Apim-Subscription-Key': 'd6b996f08ecb42b9a12ba02473edd962',
              'Content-Type': 'application/json'
            },
          };
      request(options, function (error, response) {
        var data = JSON.parse(response.body.trim())
        resolve(data);
      });
    })
}


router.post("/solicitor/search", async (req, res) => {
 var results = await getAllSolicitors(req.body.name)
 console.log(results)
   res.json(results)
});

module.exports = router;
