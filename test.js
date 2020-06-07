const { google } = require('googleapis')
const oAuth2 = google.auth.OAuth2
const keys = require('./web-keys.json')
const oAuth2Client = new oAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris
)

google.auth.OAuth2