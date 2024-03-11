//third party modules
const twilio = require('twilio');
const nodemailer = require("nodemailer");

//auth  token and account sid from Twilio dashboard
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const serviceSid = process.env.SERVICE_SID;
const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  service: 'Gmail',
  auth: {
    user: "basithkccr7@gmail.com",
    pass: "gyfb fwzm vbwz yeow",
  },
});


//otp generating
var otpOg = Math.random();
otpOg = otpOg * 1000000;
otpOg = parseInt(otpOg);

//function for send otp
async function sendOtp(to, channel) {
  console.log(to, channel);

  //if otp channel is email
  if (channel === 'email') {

    try {

      // Send mail with defined transport object
      let mailOptions = {
        from: '"Basith KC 👻" <basithkccr7@gmail.com>', // sender address
        to: to, // list of receivers
        subject: "Otp for registration is:", // Subject line
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otpOg + "</h1>" // html body
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          return
        }
      });
    } catch (error) {
      console.log(error)
    }

  } else {
    //send otp to number
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: to,
        channel: channel,
      });

    return verification;
  }

}

async function checkOtp(to, otp, channel) {

  if (channel === 'email') {
    console.log(otp, otpOg)
    //if channel is email verify
    let verification = {}
    verification.status = otp == otpOg ? 'approved' : 'rejected'
    return verification

  } else {

    const verification = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: to, code: otp });

    return verification;
  }
}

module.exports = { sendOtp, checkOtp };
