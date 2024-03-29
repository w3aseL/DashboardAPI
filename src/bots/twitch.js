import { TwitchLogger } from '@/helper/logger'
import { getAPIByUsername, validateAPIs } from './chat/api/index'

var isLive = false;

async function streamInfo(username) {
  return new Promise((resolve, reject) => {
    getAPIByUsername(username).request(`/streams?user_login=${username}`)
    .then(res => {
      resolve(res)
    })
    .catch(err => {
      reject(err)
    })
  })
}

export const isStreamLive = async function(username, callback) {
  if(getAPIByUsername(username) == null) return

  try {
    var { data } = await streamInfo(username)

    var retInfo = null
  
    if(data == null || data.length === 0) {
        if(isLive) isLive = false;
        return false;
    } else retInfo = data[0]
  
    if(!isLive && retInfo.type === "live") {
        TwitchLogger.info("w3aseL is live on Twitch! Sending tweet!");
  
        isLive = true;
        callback(retInfo.game_name, `https://www.twitch.tv/${retInfo.user_name}`);
    }
  } catch(e) {
    TwitchLogger.error("An error has occurred when checking if the streamer is live!")
    TwitchLogger.error(JSON.stringify(e))
    validateAPIs()
  }
}