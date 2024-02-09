const express = require('express');
const router = express.Router();
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

const userHomeController = require('../Controller/userhomeController');
const adminHomeController = require('../Controller/adminhomeController');

router.route('/').get(getLogin).post(postLogin);

router.route('/send-otp').post(getOtp).get(otpPage);

router.route('/resend-otp').get(ResendOtp);

router.route('/verify-otp').post(postOtp);

router.route('/signup').get(getSignup);
router.route('/forgotten-password').get((req, res) => {
        const message = req.query.message;
        const error = req.query.error;
        res.render('forgottenPassword', { message, error });
});
router.route('/forgotten-send-otp').post(forgottenGetOtp);
router.route('/forgotten-verify-otp').post(forgottenPostOtp);
router.route('/reset-password').get(resetPasswordGet).post(resetPasswordPost);


module.exports = router;
