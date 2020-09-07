const mongodb = require("mongodb")
const { getDb } = require("../util/database")

class Product {
    constructor(title, price, imageUrl, description, id, userId){
        this.title = title,
        this.price = price,
        this.imageUrl = imageUrl,
        this.description = description,
        this._id = id ? new mongodb.ObjectID(id) : null,
        this.userId = userId
    }

    save = () => {
        try {
            const db = getDb()
            let dbOp;
            if (this._id){
                dbOp = db.collection("products").updateOne(
                    {
                        _id: this._id
                    }, 
                    {
                        $set: this 
                    }
                )
            }else{
                dbOp = db.collection("products").insertOne(this)
            }

            return dbOp
                .then(result => {
                    console.log("Inserted/Updated Successfully")
                })
                .catch(err => {
                    throw err
                })

        } catch (error) {
            console.log('Inside Save method !!', error)
        }
    }


    static fetchAll = () => {
        try {
            const db = getDb()

            return db.collection("products").find()
                .toArray()
                .then(products => products)
                .catch(err => {
                    throw err
                })
        
        } catch (error) {
            console.log("fetchAll error ", error);
        }
    }

    static deleteById = (id) => {
        try {
            const db = getDb()
            
            return db.collection("products").deleteOne({_id: new mongodb.ObjectID(id)})
                        .then(result => {
                            console.log(result)
                            console.log('Deleted Successfully')
                        })
                        .catch(err => {
                            console.log('DeleteById-err', err)
                        })

        } catch (error) {
            console.log( "deleteById", error)
        }

    }

    static fetchSingleProduct = (id) => {
        try {
            const db = getDb()
            return db.collection("products").find({_id: new mongodb.ObjectID(id)})
                    .next()
                    .then(product => product)
                    .catch(err => {
                        throw err
                    })
        } catch (error) {
            console.log( "fetchSingleProduct", error)
        }
    }
}


module.exports = Product