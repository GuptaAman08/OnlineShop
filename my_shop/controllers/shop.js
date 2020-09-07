const Product = require('../models/product');
//const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(product => {
            res.render('shop/product-list', {
                prods: product,
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
    Product.fetchSingleProduct(prodId)
        .then((product) => {
            res.render("shop/product-detail", {product: product, pageTitle: product.title, path: "/products" })
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(product => {
            res.render('shop/index', {
                prods: product,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(products => {
        // console.log(products)
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
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

    Product.fetchSingleProduct(productId)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(result => {
            console.log('Item added to cart successfully')
            res.redirect("/cart")
        })
        .catch(err => {
            console.log('postCard err',err)
        })
};

exports.postOrder = (req, res, next) => {
    let allProduct, fetchCart;
    req.user.addOrder()
        .then(result => {
            res.redirect("/orders")
        })
        .catch(err => {
            console.log('postOder-err', err)
        })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then(orders => {
        // console.log(orders)
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
