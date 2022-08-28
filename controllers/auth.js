const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { expressjwt } = require('express-jwt')
const _ = require('lodash')
// using this for testing purpose only 
// exports.signup = (req, res) => {

//   // console.log('REQ BODY ON SIGNUP', req.body)
//   const { name, email, password } = req.body

//   User.findOne({ email: email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: 'Email is taken'
//       })
//     }
//   })

//   let newUser = new User({ name, email, password })

//   newUser.save((err, success) => {
//     if (err) {
//       console.log('SIGNUP ERROR', err)
//       return res.status(400).json({
//         error: err
//       })
//     }
//     res.json({
//       message: 'Signup success! Please signIn'
//     })
//   })

// }

const { sendEmailWithNodemailer } = require('../helpers/email')
const user = require('../models/user')

// controllers/auth
exports.signup = (req, res) => {
  const { name, email, password } = req.body

  User.findOne({ email: email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken',
      })
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: `${process.env.JWT_EXPIRES_IN}d` }
    )

    const emailData = {
      from: `${process.env.GMAIL_USER}`, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email, // WHO SHOULD BE RECEiVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
      subject: "ACCOUNT ACTIVATION LINK",
      html: `
        <h1>Please use the following link to activate your account</h1>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    }

    sendEmailWithNodemailer(req, res, emailData, 'activate your account')

  })
}

exports.accountActivation = (req, res) => {
  const { token } = req.body

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decodedToken) {
      if (err) {
        console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err)
        return res.status(401).json({
          error: 'Expired link. Signup again'
        })
      }

      const { name, email, password } = jwt.decode(token)

      const user = new User({ name, email, password })

      user.save((err, user) => {
        if (err) {
          console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err)
          return res.status(401).json({
            error: 'Error saving user in database. Try signup again'
          })
        }
        return res.json({
          message: 'Signup success. please signin.'
        })
      })
    })
  } else {
    return res.json({
      message: 'Something went wrong. please try again!'
    })
  }
}

/**
 * check if user is trying to signin but haven't signup yet
 * check if password match hashed_password that is saved in db
 * if yes, generate token with expiry
 * the token will be sent to client/react
 * it will be used as jwt based authentication system
 * we can allow user to access protected routes later if they have valid token 
 * so jwt token is like password with expiry
 * in successful signin we will send user info and valid token
 * this token will be send back to server from client/react to access protected route
*/
exports.signin = (req, res) => {
  const { email, password } = req.body
  // check if user exist 
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please signup'
      })
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and password do not match'
      })
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const { _id, name, email, role } = user

    return res.json({
      token,
      user: { _id, name, email, role }
    })
  })
}
exports.requireSignIn = expressjwt({
  secret: process.env.JWT_SECRET, algorithms: ['HS256']
})

exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.'
      })
    }

    req.profile = user
    next();
  })
}

exports.forgotPassword = (req, res) => {
  const { email } = req.body

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist'
      })
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_RESET_PASSWORD,
      { expiresIn: `10m` }
    )

    const emailData = {
      from: `${process.env.GMAIL_USER}`,
      to: email,
      subject: "Password Reset link",
      html: `
        <h1>Please use the following link to reset your password</h1>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    }

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log('RESET PASSWORD LINK ERROR', err)
        return res.status(400).json({
          error: 'Database connection error on user password forgot request'
        })
      } else {
        sendEmailWithNodemailer(req, res, emailData, 'reset your password')
      }
    })

  })
}

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'Expired link. Try again'
        })
      }

      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'Something went wrong. Try later'
          })
        }
      })

      const updatedFields = {
        password: newPassword,
        resetPasswordLink: ''
      }

      user = _.extend(user, updatedFields)

      user.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: 'Error resetting user password'
          })
        }
        res.json({
          message: `Great! Now you can login with your password`
        })
      })
    })
  }
}