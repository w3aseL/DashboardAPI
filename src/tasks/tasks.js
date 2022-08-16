import { botTwit, mainTwit } from "@/bots/twodder"
import { isStreamLive } from "@/bots/twitch"
import { LogColors, TwitchLogger, TwitterLogger } from '@/helper/logger'
import keys from '@/data/keys'
import { TwitterStats } from "@/data/database"
import { validateAPIs } from "@/bots/chat/api"

var info = {
  followersMain: 0,
  followersThis: 0
}

export async function followReport() {
  let infoMain, infoBot

  try {
    infoMain = (await mainTwit.getUserInfo())
    infoBot = (await botTwit.getUserInfo())
  } catch(e) {
    TwitterLogger.error(`Failed to perform follow report: ${e.message}`)
    return
  }

  const mainFollowerCount = infoMain.followers_count, mainFollowingCount = infoMain.friends_count
  const botFollowerCount = infoBot.followers_count, botFollowingCount = infoBot.friends_count

  var curTime = new Date()

  try {
    TwitterStats.create({ TwitterUserId: mainTwit.getSimpleUserInfo().id, collected_at: curTime, follower_count: mainFollowerCount, following_count: mainFollowingCount })
    TwitterStats.create({ TwitterUserId: botTwit.getSimpleUserInfo().id, collected_at: curTime, follower_count: botFollowerCount, following_count: botFollowingCount })
  } catch(e) {
    TwitterLogger.error(`Failed to perform follow report: ${e.message}`)
    return
  }

  // buncha jumbled stuff lol
  TwitterLogger.info(`Follower Report:
People Following @${mainTwit.getSimpleUserInfo().screen_name}: ${mainFollowerCount}
People Following @${botTwit.getSimpleUserInfo().screen_name}: ${botFollowerCount}
Written to database!
Time Completed: ${curTime.toLocaleString()}
--------------------------`)
}

export function checkIfLive() {
  isStreamLive("w3aseL", tweetLive);
}

export function tweetLive(game, url) {
  if(!game) return

  botTwit.postTweet(`.@_w3aseL is live on Twitch! He is playing ${game}!\n${url}`);
}

export function validateTwitchAPIs() {
  TwitchLogger.info("Validating available Twitch APIs.")
  validateAPIs()
}