const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const authMiddleware = require("../middleware/is-auth")

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', authMiddleware, shopController.getCart);

router.get('/checkout', authMiddleware, shopController.getCheckout);

router.post('/confirm-payment-success-from-stripe-webhook', authMiddleware, shopController.postConfirmPayment)

router.get('/checkout/success', authMiddleware, shopController.postOrder);

router.get('/checkout/cancel', authMiddleware, shopController.getCheckout);

router.post('/cart', authMiddleware, shopController.postCart);

router.post('/cart-delete-item', authMiddleware, shopController.postDeleteCartProduct);

router.get('/orders', authMiddleware, shopController.getOrders);

router.get("/orders/:orderId", authMiddleware, shopController.getInvoice)
// router.get('/checkout', shopController.getCheckout);

module.exports = router;
