import { botTwit, mainTwit } from "../bots/twodder"
import { isStreamLive } from "../bots/twitch"
import { LogColors, TwitterLogger } from '../helper/logger'
import keys from '../keys.json'
import { TwitterStats } from "../data/database"

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
    TwitterLogger.error(`${LogColors.FgRed}Failed to perform follow report: ${e.message}`)
    return
  }

  const mainFollowerCount = infoMain.followers_count, mainFollowingCount = infoMain.friends_count
  const botFollowerCount = infoBot.followers_count, botFollowingCount = infoBot.friends_count

  var curTime = new Date()

  try {
    TwitterStats.create({ TwitterUserId: mainTwit.getSimpleUserInfo().id, collected_at: curTime, follower_count: mainFollowerCount, following_count: mainFollowingCount })
    TwitterStats.create({ TwitterUserId: botTwit.getSimpleUserInfo().id, collected_at: curTime, follower_count: botFollowerCount, following_count: botFollowingCount })
  } catch(e) {
    TwitterLogger.error(`${LogColors.FgRed}Failed to perform follow report: ${e.message}`)
    return
  }

  // buncha jumbled stuff lol
  TwitterLogger.info(`${LogColors.FgYellow}Follower Report:
${LogColors.FgWhite}People Following ${LogColors.FgCyan}@${mainTwit.getSimpleUserInfo().screen_name}: ${LogColors.FgYellow}${mainFollowerCount}
${LogColors.FgWhite}People Following ${LogColors.FgCyan}@${botTwit.getSimpleUserInfo().screen_name}: ${LogColors.FgYellow}${botFollowerCount}
${LogColors.FgGreen}Written to database!
${LogColors.FgYellow}Time Completed: ${LogColors.FgCyan}${curTime.toLocaleString()}
${LogColors.FgWhite}--------------------------`)
}

export function checkIfLive() {
  isStreamLive("w3aseL", tweetLive);
}

export function tweetLive(game, url) {
  if(!game) return

  botTwit.postTweet(`.@_w3aseL is live on Twitch! He is playing ${game}!\n${url}`);
}