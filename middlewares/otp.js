const twilio = require('twilio');

const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const serviceSid = process.env.SERVICE_SID;
const client = twilio(accountSid, authToken);

async function sendOtp(to, channel) {
  console.log(to, channel);

  const verification = await client.verify.v2
    .services(serviceSid)
    .verifications.create({
      to: to,
      channel: channel,
    });

  return verification;
}

async function checkOtp(to, otp) {
  const verification = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to: to, code: otp });

  return verification;
}

module.exports = { sendOtp, checkOtp };
