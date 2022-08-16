import { DataTypes } from "sequelize"
import db from "../config/index"

const SpotifyAlbum = db.define('Album', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    not_null: true
  },
  title: {
    type: DataTypes.STRING,
    not_null: true
  },
  url: {
    type: DataTypes.STRING
  },
  artwork_url: {
    type: DataTypes.STRING
  }
}, {
  createdAt: false,
  updatedAt: false
})

SpotifyAlbum.sync()

export { SpotifyAlbum }