import { getAPIByUsername } from './chat/api';

var request = require('request');
var keys = require('../keys.json');

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

  var { data } = await streamInfo(username)

  var retInfo = null

  if(data == null || data.length === 0) {
      if(isLive) isLive = false;
      return false;
  } else retInfo = data[0]

  if(!isLive && retInfo.type === "live") {
      console.log("w3aseL is live on Twitch! Sending tweet!");

      isLive = true;
      callback(retInfo.game_name, `https://www.twitch.tv/${retInfo.user_name}`);
  }
}