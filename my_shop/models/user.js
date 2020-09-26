const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpireDate: Date,
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
            qty: {type: Number, required: true}}
        ]
    }
})

userSchema.methods.addToCart = function(prod){
    const cartProductIndex = this.cart.items.findIndex(cp => {
        // console.log(cp.productId.toString(), prod._id.toString().trim())
        return cp.productId.toString().trim() === prod._id.toString().trim()
    })
    
    const updatedCartItems = [...this.cart.items]
    
    if (cartProductIndex >= 0){
        this.cart.items[cartProductIndex].qty = this.cart.items[cartProductIndex].qty + 1
    }else{
        updatedCartItems.push({
            productId: prod._id,
            qty: 1
        })
    }
    
    this.cart = {items: updatedCartItems };
    return this.save() 
}

userSchema.methods.deleteItemFromCart = function(id){
    const updatedCartItems = this.cart.items.filter(item => {
        console.log(item.productId.toString().trim(), id.toString().trim())
        return item.productId.toString().trim() !== id.toString().trim()
    })
    
    this.cart.items = updatedCartItems
    return this.save()
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []}

    return this.save()
}

module.exports = mongoose.model("User", userSchema)
// class User{
//     constructor(username, email, cart, id){
//         this.username = username,
//         this.email = email,
//         this.cart = cart,
//         this._id = id
//     }

//     save = () => {
//         const db = getDb()

//         return db.collection("users").insertOne(this) 
//     }
    
//     addToCart = (prod) => {
//         
//     }

//     getCart = () => {
//         const db = getDb()

//         const allProdIds = this.cart.items.map(item => item.productId)

//         return db.collection("products").find({_id: {$in: allProdIds}})
//                     .toArray()
//                     .then(products => {
//                         return products.map(product => {
//                             let qty = this.cart.items.find(i => {
//                                 return i.productId.toString() === product._id.toString()
//                             }).quantity
                            
//                             let final_prod = {...product, qty}
//                             return final_prod
//                         })
//                     })
//     }

//     addOrder = () => {
//         const db = getDb()

//         let order;

//         return this.getCart()
//             .then(products => {
//                 order = {
//                     items: products,
//                     user: {
//                         _id: this._id,
//                         name: this.name, 
//                         email: this.email 
//                     }
//                 }
//                 return db.collection("orders").insertOne(order)
//             })
//             .then(result => {
//                 this.cart = {items: [] }
//                 return result
//             })
//             .then(result => {
//                 return db.collection("users").updateOne(
//                     {
//                         _id: this._id
//                     },
//                     {
//                         $set: {cart: {items: []}}
//                     }
//                 )
//             })
//     }

//     getOrders = () => {
//         const db = getDb()
        
//         return db.collection("orders").find({"user._id": this._id})
//             .toArray()

//     }

//     deleteItemFromCart = (id) => {
//         
//     }

//     static fetchById = (id) => {
//         const db = getDb()
            
//         return db.collection("users").findOne({_id: new mongodb.ObjectID(id)})
//     }   
// }

// module.exports = User