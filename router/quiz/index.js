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
  utils functions
 */
const { sendResult } = require('../../src/utils/request')
const { jsonParse } = require('../../src/utils')

/*
  checkAuth function
 */
const { checkAuth } = require('../../src/auth')

/*
  pg methods
 */
const { getKey } = require('../../src/pg/methods')
const { getPage } = require('../../src/pg/methods')
const { insertQuiz } = require('../../src/pg/methods')
const { getAllQuiz } = require('../../src/pg/methods')
const { updateQuiz } = require('../../src/pg/methods')
const { deleteQuiz } = require('../../src/pg/methods')

/*
  quiz: post
  new quiz creating
 */
router.post('/create', async (req, res) => {
  const body = req.body
  const token = req.headers['x-auth-token']
  const isAuth = await checkAuth(token)

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.userId) {
    return sendResult(res, 400, 'User id is required parameter')
  }

  if (!body || !body.description) {
    return sendResult(res, 400, 'Description is required parameter')
  }

  if (!body || !body.url) {
    return sendResult(res, 400, 'Google spreadsheets url is required parameter')
  }

  const userId = body.userId
  const url =  body.url
  const urlArr = url.split('/')
  const sheetId = urlArr[urlArr.length - 2]
  const description = body.description

  getSpreadsheet(sheetId).then(async data => {
    const pages = {
      main: getPage(data, 'MainPage'),
      questions: getPage(data, 'Questions'),
      result: getPage(data, 'ResultPage'),
      settings: getPage(data, 'Settings')
    }
    const key = getKey(pages.settings)
    const insertStatus = await insertQuiz(key, userId, sheetId, description, pages)
    const result = {
      key,
      user_id: userId,
      sheet_id: sheetId,
      description,
      main_page: jsonParse(pages.main),
      questions_page: jsonParse(pages.questions),
      result_page: jsonParse(pages.result),
      settings_page: jsonParse(pages.settings)
    }

    sendResult(res, 201, 'Created', result)
  }).catch(err => {
    console.log(err)

    if (err.code && err.errors && err.errors.length) {
      const statusCode = err.code
      const statusText = err.errors.shift().message

      sendResult(res, statusCode, statusText)
    } else if (err.detail) {
      const message = err.detail
      sendResult(res, 409, 'Conflict', message)
    } else {
      sendResult(res, 500, 'Internal Server Error')
    }
  })
})

/*
  quiz: get
  all quiz getting
 */
router.get('/get', async (req, res) => {
  const data = await getAllQuiz()
  const rows = data.rows

  sendResult(res, 200, 'Ok', rows)
})

/*
  quiz: put
  quiz updating
 */
router.put('/update', async (req, res) => {
  const body = req.body
  const token = req.headers['x-auth-token']
  const isAuth = await checkAuth(token)

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.userId) {
    return sendResult(res, 400, 'User id is required parameter')
  }

  if (!body || !body.description) {
    return sendResult(res, 400, 'Description is required parameter')
  }

  if (!body || !body.url) {
    return sendResult(res, 400, 'Google spreadsheets url is required parameter')
  }

  if (!body || !body.pastSheetId) {
    return sendResult(res, 400, 'Past spreadsheet id is required parameter')
  }

  const userId = body.userId
  const url =  body.url
  const urlArr = url.split('/')
  const sheetId = urlArr[urlArr.length - 2]
  const description = body.description
  const pastSheetId = body.pastSheetId + 1

  getSpreadsheet(sheetId).then(async data => {
    const pages = {
      main: getPage(data, 'MainPage'),
      questions: getPage(data, 'Questions'),
      result: getPage(data, 'ResultPage'),
      settings: getPage(data, 'Settings')
    }
    const updateStatus = await updateQuiz(pastSheetId, userId, sheetId, description, pages)

    if (updateStatus.rowCount > 0) {
      const result = {
        user_id: userId,
        sheet_id: sheetId,
        description,
        main_page: jsonParse(pages.main),
        questions_page: jsonParse(pages.questions),
        result_page: jsonParse(pages.result),
        settings_page: jsonParse(pages.settings)
      }

      sendResult(res, 200, 'Ok', result)
    } else {
      sendResult(res, 404, 'Not found')
    }

    console.log('sheet id', updateStatus.rowCount)

  }).catch(err => {
    console.log(err)

    if (err.code && err.errors && err.errors.length) {
      const statusCode = err.code
      const statusText = err.errors.shift().message

      sendResult(res, statusCode, statusText)
    } else if (err.detail) {
      const message = err.detail

      sendResult(res, 409, 'Conflict', message)
    } else {
      sendResult(res, 500, 'Internal Server Error')
    }
  })
})

/*
  quiz: delete
  delete quiz
 */
router.delete('/delete', async (req, res) => {
  const query = req.query
  const token = req.headers['x-auth-token']
  const isAuth = await checkAuth(token)
  console.log('body', req.body)

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!query || !query.userId) {
    return sendResult(res, 400, 'User id is required parameter')
  }

  if (!query || !query.sheetId) {
    return sendResult(res, 400, 'Google spreadsheets id is required parameter')
  }

  const userId = query.userId
  const sheetId = query.sheetId
  const data = await deleteQuiz(userId, sheetId)

  if (data && data.rowCount > 0) {
    sendResult(res, 200, 'Ok', true)
  } else if (data && data.rowCount === 0) {
    sendResult(res, 404, 'Not found')
  } else {
    sendResult(res, 500, 'Internal Server Error', false)
  }
})

module.exports = {
  path: '/quiz',
  router
}
