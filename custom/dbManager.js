require('dotenv').config()
const mysql = require('mysql');
const params = { host: process.env.MYSQL_HOST,user: process.env.MYSQL_USER,password: process.env.MYSQL_PASS,database: process.env.MYSQL_DB}
const crypto = require('crypto');
var db = mysql.createConnection(params);

class dbManager{

  saveEnquriy(firstname,lastname,email,telephone,addr1,addr2,town,postcode,info){
    return new Promise((resolve,reject)=>{
      db.query('insert into enquiry (firstname,lastname,email,telephone,addr1,addr2,town,postcode,info,datetime) values (?,?,?,?,?,?,?,?,?,NOW())',[firstname,lastname,email,telephone,addr1,addr2,town,postcode,info], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }

  getUserVerificationLink(){
    return new Promise((resolve,reject)=>{
      db.query('select * from faq', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }

  getFAQs(){
    return new Promise((resolve,reject)=>{
      db.query('select * from faq', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }
  getMembers(){
    return new Promise((resolve,reject)=>{
      db.query('select * from members', function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
  }
getUsers(){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select * from users', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

delHistoryAddr(userid,historyid){
  return new Promise((resolve,reject)=>{
    db.query('delete from address_history where customerid = ? and id = ?',[userid,historyid],(err,result)=>{
      if(err) throw err
      resolve(result)
    })
  })
}

addHistoryAddr(userid,addr,startYear,startMonth){
  return new Promise((resolve,reject)=>{
    var tmp=  [userid,addr.premises, addr.door, addr.street, addr.town,addr.district, addr.county, addr.postcode,addr.country,startYear,startMonth]
    db.query('insert into address_history (customerid,premises,door,street,town,district,county,postcode,country,start_year,start_month) values (?)',[tmp], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateHistoryAddr(userid,id,addr,startYear,startMonth){
  return new Promise((resolve,reject)=>{
    var tmp=  [addr.premises, addr.door, addr.street, addr.town,addr.district, addr.county, addr.postcode,addr.country,startYear,startMonth,userid,id]
    db.query('update address_history set premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=?,start_year=?,start_month=? where customerid = ? and id=?',tmp, function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

deleteCustomerAddressHistory(userid,addrid){
  return new Promise((resolve,reject)=>{
   
    db.query('delete from address_history where customerid=? and id = ?',[userid,addrid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getAddressHistoryByUserId(userid){
  return new Promise((resolve,reject)=>{
        db.query('select * from  address_history where customerid = ? order by start_year DESC,start_month DESC',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getAddressHistoryById(id,userid){
  return new Promise((resolve,reject)=>{
        db.query('select * from  address_history where customerid = ? and id = ?',[userid,id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

getCustomerById(userid){
  return new Promise((resolve,reject)=>{
      db.query('select * from customers where id = ?',[userid], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
}
getAMLReportsByUser(userid) {
  return new Promise((resolve, reject) => {
    db.query("select * from amlreports where customerid = ?",[userid],function (err, result) {
      if (err) throw err;
      resolve(result);
    })
  });
}
updateCompany(companyid,name,address,entity){
  return new Promise((resolve,reject)=>{
    db.query(`update company set name = ?, address= ?, entitytypeid= ? where id = ?`,[name,address,entity,companyid],(err,result)=>{
      if (err) throw err;
      resolve(result)
    })
  })
}
changeAccountType(userid){
  return new Promise((resolve,reject)=>{ 
    db.query(`insert into company (name) values ('')`,(err,result)=>{
      if (err) throw err;
      var companyid = result.insertId;
      db.query('update customers set companyid = ?,iscompany=true where id = ?',[companyid,userid], (err,result) =>{
        if (err) throw err;
        resolve(result)
      })
    })
  })
}
verifycode(userid,code){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where id = ?',[userid], function (err, result) {
      if (err) throw err;
      if(result[0]){
        var user = result[0]
        if(user.verificationcode==code){
          db.query('update customers set isVerified = 1 where id = ?',[userid], function (err, result) {
            if (err) throw err;
            resolve({status:true})

          })
          
        }else{
          resolve({status:false})
        }
      }
    })
  })
}
getCompanyById(companyid){
  return new Promise((resolve,reject)=>{
    db.query('select * from company where id = ?',[companyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getCompanyMembersByCompanyId(companyid){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where companyid = ?',[companyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerDetails(userid,title,forename,surname,middlename,telephone,mobile,address){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set title=?,forename=?,surname=?,middlename=?,telephone=?,mobile=?,premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=? where id= ? `,[title,forename,surname,middlename,telephone,mobile,address.premises,address.door,address.street,address.town,address.district,address.county,address.postcode,address.country,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerAddress(userid,address){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set premises=?,door=?,street=?,town=?,district=?,county=?,postcode=?,country=? where id= ? `,[address.premises,address.door,address.street,address.town,address.district,address.county,address.postcode,address.country,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerDetailsNoAddr(userid,title,forename,surname,middlename,mobile){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set title=?,forename=?,surname=?,middlename=?,mobile=? where id= ? `,[title,forename,surname,middlename,mobile,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updateCustomerVerificationDetails(userid,dob,nino,driving,passport){
  return new Promise((resolve,reject)=>{
    db.query(`update customers set dob=?,nationalinsurance=?,drivinglicense=?,passport=? where id= ? `,[dob,nino,driving,passport,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getSellers(){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

getSolcitors(userid){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('select * from solicitor_details where customerid = ? ',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

addVerificationDocument(userid,doctype,filename){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('insert into verification_documents (customerid,doctypeid,name) values (?)',[[userid,doctype,filename]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getVerificationDocument(userid){
  return new Promise((resolve,reject)=>{
    console.log(userid)
    db.query('select * from verification_documents where customerid = ?',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
insertSolictorDetails(userid,firm,name,telephone,email,address){
  return new Promise((resolve,reject)=>{
    db.query('insert into solicitor_details (customerid,firm,name,telephone,email,address) values (?) ',[[userid,firm,name,telephone,email,address]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

updateSolictorDetails(solictorid,firm,name,telephone,email,address){
  return new Promise((resolve,reject)=>{
    db.query('update solicitor_details set firm=?,name=?,telephone=?,email=?,address=?  where id = ?',[firm,name,telephone,email,address,solictorid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getVerificationDocumentTypes() {
  return new Promise((resolve, reject) => {
    db.query("select * from verification_document_types", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}
getSellerFavourites(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from customerpropertylist where userid=? and propertyid = ?',[userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
addToFavourties(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('insert into customerpropertylist (userid,propertyid) values (?)',[[userid,propertyid]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
removeFromFavourties(userid,propertyid){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('delete from customerpropertylist where userid=? and propertyid = ?',[userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

addBidDeposit(userid,propertyid,status){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('update customerpropertylist set bid_deposit=? where userid=? and propertyid = ?',[status,userid,propertyid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getLogin(username,password){
  return new Promise((resolve,reject)=>{
    db.query('select * from customers where username = ? and password = ?',[username,password], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
updatePassword(userid,password){
  return new Promise((resolve,reject)=>{
    let hash = crypto.createHash('md5').update(password).digest("hex");
    db.query('update customers set password = ? where id = ?',[hash,userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyInfoFields(){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from property_info', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertyCommercialtype(){
  return new Promise((resolve,reject)=>{
   // db = mysql.createConnection(params);
    db.query('select * from propertycommercial', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

getPropertyTypes(){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertytype', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
   // db.end();
  })
}
getPriceTypes(){
  return new Promise((resolve,reject)=>{
    db.query('select * from pricetype', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

insertPropertyListing(name,addr,header,description,customdata,sellerid,price,pricetypeid,propertytypeid,commercialtypeid,files){
  return new Promise((resolve,reject)=>{
    var prop = [name,addr.premises,addr.door,addr.street,addr.town,addr.county,addr.postcode,addr.latitude,addr.longitude,header,description,price,pricetypeid,sellerid,propertytypeid,commercialtypeid]
    db.query('insert into properties (name,premises,door,street,town,county,postcode,latitude,longitude,header,description,price,pricetype,clientid,propertytype,residentialcommercial) values (?)',[prop], function (err, result) {
      if (err) throw err;
      var propertyid = result.insertId;
      var tempfiles = []
      files.forEach(f=>{
        tempfiles.push([f,propertyid])
      })
      db.query('insert into propertyimages (filename,propertyid) values ?',[tempfiles], function (err, result) {
        if (err) throw err;
        var tempdetails = []
        customdata.forEach(f=>{
          tempdetails.push([f.fieldid,propertyid,f.details])
        })
        db.query('insert into propertydetails (infoid,propertyid,details) values ?',[tempdetails], function (err, result) {
          if (err) throw err;
          resolve(result)
        })
      })





      
    })
   // db.end();
  })
}
getPropertiesByUserId(userid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query(`SELECT myproperties.*,customerpropertylist.bid_deposit AS bid_interest
    from customerpropertylist 
    left JOIN 
    (select p.id,p.name as propname,i.img,p.price,p.town,p.county from properties p left join (select propertyid,max(filename) as img from propertyimages group by propertyid) i on i.propertyid = p.id left join customers s on s.id = p.clientid)
     AS myproperties
    ON myproperties.id = customerpropertylist.propertyid WHERE userid=?
    `,[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}

savePayment(stripeid,userid){
  return new Promise((resolve,reject)=>{
      db.query('insert into payment_deposits (stripeid, customerid,status) values (?)',[[stripeid,userid,1]], function (err, result) {
        if (err) throw err;
        resolve(result)
      })
    })
}
getPayments(userid){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select * from payment_deposits where customerid = ?',[userid], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getProperties(){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select p.id,p.name as propname,p.town,CONCAT(s.forename,", ",s.surname) as sellername,i.img,p.price,p.town,p.county from properties p left join (select propertyid,max(filename) as img from propertyimages group by propertyid) i on i.propertyid = p.id left join customers s on s.id = p.clientid;', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getPropertiesLimit8(){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('select p.id,p.name as propname,p.town,CONCAT(s.forename,", ",s.surname) as sellername,i.img,p.price,p.town,p.county from properties p left join (select propertyid,max(filename) as img from propertyimages group by propertyid) i on i.propertyid = p.id left join customers s on s.id = p.clientid limit 8;', function (err, result) {
      if (err) throw err;
      resolve(result)
    })
    //db.end();
  })
}
getPropertyById(id){
  return new Promise((resolve,reject)=>{
    db.query(`select * from properties where id = ?;`,[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyImagesById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertyimages where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyMapsById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertymaps where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyCatalogById(id){
  return new Promise((resolve,reject)=>{
    db.query('select * from propertycatalog where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
getPropertyDetailsById(id){
  return new Promise((resolve,reject)=>{
    db.query('select p.id,p.details,i.name as title from propertydetails p left join property_info i on i.id= p.infoid where propertyid = ?;',[id], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}
addProperty(name,description,price){
  return new Promise((resolve,reject)=>{
  //  db = mysql.createConnection(params);
    db.query('insert into properties(name,description,price) values ?',[[name,description,price]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  //  db.end();
  })
}

addnewCustomer(reg){
  return new Promise((resolve,reject)=>{
    console.log(reg.Password)
    let hash = crypto.createHash('md5').update(reg.Password).digest("hex");
    db.query('insert into customers(title,forename,surname,username,password) values (?)',[[reg.title,reg.firstname,reg.lastname,reg.Email,hash]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}

addNewCompanyMember(email,companyid){
  return new Promise((resolve,reject)=>{
    db.query('insert into customers(username,companyid) values (?)',[[email,companyid]], function (err, result) {
      if (err) throw err;
      resolve(result)
    })
  })
}


getAuctions() {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions", function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}
getAuctionsById(id) {
  return new Promise((resolve, reject) => {
    db.query("select * from auctions where id = ?",[id], function (err, result) {
        var auction = result[0]
        auction.properties = []
        db.query("SELECT ap.id,ap.lotno,property.* FROM auction_properties ap LEFT JOIN (select p.id as propertyid,p.name as propname,p.town,s.forename as sellername,i.img,p.price,p.county from properties p left join (select propertyid,max(filename) as img from propertyimages group by propertyid) i on i.propertyid = p.id left join customers s on s.id = p.clientid) AS property on property.propertyid=ap.propertyid WHERE  ap.auctionid = ? order by ap.lotno",[id], function (err, result) {
          if (err) throw err;
          result.forEach(r=>{auction.properties.push(r)})
          
          resolve(auction);
      });
  });
})
  }





}
module.exports =  new dbManager();