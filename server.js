const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()


// import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

// app app middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
// allows all origins to access to api
// app.use(cors())
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })) 
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB Error =>', err))

// middleware
app.use('/api', authRoutes)
app.use('/api', userRoutes)

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`api is running on ${port}`)
})
