const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();


router.get("/login", authController.getLogin)

router.get("/signup", authController.getSignup)

router.get("/reset", authController.getResetPwd)

router.get("/reset/:token", authController.getNewPwd)

router.post("/new-password", authController.postNewPwd)

router.post("/reset", authController.postResetPwd)

router.post("/login", authController.postLogin)

router.post("/logout", authController.postLogout)

router.post("/signup", authController.postSignup)

module.exports = router;