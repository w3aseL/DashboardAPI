import { getUserAPI, getPlaybackState, getActiveSession } from '../../bots/spotify/index'
import { getStoredSongs, getStoredSessions } from "./data"
import keys from '../../keys.json'

export const getUserData = (req, res, next) => {
  const user = (req.params != {} && req.params.user) ? req.params.user : keys.spotify.default_user

  const API = getUserAPI(user)

  if(!API) {
    res.status(400).send({ message: "That user does not exist!" })
    return
  }

  API.getMe()
  .then(data => {
    res.status(200).send({ ...data.body })
  })
  .catch(err => {
    res.status(500).send({ ...err })
  })
}

export const getUserPlayback = (req, res, next) => {
  const user = (req.params != {} && req.params.user) ? req.params.user : keys.spotify.default_user

  const API = getUserAPI(user)

  if(!API) {
    res.status(400).send({ message: "That user does not exist!" })
    return
  }

  API.getMyCurrentPlaybackState()
  .then(data => {
    res.status(200).send({ ...data })
  })
  .catch(err => {
    res.status(500).send({ ...err })
  })
}

export const trackPlaybackState = (req, res, next) => {
  res.status(200).send({ ...getPlaybackState() })
}

export const getSessionState = (req, res, next) => {
  res.status(200).send({ ...getActiveSession() })
}

export const getAllStates = (req, res, next) => {
  res.status(200).send({ ...getPlaybackState(), session: getActiveSession() })
}

export const getAllSongs = async (req, res, next) => {
  try {
    var songs = await getStoredSongs()

    res.status(200).send({ songs: songs })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred when retrieving the tokens for Spotify.", error: err })
    return
  }
}

export const getAllSessions = async (req, res, next) => {
  try {
    var sessions = await getStoredSessions()

    res.status(200).send({ sessions: sessions })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred when retrieving the tokens for Spotify.", error: err })
    return
  }
}

export * from './auth'