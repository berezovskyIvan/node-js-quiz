const { pg } = require('../../config')
const { Client } = require('pg')

const client = new Client({
  host: pg.host,
  database: pg.database,
  password: pg.password,
  port: pg.port,
  user: pg.user,
})

client.connect()

module.exports = client
