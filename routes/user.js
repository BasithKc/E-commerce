const express = require('express')
const router = express.Router()
const userHomeController = require('../Controller/userhomeController')

//user Home page
router.get('/userhome', userHomeController.getUserHome);

module.exports = router