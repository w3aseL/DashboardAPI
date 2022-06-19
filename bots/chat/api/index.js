import { TwitchUserAuth } from "../../../data/database"
import request from "request"
import keys from "../../../keys.json"
import { TwitchUserAPI } from "./user"
import { TwitchLogger } from "../../../helper/logger"

var apis = []

const reqInitTokens = async (code, redirectURI) => {
  return new Promise((resolve, reject) => {
    request({
      url: encodeURI(`https://id.twitch.tv/oauth2/token?client_id${keys.twitch.client.id}&client_secret=${keys.twitch.client.secret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`),
      method: "POST",
      headers: {
          'Client-ID': keys.twitch.client.id,
          'Accept': 'application/vnd.twitchtv.v5+json'
      },
      json: true
    }, function(error, resp, body){
        if(error) reject(error)
        else if(resp.statusCode > 400) reject(body)
        else resolve(body)
    });
  })
}

export const setupTwitchAPIs = async () => {
  const users = await TwitchUserAuth.findAll()

  apis = []

  for(var i in users) {
    var user = users[i], timeToTimeout = user.expires_in

    var api = new TwitchUserAPI({
      clientId: keys.twitch.client.id,
      clientSecret: keys.twitch.client.secret
    })

    api.setTokens(user.access_token, user.refresh_token)
    api.initializeInfo(user.user_id, user.username)

    const accessCreatedAt = new Date(user.created_at), timeElapsedSinceUpdate = (new Date().getTime() - accessCreatedAt.getTime()) / 1000

    if(timeElapsedSinceUpdate >= user.expires_in) {
      api.refreshAccessToken()
      .then(res => {
        var curTime = new Date()
        const { access_token, refresh_token } = res

        user.update({ access_token, refresh_token, created_at: curTime, refresh_created_at: curTime })

        api.setTokens(access_token, refresh_token )

        TwitchLogger.info(`Created user API and updated access token for user ${user.username}`)
        apis.push(api)
      })
      .catch(err => {
        TwitchLogger.error(`Failed to update access token for user ${user.username}`)
        TwitchLogger.error(err)
      })
    } else {
      apis.push(api)
      timeToTimeout -= timeElapsedSinceUpdate

      TwitchLogger.info(`Created Twitch API for ${user.username}, updates access token in ${Math.floor(timeToTimeout)} seconds`)
    }

    var index = -1

    for(var i in apis) {
      if(apis[i].getId() === user.user_id) {
        index = i
        break
      }
    }
  }
}

const updateTwitchAPI = async idx => {
  var user = await TwitchUserAuth.findOne({ where: { user_id: apis[idx].getId() } })

  if(!user) return

  apis[idx].refreshAccessToken()
  .then(async res => {
    var curTime = new Date()
    
    if(res.status >= 400) {
      const username = user.username

      await user.destroy()

      setupTwitchAPIs()

      TwitchLogger.info(`Deleted api for user ${username}, user needs to refresh authentication`)
    } else {
      const { access_token, refresh_token } = res

      user.update({ access_token, refresh_token, created_at: curTime, refresh_created_at: curTime })

      apis[idx].setTokens(access_token, refresh_token)

      TwitchLogger.info(`Updated access and refresh tokens for user ${user.username}`)
    }
  })
  .catch(err => {
    TwitchLogger.error(`Failed to update access token for user ${user.username}`)
    TwitchLogger.error(err)
  })
}

/**
 * 
 * @param {string} username 
 * @returns {TwitchUserAPI}
 */
export const getAPIByUsername = username => {
  for(var i in apis) {
    if(apis[i].getUsername().toLowerCase() === username.toLowerCase()) return apis[i]
  }

  return null
}

export const defaultTwitchAPI = getAPIByUsername(keys.twitch.chatbot.default_channel)

export const validateAPIs = () => {
  for(var i in apis) {
    apis[i].validate()
    .then(_ => TwitchLogger.info(`Performed successful validation for user ${apis[i].getUsername()}`))
    .catch(_ => {
      TwitchLogger.error(`Failed to validate for user ${apis[i].getUsername()}, treating as expired!`)
      updateTwitchAPI(i)
    })
  }
}

export const registerUser = async (code, requestURI) => {
  var data = null
  
  try {
    data = await reqInitTokens(code, requestURI)
  } catch(e) {
    return { registered: false, message: "Failed to get initial tokens for user with code!", error: e }
  }

  var currentTime = new Date()

  var api = new TwitchUserAPI({ clientId: keys.twitch.client.id, clientSecret: keys.twitch.client.secret })

  api.setTokens(data.access_token, data.refresh_token)

  try { 
    var validation = await api.validate()

    const users = await TwitchUserAuth.findAll({ where: { user_id: validation.user_id } })

    if(users.length > 0) {
      
    } else {
      api.initializeInfo(validation.user_id, validation.login)

      apis.push(api)

      await TwitchUserAuth.create({
        user_id: validation.user_id,
        username: validation.login,
        refresh_token: data.refresh_token,
        refresh_created_at: currentTime,
        access_token: data.access_token,
        expires_in: data.expires_in,
        created_at: currentTime
      })

      return { registered: true, message: "User has been successfully registered!" }
    }

    api.initializeInfo(validation.user_id, validation.login)

    apis.push(api)

    await TwitchUserAuth.create({
      user_id: validation.user_id,
      username: validation.login,
      refresh_token: data.refresh_token,
      refresh_created_at: currentTime,
      access_token: data.access_token,
      expires_in: data.expires_in,
      created_at: currentTime
    })

    return { registered: true, message: "User has been successfully registered!" }
  } catch(e) {
    TwitchLogger.error(e)
    return { registered: false, message: "Failed to setup user for Twitch!", error: e }
  }
}