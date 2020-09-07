const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const { connectToMongo } = require('./util/database');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.fetchById("5f4f3c024e8a39e1bbff6488")
        .then(user => {
            let cart = {items: []}
            if (user.cart){
                cart = user.cart
            }

            req.user = new User(user.username, user.email, cart, user._id);
            next()
        })
        .catch(err => {
            console.log('Adding user to req object', err)
        })
})  

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
    
connectToMongo(() => {     
    app.listen(3000);
})
