import { api } from "./api/index.js"
import cron from "node-cron"

import { followReport, checkIfLive } from "./tasks/index"
import { args } from './helper/args'
import { SpotifyLogger, TwitterLogger } from './helper/logger'
import { mainDB } from './data/database'
import { client as chatbot } from './bots/chat/index'

import { setupUserAPIs, updateUserPlaybackState } from './bots/spotify/index'

const SECOND_IN_MS = 1000

function init() {
  checkIfLive()
  
  // setTimeout(() => followReport(), 5000)

  setupUserAPIs()

  cron.schedule('* * * * *', () => checkIfLive())

  cron.schedule('0 0 * * *', () => {
    TwitterLogger.info('Generating follow report!')
    followReport()
  })

  setTimeout(() => {
    SpotifyLogger.info("Scheduled song tracking task!")
    cron.schedule('* * * * * *', () => {
      updateUserPlaybackState()
    })
  }, SECOND_IN_MS * 5)

  //chatbot.connect();
}

init()