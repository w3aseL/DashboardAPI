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

const formatTimeNum = timeNum => timeNum < 10 ? `0${timeNum}` : `${timeNum}`

const logger = (req, res, next) => {
  const log = () => {
    const curTime = new Date()
    const timeStr = `${curTime.getMonth() + 1}-${curTime.getDate()}-${curTime.getFullYear()} ${formatTimeNum(curTime.getHours())}:${formatTimeNum(curTime.getMinutes())}:${formatTimeNum(curTime.getSeconds())}`

    const getColorFromCode = (status) => {
      if(status >= 200 && status < 300)
        return LogColors.FgGreen
      else if(status >= 300 && status < 400)
        return LogColors.FgYellow
      else if(status >= 400 && status < 500)
        return LogColors.FgRed
      else return LogColors.FgMagenta
    }

    APILogger.info(`${LogColors.FgBlue}${timeStr} ${LogColors.FgWhite}-- ${LogColors.FgYellow}${req.method} ${LogColors.FgCyan}${req.originalUrl} ${getColorFromCode(res.statusCode)}${res.statusCode}`)
  }

  res.on('finish', log)
  next()
}

var whitelist = [ 'dashboard.noahtemplet.dev', 'statistics.noahtemplet.dev', 'noahtemplet.dev', 'weasel.gg', 'dash.weasel.gg' ]

const verifyOrigin = origin => {
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

class ServerAPI {
  constructor(port) {
    this.app = express()

    this.app.use(fileUpload({
      createParentPath: true
    }))

    this.app.use(logger)

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

    // OTHER
    this.app.use(express.static('public'));
    this.app.get('*', (req, res, next) => res.status(404).send({ error: "Method does not exist!" }))
  }
}

const api = new ServerAPI(API_PORT)

export { api }