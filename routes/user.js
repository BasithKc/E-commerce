const express = require('express')
const router = express.Router()
const userHomeController = require('../Controller/userhomeController')
const axios = require('axios');

//user Home page
router.get('/userhome', userHomeController.getUserHome);

//user Product Details 
router.get('/user/product-details/:productId', userHomeController.getProductDetails)

//mens Category
router.get('/user/mens-category', userHomeController.getMensCategory)

//This Endpoint for rendering wishlist page
router.get('/user/wishlist', userHomeController.getWishlistPage)

//Wishlist add
router.post('/user/add-to-wishlist', userHomeController.addToWishList)

//Wishlist remove
router.get('/user/remove-from-wishlist/:productId', userHomeController.removeFromWishList)

//Fetch the wishlist details while load the page
router.get('/user/fetch-wishlist', userHomeController.fetchWishlist)

//Handling logout
router.get('/user/logout', userHomeController.logOut)


module.exports = router