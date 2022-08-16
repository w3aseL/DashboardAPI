import { DataTypes } from "sequelize"
import db from "../config/index"

const SpotifyArtist = db.define('Artist', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    not_null: true
  },
  name: {
    type: DataTypes.STRING,
    not_null: true
  },
  url: {
    type: DataTypes.STRING,
  }
}, {
  createdAt: false,
  updatedAt: false
})

SpotifyArtist.sync()

export { SpotifyArtist }