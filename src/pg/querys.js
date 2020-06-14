const insertQuizQuery = function (key, userId, sheetId, description, pages) {
  return `INSERT INTO quiz_table (key, user_id, sheet_id, description, main_page, questions_page, result_page, settings_page)
    VALUES ('${key}', '${userId}', '${sheetId}', '${description}', '${pages.main}', '${pages.questions}', '${pages.result}', '${pages.settings}')`
}

const getAllQuizQuery = 'SELECT * FROM quiz_table'

const updateQuizQuery = function (pastSheetId, userId, sheetId, description, pages) {
  return `UPDATE quiz_table SET
      description = '${description}',
      sheet_id = '${sheetId}',
      main_page = '${pages.main}',
      questions_page = '${pages.questions}',
      result_page = '${pages.result}',
      settings_page = '${pages.settings}'
    WHERE sheet_id = '${pastSheetId}'`
}

const deleteQuizQuery = function (userId, sheetId) {
  return `DELETE FROM quiz_table WHERE user_id='${userId}' AND sheet_id='${sheetId}'`
}

module.exports = {
  insertQuizQuery,
  getAllQuizQuery,
  updateQuizQuery,
  deleteQuizQuery
}
