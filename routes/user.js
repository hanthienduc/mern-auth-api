const express = require('express')
const router = express.Router()

// import controller
const { requireSignIn } = require('../controllers/auth')
const { read } = require('../controllers/user')

router.get('/user/:id', requireSignIn, read)

module.exports = router 