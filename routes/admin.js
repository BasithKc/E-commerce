const express = require('express');
const router = express.Router();
const adminController= require('../Controller/adminhomeController')
const upload = require('../middlewares/multer')

router.route('/admin').get(adminController.getAdminHome);

router.route('/admin/logout').get(adminController.adminLogout);

router.route('/admin/users')
        .get(adminController.adminUserList)

router.route('/admin/products')
        .get(adminController.adminProduct);
router.route('/admin/accounts/update-profile/:userId')
        .post(adminController.adminAccountUpdate)

router.route('/admin/accounts').get(adminController.adminAccount);

router.route('/admin/product/add-product')
        .get(adminController.adminAddProductGet)
        .post(upload.array('image',10), adminController.adminAddProductPost)

router.route('/admin/delete-product/:productId')
        .get(adminController.deletProduct)

router.route('/admin/delete-category/:categoryId')
        .get(adminController.deleteCategory)

router.route('/admin/product/add-category')
        .post(adminController.adminAddCategory)

router.route('/admin/product/edit-category/:categoryId')
        .get(adminController.adminEditCategoryGet)
        .post(adminController.adminEditCategoryPost)

router.route('/admin/product/edit-product/:productId')
        .get(adminController.editProductGet)
        .post(upload.array('image',10), adminController.editProductPost)




module.exports = router;
