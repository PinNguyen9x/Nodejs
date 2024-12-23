import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from '../constants/config'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Media API',
      version: '1.0.0',
      description: 'API documentation for Social Media project'
    },
    servers: [
      {
        url: `http://localhost:${envConfig.port}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/openapi/**/*.yaml'] // Updated path to YAML files
}

export const specs = swaggerJsdoc(options)
