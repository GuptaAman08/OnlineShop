const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {

    static addProduct(id, productPrice){
        //Fetch the previous cart
        //Analyze the cart => Find existing product
        //Add new product and increase the cost

        fs.readFile(p, "utf8", (err, data) => {
            let cart = {products: [], totalPrice: 0 }
            
            if (data !== ""){
                cart = JSON.parse(data)
            }

            const existingProduct = cart.products.find(prod => prod.id === id)

            cart.totalPrice += parseInt(productPrice)
    
            if (existingProduct){
                existingProduct.qty += 1
            }else{
                cart.products.push({id: id, qty: 1})
            }

            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err)
            })
        })
    }
    
    static deleteProduct(id, prodPrice){
        fs.readFile(p, "utf8", (err, data) => {
            if (err || data === ""){
                return;
            }
            
            let updatedCart = {...JSON.parse(data)}
            let prod = updatedCart.products.find(p => p.id === id)

            if (!prod){
                return
            }
            let updatedProductList = updatedCart.products.filter(p => p.id !== id)
            
            updatedCart.totalPrice -= (prod.qty * parseInt(prodPrice))
            updatedCart.products = updatedProductList

            fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                console.log(err)
            })
        })
    }

    static getCart(cb) {
        fs.readFile(p, "utf8", (err, data) => {
            if (data === ""){
                cb([])
            }else{
                cb(JSON.parse(data)) 
            }
        })
    }
}