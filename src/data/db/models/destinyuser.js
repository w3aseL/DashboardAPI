import { DataTypes } from "sequelize"
import db from "../config/index"

const DestinyUserAuth = db.define('DestinyUser', {
  membership_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  display_name: {
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

DestinyUserAuth.sync()

export { DestinyUserAuth }