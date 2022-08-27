const nodeMailer = require('nodemailer')
require('dotenv').config()

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: `${process.env.GMAIL_USER}`, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      pass: `${process.env.GMAIL_PASS}`, // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED 
    },
    tls: {
      ciphers: 'SSLv3',
    },
  })

  return transporter
    .sendMail(emailData)
    .then(info => {
      console.log(`Message sent: ${info.response}`)
      return res.json({
        message: `Email has been sent to your email. Follow the instruction to activate your account`
      })
    })
    .catch((error) => {
      return res.json({
        error: `Problem sending email$: ${error}`
      })
    })
}