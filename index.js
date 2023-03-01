require('dotenv').config()

const app = require('./routes/index')

const { API_PORT } = process.env
const port = process.env.PORT || API_PORT

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
