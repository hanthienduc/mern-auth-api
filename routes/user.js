const express = require('express')
const router = express.Router()

// import controller
const { requireSignIn, adminMiddleware } = require('../controllers/auth')
const { read, update } = require('../controllers/user')

router.get('/user/:id', requireSignIn, read)
router.put('/user/update', requireSignIn, update)
router.put('/admin/update', requireSignIn, adminMiddleware, update)

module.exports = router 