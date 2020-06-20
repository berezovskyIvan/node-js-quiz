function jsonParse (val) {
  try {
    return JSON.parse(val)
  } catch (err) {
    console.log(err)

    return val
  }
}

function checkSheetKey (key) {
  const req = /^[a-z][a-z0-9-]*$/i
  return req.test(key)
}

module.exports = {
  jsonParse,
  checkSheetKey
}
