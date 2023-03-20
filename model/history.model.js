/* eslint-disable import/no-extraneous-dependencies */
const { customAlphabet } = require('nanoid/async')

const moment = require('moment')
const mongoose = require('../config/database')

const DateUse = moment().format()
const statusUser = ['Rent', 'Finish']
const nanoid = customAlphabet('1234567890', 5)
const randomNumber = `ADS ${nanoid}, ${DateUse}!`

const historySchema = mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  username: { type: String, require: true },
  status: { type: String, enum: statusUser, default: 'Rent' },
  primaryIdBook: { type: String },
  idBook: { type: String },
  bookName: { type: String },
  dateRent: { type: Date, require: true, default: DateUse },
  dateEnd: { type: Date },
  penalty: { type: Number, default: 0 },
  transactionId: { type: String, defaul: randomNumber },
})

module.exports = mongoose.model('historyData', historySchema)
