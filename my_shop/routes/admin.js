const path = require('path');

const express = require('express');
const { check, body } = require('express-validator/check')

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
router.post('/add-product',
    [
        body("title")
            .isString()
            .isLength({
                min: 3
            })
            .trim(),
        
        body("price")
            .isFloat(),

        body("description")
            .isLength({
                min: 3,
                max: 400
            })
            .trim()
        
    ],
    authMiddleware,
    adminController.postAddProduct
);

// /admin/edit-product
router.post('/edit-product',
    [
        body("title")
            .isString()
            .isLength({
                min: 3
            })
            .trim(),
        
        body("price")
            .isFloat(),

        body("description")
            .isLength({
                min: 3,
                max: 400
            })
            .trim()
    
    ],
    authMiddleware,
    adminController.postEditProduct
);

// /admin/delete-product
router.delete('/product/:productId', authMiddleware, adminController.deleteProduct);

module.exports = router;
