import { DataTypes } from "sequelize"
import db from "../config/index"

const TwitchUserAuth = db.define('TwitchUser', {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  refresh_token: {
    type: DataTypes.STRING,
    not_null: true
  },
  refresh_created_at: {
    type: DataTypes.DATE,
    not_null: true
  },
  access_token: {
    type: DataTypes.STRING,
    not_null: true
  },
  expires_in: {
    type: DataTypes.INTEGER,
    not_null: true
  },
  created_at: {
    type: DataTypes.DATE,
    not_null: true
  }
}, {
  createdAt: false,
  updatedAt: false
})

TwitchUserAuth.sync()

export { TwitchUserAuth }