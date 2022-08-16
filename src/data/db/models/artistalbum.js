import db from "../config/index"
import { SpotifyAlbum, SpotifyArtist } from "./index"

const SpotifyArtistAlbum = db.define('ArtistAlbum', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifyArtist.belongsToMany(SpotifyAlbum, { through: SpotifyArtistAlbum, onDelete: "cascade", onUpdate: "cascade" })
SpotifyAlbum.belongsToMany(SpotifyArtist, { through: SpotifyArtistAlbum, onDelete: "cascade", onUpdate: "cascade" })

SpotifyArtistAlbum.sync()

export { SpotifyArtistAlbum }