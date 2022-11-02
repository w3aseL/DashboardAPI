import { DataTypes } from "sequelize"
import db from "../config/index"

const SpotifySession = db.define('Session', {
  start_time: {
    type: DataTypes.DATE,
    not_null: true
  },
  end_time: {
    type: DataTypes.DATE,
    not_null: true
  },
  song_count: {
    type: DataTypes.INTEGER,
    not_null: true,
    defaultValue: 0
  },
  time_listening: {
    type: DataTypes.INTEGER,
    not_null: true,
    defaultValue: 0
  }
}, {
  createdAt: false,
  updatedAt: false
})

SpotifySession.sync()

export { SpotifySession }