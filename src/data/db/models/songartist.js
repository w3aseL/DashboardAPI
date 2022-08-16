import db from "../config/index"
import { SpotifyArtist, SpotifySong } from "./index"

const SpotifySongArtist = db.define('SongArtist', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifyArtist.belongsToMany(SpotifySong, { through: SpotifySongArtist, onDelete: "cascade", onUpdate: "cascade" })
SpotifySong.belongsToMany(SpotifyArtist, { through: SpotifySongArtist, onDelete: "cascade", onUpdate: "cascade" })

SpotifySongArtist.sync()

export { SpotifySongArtist }