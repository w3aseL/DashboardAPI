import express from 'express'
import cors from "cors"
//import path from "path"
import fileUpload from "express-fileupload"
import helmet from "helmet"

import { DEBUG, API_PORT } from '../helper/args'

import { APILogger, LogColors } from '../helper/logger'

import { spotifyRouter } from './spotify'
import { twitterRouter } from './twitter'
import { authRouter } from './auth'
import { portfolioRouter } from './portfolio'
import { twitchRouter } from './twitch'
import { destinyRouter } from './destiny'

const formatTimeNum = timeNum => timeNum < 10 ? `0${timeNum}` : `${timeNum}`

const logger = (req, res, next) => {
  const log = () => {
    APILogger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`)
  }

  res.on('finish', log)
  next()
}

var whitelist = [ 'dashboard.noahtemplet.dev', 'statistics.noahtemplet.dev', 'noahtemplet.dev', 'weasel.gg', 'dash.weasel.gg', 'api.noahtemplet.dev' ]

const verifyOrigin = origin => {
  if(!origin) return true

  var foundOrigin = false

  whitelist.forEach(wlOrig => {
    const fullUrl = `https://${wlOrig.toLowerCase()}`, fullwww = `https://www.${wlOrig.toLowerCase()}`

    if(origin === fullUrl || origin === fullwww) foundOrigin = true
  })

  return foundOrigin
}

var corsOptions = {
  origin: function (origin, callback) {
    if (verifyOrigin(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const errorHandler = (err, req, res, next) => {
  if(!err) return next()

  res.status(500).send({ message: "An uncaught error occurred on the server side!" })
}

class ServerAPI {
  constructor(port) {
    this.app = express()

    this.app.use(fileUpload({
      createParentPath: true
    }))

    this.app.use(logger)
    this.app.use(errorHandler)

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if(!DEBUG) {
      this.app.use(cors(corsOptions))
      this.app.use(helmet())
    }
  
    this.setupRoutes()
  
    this.app.listen(port, () => APILogger.info(`API listening on port ${port}`))
  }

  //Setup routes here for the API
  setupRoutes() {
    // AUTH
    this.app.use('/auth', authRouter)

    // TWITTER
    this.app.use('/twitter', twitterRouter)

    // SPOTIFY TRACKING
    this.app.use('/spotify', spotifyRouter)

    // PORTFOLIO EDITING
    this.app.use('/portfolio', portfolioRouter)

    // TWITCH BOT CONTROLS
    this.app.use('/twitch', twitchRouter)

    // DESTINY AUTHENTICATION FOR API
    this.app.use('/destiny', destinyRouter)

    // OTHER
    this.app.use(express.static('public'));
    this.app.get('*', (req, res, next) => res.status(404).send({ error: "Method does not exist!" }))
  }
}

const api = new ServerAPI(API_PORT)

export { api }