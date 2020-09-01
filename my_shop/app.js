const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
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

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE"})
User.hasMany(Product)

User.hasOne(Cart)
Cart.belongsTo(User)

Product.belongsToMany(Cart, { through: CartItem} )
Cart.belongsToMany(Product, { through: CartItem} )

Order.belongsTo(User)
User.hasMany(Order)

Order.belongsToMany(Product, {through: OrderItem})

sequelize.sync(/**{force: true}**/)
    .then(res => {
        return User.findByPk(1)
    })
    .then(users => {
        if (!users){
            return User.create({name: "Aman Gupta", email: "random12@gmail.com"})
        }
        return users
    })
    .then(users => {
        return users.createCart()
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log('mmain_app_err', err)
    })

