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
const { jsonParser } = require('../../src/utils')

/*
  checkAuth function
 */
const { checkAuth } = require('../../src/auth')

/*
  pg methods
 */
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
  const spreadsheetId = urlArr[urlArr.length - 2]
  const description = body.description

  getSpreadsheet(spreadsheetId).then(async data => {
    const pages = {
      main: getPage(data, 'MainPage'),
      questions: getPage(data, 'Questions'),
      result: getPage(data, 'ResultPage'),
      settings: getPage(data, 'Settings')
    }
    const insertStatus = await insertQuiz(userId, url, description, pages)
    const result = {
      user_id: userId,
      url,
      description,
      main_page: jsonParser(pages.main),
      questions_page: jsonParser(pages.questions),
      result_page: jsonParser(pages.result),
      settings_page: jsonParser(pages.settings)
    }

    sendResult(res, 201, 'Created', result)
  }).catch(err => {
    console.log('err', err)

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
  const data = body.data
  const oldData = body.oldData
  const token = req.headers['x-auth-token']
  const isAuth = await checkAuth(token)

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!data || !data.userId) {
    return sendResult(res, 400, 'User id is required parameter')
  }

  if (!data || !data.description) {
    return sendResult(res, 400, 'Description is required parameter')
  }

  if (!data || !data.url) {
    return sendResult(res, 400, 'Google spreadsheets url is required parameter')
  }

  const userId = data.userId
  const url =  data.url
  const urlArr = url.split('/')
  const spreadsheetId = urlArr[urlArr.length - 2]
  const description = data.description
  const oldUrl = oldData.url
  const oldDescription = oldData.description

  getSpreadsheet(spreadsheetId).then(async data => {
    const pages = {
      main: getPage(data, 'MainPage'),
      questions: getPage(data, 'Questions'),
      result: getPage(data, 'ResultPage'),
      settings: getPage(data, 'Settings')
    }
    const updateStatus = await updateQuiz(oldUrl, oldDescription, userId, url, description, pages)
    const result = {
      user_id: userId,
      url,
      description,
      main_page: jsonParser(pages.main),
      questions_page: jsonParser(pages.questions),
      result_page: jsonParser(pages.result),
      settings_page: jsonParser(pages.settings)
    }

    sendResult(res, 200, 'Updated', result)
  }).catch(err => {
    console.log('err', err)

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

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!query || !query.userId) {
    return sendResult(res, 400, 'User id is required parameter')
  }

  if (!query || !query.url) {
    return sendResult(res, 400, 'Google spreadsheets url is required parameter')
  }

  const userId = query.userId
  let url = query.url

  if (query.gid) {
    url += `#gid=${query.gid}`
  }

  const data = await deleteQuiz(userId, url)

  if (data && data.rowCount > 0) {
    sendResult(res, 200, 'Deleted', true)
  } else if (data && data.rowCount === 0) {
    sendResult(res, 204, 'No content', false)
  } else {
    sendResult(res, 500, 'Internal Server Error', false)
  }
})

module.exports = {
  path: '/quiz',
  router
}
