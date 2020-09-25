const User = require('../models/user');
const bcrypt = require("bcryptjs"); 


const ERR_MESSAGES = ["User Already Exists", "User does not exists", "Password mismatch"]

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.headers.cookie.split("=")[1] === "true"
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login"
    })    
}

exports.getSignup = (req, res, next) => {
    // const isLoggedIn = req.headers.cookie.split("=")[1] === "true"
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup"
    })    
}

exports.postSignup = (req, res, next) => {
    const fullName = req.body.fullName
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    User.findOne({email: email})
        .then((user) => {
            if (user){
                // User already exist in DB
                console.log('User already exists')
                throw "User Already Exists"
            }

            // hashing password is an async task so need to return a promise and this hash can't be decrypted
            // salt value basically implies the number of rounds of hashing you need 
            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            const newUser = new User({
                name: fullName,
                email: email, 
                password: hashedPassword,
                cart: { items: [] }
            })
            return newUser.save()
        })
        .then(result => {
            console.log('Signed Up Successfully!!!')
            return res.redirect("/login")
        })
        .catch((err) => {
            if (ERR_MESSAGES.includes(err)){
                return res.redirect("/signup")
            }
            console.log('post Signup Controller error', err)
        })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    // Below commented code is for reference and to have concept clear 

    // fetched user object is mongoose model but once u redirect to some other route then the session middleware on app.js file mount user on session object by going to MongoDBStore and fetch usering object for you and not the mongoose model
    // console.log(`${req.session.user instanceof User}`)
    // req.session.isLoggedIn = true
    // req.session.user = user

    //This is required bcoz it takes sometime to write session in mongodb bcoz of which in this time span you do not see loggedin navbar items.So, to avoid this condition better to redirect after writing to mongodb completes
    // req.session.save((err) => {
    //     console.log('post Login controller inside try block err', err)
    //     res.redirect("/")
    // })
    let storeUser;
    User.findOne({email: email})
        .then(user => {
            storeUser = user
            if (!user){
                console.log('User is not signed up')
                throw "User does not exists"
            }

            return bcrypt.compare(password, user.password)
        })
        .then(result => {
            // result is true of db pwd and user entered pwd matches else result is false
            if (result){
                req.session.isLoggedIn = true
                req.session.user = storeUser

                return req.session.save((err) => {
                    if (err){
                        console.log('post Login controller inside session save', err)
                    }
                    console.log('Logged In Successfully !!!')
                    res.redirect("/")
                })
            }else{
                console.log("Password Mis-match")
                throw "Password mismatch"
            } 
        })
        .catch(err => {
            if (ERR_MESSAGES.includes(err)){
                return res.redirect("/login")
            }
            console.log('Post Login controller error', err)
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err){
            console.log('logout Controller err', err)
        }
        res.redirect("/")
    })
}