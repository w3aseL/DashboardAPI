import SpotifyWebApi from 'spotify-web-api-node'
import { SpotifyLogger, LogColors } from '../../helper/logger'
import { SpotifyAuth } from '../../data/database'
import keys from '../../keys.json'
import { DEBUG } from "../../helper/args";

export const keyLoc = DEBUG ? keys.spotify.dev : keys.spotify.prod

var userApis = []

export const setupUserAPIs = async () => {
  const users = await SpotifyAuth.findAll()

  for(var i in users) {
    var user = users[i]

    var userAPI = new SpotifyWebApi({
      clientId: keyLoc.client.id,
      clientSecret: keyLoc.client.secret,
    })
  
    userAPI.setRefreshToken(user.refresh_token)

    const accessCreatedAt = new Date(user.created_at), timeElapsedSinceUpdate = (new Date().getTime() - accessCreatedAt.getTime()) / 1000
    var timeToTimeout = 3600

    if(timeElapsedSinceUpdate >= user.expires_in){
      userAPI.refreshAccessToken()
      .then(data => {
        const curTime = new Date()

        SpotifyAuth.update({ access_token: data.body.access_token, created_at: curTime, expires_in: data.body.expires_in }, { where: { display_name: user.display_name } })

        userAPI.setAccessToken(data.body.access_token)
        SpotifyLogger.log(`Created user API and updated access token for user ${user.display_name}`)

        userApis.push({ id: user.display_name, api: userAPI })
      })
      .catch(err => {
        SpotifyLogger.error(`Failed to update access token for user ${user.display_name}`)
        console.error(err)
      })
    } else { 
      userAPI.setAccessToken(user.access_token)
      userApis.push({ id: user.display_name, api: userAPI })
      
      timeToTimeout -= timeElapsedSinceUpdate

      SpotifyLogger.log(`Created user API for ${user.display_name}, updates access token in ${Math.floor(timeToTimeout)} seconds`)
    }

    var index = -1

    for(var i in userApis) {
      if(userApis[i].id == user.display_name) {
        index = i
        break
      }
    }

    setTimeout(() => updateUserAPI(index), Math.floor(timeToTimeout) * 1000)
  }
}

const updateUserAPI = async index => {
  var { id } = userApis[index]

  var user = await SpotifyAuth.findOne({ where: { display_name: id } })

  if(!user) return

  userApis[index].api.refreshAccessToken()
  .then(data => {
    const curTime = new Date()

    SpotifyAuth.update({ access_token: data.body.access_token, created_at: curTime, expires_in: data.body.expires_in }, { where: { display_name: id } })

    userApis[index].api.setAccessToken(data.body.access_token)
    SpotifyLogger.log(`Updated access token for user ${id}`)

    setTimeout(() => updateUserAPI(index), 3600 * 1000)
  })
  .catch(err => {
    SpotifyLogger.error(`Failed to update access token for user ${id}`)
    console.error(err)
  })
}

export const getUserAPI = name => {
  for(var i in userApis) {
    if(userApis[i].id == name)
      return userApis[i].api
  }

  return null
}

export const defaultUsername = keys.spotify.default_user
export const defaultUserAPI = getUserAPI(defaultUsername)

export const registerUser = async data => {
  const curTime = new Date()

  var userAPI = new SpotifyWebApi({
    clientId: keyLoc.client.id,
    clientSecret: keyLoc.client.secret,
  })

  userAPI.setAccessToken(data.access_token)
  userAPI.setRefreshToken(data.refresh_token)

  var result

  try {
    result = await userAPI.getMe()
  } catch (e) {
    SpotifyLogger.error("An error has occurred when retreiving the user's profile!")
    console.log(e)

    return { registered: false, message: "An error occurred fetching your profile!", error: e }
  }

  var username = result.body.id

  const users = await SpotifyAuth.findAll({ where: { display_name: username } })

  if(users.length > 0) {
    var dbUpdate = {
      refresh_token: data.refresh_token,
      refresh_created_at: curTime,
      access_token: data.access_token,
      expires_in: data.expires_in,
      created_at: curTime
    }

    try {
      const user = await SpotifyAuth.update(dbUpdate,{ where: { display_name: username }})
    } catch(e) {
      console.error(e)
      return { registered: false, message: "Failed to insert keys into database", error: e }
    }

    for(var i = 0; i < userApis.length; i++) {
      if(userApis[i].id === username) userApis[i].api = userAPI
    }

    return { registered: true, message: `User ${username}'s registration has successfully been updated!` }
  } else {
    var dbInsert = {
      display_name: username,
      refresh_token: data.refresh_token,
      refresh_created_at: curTime,
      access_token: data.access_token,
      expires_in: data.expires_in,
      created_at: curTime
    }
  
    try {
      const user = await SpotifyAuth.create(dbInsert)
    } catch (e) {
      console.error(e)
      return { registered: false, message: "Failed to insert keys into database", error: e }
    }

    userApis.push({ id: username, api: userAPI })
  
    return { registered: true, message: "User has been successfully registered!" }
  }
}