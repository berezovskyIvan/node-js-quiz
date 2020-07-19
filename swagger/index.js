const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const options = {
  openapi: '3.0.0',
  swaggerDefinition: {
    info: {
      title: 'Quiz API',
      version: '1.0.0',
      description: 'Quiz Express API'
    },
    basePath: '/'
  },
  apis: ['router/quiz/index.js']
}

const spec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(spec))
}
