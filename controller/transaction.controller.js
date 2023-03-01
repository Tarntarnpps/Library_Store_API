const moment = require('moment')
const User = require('../model/user.model')
const Book = require('../model/book.model')
const History = require('../model/history.model')

const DateUse = moment().format()

const calDate = (date1, date2) => {
  date1.getTime()
  date2.getTime()

  const diffDate = Math.floor((date2 - date1) / (24 * 3600 * 1000))

  if (diffDate <= 3) {
    return 0
  } else {
    return (diffDate - 3) * 20
  }
}
const date1 = new Date('yyyy-mm-dd')
const date2 = new Date('yyyy-mm-dd')
const d = calDate(date1, date2)
console.log(d)

// Rent
exports.rent = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username,
      idBook,
    } = req.body
    const user = await User.findOne({ role: 'USER' }).lean()
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(493).json({ data: 'Please try again' })
    }
    const book = await Book.findOne({ idBook, status: 'Avaliable' }).lean()
    if (!(user)) {
      return res.status(490).json({ data: 'Please try again, Username not found or you not USER' })
    }
    if (!(book)) {
      return res.status(491).json({ data: 'Please try again, Book not already for rent' })
    }
    const currentBookRent = await History.find({ username, status: 'Rent' }).lean()
    // ถ้ายืม id นี้แล้ว ไม่ให้ยืมซ้ำ
    if (currentBookRent != null && currentBookRent.length > 0) {
      const _currentBookRent = currentBookRent.find((v) => v.idBook === idBook)
      const __currentBookRent = currentBookRent.find((v) => v.bookName === book.bookName)
      if (_currentBookRent && __currentBookRent) {
        return res.status(489).json({ data: 'Please try again' })
      }
      console.log(currentBookRent.length)
      if (currentBookRent.length >= 5) {
        return res.status(492).json({ data: 'Have already 5 book to rent, Please return for new rent book' })
      }
    }
    await Book.updateOne({
      idBook,
      status: 'Avaliable',
    }, {
      status: 'Rent',
    })
    const bookRent = await new History({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      primaryIdBook: book.primaryIdBook,
      idBook: book.idBook,
      bookName: book.bookName,
      dateRent: DateUse,
    }).save()
    return res.status(200).json(bookRent)
  } catch (e) {
    return res.status(500).json({
      code: 100,
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
    const { username, idBook } = req.body
    // Check role
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(493).json({ data: 'Please try again' })
    }
    // Find data
    const returnDataHistory = await History.findOne({ username, idBook, status: 'Rent' }).lean()
    if (!(returnDataHistory)) {
      return res.status(493).json({ data: 'Please try again' })
    }
    const CalculatesDate = calDate(returnDataHistory.dateRent, DateUse)
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
    return res.status(200).json({ data: 'Update Done' })
  } catch (e) {
    return res.status(500).json({
      code: 100,
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
      return res.status(200).json({
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
    return res.status(200).json({ success: true, data: userData })
  } catch (e) {
    return res.status(500).json({
      code: 100,
      message: 'error',
      error: String(e),
    })
  }
}
