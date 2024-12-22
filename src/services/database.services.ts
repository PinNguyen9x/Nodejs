import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '../constants/config'
import Follower from '../models/schemas/Follower.schema'
import RefreshToken from '../models/schemas/RefreshToken.schemas'
import User from '../models/schemas/User.schemas'
import VideoStatus from '../models/schemas/VideoSatus.schemas'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@learnnodejs.rlzme.mongodb.net/?retryWrites=true&w=majority&appName=LearnNodejs`

class DatabaseService {
  private client: MongoClient
  private db: Db
  private static instance: DatabaseService

  constructor() {
    console.log('Initializing DatabaseService...')
    this.client = new MongoClient(uri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000
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
      console.log('Attempting to connect to MongoDB...')
      console.log('Database Name:', envConfig.dbName)

      await this.client.connect()

      // Test the connection
      await this.db.command({ ping: 1 })
      console.log('Successfully connected to MongoDB!')

      return this.db
    } catch (error) {
      console.error('MongoDB Connection Error:', error)
      console.error('Connection URI (redacted):', uri.replace(/:([^@]+)@/, ':****@'))
      throw error
    }
  }

  // Add a disconnect method
  async disconnect() {
    try {
      await this.client.close()
      console.log('Disconnected from MongoDB')
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error)
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

  public async checkHealth() {
    return await this.db.command({ ping: 1 })
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
