const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        edit: false
    });
};

exports.getEditProduct = (req, res, next) => {
    const editProduct = req.query.edit
    if (!editProduct){
        return redirect("/")
    }
    
    const prodId = req.params.productId

    Product.fetchSingleProduct(prodId)
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
    const product = new Product(title, price, imageUrl, description, null, req.user._id)
    product.save()
        .then((result) => {
            //console.log( result)
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('postAddProduct_err', err)
        })
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId

    Product.deleteById(prodId)
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log("postDeleteProduct", err)
        })  
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    const product = new Product(updatedTitle, updatedPrice, updatedImageUrl, updatedDescription, prodId)
    
    product.save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log('postEditProduct_err', err)
        })
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(product => {
            res.render('admin/products', {
                prods: product,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            console.log(err)
        })
};
