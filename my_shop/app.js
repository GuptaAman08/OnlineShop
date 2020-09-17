const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const mongoose = require("mongoose")
const User = require('./models/user');

const MONGODB_CON_STRING = "mongodb+srv://aman:snZ5L0a4JMbsXqWG@primary.u62r1.mongodb.net/shop"

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_CON_STRING,
    collection: "sessionStore"
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "ShouldBeABigString", resave: false, saveUninitialized: false, store: store}));


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
    
mongoose
    .connect(MONGODB_CON_STRING, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(result => {
        console.log("Connected")
        return User.findOne()
    })
    .then(user => {
        if (!user){
            const user = new User({name: "aman", email: "aman.gupta@tacto.in", cart: { items: [] } })
            user.save() 
        }
        app.listen(3000)
    })
    .catch(err => {
        console.log('Connection Error ', err)
        process.exit(1)
    })
