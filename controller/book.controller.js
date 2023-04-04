const moment = require('moment')

const Book = require('../model/book.model')
const { Response, codeStatus, httpStatus } = require('../config/response')

// Registration book
exports.register = async (req, res) => {
  const DateUse = moment().format()
  try {
    // *** INPUT
    console.log('req.body:', req.body)
    const {
      primaryIdBook,
      idBook,
      bookName,
      writer,
      publisher,
      catagory,
    } = req.body
    // add ข้อมูลหนังสือต่่างๆ ถ้ายังไม่มีของเดิม
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AdminReqFailed))
    } else if (!(primaryIdBook && idBook)) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed))
    }
    const bookOldCheck = await Book.find({ primaryIdBook }).lean()
    if (bookOldCheck.length > 0) {
      // หาหนังสือที่มี idBook เดียวกัน
      const oldBook = bookOldCheck.find((v) => v.idBook === idBook)
      if (oldBook) {
        return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.BookAlreadyInSystem))
      }
      // ดึงข้อมูลหนังสือที่มีอยู่แล้ว
      const _bookOldCheck = bookOldCheck[0]
      const book = await new Book({
        primaryIdBook: _bookOldCheck.primaryIdBook,
        idBook,
        bookName: _bookOldCheck.bookName,
        dateRegistration: DateUse,
        writer: _bookOldCheck.writer,
        publisher: _bookOldCheck.publisher,
        catagory: _bookOldCheck.catagory,
      }).save()
      return res.status(httpStatus.AllReqDone).json(codeStatus.BookRegisterSuccess,
        {
          data: book,
        })
    }
    if (!(bookName && writer && publisher && catagory)) {
      return res.status(httpStatus.Failed).json(Response(codeStatus.AllReqFailed))
    }
    const bookNew = await new Book({
      primaryIdBook,
      idBook,
      bookName,
      dateRegistration: DateUse,
      writer,
      publisher,
      catagory,
    }).save()
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.BookRegisterSuccess), {
      data: bookNew,
    })
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}

// Book Data (Admin)
exports.data = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      primaryIdBook,
      bookName,
      idBook,
      writer,
    } = req.body
    let bookHistoryobj = {}
    if (primaryIdBook) {
      bookHistoryobj = {
        ...bookHistoryobj,
        primaryIdBook,
      }
    }
    if (bookName) {
      bookHistoryobj = {
        ...bookHistoryobj,
        bookName,
      }
    }
    if (idBook) {
      bookHistoryobj = {
        ...bookHistoryobj,
        idBook,
      }
    }
    if (writer) {
      bookHistoryobj = {
        ...bookHistoryobj,
        writer,
      }
    }
    const bookData = await Book.find(bookHistoryobj).exec()
    // *** OUTPUT
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone,
      {
        data: bookData,
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed), {
      error: String(e),
    })
  }
}
