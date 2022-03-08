import { api } from "./api/index.js"
import cron from "node-cron"

import { followReport, checkIfLive } from "./tasks/index"
import { DEBUG } from './helper/args'
import { SpotifyLogger, TwitterLogger, APILogger, TwitchLogger } from './helper/logger'
import { mainDB } from './data/database'

import { setupUserAPIs, updateUserPlaybackState, fixMissingAlbumsIfAnyMissing, findListenAnomalies } from './bots/spotify/index'
import { setupTwitchAPIs } from "./bots/chat/api/index.js"
import { setupDestinyUserAPIs } from "./bots/destiny/auth.js"

const SECOND_IN_MS = 1000

function init() {
  // setTimeout(() => followReport(), 5000)

  setupUserAPIs()
  setupTwitchAPIs()
  setupDestinyUserAPIs()

  setTimeout(() => {
    TwitchLogger.info("Scheduled live tracking task!")
    cron.schedule('* * * * *', () => checkIfLive())
  }, SECOND_IN_MS * 10)

  if(DEBUG) {
    APILogger.info("API is in local developer mode!!!")
    cron.schedule('*/30 * * * *', () => {
      APILogger.info("API is in local developer mode!!!")
    })
  }

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

  setTimeout(() => {
    SpotifyLogger.info("Fixing songs with missing albums.")
    fixMissingAlbumsIfAnyMissing()
    // findListenAnomalies()
  }, SECOND_IN_MS * 15)
}

init()