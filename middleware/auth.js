const jwt = require('jsonwebtoken')
const User = require('../model/user.model')
const { Response, codeStatus, httpStatus } = require('../config/response')

const config = process.env

const verifyToken = async ({ token }) => {
  const authOptionnal = await User.findOne({ token }).lean()
  const decoded = jwt.verify(token, config.TOKEN_KEY)
  if (!authOptionnal) throw 'worng token'
  return decoded
}
const required = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  // console.log(token)
  if (!token) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed, {
      data: 'Failed',
    }))
  }
  try {
    req.user = await verifyToken({ token })
  } catch (e) {
    console.log(e)
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed, {
      data: 'Invalid Token',
    }))
  }
  return next()
}

const optional = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  if (!token) {
    return next()
  }
  try {
    req.user = await verifyToken({ token })
  } catch (e) {
    return res.status(httpStatus.AllReqFailed).json(Response(codeStatus.AllReqFailed, {
      data: 'Invalid Token',
    }))
  }
  return next()
}

module.exports = {
  optional,
  required,
}
