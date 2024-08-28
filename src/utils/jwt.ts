import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'
config()

export const signToken = ({
  secretKey = process.env.JWT_SECRET_KEY as string,
  options = { algorithm: 'HS256' },
  payload
}: {
  secretKey?: string
  options?: SignOptions
  payload: string | Buffer | object
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}
export const verifyAcessToken = ({
  token,
  secretKey = process.env.JWT_SECRET_KEY
}: {
  token: string
  secretKey?: string
}) => {
  return new Promise<jwt.VerifyCallback>((resolve, reject) => {
    jwt.verify(token, secretKey as string, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as jwt.VerifyCallback)
    })
  })
}
