import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from '../constants/config'
import path from 'path'

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
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://twitter-navy-seven.vercel.app'
            : `http://localhost:${envConfig.port}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ]
  },
  apis: [path.join(__dirname, './paths/*.yaml'), path.join(__dirname, './components.yaml')]
}

export const specs = swaggerJsdoc(options)
