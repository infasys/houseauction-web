require('dotenv').config()
const nodemailer = require('nodemailer');
const db = require('./dbManagerMailTemplate.js')
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "50b94adaf8f7d0",
    pass: "0d89c8801a5fcd"
  }
  });

  const smtpSender = process.env.SMTP_SENDER

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

        async new_registration(to){
            var mailtemplate = await db.getRegistrationTemplate();
            await this.sendMail(to,mailtemplate.subject,mailtemplate.body)
        }
        async forgot_password(to){
          var mailtemplate = await db.getRegistrationTemplate();
          await this.sendMail(to,mailtemplate.subject,mailtemplate.body)
      }
  }

  module.exports = new smtpManager()