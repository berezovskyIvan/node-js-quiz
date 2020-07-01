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
const { checkSheetKey } = require('../../src/utils')

/*
  checkAuth function
 */
const { checkAuth } = require('../../src/auth')

/*
  pg methods
 */
const { getPage } = require('../../src/pg/methods')
const { insertQuiz } = require('../../src/pg/methods')
const { getMyQuizzes } = require('../../src/pg/methods')
const { getQuizByKey } = require('../../src/pg/methods')
const { updateQuiz } = require('../../src/pg/methods')
const { deleteQuiz } = require('../../src/pg/methods')
const { publishQuiz } = require('../../src/pg/methods')
const { stopPublishingQuiz } = require('../../src/pg/methods')

/*
  quiz: post
  new quiz creating
 */
router.post('/create', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.url) {
    const message = 'Google spreadsheets url is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  if (!body || !body.description) {
    const message = 'Description is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const userId = auth.data.id
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
    const insertStatus = await insertQuiz(userId, sheetId, description, pages)
    const result = {
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
  own quiz getting
 */
router.get('/get-my', async (req, res) => {
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  const data = await getMyQuizzes(auth.data.id)
  const rows = data.rows

  if (rows.length > 0) {
    sendResult(res, 200, 'Ok', rows)
  } else {
    sendResult(res, 204, 'No Content')
  }
})

/*
  quiz: get
  quiz getting by key
 */
router.get('/get-by-key', async (req, res) => {
  const query = req.query

  if (!query || !query.key) {
    const message = 'Quiz key is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const key = query.key
  const data = await getQuizByKey(key)
  const rows = data.rows

  if (rows.length > 0) {
    sendResult(res, 200, 'Ok', rows[0])
  } else {
    sendResult(res, 204, 'No Content')
  }
})

/*
  quiz: put
  quiz updating
 */
router.put('/update', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.url) {
    const message = 'Google spreadsheets url is required parameter'
    return sendResult(res, 400, 'Bad request', message)
  }

  if (!body || !body.description) {
    const message = 'Description is required parameter'
    return sendResult(res, 400, 'Bad request', message)
  }

  if (!body || !body.pastSheetId) {
    const message = 'Past spreadsheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const userId = auth.data.id
  const url =  body.url
  const urlArr = url.split('/')
  const sheetId = urlArr[urlArr.length - 2]
  const description = body.description
  const pastSheetId = body.pastSheetId

  getSpreadsheet(sheetId).then(async data => {
    const pages = {
      main: getPage(data, 'MainPage'),
      questions: getPage(data, 'Questions'),
      result: getPage(data, 'ResultPage'),
      settings: getPage(data, 'Settings')
    }

    const updateStatus = await updateQuiz(userId, sheetId, description, pages, pastSheetId)

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
  quiz: patch
  quiz publishing
 */
router.patch('/publish', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const isAuth = (await checkAuth(token)).is

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.sheetId) {
    const message = 'Spreadsheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  if (!body || !body.key) {
    const message = 'Quiz key is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  if (!body || !checkSheetKey(body.key)) {
    const message = 'Quiz key is not in the valid format'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const sheetId = body.sheetId
  const key = body.key

  try {
    const data = await publishQuiz(sheetId, key)

    if (data && data.rowCount > 0) {
      sendResult(res, 200, 'Ok', true)
    } else if (data && !data.rowCount) {
      sendResult(res, 404, 'Not found')
    } else {
      sendResult(res, 500, 'Internal Server Error', false)
    }
  } catch (err) {
    const message = err.detail

    sendResult(res, 409, 'Conflict', message)
  }
})

router.patch('/stop-publishing', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const isAuth = (await checkAuth(token)).is

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.sheetId) {
    const message = 'Spreadsheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const sheetId = body.sheetId
  const data = await stopPublishingQuiz(sheetId)

  if (data && data.rowCount > 0) {
    sendResult(res, 200, 'Ok', true)
  } else if (data && !data.rowCount) {
    sendResult(res, 404, 'Not found')
  } else {
    sendResult(res, 500, 'Internal Server Error', false)
  }
})

/*
  quiz: delete
  delete quiz
 */
router.delete('/delete', async (req, res) => {
  const query = req.query
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!query || !query.sheetId) {
    const message = 'Google spreadsheets id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const userId = auth.data.id
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
