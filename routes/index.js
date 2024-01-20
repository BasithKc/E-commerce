const express = require('express')
const router = express.Router()
const {getLogin} = require("../Controller/indexController")

router.route('/login')
        .get(getLogin)

module.exports = router