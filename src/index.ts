import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { specs } from 'openapi'
import swaggerUi from 'swagger-ui-express'
import { envConfig, isProduction } from './constants/config'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'

const port = envConfig.port
initFolder()
const app = express()
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})
app.use(express.json())
app.use(helmet())
app.use(cors(corsOptions))
app.use(limiter)
app.use('/medias', mediasRouter)
app.use('/users', usersRouter)
app.use('/static', staticRouter)
app.get('/health', async (req, res) => {
  try {
    await databaseService.checkHealth()
    res.status(200).json({ status: 'ok', message: 'Server is healthy' })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ status: 'error', message: 'Database connection failed' })
  }
})
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>API Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          h1 { color: #2ecc71; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Congratulations!</h1>
          <p>Your API server is running successfully.</p>
          <p>Check out the API documentation at <a href="/api-docs">/api-docs</a></p>
        </div>
      </body>
    </html>
  `)
})
app.use(defaultErrorHandler)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Connect to database before starting server
const startServer = async () => {
  try {
    console.log('Starting server...')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Port:', envConfig.port)

    await databaseService.connect()

    app.listen(envConfig.port, () => {
      console.log(`Server is running on port ${envConfig.port}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Add graceful shutdown
const gracefulShutdown = async () => {
  try {
    console.log('Shutting down gracefully...')
    await databaseService.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Add better error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

startServer()

export default app
