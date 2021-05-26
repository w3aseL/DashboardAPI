import { getUserAPI, getPlaybackState, getActiveSession } from '../../bots/spotify/index'
import { getStoredSongs, getStoredSessions, getStoredSong, getStoredSession } from "./data"
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

export const getSong = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "You must provide a song identifier!" })
    return
  }

  try {
    const song = await getStoredSong(id)

    res.status(200).send(song)
  } catch(err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

export const getSongs = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 50
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  var fullSongs = req.query.full_songs && req.query.full_songs === "false" ? false : true
  const songUrl = `/spotify/data/song/`
  const nextUrl = `/spotify/data/songs`

  try {
    var { songs, total_count } = await getStoredSongs(limit, offset, fullSongs, songUrl)

    var returnData = {
      songs,
      total_count
    }

    if(total_count-1 >= offset+limit)
      returnData.next = `${nextUrl}?limit=${limit}&offset=${offset+limit}&full_songs=${fullSongs}`

    res.status(200).send(returnData)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

export const getSession = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "You must provide a song identifier!" })
    return
  }

  try {
    const session = await getStoredSession(id)

    res.status(200).send(session)
  } catch(err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

export const getSessions = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 10
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  var songList = req.query.song_list && req.query.song_list === "true" ? true : false
  var fullSongs = req.query.full_songs && req.query.full_songs === "false" ? false : true
  const songUrl = `/spotify/data/song/`
  const sessionUrl = `/spotify/data/session/`
  const nextUrl = `/spotify/data/sessions`

  try {
    var { sessions, total_count } = await getStoredSessions(limit, offset, songList, fullSongs, songUrl, sessionUrl)

    var returnData = {
      sessions,
      total_count
    }

    if(total_count-1 >= offset+limit)
      returnData.next = `${nextUrl}?limit=${limit}&offset=${offset+limit}&song_list=${songList}&full_songs=${fullSongs}`

    res.status(200).send(returnData)
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

export * from './auth'