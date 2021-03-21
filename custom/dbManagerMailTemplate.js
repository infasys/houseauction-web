require('dotenv').config()
const mysql = require('mysql');
const params = { host: process.env.MYSQL_HOST,user: process.env.MYSQL_USER,password: process.env.MYSQL_PASS,database: process.env.MYSQL_DB}
const crypto = require('crypto');
var db = mysql.createConnection(params);

class dbManager{

  getRegistrationTemplate(){
    return new Promise((resolve,reject)=>{
      db.query('select * from email_templates where id = 1', function (err, result) {
        if (err) throw err;
        resolve(result[0])
      })
    })
  }
  getForgotPasswordTemplate(){
    return new Promise((resolve,reject)=>{
      db.query('select * from email_templates where id = 2', function (err, result) {
        if (err) throw err;
        resolve(result[0])
      })
    })
  }
  getResendVerificationCode(){
    return new Promise((resolve,reject)=>{
      db.query('select * from email_templates where id = 3', function (err, result) {
        if (err) throw err;
        resolve(result[0])
      })
    })
  }
}
module.exports =  new dbManager();