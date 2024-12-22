import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { envConfig } from '../constants/config'
import { UserVerifyStatus } from '../constants/enums'
import { HTTP_STATUS } from '../constants/httpStatus'
import { USER_MESSAGES } from '../constants/messages'
import { REGEX_USERNAME } from '../constants/regex'
import { ErrorWithStatus } from '../models/Errors'
import { TokenPayload } from '../models/requests/User.request'
import databaseService from '../services/database.services'
import usersServices from '../services/users.services'
import { hashPassword } from '../utils/crypto'
import { verifyToken } from '../utils/jwt'
import { validate } from '../utils/validation'
const passwordSchema: ParamSchema = {
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
  },
  isStrongPassword: {
    options: { minLength: 6, minSymbols: 1, minUppercase: 1, minNumbers: 1, minLowercase: 1 },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
  },
  isStrongPassword: {
    options: { minLength: 6, minSymbols: 1, minUppercase: 1, minNumbers: 1, minLowercase: 1 },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value: string, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
      }
      return true
    }
  }
}
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,

  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}
const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH
  }
}
const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }

      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken || ''
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
        return true
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: (err as JsonWebTokenError).message,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw err
      }
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })

      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: envConfig.jwtSecretAccessToken || ''
              })
              ;(req as Request).decoded_authorization = decoded_authorization
              return true
            } catch (err) {
              throw new ErrorWithStatus({
                message: (err as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken || '' }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              return true
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: (err as JsonWebTokenError).message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw err
            }
          }
        }
      }
    },
    ['body']
  )
)
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (email: string, { req }) => {
            const user = await databaseService.users.findOne({ email, password: hashPassword(req.body.password) })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_50
        },
        isStrongPassword: {
          options: { minLength: 6, minSymbols: 1, minUppercase: 1, minNumbers: 1, minLowercase: 1 },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            const existed = await usersServices.checkEmailExisted(value)
            if (existed) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretEmailVerifyToken || ''
              })

              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (email: string, { req }) => {
            const user = await databaseService.users.findOne({ email })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)
export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.BIO_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USER_MESSAGES.BIO_LENGTH
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USER_MESSAGES.LOCATION_LENGTH
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USER_MESSAGES.WEBSITE_LENGTH
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error(USER_MESSAGES.USERNAME_INVALID)
            }
            const user = await databaseService.users.findOne({ username: value })
            // Nếu đã tồn tại username này trong db
            // thì chúng ta không cho phép update
            if (user) {
              throw Error(USER_MESSAGES.USERNAME_EXISTED)
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)
export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          const isMatch = hashPassword(value) === password
          if (!isMatch) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.OLD_PASSWORD_NOT_MATCH,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        }
      }
    },
    new_password: passwordSchema,
    confirm_new_password: confirmPasswordSchema
  })
)
