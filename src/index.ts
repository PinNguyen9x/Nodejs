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

// Connect to database before starting server
const startServer = async () => {
  try {
    await databaseService.connect()

    app.listen(envConfig.port, () => {
      console.log(`Server is running on port ${envConfig.port}`)
    })
  } catch (err) {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  }
}

startServer()

// Add error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
