const User = require('../models/user')

exports.read = (req, res) => {
  const userId = req.params.id
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    user.hashed_password = undefined
    user.salt = undefined
    return res.json({ user })
  })
}

exports.update = (req, res) => {
  // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body)
  const { name, password } = req.body
  if (!req.user) {
    return res.json(req.user)
  }
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        err: 'User not found'
      })
    }
    if (!name) {
      return res.status(400).json({
        err: 'Name is required'
      })
    } else {
      user.name = name
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          err: 'Password should be min 6 characters long'
        })
      } else {
        user.password = password
      }
    }

    user.save((err, updatedUser) => {
      if (err) {
        console.log('USER UPDATE ERROR', err)
        return res.status(400).json({
          err: 'User update failed'
        })
      }
      updatedUser.hashed_password = undefined
      updatedUser.salt = undefined
      res.json({ updatedUser })
    })
  })
}