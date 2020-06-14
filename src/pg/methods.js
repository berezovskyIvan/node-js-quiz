const client = require('./index')
const { insertQuizQuery } = require('./querys')
const { getAllQuizQuery } = require('./querys')
const { updateQuizQuery } = require('./querys')
const { deleteQuizQuery } = require('./querys')
const { jsonParse } = require('../../src/utils')

function getKey (settingsPage) {
  const data = jsonParse(settingsPage)

  const index = data.findIndex(item => {
    return item.some(val => val.toLowerCase() === 'key')
  })

  if (index !== -1) {
    if (data[index] && data[index].length) {
      return data[index][1].toLowerCase()
    }
  }

  return ''
}

function getPage (pageData, name) {
  const values = pageData.find(item => item.range.includes(name)).values

  return JSON.stringify(values)
}

async function insertQuiz (key, userId, sheetId, description, pages) {
  const query = insertQuizQuery(key, userId, sheetId, description, pages)
  const result = await client.query(query)

  return result
}

async function getAllQuiz () {
  const result = await client.query(getAllQuizQuery)

  return result
}

async function updateQuiz (pastSheetId, userId, sheetId, description, pages) {
  const query = updateQuizQuery(pastSheetId, userId, sheetId, description, pages)
  const result = await client.query(query)

  return result
}

async function deleteQuiz (userId, sheetId) {
  const query = deleteQuizQuery(userId, sheetId)
  const result = await client.query(query)

  return result
}

module.exports = {
  getKey,
  getPage,
  insertQuiz,
  getAllQuiz,
  updateQuiz,
  deleteQuiz
}
