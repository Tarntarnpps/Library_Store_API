const moment = require('moment')
const User = require('../model/user.model')
const Book = require('../model/book.model')
const History = require('../model/history.model')
const { Response, codeStatus, httpStatus } = require('../config/response')

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
// exports.rent = async (req, res) => {
//   try {
//     console.log('req.body:', req.body)
//     const {
//       username,
//       idBooks,
//     } = req.body
//     // [1,2,3,4,5]
//     /*
//     *** old
//     check codition
//     if(success) {
//       save
//       return res.status(codeStatus.AllReqDone).json(codeStatus.AllReqDone, { data: ***})
//     }
//     else{
//       return falied
//     }
//     *** new
//       for(i=0 ; i<=idBooks ; i++){
//        const idBook = idBooks[i]
//         // check condition
//         if(success) {
//         }
//          save => return success
//         else {
//           return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//         }
//       }
//     */
//     for (let index = 0; index < array.length; index++) {
//       const element = array[index]
//     }
//     const user = await User.findOne({ username, role: 'USER' }).lean()
//     if (!req.user || (req.user.role !== 'ADMIN')) {
//       return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//     }
//     if (!(user)) {
//       return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//     }
//     const book = await Book.findOne({ idBook, status: 'Avaliable' }).lean()
//     if (!(book)) {
//       return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//     }
//     const currentBookRent = await History.find({ username, status: 'Rent' }).lean()
//     // ถ้ายืม id นี้แล้ว ไม่ให้ยืมซ้ำ
//     if (currentBookRent != null && currentBookRent.length > 0) {
//       const _currentBookRent = currentBookRent.find((v) => v.idBook === idBook)
//       const __currentBookRent = currentBookRent.find((v) => v.bookName === book.bookName)
//       if (_currentBookRent && __currentBookRent) {
//         return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//       }
//       console.log(currentBookRent.length)
//       if (currentBookRent.length >= 5) {
//         return res.status(codeStatus.AllReqFailed).json(Response(httpStatus.AllReqFailed))
//       }
//       // if (currentBookRent.length <= 5) {
//       //   console.log(currentBookRent.length)
//       // }
//     }
//     await Book.updateOne({
//       idBook,
//       status: 'Avaliable',
//     }, {
//       status: 'Rent',
//     })
//     const bookRent = await new History({
//       firstname: user.firstname,
//       lastname: user.lastname,
//       username: user.username,
//       primaryIdBook: book.primaryIdBook,
//       idBook: book.idBook,
//       bookName: book.bookName,
//       dateRent: DateUse,
//     }).save()
//     return res.status(codeStatus.AllReqDone).json(codeStatus.AllReqDone, { data: bookRent })
//   } catch (e) {
//     return res.status(codeStatus.AllReqFailed).json({
//       code: 400,
//       message: 'error',
//       error: String(e),
//     })
//   }
// }

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
      return res.status(codeStatus.UserReqFailed).json(Response(httpStatus.UserReqFailed))
    }
    const book = await Book.find({ idBook: { $in: idBooks }, status: 'Avaliable' }).lean()
    if (book.length === 0) {
      return res.status(httpStatus.BookReqFailed).json(Response(codeStatus.BookReqFailed))
    }
    const currentBookRent = await History.find({ username, status: 'Rent' }).lean()
    if (currentBookRent.length >= 5) {
      return res.status(codeStatus.HistoryReqFailed).json(Response(httpStatus.HistoryReqFailed))
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
        return res.status(httpStatus.Failed).json(Response(codeStatus.Faile))
      }
      await Book.updateOne({
        idBooks,
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
      bookRents = [
        ...bookRents,
        bookRent,
      ]
    }
    console.log('CCCCCCCCCC')
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
    const { username, idBook } = req.body
    // Check role
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(codeStatus.Failed).json(Response(httpStatus.AllReqFailed))
    }
    // Find data
    const returnDataHistory = await History.findOne({ username, idBook, status: 'Rent' }).lean()
    if (!(returnDataHistory)) {
      return res.status(codeStatus.Failed).json(Response(httpStatus.AllReqFailed))
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
    return res.status(codeStatus.Success).json(codeStatus.AllReqDone)
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
