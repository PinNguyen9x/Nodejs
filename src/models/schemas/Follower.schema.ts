import { ObjectId } from 'mongodb'

interface FollowerType {
  _id?: ObjectId
  created_at?: Date
  user_id: ObjectId
  followed_user_id: ObjectId
}

export default class Follower {
  _id?: ObjectId
  created_at?: Date
  user_id: ObjectId
  followed_user_id: ObjectId

  constructor(follower: FollowerType) {
    this._id = follower._id
    this.created_at = follower.created_at || new Date()
    this.user_id = follower.user_id
    this.followed_user_id = follower.followed_user_id
  }
}
