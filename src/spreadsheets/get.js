const { google } = require('googleapis')
const keys = require('../../keys.json')
const { googleSpreadsheets } = require('../../config')

async function getAuthClient () {
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    [googleSpreadsheets.url]
  )

  const auth = await client.authorize()

  return client
}

async function getSheets (client, spreadsheetId) {
  const googleApis = google.sheets({ version: googleSpreadsheets.version, auth: client })
  const opt = {
    spreadsheetId,
    ranges: googleSpreadsheets.availableSheets
  }
  const data = await googleApis.spreadsheets.values.batchGet(opt)

  return data.data.valueRanges
}

async function getSpreadsheet (spreadsheetId) {
  const client = await getAuthClient()
  const data = await getSheets(client, spreadsheetId)

  return data
}

module.exports = getSpreadsheet
