import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/messages'
import { RegisterRqBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
import usersServices from '~/services/users.services'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersServices.login(user_id?.toString())
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRqBody>, res: Response) => {
  const result = await usersServices.register(req.body)
  return res.json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}
