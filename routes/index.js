/* eslint-disable no-undef */
const express = require('express')

// const routes = express.Router()
const auth = require('../middleware/auth')
const admin = require('./admin.route')
const book = require('./book.route')
const transaction = require('./transaction.route')
const user = require('./user.route')

const app = express()
app.use(express.json())

// app.use('/', routes)
app.use('/admin', admin)
app.use('/book', book)
app.use('/transaction', auth, transaction)
app.use('/user', user)

module.exports = app
