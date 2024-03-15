//third party modules
const express = require('express');

const router = express.Router();

//Importing controllers
const adminController = require('../Controller/adminhomeController');
const adminCouponController = require('../Controller/adminCouponController')

const { upload, userProfile, banner } = require('../utilities/multer');//multer function Importing

//Endpoint for admin home page rendering (dashboard)
router.route('/adminhome').get(adminController.getAdminHome);

//Endpoint for admin logout
router.route('/admin/logout').get(adminController.adminLogout);


//Endpoint for listing all users 
router.route('/admin/users').get(adminController.adminUserList);

//Edit user
router
        .route('/admin/users/edit-user/:userId')
        .get(adminController.adminUserListEditPage);

//Delete user
router
        .route('/admin/users/delete-user/:userId')
        .get(adminController.adminUserDelete);
//Block user
router
        .route('/admin/users/block-user/:userId')
        .post(adminController.adminUserBlockpost);

//Unblock User
router
        .route('/admin/users/unblock-user/:userId')
        .post(adminController.adminUserUnblockPost);


//Endpoint for edit admin profile
router
        .route('/admin/accounts/update-profile/:userId')
        .post(userProfile.single('avatar'), adminController.adminAccountUpdate);

router.route('/admin/accounts').get(adminController.adminAccount);

router
        .route('/admin/accounts/delete-profile/:userId')
        .get(adminController.adminDeleteAccount);

router
        .route('/admin/accounts/reset-password')
        .get(adminController.adminResetPasswordGet)
        .post(adminController.adminResetPasswordPost);

//product listing
router.route('/admin/products').get(adminController.adminProduct);

router
        .route('/admin/product/add-product')
        .get(adminController.adminAddProductGet)
        .post(upload.array('image', 10), adminController.adminAddProductPost);

router
        .route('/admin/delete-product/:productId')
        .get(adminController.deletProduct);

router
        .route('/admin/delete-category/:categoryId')
        .get(adminController.deleteCategory);

router
        .route('/admin/product/add-category')
        .post(adminController.adminAddCategory);

router
        .route('/admin/product/edit-category/:categoryId')
        .get(adminController.adminEditCategoryGet)
        .post(adminController.adminEditCategoryPost);

router
        .route('/admin/product/edit-product/:productId')
        .get(adminController.editProductGet)
        .post(upload.array('image', 10), adminController.editProductPost);

//Endpoint for listing banners  and adding new one
router
        .route('/admin/banners')
        .get(adminController.adminBannerGet) //render banner page
        .post(banner.single('image'), adminController.adminBannerPost);//posting banner

//Delete banner
router
        .route('/admin/banners/delete-banner/:bannerId')
        .get(adminController.adminBannerDelete);
//Edit banner page and submit
router
        .route('/admin/banners/edit-banner/:bannerId')
        .get(adminController.adminBannerEdit)//render banner edit page
        .post(banner.single('image'), adminController.adminBannerEditPost);//endpoint after submit banner page

//End point for orders listing 
router.route('/admin/orders')
        .get(adminController.adminOrders)
        .post(adminController.adminOrders)

//end point for details of a order when clicked on the eidt buttton
router.route('/admin/order/edit-order/:orderId')
        .get(adminController.orderEditPage)

//End point for post  order status edit
router.route('/order/order-details/edit/:orderId')
        .get(adminController.orderEditStatus)

//Endpoint for cancelling an order
router.route('/admin/orders/cancel-order/:orderId')
        .get(adminController.orderCancel)

//Endpoint to handle Coupons
router.route('/admin/coupons')
        .get(adminCouponController.adminCouponPage)//get coupon page
        .post(adminCouponController.addCoupon)//Add coupon
router
        .route('/admin/coupons/edit-coupon/:couponId')
        .get(adminCouponController.adminCouponEdit) //edit coupon page rendering endpointt
        .post(adminCouponController.adminCouponEditPost) //edit coupon and submit

router
        .route('/admin/coupons/delete-coupon/:couponId')
        .get(adminCouponController.adminCouponDelete); //Endpoint for deleting coupon



module.exports = router;
