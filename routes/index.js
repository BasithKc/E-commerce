const express = require('express')
const router = express.Router()
const {getLogin,getSignup,getOtp, postSignup} = require("../Controller/indexController")

router.route('/')
        .get(getLogin)

router.route('/signup/otp')
        .get(getOtp)

router.route('/signup')
        .get(getSignup)
        .post(postSignup)



module.exports = router