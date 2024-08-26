import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schemas'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@learnnodejs.rlzme.mongodb.net/?retryWrites=true&w=majority&appName=LearnNodejs`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
