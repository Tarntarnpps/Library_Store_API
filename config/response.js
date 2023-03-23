const codeStatus = {
  AllReqDone: 200,
  AllReqFailed: 400,
  AdminReqFailed: 401,
  UserReqFailed: 402,
  BookReqFailed: 403,
  HistoryReqFailed: 405,
  Failed: 406,
  PasswordFailed: 407,
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
    case 401:
      res = { code, message: 'Req ADMIN Failed' }
      break
    case 402:
      res = { code, message: 'Req USER Failed' }
      break
    case 403:
      res = { code, message: 'Req Book Failed' }
      break
    case 405:
      res = { code, message: 'You rent total 5 books, Pls return before rent' }
      break
    case 406:
      res = { code, message: 'Req Failed' }
      break
    case 407:
      res = { code, message: 'Username or Password Failed' }
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
