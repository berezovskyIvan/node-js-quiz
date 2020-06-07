module.exports = {
  port: 9010,
  clientUrl: 'http://localhost:9000',
  googleOAuth2: {
    version: 'v2'
  },
  googleSpreadsheets: {
    version: 'v4',
    url: 'https://www.googleapis.com/auth/spreadsheets',
    availableSheets: ['MainPage', 'Questions', 'ResultPage', 'Settings']
  }
}
