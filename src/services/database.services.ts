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
      connectTimeoutMS: 30000, // Connection timeout
      socketTimeoutMS: 45000, // Socket timeout
      serverSelectionTimeoutMS: 60000, // Server selection timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5, // Minimum number of connections in the pool
      retryWrites: true,
      w: 'majority', // Write concern
      retryReads: true,
      maxIdleTimeMS: 120000, // Maximum idle time for connection
      heartbeatFrequencyMS: 10000 // How often to check server status
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
      console.log('Connecting to MongoDB...')
      await this.client.connect()
      this.db = this.client.db(envConfig.dbName)
      console.log('Connected to MongoDB successfully')

      return this.db
    } catch (error) {
      console.error('MongoDB Connection Error:', error)
      // Add retry logic
      const maxRetries = 3
      let retries = 0
      while (retries < maxRetries) {
        try {
          console.log(`Retrying connection... Attempt ${retries + 1}/${maxRetries}`)
          await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds before retrying
          await this.client.connect()
          this.db = this.client.db(envConfig.dbName)
          console.log('Connected to MongoDB successfully after retry')
          return
        } catch (retryErr) {
          retries++
          if (retries === maxRetries) {
            throw new Error(`Failed to connect after ${maxRetries} attempts: ${retryErr}`)
          }
        }
      }
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
    try {
      await this.db.command({ ping: 1 })
      return true
    } catch (err) {
      console.error('Database health check failed:', err)
      throw err
    }
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
