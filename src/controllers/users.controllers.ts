import { Request, Response } from 'express'
export const loginController = (req: Request, res: Response) => {
  const { username, password } = req.body
  if (username === 'admin' && password === '123') return res.json({ message: 'Hello World!' })
  return res.status(401).json({ message: 'Unauthorized' })
}
