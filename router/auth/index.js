/*
  router configs
 */
const express = require('express')
const router = express.Router()

/*
  utils
 */
const { sendResult } = require('../../src/utils/request')

/*
  google auth objects
 */
const keys = require('../../web-keys.json')
const { google } = require('googleapis')
const oAuth2 = google.auth.OAuth2
const oAuth2Client = new oAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris
)
const { googleOAuth2 } = require('../../config')
const { googleSpreadsheets } = require('../../config')

/*
  auth: get
  auth url generate
 */
router.get('/login-url', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    scope: [googleSpreadsheets.url]
  })

  sendResult(res, 200, 'Ok', url)
})

router.get('/tokens', (req, res) => {
  if (!req.query || !req.query.code) {
    return sendResult(res, 400, 'Code is required parameter')
  }

  const code = req.query.code

  oAuth2Client.getToken(code , (err, tokens) => {
    if (err) {
      if (err.response && err.response.status && err.response.statusText) {
        return sendResult(res, err.response.status, err.response.statusText)
      } else {
        oAuth2Client.setCredentials(tokens)
        return sendResult(res, 500, 'Internal Server Error')
      }
    } else {
      sendResult(res, 200, 'Ok', tokens)
    }
  })
})

router.get('/user', (req, res) => {
  const query = req.query
  const token = query.token

  if (!token) {
    return sendResult(res, 401, 'Unauthorized')
  }

  oAuth2Client.setCredentials({ access_token: token })

  const oauth2 = google.oauth2({
    auth: oAuth2Client,
    version: googleOAuth2.version
  })

  oauth2.userinfo.get().then(({ data }) => {
    sendResult(res, 200, 'Ok', data)
  }).catch(err => {
    if (err.response && err.response.status && err.response.statusText) {
      return sendResult(res, err.response.status, err.response.statusText)
    } else {
      return sendResult(res, 500, 'Internal Server Error')
    }
  })
})

module.exports = {
  path: '/auth',
  router
}
