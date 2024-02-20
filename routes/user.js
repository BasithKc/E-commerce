const express = require('express')
const router = express.Router()
const userHomeController = require('../Controller/userhomeController')
const axios = require('axios');

//user Home page
router.get('/userhome', userHomeController.getUserHome);

//user Product Details 
router.get('/user/product-details/:productId', userHomeController.getProductDetails)

//Category
router.get('/user/category', userHomeController.getCategory)

//This Endpoint for rendering wishlist page
router.get('/user/wishlist', userHomeController.getWishlistPage)

//Wishlist add
router.post('/user/add-to-wishlist', userHomeController.addToWishList)

//Wishlist remove
router.get('/user/remove-from-wishlist/:productId', userHomeController.removeFromWishList)

//Fetch the wishlist details while load the page
router.get('/user/fetch-wishlist', userHomeController.fetchWishlist)

//Get Cart page
router.get('/user/cart-page', userHomeController.getCartPage)

//Delete from cart
router.get('/user/remove-from-cart/:productId', userHomeController.removeFromCart)

//Fetch the cart details while load the page
router.get('/user/fetch-cart', userHomeController.fetchCart)

//Add to cart
router.get('/user/add-to-cart/:productId', userHomeController.addtoCart)

//User checkout Page
router.get('/user/checkout', userHomeController.checkoutPage)

//Endpoin for creating an order
router.post('/user/create-order', userHomeController.createOrder)

//Complete order
router.post('/user/complete-order', userHomeController.completeOrder)

//Handling logout
router.get('/user/logout', userHomeController.logOut)


module.exports = router