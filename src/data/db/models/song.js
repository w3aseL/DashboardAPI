import { DataTypes } from "sequelize"
import db from "../config/index"

const SpotifySong = db.define('Song', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    not_null: true
  },
  title: {
    type: DataTypes.STRING,
    not_null: true
  },
  duration: {
    type: DataTypes.INTEGER,
    not_null: true,
    defaultValue: 0
  },
  url: {
    type: DataTypes.STRING,
  }
}, {
  createdAt: false,
  updatedAt: false
})

SpotifySong.sync()

export { SpotifySong }