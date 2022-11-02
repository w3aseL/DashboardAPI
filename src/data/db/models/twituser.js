import { DataTypes } from "sequelize"
import db from "../config/index"

const TwitterUser = db.define('TwitterUser', {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false
  },
  handle: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

TwitterUser.sync()

export { TwitterUser }