// helps in creating secure, unique, random values.
const crypto = require("crypto")

const User = require('../models/user');
const bcrypt = require("bcryptjs"); 

// Uncomment below code for sending mails to new signed up user.
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const ERR_MESSAGES = require("../util/auth-errors")

// tells nodemailer how ur mails will be delivered. 
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: "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"
    }
}))



exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.headers.cookie.split("=")[1] === "true"
    let mssg = req.flash("loginError") 
    if (mssg.length === 0){
        mssg = null 
    }else{
        mssg = mssg[0]
    }

    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMssg: mssg
    })    
}

exports.getSignup = (req, res, next) => {
    // const isLoggedIn = req.headers.cookie.split("=")[1] === "true"
    let mssg = req.flash("signUpError") 
    if (mssg.length === 0){
        mssg = null 
    }else{
        mssg = mssg[0]
    }
    
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMssg: mssg
    })    
}

exports.getResetPwd = (req, res, next) => {
    let mssg = req.flash("resetPwdError") 
    if (mssg.length === 0){
        mssg = null 
    }else{
        mssg = mssg[0]
    }

    res.render("auth/reset-pwd", {
        path: "/reset-pwd",
        pageTitle: "Reset Password",
        errorMssg: mssg
    })
}

exports.getNewPwd = (req, res, next) => {
    const token = req.params.token
    
    User.findOne({resetToken: token, resetTokenExpireDate: { $gt: Date.now() } })
    .then(user => {
        if (!user){
            throw "Invalid Token or session expired"
        }
        let mssg = req.flash("signUpError") 
        
        if (mssg.length === 0){
            mssg = null 
        }else{
            mssg = mssg[0]
        }

        res.render("auth/new-password", {
            path: "/new-pwd",
            pageTitle: "New Password",
            errorMssg: mssg,
            userId: user._id.toString(),
            token: token
        })
    })
    .catch(err => {
        console.log('get New Pwd', err)
        if (ERR_MESSAGES.includes(err)){
            req.flash("loginError", err)
        }
        return res.redirect("/login")
    })    
}

exports.postNewPwd = (req, res, next) => {
    const pwd = req.body.password
    const userId = req.body.userId
    const token = req.body.token

    let resetUser;
    User.findOne({ 
        resetToken: token, 
        resetTokenExpireDate: { $gt: Date.now() },
        _id: userId
    })
    .then(user => {
        if (!user){
            throw "Invalid Token or session expired"
        }
        resetUser = user
        return bcrypt.hash(pwd, 12)
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpireDate = undefined
        return resetUser.save()
    })
    .then(result => {
        console.log('Password Updated Successfully')
        // req.flash("")
        return res.redirect("/login")
    })
    .catch(err => {
        if (ERR_MESSAGES.includes(err)){
            req.flash("loginError", err)
        }
        console.log("post New Pwd" , err)
        return res.redirect("/login")
    })
}

exports.postResetPwd = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err){
            throw "Some Error Occured. Please try again!!"
        }
        const token = buffer.toString("hex")
        const email = req.body.email
        
        User.findOne({email: email})
        .then(user => {
            if (!user){
                throw "User does not exists"
            }

            user.resetToken = token,
            user.resetTokenExpireDate = Date.now() + 3600000;

            return user.save()
        })
        .then(result => {
            console.log('Token Saved')
            return transporter.sendMail({
                to: email,
                from: "aman.gupta@tacto.in",
                subject: "Password Reset",
                html: `
                    <p> You requested for password reset </p>
                    <p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password. </p>
                `
            })
        })
        .then(result => {
            console.log('Pwd reset email sended successfully')
            req.flash("success", "A password reset email has been send to your respective Email ID")
            return res.redirect("/")
        })
        .catch(err => {
            if (ERR_MESSAGES.includes(err)){
                req.flash("resetPwdError", err)
            }
            console.log('post Reset Pwd error', err)
            return res.redirect("/reset")
        })
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
                console.log("Email ID already exists. Please use a different one")
                throw "Email ID already exists. Please use a different one"
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
            console.log('"Signed Up Successfully')
            req.flash("loginError", "Signed Up Successfully. Please login to proceed further!!!")
            return res.redirect("/login")
        //     return transporter.sendMail({
        //         to: email,
        //         from: "aman.gupta@tacto.in",
        //         subject: "Try to hack Indresh gmail",
        //         html: "<h1> You are Hacked </h1>"
        //     })
        // })
        // .then(result => {
        //     console.log('Mailed send Successfully')
        })
        .catch((err) => {
            if (ERR_MESSAGES.includes(err)){
                req.flash("signUpError", err)
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
                throw "Invalid username or password"
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
                console.log("Invalid username or password")
                throw "Invalid username or password"
            } 
        })
        .catch(err => {
            if (ERR_MESSAGES.includes(err)){
                req.flash("loginError" ,err)
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