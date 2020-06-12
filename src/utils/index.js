function jsonParser (val) {
  try {
    return JSON.parse(val)
  } catch (err) {
    console.log(err)

    return val
  }
}

module.exports = {
  jsonParser
}
