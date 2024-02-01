const express = require('express');
const router = express.Router();

router.route('/admin').get((req, res) => {
  res.render('admin/adminhome.ejs', { URL: 'dashboard' });
});

router.route('/admin/logout').get((req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.route('/admin/products').get((req, res) => {
  res.render('admin/product', { URL: 'products' });
});
router.route('/admin/accounts').get((req, res) => {
  res.render('admin/account', { URL: 'accounts' });
});

router.route('/admin/product/add-product').get((req, res) => {
  res.render('admin/addproduct', { URL: 'products' });
});
module.exports = router;
