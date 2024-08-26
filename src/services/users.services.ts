import { TokenType } from '~/constants/enums'
import { RegisterRqBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schemas'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import databaseService from './database.services'

class UsersService {
  private signAccessToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }
  async register(payload: RegisterRqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return { accessToken, refreshToken }
  }
  async checkEmailExisted(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
}

const usersService = new UsersService()
export default usersService
