import express from 'express'
import bodyParser from 'body-parser'
import { args } from '../helper/args'
import { postTweet, getAllStats } from './twitter/index'
import { APILogger, LogColors } from '../helper/logger'
import { login, loginCallback, getUserData, getUserPlayback, getSessionState, trackPlaybackState, getAllStates, getAllSongs, getAllSessions } from './spotify'

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

    APILogger.info(`${LogColors.FgBlue}${timeStr} ${LogColors.FgWhite}-- ${LogColors.FgYellow}${req.method} ${LogColors.FgCyan}${req.url} ${getColorFromCode(res.statusCode)}${res.statusCode}`)
  }

  res.on('finish', log)
  next()
}

class ServerAPI {
  constructor(port) {
    this.app = express()

    this.app.use(logger)

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  
    this.setupRoutes()
  
    this.app.listen(port, () => APILogger.info(`API listening on port ${port}`))
  }

  //Setup routes here for the API
  setupRoutes() {
    this.app.get('/', (req, res) => res.status(200).send('Hello, world!'));
    this.app.post('/twitter/:acct/tweet', postTweet);
    this.app.get('/twitter/:acct/statistics', getAllStats);
    this.app.get('/spotify/login', login);
    this.app.get('/spotify/auth', loginCallback);
    this.app.get('/spotify/track-all', getAllStates);
    this.app.get('/spotify/track-playback', trackPlaybackState);
    this.app.get('/spotify/track-session', getSessionState);
    this.app.get('/spotify/data/songs', getAllSongs);
    this.app.get('/spotify/data/sessions', getAllSessions);
    this.app.get('/spotify/me', getUserData);
    this.app.get('/spotify/:user/me', getUserData);
    this.app.get('/spotify/me/playback', getUserPlayback);
    this.app.get('/spotify/:user/me/playback', getUserPlayback);
    this.app.get('*', (req, res, next) => res.status(404).send({ error: "Method does not exist!" }))
  }
}

const backendPort = args['backend-port'] ? parseInt(args['backend-port']) : 3000

const api = new ServerAPI(backendPort)

export { api }