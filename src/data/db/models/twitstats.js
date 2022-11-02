import { DataTypes } from "sequelize"
import db from "../config/index"
import { TwitterUser } from "./index"

const TwitterStats = db.define('UserStatistics', {
  collected_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  follower_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  following_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  createdAt: false,
  updatedAt: false,
  name: {
    singular: 'UserStatistics',
    plural: 'UserStatistics'
  }
})

TwitterUser.hasMany(TwitterStats)

TwitterStats.sync()

export { TwitterStats }