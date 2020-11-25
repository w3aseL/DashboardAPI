import path from "path"
import { mainTwit } from "../bots/twodder"
import { DBLogger, LogColors } from '../helper/logger'
import { Sequelize, Model, DataTypes } from "sequelize"

// Create Spotify Database
const spotifySQL = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../storage", "spotify-db.sqlite"),
  logging: (msg) => DBLogger.info(msg)
})

// Spotify Authorization model
const SpotifyAuth = spotifySQL.define('Auth', {
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

// -- Spotify Track Data Models --
// Songs
const SpotifySong = spotifySQL.define('Song', {
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

// Artists
const SpotifyArtist = spotifySQL.define('Artist', {
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

// Albums
const SpotifyAlbum = spotifySQL.define('Album', {
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

// Song/Artist/Album Relationship Models
const SpotifySongArtist = spotifySQL.define('SongArtist', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifyArtist.belongsToMany(SpotifySong, { through: SpotifySongArtist, onDelete: "cascade", onUpdate: "cascade" })
SpotifySong.belongsToMany(SpotifyArtist, { through: SpotifySongArtist, onDelete: "cascade", onUpdate: "cascade" })

const SpotifySongAlbum = spotifySQL.define('SongAlbum', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifySong.belongsToMany(SpotifyAlbum, { through: SpotifySongAlbum, onDelete: "cascade", onUpdate: "cascade" })
SpotifyAlbum.belongsToMany(SpotifySong, { through: SpotifySongAlbum, onDelete: "cascade", onUpdate: "cascade" })

const SpotifyArtistAlbum = spotifySQL.define('ArtistAlbum', {}, {
  createdAt: false,
  updatedAt: false
})

SpotifyArtist.belongsToMany(SpotifyAlbum, { through: SpotifyArtistAlbum, onDelete: "cascade", onUpdate: "cascade" })
SpotifyAlbum.belongsToMany(SpotifyArtist, { through: SpotifyArtistAlbum, onDelete: "cascade", onUpdate: "cascade" })

// -- Spotify Tracking Data --
// Sessions
const SpotifySession = spotifySQL.define('Session', {
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

// Track Plays
const SpotifyTrackPlay = spotifySQL.define("TrackPlay", {
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

SpotifySession.hasMany(SpotifyTrackPlay)

// Sync models
SpotifyAuth.sync()
SpotifySong.sync()
SpotifyArtist.sync()
SpotifyAlbum.sync()
SpotifySongArtist.sync()
SpotifySongAlbum.sync()
SpotifyArtistAlbum.sync()
SpotifySession.sync()
SpotifyTrackPlay.sync()
//SpotifySessionTrackPlay.sync()

spotifySQL.authenticate()

// Create Twitter Database
const twitterSQL = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../storage", "twitter-db.sqlite"),
  logging: (msg) => DBLogger.info(msg)
})

// Twitter Models
const TwitterUser = twitterSQL.define('TwitterUser', {
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

const TwitterStats = twitterSQL.define('UserStatistics', {
  collected_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  follower_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  following_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  createdAt: false,
  updatedAt: false,
  name: {
    singular: 'UserStatistics',
    plural: 'UserStatistics'
  }
})

// Relationships
TwitterUser.hasMany(TwitterStats)

// Sync models
TwitterUser.sync()
TwitterStats.sync()

twitterSQL.authenticate()

export { spotifySQL, SpotifyAuth, twitterSQL, TwitterUser, TwitterStats, SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay }