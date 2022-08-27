const express = require('express')
const router = express.Router()

// import controller
const { signup, accountActivation, signin } = require('../controllers/auth')

// import validators
const { userSignUpValidator, userSignInValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

router.get('/signup', userSignUpValidator, runValidation, signup)
router.get('/account-activation', accountActivation)
router.get('/signin', userSignInValidator, runValidation, signin)

module.exports = router 