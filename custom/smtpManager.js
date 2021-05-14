require('dotenv').config()
const nodemailer = require('nodemailer');
const db = require('./dbManagerMailTemplate.js')
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
  });

  const smtpSender = process.env.SMTP_SENDER
  function replaceAll(a, search, replace) {
    return a.split(search).join(replace);
  }
  
  class smtpManager {
        async sendMail(to,subject,html){
            return new Promise((resolve,reject)=>{
                const mailOptions = {
                    from: smtpSender,
                    to: to,
                    subject: subject,
                    text: html,
                    html: html

                  };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                      reject(error)
                    } else {
                      console.log('Email sent: ' + info.response);
                      resolve(info.response)
                    }
                  }); 
            })
        }

        async new_registration(to,code,hash){
            var mailtemplate = await db.getemailtemplate('Registration');
            var body = mailtemplate.body
            body = replaceAll(body,'{{uri}}',process.env.HOST+'/veri'+hash)
            body = replaceAll(body,'{{code}}',code)
            await this.sendMail(to,mailtemplate.subject,body) 
        }
        async verification_code(to,code,hash){
          var mailtemplate = await db.getemailtemplate('Verification');
          var body = mailtemplate.body
          body = replaceAll(body,'{{uri}}',process.env.HOST+'/veri'+hash)
          body = replaceAll(body,'{{code}}',code)
          await this.sendMail(to,mailtemplate.subject,body) 
      }
        async forgot_password(to,hash){
          var mailtemplate = await db.getemailtemplate('Forgot');
            var body = mailtemplate.body
            body = replaceAll(body,'{{uri}}',process.env.HOST+'/pwa'+hash)
            await this.sendMail(to,mailtemplate.subject,body) 
      }
  }

  module.exports = new smtpManager()