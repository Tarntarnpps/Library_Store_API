const moment = require('moment')

const Book = require('../model/book.model')
const { Response, codeStatus } = require('../config/response')

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
      return res.status(codeStatus.Failed).json({ data: 'Please try again, Username not found or you not ADMIN' })
    }
    if (!(primaryIdBook && idBook)) {
      return res.status(codeStatus.Failed).json({ data: 'All required' })
    }
    const bookOldCheck = await Book.find({ primaryIdBook }).lean()
    if (bookOldCheck.length > 0) {
      const oldBook = bookOldCheck.find((v) => v.idBook === idBook)
      if (oldBook) {
        return res.status(codeStatus.Failed).json({ data: 'Book alredy library. Please try again' })
      }
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
      return res.status(codeStatus.Success).json({ status: 'done', data: book })
    }
    if (!(bookName && writer && publisher && catagory)) {
      return res.status(codeStatus.Failed).json({ data: 'All required' })
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
    return res.status(codeStatus.Success).json({ status: 'done', data: bookNew }) // Response message
  } catch (e) {
    console.log(e)
    return res.status(codeStatus.Failed).json({ data: 'failed' }) // Response message
  }
}

// Book Data (Admin)
exports.data = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      primaryIdBook, bookName, idBook, writer,
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
    return res.status(codeStatus.Success).json({ success: true, data: bookData })
  } catch (e) {
    return res.status(codeStatus.Failed).json({ error: String(e) })
  }
}
