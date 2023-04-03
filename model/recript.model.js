const moment = require('moment')
const mongoose = require('../config/database')

const DateUse = moment().format('L')
const statusUser = ['Rent', 'Finish']

const recriptSchema = mongoose.Schema({
  transactionId: { type: String },
  payDate: { type: Date, default: DateUse },
  firstname: { type: String },
  lastname: { type: String },
  username: { type: String, require: true },
  status: { type: String, enum: statusUser, default: 'Finsh' },
  primaryIdBook: { type: String },
  idBook: { type: String },
  bookName: { type: String },
  dateRent: { type: Date, require: true, default: DateUse },
  dateEnd: { type: Date },
  penalty: { type: Number, default: 0 },
})

module.exports = mongoose.model('historyData', recriptSchema)
