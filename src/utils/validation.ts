import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult, ValidationError as ExpressValidationError } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HTTP_STATUS } from '../constants/httpStatus'
import { EntityError, ErrorWithStatus, ErrorsType } from '../models/Errors'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObject = errors.mapped()
    const entityError = new EntityError({
      errors: {}
    })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      console.log('message', msg)
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    next(entityError)
  }
}

export const handleValidationError = (errors: ExpressValidationError[]) => {
  const errorsObject: ErrorsType = {}

  errors.forEach((error) => {
    const key = error.type
    errorsObject[key] = error.msg
  })

  return new ErrorWithStatus({
    message: 'Validation error',
    status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors: errorsObject
  })
}
