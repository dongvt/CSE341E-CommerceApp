const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../util/auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

// /admin/edit-product/id => GET
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);

// /admin/edit-product/id => POST
router.post('/edit-product',isAuth,adminController.postEditProduct);

// /admin/delete-product/id => POST
router.post('/delete-product',isAuth,adminController.postDeleteProduct);

module.exports = router;
