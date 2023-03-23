const express = require('express')

const router = express.Router()
const book = require('../controller/book.controller')

router.route('/register')
  .post(book.register)

router.route('/data')
  .post(book.data)
module.exports = router
