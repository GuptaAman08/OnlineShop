const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId, (targetProd) => {
        res.render("shop/product-detail", {product: targetProd, pageTitle: targetProd.title, path: "/products" })
    })
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(product => {
            const cartProduct = []
            for (let i=0; i < product.length; i++){
                prod = product[i]
                if (cart.products){
                    const productInCart = cart.products.find(p => prod.id === p.id)
                    if (productInCart){
                        cartProduct.push({productData: prod, qty: productInCart.qty})
                    }
                }else{
                    break
                }
            }        
            
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProduct
            });
        })
    })
};

exports.postDeleteCartProduct = (req, res, next) => {
    const prodId = req.body.productId

    Product.findById(prodId, (product) => {
        Cart.deleteProduct(prodId, product.price)
        res.redirect("/cart")
    })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    Product.findById(productId, (product) => {
        Cart.addProduct(productId, product.price)
    })

    res.redirect("/cart")
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};
