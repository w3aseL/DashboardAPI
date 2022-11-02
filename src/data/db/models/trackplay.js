import { DataTypes } from "sequelize"
import db from "../config/index"

import { SpotifySong, SpotifySession } from "./index"

const SpotifyTrackPlay = db.define("TrackPlay", {
  time_played: {
    type: DataTypes.INTEGER,
    not_null: true,
    defaultValue: 0
  }
}, {
  createdAt: false,
  updatedAt: false
})

SpotifyTrackPlay.belongsTo(SpotifySong)     // Defined relationship here as it is crucial part of TrackPlay
SpotifyTrackPlay.belongsTo(SpotifySession)

SpotifyTrackPlay.sync()

export { SpotifyTrackPlay }