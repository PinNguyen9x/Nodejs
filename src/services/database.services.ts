import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Follower from '~/models/schemas/Follower.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import User from '~/models/schemas/User.schemas'
import VideoStatus from '~/models/schemas/VideoSatus.schemas'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@learnnodejs.rlzme.mongodb.net/?retryWrites=true&w=majority&appName=LearnNodejs`

let client: MongoClient | null = null
let db: Db | null = null

class DatabaseService {
  private client: MongoClient
  private db: Db
  private static instance: DatabaseService

  constructor() {
    this.client = new MongoClient(uri, {
      maxPoolSize: 10,
      maxIdleTimeMS: 50000,
      serverSelectionTimeoutMS: 5000
    })
    this.db = this.client.db(envConfig.dbName)
  }

  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async connect() {
    try {
      if (!client) {
        client = await this.client.connect()
        db = this.db
        console.log('Connected to MongoDB!')
      }
      return db
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    }
  }
  get users(): Collection<User> {
    return this.db.collection(envConfig.dbUsersCollection || '')
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.dbRefreshTokensCollection || '')
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection || '')
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.dbVideoStatusCollection || '')
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
