import { TokenPayload } from './models/requests/User.request'
import { User } from './models/schemas/User.schemas'
import { Request } from 'express'
declare module 'express' {
  export interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
