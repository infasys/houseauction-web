require('dotenv').config()
var request = require('request');
const { getProperties } = require('./dbManager');


function getPostCode (postCodeEntry) {
    var apiKey = process.env.POSTCODE_SECRET;
    return new Promise(function (resolve, reject) {
    var options = {
        method: 'GET',
        url: `https://api.getAddress.io/v2/uk/${postCodeEntry}?api-key=${apiKey}`
      }
      request(options, function (error, response) {
        var data = JSON.parse(response.body.trim())
        console.log(data)
        resolve(data);
      });
    })
  }
  function empty(e) {
      var a = e.trim()
    switch (a) {
      case "":
      case 0:
      case "0":
      case null:
      case false:
      case typeof(a) == "undefined":
        return true;
      default:
        return false;
    }
  }
  function jsonDataToOutput(addresses){
    var addrlist = []
    addresses.forEach(addr=>{
        var parts=addr.split(',');
        var myaddr = {newlbl:''};
        parts.forEach(t1=>{
            var t2 = t1.replace(/\s+/g, '');
            myaddr.newlbl+= empty(t2) ? '' : t1+', ';
            
        })
        myaddr.newlbl=myaddr.newlbl.replace(/,(?=\s*$)/, '');
        myaddr.county = parts[parts.length - 1];
        myaddr.town = parts[parts.length  - 2];
        var temp = parts[1].replace('/\s+/', '')
        var temp2 = parts[2].replace('/\s+/', '');
        temp2= (myaddr.town == parts[2])?'':temp2;
        myaddr.street = empty(temp) ? parts[0] : (empty(temp2)? parts[1]:parts[2]);
        myaddr.premises =  empty(temp) ? '' : (empty(temp2)?parts[0]:parts[0]+", "+parts[1]);
        addrlist.push(myaddr)
    })


    var l = 100;
    var myitms = [];
    addrlist.forEach(addr=>{
      var parts=addr.street.split(' ');
      for(var i = parts.length;i>0;i--){
        var subcount = i-1;
        var num = parts.length - i;
        var partdata = parts[num]
        myitms[i] =  (myitms[i])?myitms[i]:partdata;
        if(myitms[i]!==partdata){
          if(l>subcount) l=subcount;
        }
      }
    })
    if(l==100)l=1;
    addrlist.forEach(addr=>{
      var parts=addr.street.split(' ');
      console.log(parts)
      addr.newstreet = '';
      addr.door='';
      for (var x = l; x > 0 ; x--) {
        addr.newstreet += parts[parts.length - x]+" ";
      }
      var m = parts.length -l;
      for (var x = 0;  x < m ; x++) {
        addr.door+=parts[x]+" ";
      }
      
    })

    return addrlist
}

function getPostCodeFull (postCodeEntry,doorno) {
  var apiKey = process.env.POSTCODE_SECRET;
  return new Promise(function (resolve, reject) {
  var options = {
      method: 'GET',
      url: `https://api.getAddress.io/find/${postCodeEntry}/${doorno}?api-key=${apiKey}&expand=true`
    }
    request(options, function (error, response) {
      var data = JSON.parse(response.body.trim())
      resolve(data);
    });
  })
}

async function postCodeSearch(postCodeEntry,doorno){
  if(doorno){
    var results = getPostCodeFull(postCodeEntry,doorno);
    return results
  }else{
    var results = await getPostCode(postCodeEntry);
    var data = {}
    if(results){
      if(results.Message){
        data = {status:false,message:results.Message}
      }else{
      var tmp = jsonDataToOutput(results.Addresses)
      data = {status:true,myaddrs:tmp,lat:results.Latitude,lng:results.Longitude,postalcode:postCodeEntry}
      }
    }
    return data;
  }
}

module.exports = postCodeSearch;

