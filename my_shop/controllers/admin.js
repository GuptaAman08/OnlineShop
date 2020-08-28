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
    console.log(prodId)
    Product.findById(prodId, (product) => {
        
        console.log(product)
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
    const product = new Product(null, title, imageUrl, description, price);
    product.save();
    res.redirect('/');
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId

    Product.deleteProduct(prodId)
    res.redirect('/');
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl,updatedDescription, updatedPrice);
    updatedProduct.save();
    res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    });
};
