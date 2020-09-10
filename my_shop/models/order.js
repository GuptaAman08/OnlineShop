const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema({
    products: [
        {
            product: {type: Object, required: true},
            qty: { type: Number }
        }
    ],
    user: {
        name: { 
            type: String, required: true 
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        }
    }
})

module.exports = mongoose.model("Order", userSchema)