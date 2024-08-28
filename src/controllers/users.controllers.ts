import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRqBody } from '~/models/requests/User.request'
import usersServices from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { username, password } = req.body
  if (username === 'admin' && password === '123') return res.json({ message: 'Hello World!' })
  return res.status(401).json({ message: 'Unauthorized' })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRqBody>, res: Response) => {
  const result = await usersServices.register(req.body)
  return res.json({ message: 'register successfully', result })
}
