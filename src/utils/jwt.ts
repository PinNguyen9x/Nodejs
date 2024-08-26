import jwt, { SignOptions } from 'jsonwebtoken'
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
