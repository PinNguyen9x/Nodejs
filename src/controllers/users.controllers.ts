import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '../constants/enums'
import { HTTP_STATUS } from '../constants/httpStatus'
import { USER_MESSAGES } from '../constants/messages'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  LogoutRqBody,
  RefreshTokenRqBody,
  RegisterRqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '../models/requests/User.request'
import User from '../models/schemas/User.schemas'
import databaseService from '../services/database.services'
import { default as usersService, default as usersServices } from '../services/users.services'
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

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  // Nếu không tìm thấy user thì mình sẽ báo lỗi
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // Đã verify rồi thì mình sẽ không báo lỗi
  // Mà mình sẽ trả về status OK với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user as User
  const user = await databaseService.users.findOne({
    _id
  })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  const result = await usersService.forgotPassword((_id as ObjectId)?.toString())
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USER_MESSAGES.FORGOT_PASSWORD_VERIFY_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(user_id)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (req: Request<{ username: string }>, res: Response, next: NextFunction) => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}
export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await usersService.unfollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}
