import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
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
app.use(defaultErrorHandler)

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err)
  res.status(500).json({ error: 'Internal Server Error', message: err.message })
})

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

// Add this near your other routes
app.get('/health', async (req, res) => {
  try {
    await databaseService.checkHealth()
    res.status(200).json({ status: 'ok', message: 'Server is healthy' })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ status: 'error', message: 'Database connection failed' })
  }
})

export default app
