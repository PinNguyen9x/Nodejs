import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { username, password } = req.body
  if (username === 'admin' && password === '123') return res.json({ message: 'Hello World!' })
  return res.status(401).json({ message: 'Unauthorized' })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersServices.register({ email, password })
    return res.json({ message: 'register successfully', result })
  } catch (error) {
    return res.status(400).json({ message: 'Register failed', error })
  }
}
