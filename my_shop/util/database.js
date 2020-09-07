const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db;

const connectToMongo = (callback) => {
    
    MongoClient.connect("mongodb+srv://aman:u29iEWdkhXlkX7sH@primary.u62r1.mongodb.net/shop?retryWrites=true&w=majority", { 
        useUnifiedTopology: true 
    })
    .then(client => {
        console.log('Connected')
        _db = client.db()
        callback()
    })
    .catch(err => {
        console.log('connection failed', err)
    })
}


const getDb = () => {
    if (_db){
        return _db
    }
    throw "No Such Database exists"
}

exports.connectToMongo = connectToMongo
exports.getDb = getDb