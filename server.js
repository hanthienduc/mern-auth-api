const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()


// import routes
const authRoutes = require('./routes/auth')

// app app middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
// app.use(cors()) // allows all origins to access to api
if (process.env.NODE_ENV === 'development') {
  // app.use(cors({ origin: process.env.CLIENT_URL }))
  app.use(cors())
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB Error =>', err))

// middleware
app.use('/api', authRoutes)

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`api is running on ${port}`)
})
