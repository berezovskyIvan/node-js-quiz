const insertQuizQuery = function (userId, sheetId, description, pages) {
  return `INSERT INTO quiz_table (user_id, sheet_id, description, main_page, questions_page, result_page, settings_page)
  VALUES
  ($$${userId}$$, $$${sheetId}$$, $$${description}$$, $$${pages.main}$$, $$${pages.questions}$$, $$${pages.result}$$, $$${pages.settings}$$)`
}

const getMyQuizzesQuery = function (id) {
  return `SELECT * FROM quiz_table WHERE user_id = $$${id}$$`
}

const getQuizByKeyQuery = function (key) {
  return `SELECT
      description,
      main_page,
      questions_page,
      result_page,
      settings_page
    FROM quiz_table
    WHERE is_publish = true AND key = $$${key}$$`
}

const updateQuizQuery = function (userId, sheetId, description, pages, pastSheetId) {
  return `UPDATE quiz_table SET
      sheet_id = $$${sheetId}$$,
      description = $$${description}$$,
      main_page = $$${pages.main}$$,
      questions_page = $$${pages.questions}$$,
      result_page = $$${pages.result}$$,
      settings_page = $$${pages.settings}$$
    WHERE sheet_id = $$${pastSheetId}$$`
}

const deleteQuizQuery = function (userId, sheetId) {
  return `DELETE FROM quiz_table WHERE user_id=$$${userId}$$ AND sheet_id=$$${sheetId}$$`
}

const publishQuizQuery = function (sheetId, key) {
  return `UPDATE quiz_table SET
      is_publish = true,
      key = $$${key}$$
    WHERE sheet_id = $$${sheetId}$$`
}

const stopPublishingQuizQuery = function (sheetId) {
  return `UPDATE quiz_table SET
      is_publish = false
    WHERE sheet_id = $$${sheetId}$$`
}

module.exports = {
  insertQuizQuery,
  getMyQuizzesQuery,
  getQuizByKeyQuery,
  updateQuizQuery,
  deleteQuizQuery,
  publishQuizQuery,
  stopPublishingQuizQuery
}
