const codeStatus = {
  AllReqDone: 200,
  AdminRegisterSuccess: 201,
  AdminLoginSuccess: 202,
  BookRegisterSuccess: 203,
  AllReqFailed: 400,
  AdminReqFailed: 401,
  UserReqFailed: 402,
  BookReqFailed: 403,
  HistoryReqFailed: 405,
  Failed: 406,
  PasswordFailed: 407,
  AdminRegisterFailed: 408,
  AdminInSystem: 409,
  BookAlreadyInSystem: 501,
  BookRentNotAvaliable: 502,
}

const httpStatus = {
  AllReqDone: 200,
  AllReqFailed: 400,
}

const status = (code) => {
  let res
  switch (code) {
    case 200:
      res = { code, message: 'Success' }
      break
    case 201:
      res = { code, message: 'Admin Register Success' }
      break
    case 202:
      res = { code, message: 'Admin Login Success' }
      break
    case 203:
      res = { code, message: 'Book Register Success' }
      break
    case 400:
      res = { code, message: 'Failed' }
      break
    case 401:
      res = { code, message: 'ADMIN Failed, Please try again' }
      break
    case 402:
      res = { code, message: 'USER Failed, Please try again' }
      break
    case 403:
      res = { code, message: 'This Book can not rent, B/C not Avaliable' }
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
    case 408:
      res = { code, message: 'Admin Register Failed' }
      break
    case 409:
      res = { code, message: 'User Alredy in system' }
      break
    case 501:
      res = { code, message: 'Book Alredy in system' }
      break
    case 502:
      res = { code, message: 'Book Not Avaliable' }
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
