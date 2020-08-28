const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const Cart = require('./cart');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, "utf8" ,(err, fileContent) => {
        if (fileContent === "") {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    // same method is used for creation and updation
    save() {
        getProductsFromFile(products => {
            // this if blocks execute for products that are suppose to be updated !!!!
            if (this.id){
                let existingProductIndex = products.findIndex(prod => prod.id === this.id)
                let updatedProducts = [...products]
                updatedProducts[existingProductIndex] = this 
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });
            }else{
                this.id = uuidv4()
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
    }

    static deleteProduct(id){
        getProductsFromFile(products => {
            const product = products.find(p => p.id == id )
            const updatedProducList = products.filter(prod => prod.id !== id)
            fs.writeFile(p, JSON.stringify(updatedProducList), (err) => {
                if(!err){
                    Cart.deleteProduct(id, product.price)
                }
            })
        })
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb){
        getProductsFromFile(products => {
            let product = products.find(prod => prod.id === id)
            cb(product)
        })
    }
};
