import { HTTP_STATUS } from '../constants/httpStatus'
import { ValidationError } from 'express-validator'

export type ErrorsType = Record<string, ValidationError | string>

export class ErrorWithStatus extends Error {
  status: number
  errors: ErrorsType

  constructor({
    message,
    status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors = {}
  }: {
    message?: string
    status?: number
    errors?: ErrorsType
  }) {
    super(message || 'Error')
    this.status = status
    this.errors = errors
  }
}

export class EntityError extends ErrorWithStatus {
  constructor({ message = 'Validation error', errors }: { message?: string; errors: Record<string, any> }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY, errors: errors as ErrorsType })
  }
}
