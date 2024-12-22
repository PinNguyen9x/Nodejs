import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = process.env.NODE_ENV || 'production'
const envFilename = `.env.${env}`

// Only check for env files in development
if (env === 'development') {
  if (!fs.existsSync(path.resolve(envFilename))) {
    console.log(`Không tìm thấy file môi trường ${envFilename}`)
    console.log(
      `Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`
    )
    console.log(`Vui lòng tạo file ${envFilename} và tham khảo nội dung ở file .env.example`)
    process.exit(1)
  }

  config({
    path: envFilename
  })
} else {
  // In production (Vercel), just load process.env
  config()
}

export const isProduction = env === 'production'

export const envConfig = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || '0.0.0.0',
  dbName: process.env.DB_NAME,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbTweetsCollection: process.env.DB_TWEETS_COLLECTION,
  dbUsersCollection: process.env.DB_USERS_COLLECTION,
  dbHashtagsCollection: process.env.DB_HASHTAGS_COLLECTION,
  dbBookmarksCollection: process.env.DB_BOOKMARKS_COLLECTION,
  dbLikesCollection: process.env.DB_LIKES_COLLECTION,
  dbRefreshTokensCollection: process.env.DB_REFRESH_TOKENS_COLLECTION,
  dbFollowersCollection: process.env.DB_FOLLOWERS_COLLECTION,
  dbVideoStatusCollection: process.env.DB_VIDEO_STATUS_COLLECTION,
  dbConversationCollection: process.env.DB_CONVERSATION_COLLECTION,
  passwordSecret: process.env.PASSWORD_SECRET,
  jwtSecretAccessToken: process.env.JWT_SECRET_ACCESS_TOKEN,
  jwtSecretRefreshToken: process.env.JWT_SECRET_REFRESH_TOKEN,
  jwtSecretEmailVerifyToken: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  jwtSecretForgotPasswordToken: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  emailVerifyTokenExpiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  clientRedirectCallback: process.env.CLIENT_REDIRECT_CALLBACK,
  clientUrl: process.env.CLIENT_URL,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  sesFromAddress: process.env.SES_FROM_ADDRESS,
  s3BucketName: process.env.S3_BUCKET_NAME
}
