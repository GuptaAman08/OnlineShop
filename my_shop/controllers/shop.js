const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId)
        .then((product) => {
            res.render("shop/product-detail", {product: product, pageTitle: product.title, path: "/products" })
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getCart = (req, res, next) => {
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
        // console.log( user.cart.items)
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: user.cart.items
        });
        
    })
    .catch(err => {
        console.log(err)
    })
};

exports.postDeleteCartProduct = (req, res, next) => {
    const prodId = req.body.productId
    
    req.user.deleteItemFromCart(prodId)
        .then(result => {
            console.log("Delete Card Product")
            res.redirect("/cart")
        })
        .catch(err => {
            console.log("Delete Card Product error", err)
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            console.log('Item added to cart successfully')
            res.redirect("/cart")
        })
        .catch(err => {
            console.log('postCard err', err)
        })
};

exports.postOrder = (req, res, next) => {
    req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(item => {
            // _doc basically help you in pulling only the data and ignore the metadata in the populated field
            return {qty: item.qty, product: { ...item.productId._doc}}
        })
        
        const order = new Order({
            products: products,
            user: {
                name: req.user.name,
                userId: req.user._id
            }
        })
        return order.save()
    })    
    .then(result => {
        return req.user.clearCart()
    })
    .then(result => {
        res.redirect("/orders")
    })
    .catch(err => { 
        console.log('postOder-err', err)
    })
}

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
    .then(orders => {
        // console.log('orders', orders)
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders
        });
    })
    .catch(err => {
        console.log('getOrders-err', err)
    })
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};
