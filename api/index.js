import express from 'express'
import bodyParser from 'body-parser'
import cors from "cors"
//import path from "path"
import fileUpload from "express-fileupload"

import { args } from '../helper/args'

import { postTweet, getAllStats } from './twitter/index'
import { APILogger, LogColors } from '../helper/logger'

import { login, loginCallback, getUserData, getUserPlayback, getSessionState, trackPlaybackState, getAllStates, getSong, getSongs, getSession, getSessions } from './spotify'
import { startAccountProcess, createAccount, loginAccount, verifyAccount, performAccessTokenRefresh, updatePassword } from './auth'
import { uploadImage, getCategories, createCategory, removeCategory, uploadToolLogo, createTool, getTools, deleteTool, getTool,
  uploadResume, updateResumeCreationDate, getResumes, getAllEducation, getEducationById, createEducationObj, uploadSchoolLogo } from './portfolio'

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

var whitelist = [ 'https://dashboard.noahtemplet.dev', "https://statistics.noahtemplet.dev", 'https://noahtemplet.dev' ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
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

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    if(args.DEBUG)
      this.app.use(cors(corsOptions))
  
    this.setupRoutes()
  
    this.app.listen(port, () => APILogger.info(`API listening on port ${port}`))
  }

  //Setup routes here for the API
  setupRoutes() {
    // AUTH
    this.app.get('/auth/request-registration', startAccountProcess);
    this.app.post('/auth/register', createAccount)
    this.app.post('/auth/login', loginAccount)
    this.app.post('/auth/refresh', performAccessTokenRefresh)
    this.app.post('/auth/update-password', verifyAccount, updatePassword)

    // TWITTER
    this.app.post('/twitter/:acct/tweet', verifyAccount, postTweet);
    this.app.get('/twitter/:acct/statistics', verifyAccount, getAllStats);

    // SPOTIFY TRACKING
    this.app.get('/spotify/login', verifyAccount, login);
    this.app.get('/spotify/auth', verifyAccount, loginCallback);
    this.app.get('/spotify/track-all', verifyAccount, getAllStates);
    this.app.get('/spotify/track-playback', verifyAccount, trackPlaybackState);
    this.app.get('/spotify/track-session', verifyAccount, getSessionState);
    this.app.get('/spotify/data/songs', verifyAccount, getSongs);
    this.app.get('/spotify/data/song/:id', verifyAccount, getSong);
    this.app.get('/spotify/data/sessions', verifyAccount, getSessions);
    this.app.get('/spotify/data/session/:id', verifyAccount, getSession);
    this.app.get('/spotify/me', verifyAccount, getUserData);
    this.app.get('/spotify/:user/me', verifyAccount, getUserData);
    this.app.get('/spotify/me/playback', verifyAccount, getUserPlayback);
    this.app.get('/spotify/:user/me/playback', verifyAccount, getUserPlayback);

    // PORTFOLIO EDITING
    //this.app.post('/portfolio/upload-image', verifyAccount, uploadImage);
    this.app.get('/portfolio/category', verifyAccount, getCategories);
    this.app.post('/portfolio/category', verifyAccount, createCategory);
    this.app.delete('/portfolio/category', verifyAccount, removeCategory);
    this.app.get('/portfolio/tool', verifyAccount, getTools);
    this.app.post('/portfolio/tool', verifyAccount, createTool);
    this.app.delete('/portfolio/tool', verifyAccount, deleteTool);
    this.app.get('/portfolio/tool/:id', verifyAccount, getTool);
    this.app.post('/portfolio/tool/upload-image', verifyAccount, uploadToolLogo);
    this.app.get('/portfolio/resume', verifyAccount, getResumes);
    this.app.post('/portfolio/resume', verifyAccount, uploadResume);
    this.app.patch('/portfolio/resume/:id', verifyAccount, updateResumeCreationDate);
    this.app.get('/portfolio/education', verifyAccount, getAllEducation);
    this.app.post('/portfolio/education', verifyAccount, createEducationObj);
    this.app.get('/portfolio/education/:id', verifyAccount, getEducationById);
    this.app.post('/portfolio/education/upload-image', verifyAccount, uploadSchoolLogo);

    // OTHER
    this.app.use(express.static('public'));
    this.app.get('*', (req, res, next) => res.status(404).send({ error: "Method does not exist!" }))
  }
}

const backendPort = args['backend-port'] ? parseInt(args['backend-port']) : 3000

const api = new ServerAPI(backendPort)

export { api }