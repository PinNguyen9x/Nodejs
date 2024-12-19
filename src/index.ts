import cors, { CorsOptions } from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { envConfig, isProduction } from './constants/config'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
const port = envConfig.port
databaseService.connect()
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
app.use('/static/videos', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler)

// listen on port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
