const express = require('express');
const router = express.Router();
const adminController = require('../Controller/adminhomeController');
const { upload, userProfile, banner } = require('../middlewares/multer');

router.route('/adminhome').get(adminController.getAdminHome);

router.route('/admin/logout').get(adminController.adminLogout);

router.route('/admin/users').get(adminController.adminUserList);

router
        .route('/admin/users/edit-user/:userId')
        .get(adminController.adminUserListEditPage);
router
        .route('/admin/users/delete-user/:userId')
        .get(adminController.adminUserDelete);
router
        .route('/admin/users/block-user/:userId')
        .post(adminController.adminUserBlockpost);
router
        .route('/admin/users/unblock-user/:userId')
        .post(adminController.adminUserUnblockPost);

router.route('/admin/products').get(adminController.adminProduct);

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

router
        .route('/admin/banners')
        .get(adminController.adminBannerGet)
        .post(banner.single('image'), adminController.adminBannerPost);
router
        .route('/admin/banners/delete-banner/:bannerId')
        .get(adminController.adminBannerDelete);
router
        .route('/admin/banners/edit-banner/:bannerId')
        .get(adminController.adminBannerEdit)
        .post(banner.single('image'), adminController.adminBannerEditPost);

//End point for orders listing 
router.route('/admin/orders')
        .get(adminController.adminOrders)

//end point for details of a order when clicked on the eidt buttton
router.route('/admin/order/edit-order/:orderId')
        .get(adminController.orderEditPage)

//End point for order status edit
router.route('/order/order-details/edit/:orderId')
        .get(adminController.orderEditStatus)

//Endpoint to handle Coupons
router.route('/admin/coupons')
        .get(adminController.adminCouponPage)
        .post(adminController.addCoupon)
router
        .route('/admin/coupons/edit-coupon/:couponId')
        .get(adminController.adminCouponEdit) //edit coupon page rendering endpointt
        .post(adminController.adminCouponEditPost) //edit coupon and submit
router
        .route('/admin/coupons/delete-coupon/:couponId')
        .get(adminController.adminCouponDelete);

module.exports = router;
