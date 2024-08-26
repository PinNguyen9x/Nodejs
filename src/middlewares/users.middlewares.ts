import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import usersServices from '~/services/users.services'
import { validate } from '~/utils/validation'
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value: string) => {
          const existed = await usersServices.checkEmailExisted(value)
          if (existed) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: { minLength: 6, minSymbols: 1, minUppercase: 1, minNumbers: 1, minLowercase: 1 }
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: { minLength: 6, minSymbols: 1, minUppercase: 1, minNumbers: 1, minLowercase: 1 }
      },
      custom: {
        options: (value: string, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match')
          }
          return true
        }
      }
    },
    date_of_birth: {
      notEmpty: true,
      isISO8601: {
        options: { strict: true, strictSeparator: true }
      }
    }
  })
)
