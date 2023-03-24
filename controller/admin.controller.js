const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { tokenKey } = require('../config/vars')

const User = require('../model/user.model')
const History = require('../model/history.model')
const { Response, codeStatus, httpStatus } = require('../config/response')

// Admin Register
exports.register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      password,
    } = req.body
    if (!(firstname && lastname && username && password)) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AdminRegisterFailed),
        {
          data: 'Please fill out all require fields',
        })
    }
    const oldUser = await User.findOne({ username }).lean()
    if (oldUser) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AdminInSystem),
        {
          data: 'Alredy User in system',
        })
    }
    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10)
    // Create user in our database
    const user = await User.create({
      firstname,
      lastname,
      username,
      password: encryptedPassword,
      role: 'ADMIN',
    })
    // return new user
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AdminRegisterSuccess,
      {
        data: user,
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json({
      code: 400,
      message: 'error',
      error: String(e),
    })
  }
}

// Admin login
exports.login = async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body
    if (!(username && password)) {
      console.log('jjjjj')
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.PasswordFailed))
    }
    console.log('lllllllll')
    const user = await User.findOne({ username, role: 'ADMIN' }).lean()
    if (user && (await bcrypt.compare(password, user.password))) {
      const {
        role,
        _id,
      } = user
      const token = jwt.sign(
        {
          user_id: _id,
          username,
          role,
        },
        tokenKey,
        {
          expiresIn: '2h',
        },
      )
      user.token = token
      await User.updateOne({ _id }, { token })
      console.log('kkkkkkkkkkkkk')
      return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AdminLoginSuccess,
        {
          data: user,
        }))
    }
    console.log('pppppppppppppppp')
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed,
      {
        status: 'Failed',
      }))
  } catch (e) {
    console.log('kkkkkkkkkkkkk888888')
    return res.status(httpStatus.AllReqFailed).json({
      code: 400,
      message: 'error',
      error: String(e),
    })
  }
}

// Book History (Admin)
exports.history = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      primaryIdBook,
      bookName,
      idBook,
      writer,
    } = req.body
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AdminReqFailed))
    }
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
    const bookData = await History.find(bookHistoryobj).exec()
    // *** OUTPUT
    return res.status(httpStatus.Success).json(Response(codeStatus.AllReqDone,
      {
        data: bookData,
        message: 'Success',
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json({
      code: 400,
      message: 'error',
      error: String(e),
    })
  }
}
