const codeStatus = {
  AllReqDone: 0,
  AllReqFailed: 400,
}

const httpStatus = {
  AllReqDone: 200,
  AllReqFailed: 400,
}

const status = (code) => {
  let res
  switch (code) {
    case 0:
      res = { code, message: 'Done' }
      break
    case 200:
      res = { code, message: 'Done' }
      break
    case 400:
      res = { code, message: 'Failed' }
      break
    default: break
  }
  return res
}

const Response = (code, data = {}) => (
  {
    status: status(code),
    data,
  }
)

module.exports = {
  Response,
  codeStatus,
  httpStatus,
}
