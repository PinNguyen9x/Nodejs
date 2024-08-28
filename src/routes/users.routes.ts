import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapperHandler } from '~/utils/handlers'
const usersRouter = Router()

/**
 * Description. User Login
 * Path: /login
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/login', loginValidator, wrapperHandler(loginController))

/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapperHandler(registerController))

/**
 * Description. User Logout
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  wrapperHandler((req, res) => {
    res.json({ message: 'Logout success' })
  })
)

export default usersRouter
