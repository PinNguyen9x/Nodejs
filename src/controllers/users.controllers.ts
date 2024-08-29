import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/messages'
import { LogoutRqBody, RefreshTokenRqBody, RegisterRqBody, TokenPayload } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
import usersServices from '~/services/users.services'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const user_verify = user.verify
  const result = await usersServices.login({ user_id: user_id?.toString(), verify: user_verify })
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRqBody>, res: Response) => {
  const result = await usersServices.register(req.body)
  return res.json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRqBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersServices.logout(refresh_token)
  return res.json({ message: USER_MESSAGES.LOG_OUT_SUCCESS })
}
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRqBody>,
  res: Response
) => {
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  await usersServices.refreshToken({ user_id, verify, refresh_token })
  return res.json({ message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS })
}
