const client = require('./index')
const { insertQuizQuery } = require('./querys')
const { getMyQuizzesQuery } = require('./querys')
const { getQuizByKeyQuery } = require('./querys')
const { updateQuizQuery } = require('./querys')
const { deleteQuizQuery } = require('./querys')
const { publishQuizQuery } = require('./querys')
const { stopPublishingQuizQuery } = require('./querys')
const { jsonParse } = require('../../src/utils')

function getPage (pageData, name) {
  const values = pageData.find(item => item.range.includes(name)).values

  return JSON.stringify(values)
}

async function insertQuiz (userId, sheetId, description, pages) {
  const query = insertQuizQuery(userId, sheetId, description, pages)
  const result = await client.query(query)

  return result
}

async function getMyQuizzes (id) {
  const query = getMyQuizzesQuery(id)
  const result = await client.query(query)

  return result
}

async function getQuizByKey (key) {
  const query = getQuizByKeyQuery(key)
  const result = await client.query(query)

  return result
}

async function updateQuiz (userId, sheetId, description, pages, pastSheetId) {
  const query = updateQuizQuery(userId, sheetId, description, pages, pastSheetId)
  const result = await client.query(query)

  return result
}

async function deleteQuiz (userId, sheetId) {
  const query = deleteQuizQuery(userId, sheetId)
  const result = await client.query(query)

  return result
}

async function publishQuiz (sheetId, key) {
  const query = publishQuizQuery(sheetId, key)
  const result = await client.query(query)

  return result
}

async function stopPublishingQuiz (sheetId) {
  const query = stopPublishingQuizQuery(sheetId)
  const result = await client.query(query)

  return result
}

module.exports = {
  getPage,
  insertQuiz,
  getMyQuizzes,
  getQuizByKey,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  stopPublishingQuiz
}
