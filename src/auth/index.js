/*
  google auth module
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

async function checkAuth(token) {
  oAuth2Client.setCredentials({ access_token: token })

  const oauth2 = google.oauth2({
    auth: oAuth2Client,
    version: googleOAuth2.version
  })

  try {
    const auth =  await oauth2.userinfo.get()

    if (auth && auth.status === 200) {
      return {
        is: true,
        data: auth.data
      }
    } else {
      return {
        is: false,
        data: null
      }
    }
  } catch {
    return {
      is: false,
      data: null
    }
  }
}

module.exports = {
  checkAuth
}
