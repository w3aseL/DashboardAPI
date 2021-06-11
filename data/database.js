import path from "path"
import { mainTwit } from "../bots/twodder"
import { DBLogger, LogColors } from '../helper/logger'
import { Sequelize, Model, DataTypes } from "sequelize"

import generator from "generate-password"

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

const userSQL = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../storage", "user-db.sqlite"),
  logging: (msg) => DBLogger.info(msg)
})

const User = userSQL.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "display_name"
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

User.sync()

userSQL.authenticate()

// Create portfolio database for storing that information
const portfolioSQL = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../storage", "portfolio-db.sqlite"),
  logging: (msg) => DBLogger.info(msg)
})

const Category = portfolioSQL.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

const Tool = portfolioSQL.define('Tool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

const Image = portfolioSQL.define('Image', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: { 
    type: DataTypes.STRING,
    allowNull: false,
    field: "file_name"
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

Tool.belongsTo(Category)         // Establishes tools belong to categories (e.g. C++ is a language or Express is a framework)
Tool.belongsTo(Image)            // Main image of the tool (e.g. C++ logo)

const Education = portfolioSQL.define('Education', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "school_name"
  },
  schoolType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "school_type"
  },
  schoolUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "school_url"
  },
  rewardType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "reward_type"
  },
  major: {
    type: DataTypes.STRING,
    allowNull: true
  },
  graduationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "graduation_date"
  },
  gpa: {
    type: DataTypes.DECIMAL(2),
    allowNull: false
  }
}, {
  createdAt: false,
  updatedAt: false
})

Education.belongsTo(Image)

const Project = portfolioSQL.define('Project', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  repoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "repo_url"
  }
}, {
  createdAt: false,
  updatedAt: false
})

const ProjectImage = portfolioSQL.define('ProjectImage', {
  isLogo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "is_logo"
  }
}, {
  createdAt: false,
  updatedAt: false
})

const ProjectTool = portfolioSQL.define('ProjectTool', {}, {
  createdAt: false,
  updatedAt: false
})

Image.belongsToMany(Project, { through: ProjectImage, onDelete: "cascade", onUpdate: "cascade" })
Project.belongsToMany(Image, { through: ProjectImage, onDelete: "cascade", onUpdate: "cascade" })

Tool.belongsToMany(Project, { through: ProjectTool, onDelete: "cascade", onUpdate: "cascade" })
Project.belongsToMany(Tool, { through: ProjectTool, onDelete: "cascade", onUpdate: "cascade" })

const Position = portfolioSQL.define('Position', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "job_title"
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "company_name"
  },
  companyUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "company_url"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "start_date"
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "end_date"
  }
}, {
  createdAt: false,
  updatedAt: false
})

Position.belongsTo(Image)              // Logo for company position

const Resume = portfolioSQL.define('Resume', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => {
      const str = generator.generate({ length: 12, uppercase: true, lowercase: true, symbols: false, numbers: true })
      return str
    }
  },
  fileName: { 
    type: DataTypes.STRING,
    allowNull: false,
    field: "file_name"
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  creationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: "creation_date"
  }
}, {
  createdAt: false,
  updatedAt: false
})

Category.sync()
Tool.sync()
Image.sync()
Resume.sync()
Education.sync()

Position.sync()

Project.sync()
ProjectImage.sync()
ProjectTool.sync()

portfolioSQL.authenticate()

export { spotifySQL, SpotifyAuth, twitterSQL, TwitterUser, TwitterStats, SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay, User,
                    Category, Tool, Image, Resume, Education, Position, Project, ProjectImage, ProjectTool }