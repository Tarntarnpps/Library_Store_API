/* eslint-disable max-len */
const moment = require('moment')
// const { create } = require('lodash')
const User = require('../model/user.model')
const Book = require('../model/book.model')
const History = require('../model/history.model')
const { Response, codeStatus, httpStatus } = require('../config/response')
const { calDate, createTransactionId } = require('../config/service')

// Rent
exports.rent = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username,
      idBooks,
    } = req.body
    const DateUse = moment().format('L')
    // check admin before save
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AdminReqFailed))
    }
    let bookRents = []
    // check user role before save
    const user = await User.findOne({ role: 'USER', username }).select('firstname lastname').lean()
    if (!(user)) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.UserReqFailed))
    }
    const { firstname, lastname } = user
    const book = await Book.find({ idBook: { $in: idBooks }, status: 'Avaliable' }).select('idBook bookName primaryIdBook').lean()
    if (book.length === 0) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.BookReqFailed))
    }
    const currentBookRent = await History.find({ username, status: 'Rent' }).select('idBook bookName').lean()
    if (currentBookRent.length >= 5) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.HistoryReqFailed))
    }
    const currentRentCount = currentBookRent.length
    const avaliableRent = 5 - currentRentCount
    if (book.length > avaliableRent) {
      return res.status(httpStatus.BookRentNotAvaliable).json(
        Response(codeStatus.BookRentNotAvaliable),
      )
    }
    for (let i = 0; i < book.length; i += 1) {
      const transactionId = createTransactionId()
      const _book = book[i] // array
      const { idBook, bookName, primaryIdBook } = _book // obj
      // หาหนังสือ idBook เดียวกันแต่ถูกยืมแล้ว
      const _currentBookRent = currentBookRent.find((v) => v.idBook === idBook)
      // หาหนังสือที่ชื่อเดียวกัน แต่คนละ idBook ที่ถูกยืมไปแล้ว
      const __currentBookRent = currentBookRent.find((v) => v.bookName === bookName && v.idBook !== idBook)
      if (!(_currentBookRent || __currentBookRent)) {
        const primaryBookList = await Book.find({
          primaryIdBook,
          status: 'Avaliable',
        }).lean()
        const bookCount = primaryBookList.length
        if (bookCount > 2) {
          await Book.updateOne({
            idBook,
            status: 'Avaliable',
          }, {
            status: 'Rent',
          })
          const bookRent = await new History({
            firstname,
            lastname,
            username,
            primaryIdBook,
            idBook,
            bookName,
            dateRent: DateUse,
            transactionId,
          }).save()
          bookRents = [
            ...bookRents,
            bookRent,
          ]
        }
      }
    }
    if (bookRents.length === 0) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed))
    }
    // eslint-disable-next-line max-len
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone,
      {
        data: bookRents,
      }))
  } catch (e) {
    console.log(e)
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}

// Return By transactionId
exports.returnByTransactionId = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    // Input
    const {
      username,
      transactionId,
    } = req.body
    const DateUse = moment().format()
    // Check role
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.Failed).json(Response(codeStatus.AdminReqFailed))
    }
    // Find data that still not return
    const returnDataHistory = await History.find({ username, transactionId, status: 'Rent' }).lean()
    if (returnDataHistory.length < 1) {
      return res.status(httpStatus.HistoryReqFailed).json(Response(codeStatus.HistoryReqFailed))
    }
    // const returnDataHistory = returnDataHistory
    for (let i = 0; i < returnDataHistory.length; i += 1) {
      const returnHistory = returnDataHistory[i]
      const { idBook } = returnHistory
      // Check
      const CalculatesDate = calDate({
        date1: returnHistory.dateRent,
        date2: DateUse,
      })
      await History.updateOne({
        username,
        idBook,
        status: 'Rent',
      }, {
        dateEnd: DateUse,
        penalty: CalculatesDate.calDate,
        status: 'Finish',
      })
      await Book.updateOne({
        idBook,
        status: 'Rent',
      }, {
        status: 'Avaliable',
      })
    }
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}

// Transaction
exports.transaction = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username,
      firstname,
      lastname,
      dateRent,
      dateEnd,
    } = req.body
    let userHistoryobj = {}
    if (username) {
      userHistoryobj = {
        ...userHistoryobj,
        username,
      }
    }
    if (firstname) {
      userHistoryobj = {
        ...userHistoryobj,
        firstname,
      }
    }
    if (lastname) {
      userHistoryobj = {
        ...userHistoryobj,
        lastname,
      }
    }
    if (dateRent) {
      userHistoryobj = {
        ...userHistoryobj,
        dateRent,
      }
    }
    if (dateEnd) {
      userHistoryobj = {
        ...userHistoryobj,
        dateEnd,
      }
    }
    const userData = await History.find(userHistoryobj).exec()
    // *** OUTPUT
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone,
      {
        data: userData,
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}

// Recript
exports.recript = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    // Input
    const {
      username,
      transactionId,
    } = req.body
    // const DateUse = moment().format()
    // Check role
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.Failed).json(Response(codeStatus.AdminReqFailed))
    }
    // Find data that still not return
    const returnDataHistory = await History.find({
      username, transactionId, status: 'Finish', idPaid: false,
    }).lean()
    if (returnDataHistory.length < 1) {
      return res.status(httpStatus.HistoryReqFailed).json(Response(codeStatus.HistoryReqFailed))
    }
    // return data
    // save
    // send recript

    // for () {
    // }
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone, {
      data: transactionId,
    }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}
