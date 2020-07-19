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

/**
 * @swagger
 * /quiz/create:
 *   post:
 *     tags:
 *       - quizzes
 *     description: Create a quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         type: string
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal Server Error
 */
router.post('/create', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.url) {
    const message = 'Google sheet url is required parameter'
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

    if (insertStatus.rowCount > 0) {
      const result = {
        user_id: userId,
        sheet_id: sheetId,
        description,
        main_page: jsonParse(pages.main),
        questions_page: jsonParse(pages.questions),
        result_page: jsonParse(pages.result),
        settings_page: jsonParse(pages.settings)
      }

      return sendResult(res, 201, 'Created', result)
    }

    return sendResult(res, 500, 'Internal Server Error')
  }).catch(err => {
    console.log(err)

    if (err.code && err.errors && err.errors.length) {
      const statusCode = err.code
      const statusText = err.errors.shift().message

      return sendResult(res, statusCode, statusText)
    }

    if (err.detail) {
      const message = err.detail
      return sendResult(res, 409, 'Conflict', message)
    }

    return sendResult(res, 404, 'Not Found')
  })
})

/**
 * @swagger
 * /quiz/get-my:
 *   get:
 *     tags:
 *       - quizzes
 *     description: Returns the user's quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ok
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
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

/**
 * @swagger
 * /quiz/get-by-key:
 *   get:
 *     tags:
 *       - quizzes
 *     description: Returns the content of a quiz by its key
 *     parameters:
 *       - name: key
 *         description: Quiz key
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
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
    sendResult(res, 404, 'Not Found')
  }
})

/**
 * @swagger
 * /quiz/update:
 *   put:
 *     tags:
 *       - quizzes
 *     description: Update a quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             description:
 *               type: string
 *             pastSheetId:
 *               type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 */
router.put('/update', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.url) {
    const message = 'Google sheet url is required parameter'
    return sendResult(res, 400, 'Bad request', message)
  }

  if (!body || !body.description) {
    const message = 'Description is required parameter'
    return sendResult(res, 400, 'Bad request', message)
  }

  if (!body || !body.pastSheetId) {
    const message = 'Past google sheet id is required parameter'
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

      return sendResult(res, 200, 'Ok', result)
    }

    return sendResult(res, 404, 'Not found')
  }).catch(err => {
    console.log(err)

    if (err.code && err.errors && err.errors.length) {
      const statusCode = err.code
      const statusText = err.errors.shift().message

      return sendResult(res, statusCode, statusText)
    }

    if (err.detail) {
      const message = err.detail
      return sendResult(res, 409, 'Conflict', message)
    }

    return sendResult(res, 404, 'Not Found')
  })
})

/**
 * @swagger
 * /quiz/publish:
 *   patch:
 *     tags:
 *       - quizzes
 *     description: Publishing a quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sheetId:
 *               type: string
 *             key:
 *               type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal Server Error
 */
router.patch('/publish', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const isAuth = (await checkAuth(token)).is

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.sheetId) {
    const message = 'Google sheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  if (!body || !body.key) {
    const message = 'Quiz key is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  if (!body || !checkSheetKey(body.key)) {
    const message = 'The quiz key is not in the correct format'
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

/**
 * @swagger
 * /quiz/stop-publishing:
 *   patch:
 *     tags:
 *       - quizzes
 *     description: Stop publishing a quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sheetId:
 *               type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/stop-publishing', async (req, res) => {
  const body = req.body
  const token = req.headers['access-token']
  const isAuth = (await checkAuth(token)).is

  if (!isAuth) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!body || !body.sheetId) {
    const message = 'Google sheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const sheetId = body.sheetId
  let data

  try {
    data = await stopPublishingQuiz(sheetId)
  } catch (err) {
    console.log(err)

    return sendResult(res, 500, 'Internal Server Error', false)
  }

  if (data && data.rowCount > 0) {
    return sendResult(res, 200, 'Ok', true)
  }

  if (data && !data.rowCount) {
    return sendResult(res, 404, 'Not found')
  }

  return sendResult(res, 500, 'Internal Server Error', false)
})

/**
 * @swagger
 * /quiz/delete:
 *   delete:
 *     tags:
 *       - quizzes
 *     description: Deleting a quiz
 *     parameters:
 *       - name: ACCESS-TOKEN
 *         description: Google auth token
 *         in: header
 *         required: true
 *         type: string
 *       - name: sheetId
 *         description: Google sheet id
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/delete', async (req, res) => {
  const query = req.query
  const token = req.headers['access-token']
  const auth = await checkAuth(token)

  if (!auth.is) {
    return sendResult(res, 401, 'Unauthorized')
  }

  if (!query || !query.sheetId) {
    const message = 'Google sheet id is required parameter'
    return sendResult(res, 400, 'Bad Request', message)
  }

  const userId = auth.data.id
  const sheetId = query.sheetId
  let data

  try {
    data = await deleteQuiz(userId, sheetId)
  } catch (err) {
    console.log(err)

    return sendResult(res, 500, 'Internal Server Error', false)
  }

  if (data && data.rowCount > 0) {
    return sendResult(res, 200, 'Ok', true)
  }

  if (data && data.rowCount === 0) {
    return sendResult(res, 404, 'Not found')
  }

  return sendResult(res, 500, 'Internal Server Error', false)
})

module.exports = {
  path: '/quiz',
  router
}
