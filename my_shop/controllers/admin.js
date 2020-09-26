const Product = require('../models/product');

const ERR_MESSAGE = require("../util/auth-errors")

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: falseÆ
    });
};

exports.getEditProduct = (req, res, next) => {
    const editProduct = req.query.edit
    if (!editProduct){
        return redirect("/")
    }
    
    const prodId = req.params.productId

    Product.findById(prodId)
    .then(product => {
        if (!product){
            return res.redirect("/")
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            edit: editProduct,
            product: product
        });
    })
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({title: title, price: price, imageUrl: imageUrl , description: description, userId: req.user._id })
    // you can just pass req.user as well instead of req.user._id bcoz mongoose can automatically pick it from user object
    product.save()
        .then((result) => {
            console.log( "Product added successfully")
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('postAddProduct_err', err)
        })
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId


    Product.deleteOne({_id: prodId, userId: req.user._id})
        .then(result => {
            console.log('Product deleted succesfully')
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log("postDeleteProduct", err)
            return res.redirect("/")
        })  
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()){
                throw "User Not Authorized to perform this action"
            }
            product.title = updatedTitle,
            product.price = updatedPrice,
            product.imageUrl = updatedImageUrl,
            product.description = updatedDescription
            return product.save()
        })
        .then(result => {
            console.log("Product updated successfully")
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('postEditProduct_err', err)
            return res.redirect("/")
        })
};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        // .select("title price -_id") this methods helps in projectio 
        // .populate("userId", "-_id")  first mentions the field to be filled with data and second argument mentions projection
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            console.log(err)
        })
};
