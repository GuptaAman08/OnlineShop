const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoose = require("mongoose")
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { exit } = require('process');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5f59da0eeddbb91a94e95138")
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => {
            console.log('Adding user to req object', err)
        })
})  

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
    
mongoose
    .connect("mongodb+srv://aman:snZ5L0a4JMbsXqWG@primary.u62r1.mongodb.net/shop?retryWrites=true&w=majority", {useUnifiedTopology: true, useNewUrlParser: true})
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
