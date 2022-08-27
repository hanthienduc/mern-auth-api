const express = require('express')
const router = express.Router()

// import controller
const { signup, accountActivation, signin } = require('../controllers/auth')

// import validators
const { userSignUpValidator, userSignInValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

router.post('/signup', userSignUpValidator, runValidation, signup)
router.post('/account-activation', accountActivation)
router.post('/signin', userSignInValidator, runValidation, signin)

module.exports = router 