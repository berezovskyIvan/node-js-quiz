const client = require('./index')
const { insertQuizQuery } = require('./querys')
const { getAllQuizQuery } = require('./querys')
const { updateQuizQuery } = require('./querys')
const { deleteQuizQuery } = require('./querys')

function getPage (pageData, name) {
  const values = pageData.find(item => item.range.includes(name)).values
  return JSON.stringify(values)
}

async function insertQuiz (userId, url, description, pages) {
  const query = insertQuizQuery(userId, url, description, pages)
  const result = await client.query(query)

  return result
}

async function getAllQuiz () {
  const result = await client.query(getAllQuizQuery)
  return result
}

async function updateQuiz (oldUrl, oldDescription, userId, url, description, pages) {
  const query = updateQuizQuery(oldUrl, oldDescription, userId, url, description, pages)
  const result = await client.query(query)

  return result
}

async function deleteQuiz (userId, url) {
  const query = deleteQuizQuery(userId, url)
  const result = await client.query(query)
  return result
}

module.exports = {
  getPage,
  insertQuiz,
  getAllQuiz,
  updateQuiz,
  deleteQuiz
}
