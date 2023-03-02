const codeStatus = {
  Success: 200,
  Failed: 400,
}

const status = (code) => {
  let res
  switch (code) {
    case 0:
      res = { code, message: 'Done' }
      break
    case codeStatus.Failed:
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
}
