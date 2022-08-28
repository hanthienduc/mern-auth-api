const express = require('express')
const router = express.Router()

// import controller
const { signup, accountActivation, signin, forgotPassword, resetPassword } = require('../controllers/auth')

// import validators
const { userSignUpValidator, userSignInValidator,forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

router.post('/signup', userSignUpValidator, runValidation, signup)
router.post('/account-activation', accountActivation)
router.post('/signin', userSignInValidator, runValidation, signin)

// forgot reset password
router.put('/forgot-password', forgotPasswordValidator, forgotPassword)
router.put('/reset-password', resetPasswordValidator, resetPassword)

module.exports = router 