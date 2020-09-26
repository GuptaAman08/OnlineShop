const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require("csurf")
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require("connect-flash")

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
app.use(csrf())
app.use(flash())

app.use((req, res, next) => {
    if (!req.session.user){
        return next()
    }
    User.findById(req.session.user._id)
    .then(user => {
            req.user = user
            next()
        })
        .catch(err => {
            console.log('Post Login controller error', err)
        })
})

// instead of sending authenticated status from every controller to their views we can use res.locals to send to all view automatically 
app.use((req, res, next) =>{
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
    
mongoose
    .connect(MONGODB_CON_STRING, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(result => {
        console.log("Connected")
        app.listen(3000)
    })
    .catch(err => {
        console.log('Connection Error ', err)
        process.exit(1)
    })
