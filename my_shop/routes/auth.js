const express = require('express');
const { check, body } = require('express-validator/check')

const authController = require('../controllers/auth');

const router = express.Router();
const User = require('../models/user');


router.get("/login", authController.getLogin)

router.get("/signup", authController.getSignup)

router.get("/reset", authController.getResetPwd)

router.get("/reset/:token", authController.getNewPwd)

router.post("/new-password", authController.postNewPwd)

router.post("/reset", authController.postResetPwd)

router.post("/login", 
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .normalizeEmail(),

        body("password", "Please enter a password with only number and alphabets and should be atleast 6 characters long." ) // use the second argument if you want only one meesage to return for all types of error encountered
            .isLength({
                min: 6
            })
            .isAlphanumeric()
            .trim(),
    ], 
    authController.postLogin)

router.post("/logout", authController.postLogout)

router.post(
    "/signup", 
    [
        check("email")
            .isEmail()
            .withMessage("Please enter a valid email")
            .normalizeEmail()
            .custom((value, {req}) => {
            //     if (value !== someCustomValidation){
            //         throw new Error("custom message")
            //         or
            //         return false //to show default message
            //     }
            //     return true // if all went well
                return User.findOne({email: value})
                    .then((user) => {
                        if (user){
                            return Promise.reject("Email ID already exists. Please use a different one")
                        }
                    })
            }),

        // The second argument bcomes the default message for every type of validation that you peform on a field so avoid using withMessage() everytime.
        body("password", "Please enter a password with only number and alphabets and should be atleast 6 characters long.")
            .isLength({
                min: 6
            })
            .isAlphanumeric()
            .trim(),

        body("confirmPassword")
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password Mismatch")
                }
                return true
            })
    ],
    authController.postSignup
)

module.exports = router;