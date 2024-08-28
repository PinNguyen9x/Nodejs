import { Request, Response, NextFunction, RequestHandler } from 'express'
export const wrapperHandler = (fn: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}
