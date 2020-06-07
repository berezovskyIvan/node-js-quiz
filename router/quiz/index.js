/*
  router configs
 */
const express = require('express')
const router = express.Router()

/*
  spreadsheets helper
 */
const getSpreadsheet = require('../../src/spreadsheets/get')

/*
  send-result function
 */
const { sendResult } = require('../../src/utils/request')

/*
  quiz: post
  new quiz creating
 */
router.post('/create', (req, res) => {
  const body = req.body

  if (!body || !body.description) {
    return sendResult(res, 400, 'Description is required parameter')
  }

  if (!body || !body.url) {
    return sendResult(res, 400, 'Google spreadsheets url is required parameter')
  }

  const urlArr = body.url.split('/')
  const spreadsheetId = urlArr[urlArr.length - 2]

  getSpreadsheet(spreadsheetId).then(data => {
    sendResult(res, 201, 'Created', data)
  }).catch(err => {
    console.log('err', err)

    if (err.code && err.errors && err.errors.length) {
      const statusCode = err.code
      const statusText = err.errors.shift().message

      sendResult(res, statusCode, statusText)
    } else {
      sendResult(res, 500, 'Internal Server Error')
    }
  })
})

module.exports = {
  path: '/quiz',
  router
}
