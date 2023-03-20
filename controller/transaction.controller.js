/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
const { customAlphabet } = require('nanoid')

const moment = require('moment')
const User = require('../model/user.model')
const Book = require('../model/book.model')
const History = require('../model/history.model')
const { Response, codeStatus, httpStatus } = require('../config/response')
// const { count } = require('../model/user.model')
// const nanoId = require('nano-id')

const DateUse = moment().format()
const nanoid = customAlphabet('1234567890abcdef', 10)
const _nanoid = nanoid(5)
const randomNumber = `ADS${_nanoid}, ${DateUse}!`

const calDate = ({ date1, date2 }) => {
  const startDate = date1
  console.log(startDate)
  const endDate = date2
  console.log(endDate)
  const diffDate = Math.floor((endDate - startDate) / (24 * 3600 * 1000))
  if (diffDate <= 3) {
    return 0
  } else {
    return (diffDate - 3) * 20
  }
}
const date1 = new Date('yyyy-mm-dd')
const date2 = new Date('yyyy-mm-dd')
const countDay = calDate({ date1, date2 })
console.log(countDay)

// const a = undefined.at()
// Rent
exports.rent = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username,
      idBooks,
    } = req.body
    // check admin before save
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(codeStatus.AdminReqFailed).json(Response(httpStatus.AdminReqFailed))
    }
    let bookRents = []
    // check user role before save
    const user = await User.findOne({ role: 'USER', username }).lean()
    if (!(user)) {
      return res.status(httpStatus.UserReqFailed).json(Response(codeStatus.UserReqFailed))
    }
    const book = await Book.find({ idBook: { $in: idBooks }, status: 'Avaliable' }).lean()
    if (book.length === 0) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.BookReqFailed, { data: 'This Book can not rent' }))
    }
    const currentBookRent = await History.find({ username, status: 'Rent' }).lean()
    if (currentBookRent.length >= 5) {
      return res.status(httpStatus.HistoryReqFailed).json(Response(codeStatus.HistoryReqFailed, { data: 'You rent total 5 books, Pls return before rent' }))
    }
    for (let i = 0; i < book.length; i += 1) {
      const _book = book[i]
      if (currentBookRent != null && currentBookRent.length > 0) {
        const _currentBookRent = currentBookRent.find((v) => v.idBook === _book.idBook)
        const __currentBookRent = currentBookRent.find((v) => v.bookName === _book.bookName)
        if (_currentBookRent && __currentBookRent) {
          return res.status(httpStatus.Failed).json(Response(codeStatus.Failed))
        }
      }
      const currentBookRentCount = currentBookRent.length
      if (currentBookRentCount === 5) {
        return res.status(httpStatus.Failed).json(Response(codeStatus.Failed))
      }
      const bookCount = book.length
      if (bookCount === 2) {
        return res.status(httpStatus.Failed).json(Response(codeStatus.Failed))
      }
      await Book.updateOne({
        idBook: _book.idBook,
        status: 'Avaliable',
      }, {
        status: 'Rent',
      })
      const bookRent = await new History({
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        primaryIdBook: _book.primaryIdBook,
        idBook: _book.idBook,
        bookName: book.bookName,
        dateRent: DateUse,
        transactionId: randomNumber,
      }).save()
      bookRents = [
        ...bookRents,
        bookRent,
      ]
    }
    // eslint-disable-next-line max-len
    return res.status(codeStatus.AllReqDone).json(Response(codeStatus.AllReqDone, { data: bookRents }))
  } catch (e) {
    console.log(e)
    return res.status(httpStatus.AllReqFailed).json({
      code: 400,
      message: 'error',
      error: String(e),
    })
  }
}

// Return
exports.return = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    // Input
    const { username, idBooks } = req.body
    // Check role
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.Failed).json(Response(codeStatus.AdminReqFailed))
    }
    console.log('oooooooo')
    // Find data
    const returnDataHistory = await History.find({ username, idBooks, status: 'Rent' }).lean()
    if (!(returnDataHistory)) {
      return res.status(httpStatus.Failed).json(Response(codeStatus.HistoryReqFailed, { data: ' ' }))
    }
    // const book = await Book.find({ idBook: { $in: idBooks }, status: 'Rent' }).lean()
    // if (!book) {
    //   return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.BookReqFailed, { data: '' }))
    // }
    console.log('uuuuuuuuuuuu')
    // Check
    const CalculatesDate = calDate({
      date1: returnDataHistory.dateRent,
      date2: DateUse,
    })
    await History.updateOne({
      username,
      idBooks,
      status: 'Rent',
    }, {
      dateEnd: DateUse,
      penalty: CalculatesDate.calDate,
      status: 'Finish',
    })
    console.log('yyyyyyyyyy')
    await Book.updateOne({
      idBooks,
      status: 'Rent',
    }, {
      status: 'Avaliable',
    })
    console.log('kkkkkkkkkk')
    return res.status(httpStatus.AllReqDone).json(codeStatus.AllReqDone)
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json({
      code: 400,
      message: 'error',
      error: String(e),
    })
  }
}

// Transaction
exports.transaction = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const { username, firstname, lastname } = req.body
    if (req.user.role !== 'ADMIN') {
      return res.status(codeStatus.Success).json({
        code: 201,
        message: 'Please try again',
      })
    }
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
    const userData = await History.find(userHistoryobj).exec()
    // *** OUTPUT
    return res.status(codeStatus.Success).json(codeStatus.AllReqDone, { data: userData })
  } catch (e) {
    return res.status(500).json({
      code: 100,
      message: 'error',
      error: String(e),
    })
  }
}
