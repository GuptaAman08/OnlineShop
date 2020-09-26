const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const authMiddleware = require("../middleware/is-auth")

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', authMiddleware, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', authMiddleware, adminController.getProducts);

// /admin/edit-product => 
router.get('/edit-product/:productId', authMiddleware, adminController.getEditProduct);

// /admin/add-product => POST
router.post('/add-product', authMiddleware, adminController.postAddProduct);

// /admin/edit-product
router.post('/edit-product', authMiddleware, adminController.postEditProduct);

// /admin/delete-product
router.post('/delete-product', authMiddleware, adminController.postDeleteProduct);

module.exports = router;
