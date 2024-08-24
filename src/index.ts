import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
app.use(express.json())
app.use('/users', usersRouter)

databaseService.connect()

// listen on port 3000
app.listen(4000, () => {
  console.log('Example app listening on port 4000!')
})
