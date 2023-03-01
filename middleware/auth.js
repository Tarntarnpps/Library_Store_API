const jwt = require('jsonwebtoken')
const User = require('../model/user.model')

const config = process.env

const verifyToken = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  console.log(token)
  if (!token) {
    return res.status(400).json({ data: 'A token is required for authentication' })
  }
  try {
    const userId = await User.findOne({ token }).lean()
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    console.log(userId)
    if (!userId) throw 'wrong token'
    req.user = decoded
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: 'Invalid Token' })
  }
  return next()
}

const optional = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  if (!token) {
    return next()
  }
  try {
    const authOptionnal = await User.findOne({ token }).lean()
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    if (!authOptionnal) throw 'wrong token'
    req.user = decoded
  } catch (e) {
    return res.status(400).json({ data: 'Invalid Token' })
  }
  return next()
}

module.exports = {
  optional,
  verifyToken,
}
