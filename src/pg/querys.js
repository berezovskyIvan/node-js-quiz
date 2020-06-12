const insertQuizQuery = function (userId, url, description, pages) {
  return `INSERT INTO quiz_table (user_id, url, description, main_page, questions_page, result_page, settings_page)
    VALUES ('${userId}', '${url}', '${description}', '${pages.main}', '${pages.questions}', '${pages.result}', '${pages.settings}')`
}

const getAllQuizQuery = 'SELECT * FROM quiz_table'

const updateQuizQuery = function (oldUrl, oldDescription, userId, url, description, pages) {
  return `UPDATE quiz_table SET
      description = '${description}',
      url = '${url}',
      main_page = '${pages.main}',
      questions_page = '${pages.questions}',
      result_page = '${pages.result}',
      settings_page = '${pages.settings}'
    WHERE url = '${oldUrl}' AND description = '${oldDescription}'`
}

const deleteQuizQuery = function (userId, url) {
  return `DELETE FROM quiz_table WHERE user_id='${userId}' AND url='${url}'`
}

module.exports = {
  insertQuizQuery,
  getAllQuizQuery,
  updateQuizQuery,
  deleteQuizQuery
}
