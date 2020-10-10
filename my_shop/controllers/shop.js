const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit') 

const Product = require('../models/product');
const Order = require('../models/order');
const { getBaseUrl } = require("../util/get-url")

const ITEMS_PER_PAGE = 3

exports.getProducts = (req, res, next) => {
    const pageNo = +req.query.page || 1 
    let totalCount, mainUrlPart = getBaseUrl(req.originalUrl);

    let mssg = req.flash("success") 
    if (mssg.length === 0){
        mssg = null 
    }else{
        mssg = mssg[0]
    }
    
    Product.find().countDocuments()
    .then((count) => {
        totalCount = count
        
        return Product.find()
        .skip((pageNo - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Products',
            path: '/products',
            successFlashMssg: mssg,
            totalProducts: totalCount,
            hasNextPage: ( ITEMS_PER_PAGE * pageNo ) < totalCount,
            hasPreviousPage: pageNo > 1,
            nextPage: pageNo + 1,
            previousPage: pageNo - 1,
            lastPage: Math.ceil(totalCount / ITEMS_PER_PAGE),
            currentUrl: mainUrlPart
        });
    })
    .catch(err => {
        const error = new Error(err)
        error.httpStatuCode = 500
        return next(error)
    })
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId)
        .then((product) => {
            console.log(product.title)
            res.render("shop/product-detail", {
                product: product,
                pageTitle: product.title,
                path: "/products"
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatuCode = 500
            return next(error)
        })
};

exports.getIndex = (req, res, next) => {
    const pageNo = +req.query.page || 1 
    let totalCount, mainUrlPart = getBaseUrl(req.originalUrl);;
    

    let mssg = req.flash("success") 
    if (mssg.length === 0){
        mssg = null 
    }else{
        mssg = mssg[0]
    }

    Product.find().countDocuments()
    .then((count) => {
        totalCount = count

        return Product.find()
            .skip((pageNo - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
        // let hasNextPage = ( ITEMS_PER_PAGE * pageNo ) < totalCount
        // let hasPreviousPage = pageNo > 1
        // let nextPage = pageNo + 1
        // let previousPage = pageNo - 1
        // let lastPage = Math.ceil(totalCount / ITEMS_PER_PAGE)

        // console.log(hasNextPage, hasPreviousPage, nextPage, previousPage, lastPage)
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            successFlashMssg: mssg,
            totalProducts: totalCount,
            hasNextPage: ( ITEMS_PER_PAGE * pageNo ) < totalCount,
            hasPreviousPage: pageNo > 1,
            nextPage: pageNo + 1,
            previousPage: pageNo - 1,
            lastPage: Math.ceil(totalCount / ITEMS_PER_PAGE),
            currentUrl: mainUrlPart
        });
    })
    .catch(err => {
        console.log('Inside index controller', err)
        const error = new Error(err)
        error.httpStatuCode = 500
        return next(error)
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
        const error = new Error(err)
        error.httpStatuCode = 500
        return next(error)
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
            const error = new Error(err)
            error.httpStatuCode = 500
            return next(error)
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
            const error = new Error(err)
            error.httpStatuCode = 500
            return next(error)
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
                email: req.user.email,
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
        const error = new Error(err)
        error.httpStatuCode = 500
        return next(error)
    })
}

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
    .then(orders => {
        // console.log('orders', orders)
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
            
        });
    })
    .catch(err => {
        const error = new Error(err)
        error.httpStatuCode = 500
        return next(error)
    })
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',

    });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId

    Order.findById(orderId)
    .then(order => {
        if (!order){
            return next(new Error("No order found!!!"))
        }

        if (order.user.userId.toString() !== req.user._id.toString()){
            return next("You are not allowed to download this invoice")
        }

        const invoiceName = "invoice-" + orderId + ".pdf"
        const invoicePath = path.join("data", "Invoices", invoiceName)

        // This pdfDoc is a readable stream
        const pdfDoc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

        // The below line ensures to save a copy of this pdf in our file system as well
        pdfDoc.pipe(fs.createWriteStream(invoicePath))
        pdfDoc.pipe(res)

        // This allows to write a line of text in PDF Document
        pdfDoc.fontSize(25).text("Invoice", {
            align: "center"
        })

        pdfDoc.text("--------------------------------------------------------")
        pdfDoc.moveDown(2);

        let totalPrice = 0
        order.products.forEach(prod => {
            totalPrice += (prod.qty * prod.product.price)
            pdfDoc.fontSize(12).text(`${prod.product.title}-${prod.qty} x $${prod.product.price}`)
        });
        pdfDoc.moveDown();
        pdfDoc.text("------------------")
        pdfDoc.fontSize(18).text(`Total Price $${totalPrice}`)

        // When this line gets executed the file will be written to our filesystem and the response will be send. 
        pdfDoc.end()


        

        // Use the below commented code for allow downloading a stored pdf in your file system. 
        // const fileReadStream = fs.createReadStream(invoicePath)
        // res.setHeader('Content-Type', 'application/pdf')

        // use attachment inside of inline for directly downloading the pdf file instead of displaying it as web package and then leeting user to download them on their own.
        //  res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

        // fileReadStream.pipe(res)
    })
    .catch(err => {
        return next(err)
    })
};
