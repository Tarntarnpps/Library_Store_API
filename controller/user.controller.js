const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { tokenKey } = require('../config/vars')
const User = require('../model/user.model')
const History = require('../model/history.model')
const { Response, codeStatus, httpStatus } = require('../config/response')

const app = express()
app.use(express.json())

// User Register
exports.register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      password,
    } = req.body
    if (!(firstname && lastname && username && password)) {
      return res.status(codeStatus.Failed).json(Response(httpStatus.AllReqFailed))
    }
    const oldUser = await User.findOne({ username }).lean()
    if (oldUser) {
      return res.status(codeStatus.Failed).json(Response(httpStatus.AllReqFailed))
    }
    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10)
    // Create user in our database
    const user = await User.create({
      firstname,
      lastname,
      username,
      password: encryptedPassword,
      role: 'USER',
    })
    // return new user
    return res.status(codeStatus.Success).json(codeStatus.AllReqDone, { data: user })
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.Failed,
      {
        error: String(e),
      }))
  }
}

// User login
exports.login = async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body
    if (!(username && password)) {
      return res.status(codeStatus.Failed).json(Response(httpStatus.AllReqFailed))
    }
    const user = await User.findOne({ username, role: 'USER' }).lean()
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
      return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone,
        {
          data: user,
        }))
    }
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed,
      {
        status: 'Done',
        data: user,
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.Failed,
      {
        error: String(e),
      }))
  }
}

// User History
exports.history = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username,
      firstname,
      lastname,
    } = req.body
    console.log(req.user)
    if (!req.user || (req.user.role !== 'USER')) {
      return res.status(codeStatus.UserReqFailed).json(Response(httpStatus.UserReqFailed))
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
    return res.status(httpStatus.AllReqDone).json(Response(codeStatus.AllReqDone,
      {
        data: userData,
      }))
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.Failed,
      {
        error: String(e),
      }))
  }
}
