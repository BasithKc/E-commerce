const express = require('express');
const router = express.Router();

//imprting third party module
const nocache = require('nocache')

//Importing Controllers
const {
        getLogin,
        getSignup,
        getOtp,
        postLogin,
        postOtp,
        otpPage,
        ResendOtp,
        forgottenGetOtp,
        forgottenPostOtp,
        resetPasswordGet,
        resetPasswordPost,
} = require('../Controller/indexController');

//Controllers Improting
const userHomeController = require('../Controller/userhomeController');
const adminHomeController = require('../Controller/adminhomeController');

//Router for initial page of PORT which is login page
router.route('/').get(nocache(), getLogin).post(postLogin);

//Signup Page 
router.route('/signup').get(getSignup);

//Endpoint for sendig OTP after signup
router.route('/send-otp').post(getOtp).get(otpPage);

//Endpoint for resend OTP if otp does not come
router.route('/resend-otp').get(ResendOtp);

//Endpoint for Verify the user Entered OTP
router.route('/verify-otp').post(postOtp);

//Endpoint for forgotten-password , render the page in case of clicking on Forgot Password on login page
router.route('/forgotten-password').get((req, res) => {
        const message = req.query.message;
        const error = req.query.error;
        res.render('forgottenPassword', { message, error });
});

//Endpoint for sending OTP after entering the number
router.route('/forgotten-send-otp').post(forgottenGetOtp);

//Verify the user entered OTp\P
router.route('/forgotten-verify-otp').post(forgottenPostOtp);

//Rendering the Reset password page after completing the verification and post it
router.route('/reset-password').get(resetPasswordGet).post(resetPasswordPost);


module.exports = router;
