const { getDb } = require("../util/database")
const mongodb = require("mongodb")
const Product = require("./product")

class User{
    constructor(username, email, cart, id){
        this.username = username,
        this.email = email,
        this.cart = cart,
        this._id = id
    }

    save = () => {
        const db = getDb()

        return db.collection("users").insertOne(this) 
    }
    
    addToCart = (prod) => {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === prod._id.toString()
        })

        const updatedCartItems = [...this.cart.items]

        if (cartProductIndex >= 0){
            this.cart.items[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
        }else{
            updatedCartItems.push({
                productId: prod._id,
                quantity: 1
            })
        }
        const updatedCart = {items: updatedCartItems };

        const db = getDb()
        return db.collection("users").updateOne(
            {
                _id: new mongodb.ObjectID(this._id)
            },
            {   
                $set: {
                    cart: updatedCart
                }
            }            
        )
    }

    getCart = () => {
        const db = getDb()

        const allProdIds = this.cart.items.map(item => item.productId)

        return db.collection("products").find({_id: {$in: allProdIds}})
                    .toArray()
                    .then(products => {
                        return products.map(product => {
                            let qty = this.cart.items.find(i => {
                                return i.productId.toString() === product._id.toString()
                            }).quantity
                            
                            let final_prod = {...product, qty}
                            return final_prod
                        })
                    })
    }

    addOrder = () => {
        const db = getDb()

        let order;

        return this.getCart()
            .then(products => {
                order = {
                    items: products,
                    user: {
                        _id: this._id,
                        name: this.name, 
                        email: this.email 
                    }
                }
                return db.collection("orders").insertOne(order)
            })
            .then(result => {
                this.cart = {items: [] }
                return result
            })
            .then(result => {
                return db.collection("users").updateOne(
                    {
                        _id: this._id
                    },
                    {
                        $set: {cart: {items: []}}
                    }
                )
            })
    }

    getOrders = () => {
        const db = getDb()
        
        return db.collection("orders").find({"user._id": this._id})
            .toArray()

    }

    deleteItemFromCart = (id) => {
        const updatedCart = this.cart.items.filter(item => {
            return item.productId.toString() !== id.toString()
        })

        const db = getDb()

        return db.collection("users").updateOne(
            {
                _id: this._id
            },
            {
                $set: {cart: {items: updatedCart}}
            }
        )
    }

    static fetchById = (id) => {
        const db = getDb()
            
        return db.collection("users").findOne({_id: new mongodb.ObjectID(id)})
    }   
}

module.exports = User