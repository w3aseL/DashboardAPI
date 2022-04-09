import { DestinyAPI } from '.';
import { DestinyLogger, LogColors } from '../../helper/logger'
import { DestinyUserAuth } from '../../data/database'
import keys from '../../keys.json'
import { doManifestUpdate, setupManifest } from './manifest';

var userApis = []

export const setupDestinyUserAPIs = async () => {
  const users = await DestinyUserAuth.findAll()

  for(var i in users) {
    var user = users[i]

    var userAPI = new DestinyAPI()
  
    userAPI.setTokens(null, user.refresh_token)
    userAPI.setMembershipId(user.membership_id)
    userAPI.setDisplayName(user.display_name)

    const accessCreatedAt = new Date(user.created_at), timeElapsedSinceUpdate = (new Date().getTime() - accessCreatedAt.getTime()) / 1000
    var timeToTimeout = 3600

    if(timeElapsedSinceUpdate >= user.expires_in){
      userAPI.refreshAccessToken()
      .then(data => {
        const curTime = new Date()

        DestinyUserAuth.update({ access_token: data.access_token, created_at: curTime, expires_in: data.expires_in, refresh_token: data.refresh_token, refresh_created_at: curTime, refresh_expires_in: data.refresh_expires_in  }, { where: { membership_id: user.membership_id } })

        timeToTimeout = data.expires_in

        userAPI.setTokens(data.access_token, data.refresh_token)
        DestinyLogger.info(`Created user API and updated access token for user with ID ${user.membership_id}`)

        userApis.push({ id: user.display_name, api: userAPI })
      })
      .catch(err => {
        DestinyLogger.error(`Failed to update access token for user ${user.display_name}`)
        DestinyLogger.error(err)
      })
    } else { 
      userAPI.setTokens(user.access_token)
      userApis.push({ id: user.display_name, api: userAPI })
      
      timeToTimeout -= timeElapsedSinceUpdate

      DestinyLogger.info(`Created user API for ${user.display_name}, updates access token in ${Math.floor(timeToTimeout)} seconds`)
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

  setTimeout(() => doManifestUpdate(), 10000)
}

const updateUserAPI = async index => {
  var { id } = userApis[index]

  var user = await DestinyUserAuth.findOne({ where: { display_name: id } })

  if(!user) return

  userApis[index].api.refreshAccessToken()
  .then(data => {
    const curTime = new Date()

    DestinyUserAuth.update({ access_token: data.access_token, created_at: curTime, expires_in: data.expires_in, refresh_token: data.refresh_token, refresh_created_at: curTime, refresh_expires_in: data.refresh_expires_in  }, { where: { display_name: id } })

    var expiresIn = data.expiresIn

    userApis[index].api.setTokens(data.access_token, data.refresh_token)
    DestinyLogger.info(`Updated access token for user ${id}`)

    setTimeout(() => updateUserAPI(index), expiresIn * 1000)
  })
  .catch(err => {
    DestinyLogger.error(`Failed to update access token for user ${id}`)
    DestinyLogger.error(err)
  })
}

/**
 * 
 * @param {string} name 
 * @returns {DestinyAPI}
 */
export const getUserAPI = name => {
  for(var i in userApis) {
    if(userApis[i].id == name)
      return userApis[i].api
  }

  return null
}

/**
 * Gets the first available API
 * 
 * @returns {DestinyAPI}
 */
export const getFirstAPI = () => {
  if(userApis.length > 0) return userApis[0].api

  return null
}

export const registerUser = async code => {
  var userAPI = new DestinyAPI()

  var data = await userAPI.requestTokensViaCode(code), result = null

  const curTime = new Date()

  userAPI.setMembershipId(data.membership_id)
  userAPI.setTokens(data.access_token, data.refresh_token)

  try {
    result = (await userAPI.request(`/User/GetBungieNetUserById/${data.membership_id}/`))['Response']
  } catch (e) {
    DestinyLogger.error("An error has occurred when retreiving the user's profile!")
    DestinyLogger.error(e)

    return { registered: false, message: "An error occurred fetching your profile!", error: e }
  }

  userApis.push({ id: result.displayName, api: userAPI })

  const users = await DestinyUserAuth.findAll({ where: { display_name: result.displayName } })

  if(users.length > 0)
    return { registered: false, message: "User is already registered!" }

  var dbInsert = {
    membership_id: data.membership_id,
    display_name: result.displayName,
    refresh_token: data.refresh_token,
    refresh_created_at: curTime,
    access_token: data.access_token,
    expires_in: data.expires_in,
    created_at: curTime
  }

  try {
    const user = await DestinyUserAuth.create(dbInsert)
  } catch (e) {
    DestinyLogger.error(e)
    return { registered: false, message: "Failed to insert keys into database", error: e }
  }

  return { registered: true, message: "User has been successfully registered!" }
}