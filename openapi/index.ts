import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from '../src/constants/config'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter API',
      version: '1.0.0',
      description: 'API documentation for Twitter Project'
    },
    servers: [
      {
        url: `http://localhost:${envConfig.port}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./openapi/**/*.yaml'] // Updated path to YAML files
}

export const specs = swaggerJsdoc(options)
