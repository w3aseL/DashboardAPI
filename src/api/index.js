import express from 'express'
import http from "http"
import https from "https"
import cors from "cors"
import path from "path"
import fs from "fs"
import fileUpload from "express-fileupload"
import helmet from "helmet"

import { DEBUG, API_PORT } from '@/helper/args'

import { APILogger, LogColors } from '@/helper/logger'

import { spotifyRouter } from './spotify'
import { twitterRouter } from './twitter'
import { authRouter } from './auth'
import { portfolioRouter } from './portfolio'
import { twitchRouter } from './twitch'
import { destinyRouter } from './destiny'
import { mobileRouter } from './mobile'

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
  
    const httpSrv = http.createServer(this.app)
    
    httpSrv.listen(port, '0.0.0.0', () => APILogger.info(`API listening on port ${port}`))

    if(DEBUG) {
      const httpsSrv = https.createServer({
        key: fs.readFileSync("./certs/server.key"),
        cert: fs.readFileSync("./certs/server.crt")
      }, this.app)
    
      httpsSrv.listen((port+1), '0.0.0.0', () => APILogger.info(`API HTTPS listening on port ${port+1}`))
    }
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

    // MOBILE APP ROUTES AND AUTH
    if(DEBUG) this.app.use('/mobile', mobileRouter)

    // OTHER
    this.app.use(express.static('public'))
    if(DEBUG) this.app.use('/certs', express.static('certs'))
    this.app.get('*', (req, res, next) => res.status(404).send({ error: "Method does not exist!" }))
  }
}

const api = new ServerAPI(API_PORT)

export { api }