function sendResult (res, statusCode, statusText, data, contentType) {
  if (!contentType) {
    contentType = {
      'Content-Type': 'application/json'
    }
  }

  res.writeHead(statusCode, statusText, contentType)

  if (data) {
    res.write(JSON.stringify(data))
  }

  res.end()
}

module.exports = {
  sendResult
}
