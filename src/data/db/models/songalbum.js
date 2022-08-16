import db from "../config"
import { SpotifyAlbum, SpotifySong } from "./"

const SpotifySongAlbum = db.define('SongAlbum', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifySong.belongsToMany(SpotifyAlbum, { through: SpotifySongAlbum, onDelete: "cascade", onUpdate: "cascade" })
SpotifyAlbum.belongsToMany(SpotifySong, { through: SpotifySongAlbum, onDelete: "cascade", onUpdate: "cascade" })

SpotifySongAlbum.sync()

export { SpotifySongAlbum }