// eslint-disable-next-line import/no-extraneous-dependencies
const { customAlphabet } = require('nanoid')

const calDate = ({ date1, date2 }) => {
  const startDate = date1
  const endDate = date2
  const diffDate = Math.floor((endDate - startDate) / (24 * 3600 * 1000))
  if (diffDate <= 3) {
    return 0
  } else {
    return (diffDate - 3) * 20
  }
}

const createTransactionId = () => {
  const nanoid = customAlphabet('1234567890abcdefghijk', 10)
  const _nanoid = nanoid(8)
  const randomNumber = `ADS${_nanoid}`
  return randomNumber
}

// const date1 = new Date('yyyy-mm-dd')
// const date2 = new Date('yyyy-mm-dd')
// const countDay = calDate({ date1, date2 })
// console.log(countDay)

module.exports = {
  calDate,
  createTransactionId,
}
