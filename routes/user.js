//importing third party modules
const express = require('express')
const axios = require('axios');

const router = express.Router()

//Importing controllers
const userHomeController = require('../Controller/userhomeController')
const userOrderController = require('../Controller/userOrderController')
const userWishlistController = require('../Controller/userWishlistController')
const userCartController = require('../Controller/userCartController')
const userReviewController = require('../Controller/userReviewController')
const userAddressController = require('../Controller/userAddressController')

//user Home page
router.get('/userhome', userHomeController.getUserHome);

//User Account page
router.get('/user/account', userHomeController.getUserAccountPage)

//User update Profile
router.post('/user/account/update-profile', userHomeController.updateUserProfile)


//ADDRESS
//user account address manage routing
router.get('/user/account/address', userAddressController.getUserAddress)

//user Account adddress add posting
router.post('/user/account/address', userAddressController.addAddressPost)

//user  adddress Edit posting
router.post('/user/account/address/edit/:addressId', userAddressController.editAddressPost)

//user delelte address
router.get('/user/account/address/delete-address/:addressId', userAddressController.deleteAddress)



//ORDERS
//Endpoint for creating an order
router.post('/user/create-order', userOrderController.createOrder)

//Complete order
router.post('/user/complete-order', userOrderController.completeOrder)

//user orders list page 
router.get('/user/account/orders', userOrderController.getOrdersList)

//endpoint for order details if click on one order
router.get('/user/account/orders/order-details/:orderId', userOrderController.OrderDetailsPage)

//Endpoint for cancelling an order
router.get('/user/account/orders/cancel-order/:orderId', userOrderController.orderCancel)



//user Product Details 
router.get('/user/product-details/:productId', userHomeController.getProductDetails)

//Category
router.get('/user/category', userHomeController.getCategory)


//WISHLIST
//This Endpoint for rendering wishlist page
router.get('/user/wishlist', userWishlistController.getWishlistPage)

//Wishlist add
router.post('/user/add-to-wishlist', userWishlistController.addToWishList)

//Wishlist remove
router.get('/user/remove-from-wishlist/:productId', userWishlistController.removeFromWishList)

//Fetch the wishlist details while load the page
router.get('/user/fetch-wishlist', userWishlistController.fetchWishlist)


//CART
//Get Cart page
router.get('/user/cart-page', userCartController.getCartPage)

//Delete from cart
router.get('/user/remove-from-cart/:productId', userCartController.removeFromCart)

//Fetch the cart details while load the page
router.get('/user/fetch-cart', userCartController.fetchCart)

//Add to cart
router.get('/user/add-to-cart/:productId', userCartController.addtoCart)



//User checkout Page
router.get('/user/checkout', userHomeController.checkoutPage)



//REVIEW
//get a review page
router.get('/user/review/:productId', userReviewController.reviewProductPage)

//review edit page
router.get('/user/review/edit/:productId', userReviewController.reviewProductEdit)

router.post('/user/review/edit', userReviewController.reveiwEditPost)

//Delete reveiew
router.get('/user/review/delete/:reviewId', userReviewController.deleteReview)
//Submit Review
router.post('/user/review', userReviewController.submitReview)

//review preview page
router.get('/user/review-preview', userReviewController.reviewPagePreview)


//Search endpoint
router.post('/user/search', userHomeController.searchProducts);

//Handling logout
router.get('/user/logout', userHomeController.logOut)


module.exports = router