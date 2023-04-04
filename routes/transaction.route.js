const express = require('express')

const router = express.Router()
const transaction = require('../controller/transaction.controller')

router.route('/rent')
  .post(transaction.rent)

router.route('/returnByTransactionId')
  .post(transaction.returnByTransactionId)

router.route('/transaction')
  .post(transaction.transaction)

module.exports = router
