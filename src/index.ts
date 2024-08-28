import express from 'express'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

databaseService.connect()
const app = express()
app.use(express.json())
app.use('/users', usersRouter)
app.use(defaultErrorHandler)

// listen on port 3000
app.listen(4000, () => {
  console.log('Example app listening on port 4000!')
})
