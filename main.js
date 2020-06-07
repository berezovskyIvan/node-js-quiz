/*
  express main options
 */
const express = require('express')
const app = express()
const { port } = require('./config')

app.listen(port)
/*
  cors policy options
 */
const cors = require('cors')
const { clientUrl } = require('./config')

app.use(cors({
  origin: clientUrl
}))

/*
  request body parser using
 */
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();

app.use(jsonParser)

/*
  express router options
 */
const router = require('./router/index')

for (const key in router) {
  app.use(router[key].path, router[key].router)
}
