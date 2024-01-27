const express = require('express')
const router = express.Router()
const {getLogin,getSignup,getOtp, postLogin,postOtp, otpPage, ResendOtp,success} = require("../Controller/indexController")
const userHomeController = require('../Controller/userhomeController')
const adminHomeController = require('../Controller/adminhomeController')

router.route('/')
        .get(getLogin)
        .post(postLogin)

router.route('/send-otp')
        .post(getOtp)
        .get(otpPage)

router.route('/resend-otp')
        .get(ResendOtp)

router.route('/verify-otp')
        .post(postOtp)

router.route('/signup')
        .get(getSignup)

router.get('/userhome', userHomeController.getUserHome)
router.get('/adminhome',adminHomeController.getAdminHome)


module.exports = router