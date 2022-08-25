const express = require('express')
const router = express.Router()

// import controller
const { signup } = require('../controllers/auth')

// import validators
const { userSignUpValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

router.get('/signup', userSignUpValidator, runValidation, signup)

module.exports = router 