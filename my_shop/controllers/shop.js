const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.findAll()
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
    Product.findByPk(prodId)
        .then((product) => {
            res.render("shop/product-detail", {product: product, pageTitle: product.title, path: "/products" })
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getIndex = (req, res, next) => {
    Product.findAll()
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
    .then(cart => {
        cart.getProducts()
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        })
        .catch(err => {
            console.log('getCart-err', err)
        })
    })
    .catch(err => {
        console.log(err)
    })
};

exports.postDeleteCartProduct = (req, res, next) => {
    const prodId = req.body.productId
    
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where: { id: prodId}})
        })
        .then(products => {
            const product = products[0]
            return product.cartItem.destroy()
        })
        .then(result => {
            res.redirect("/cart")
        })
        .catch(err => {
            console.log("Delete Card Product", err)
        })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    let final_cart, final_qty = 1;
    req.user.getCart()
    .then(cart => {
        final_cart = cart
        return cart.getProducts({where: {id: productId}})
    })
    .then(products => {
        let product;
        if (products.length > 0){
            product = products[0]
        }
        if (product){
            final_qty += product.cartItem.qty 
        }
        return Product.findByPk(productId)
    })  
    .then(product => {
        return final_cart.addProduct(product, {
            through: { qty: final_qty }
        })
    })
    .then(() => {
        res.redirect("/cart")
    })
    .catch(err => {
        console.log('postCard-err', err)
    })
};

exports.postOrder = (req, res, next) => {
    let allProduct, fetchCart;
    req.user.getCart()
        .then(cart => {
            fetchCart = cart
            return cart.getProducts()
        })
        .then(products => {
            allProduct = products
            return req.user.createOrder()
        })
        .then(order => {
            order.addProducts(allProduct.map(prod => {
                    prod.orderItem = { qty: prod.cartItem.qty }
                    return prod
                })
            )
        })
        .then(result => {
            return fetchCart.setProducts(null)
        })
        .then(result => {
            res.redirect("/orders")
        })
        .catch(err => {
            console.log('postOder-err', err)
        })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include: ["products"]})
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
