import { Router } from "express"

import { verifyAccount } from "../auth"

import { getUserAPI, getPlaybackState, getActiveSession, getSimplePlayback } from '../../bots/spotify/index'
import { getStoredSongs, getStoredSessions, getStoredSong, getStoredSession, getAlbumsWithSongs, getAlbumsWithoutSongs, getStoredAlbum, getStoredAlbums, countTimesListened, countTimesListenedByArtist, getTopListensOfSongs, getTopListensOfArtists } from "./data"
import keys from '../../keys.json'
import { login, loginCallback } from "./auth"
import { SpotifyLogger } from "../../helper/logger"

const getUserData = (req, res, next) => {
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

const getUserPlayback = (req, res, next) => {
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

const trackSimplePlayback = (req, res, next) => {
  res.status(200).send({ ...getSimplePlayback() })
}

const trackPlaybackState = (req, res, next) => {
  res.status(200).send({ ...getPlaybackState() })
}

const getSessionState = (req, res, next) => {
  res.status(200).send({ ...getActiveSession() })
}

const getAllStates = (req, res, next) => {
  res.status(200).send({ ...getPlaybackState(), session: getActiveSession() })
}

const getSong = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "You must provide a song identifier!" })
    return
  }

  try {
    const song = await getStoredSong(id)

    res.status(200).send(song)
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getSongs = async (req, res, next) => {
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
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getSession = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "You must provide a session identifier!" })
    return
  }

  try {
    const session = await getStoredSession(id)

    res.status(200).send(session)
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getSessions = async (req, res, next) => {
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
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getAlbum = async (req, res, next) => {
  const { id } = req.params

  if(!id) {
    res.status(400).send({ message: "You must provide a album identifier!" })
    return
  }

  try {
    const album = await getStoredAlbum(id)

    res.status(200).send(album)
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getAlbums = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 20
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  var fullAlbum = req.query.full_album && req.query.full_album === "false" ? false : true
  const songUrl = `/spotify/data/song/`
  const albumUrl = `/spotify/data/album/`
  const nextUrl = `/spotify/data/albums`

  try {
    var { albums, count } = await getStoredAlbums(limit, offset, fullAlbum, albumUrl, songUrl)

    var returnData = {
      albums,
      total_count: count
    }

    if(count-1 >= offset+limit)
      returnData.next = `${nextUrl}?limit=${limit}&offset=${offset+limit}&full_album=${fullAlbum}`

    res.status(200).send(returnData)
  } catch (err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getTimesListenedToSong = async (req, res, next) => {
  const { id } = req.params

  try {
    const records = await countTimesListened(id)

    res.status(200).send({ ...records })
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const getTimesListenedToArtist = async (req, res, next) => {
  const { id } = req.params

  try {
    const records = await countTimesListenedByArtist(id)

    res.status(200).send({ ...records })
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const topSongListens = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 50
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  const nextUrl = `/spotify/stats/songs`

  try {
    const { records, count } = await getTopListensOfSongs(limit, offset)

    var returnData = {
      records,
      total_count: count
    }

    if(count-1 >= offset+limit)
      returnData.next = `${nextUrl}?limit=${limit}&offset=${offset+limit}`

    res.status(200).send(returnData)
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

const topArtistListens = async (req, res, next) => {
  var limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 20
  var offset = req.query.offset && req.query.offset >= 0 ? Number(req.query.offset) : 0
  const nextUrl = `/spotify/stats/artists`

  try {
    const { records, count } = await getTopListensOfArtists(limit, offset)

    var returnData = {
      records,
      total_count: count
    }

    if(count-1 >= offset+limit)
      returnData.next = `${nextUrl}?limit=${limit}&offset=${offset+limit}`

    res.status(200).send(returnData)
  } catch(err) {
    SpotifyLogger.error(err)
    res.status(500).send({ message: "An error occurred.", error: err.message })
    return
  }
}

var spotifyRouter = Router()

// spotifyRouter.get('/test/:id', topArtistListens)
spotifyRouter.get('/playback', trackSimplePlayback)
spotifyRouter.get('/login', verifyAccount, login)
spotifyRouter.get('/auth', loginCallback)
spotifyRouter.get('/track-all', verifyAccount, getAllStates)
spotifyRouter.get('/track-playback', verifyAccount, trackPlaybackState)
spotifyRouter.get('/track-session', verifyAccount, getSessionState)
spotifyRouter.get('/data/songs', verifyAccount, getSongs)
spotifyRouter.get('/data/song/:id', verifyAccount, getSong)
spotifyRouter.get('/data/sessions', verifyAccount, getSessions)
spotifyRouter.get('/data/session/:id', verifyAccount, getSession)
spotifyRouter.get('/data/albums', verifyAccount, getAlbums)
spotifyRouter.get('/data/album/:id', verifyAccount, getAlbum)
spotifyRouter.get('/stats/song/:id', verifyAccount, getTimesListenedToSong)
spotifyRouter.get('/stats/artist/:id', verifyAccount, getTimesListenedToArtist)
spotifyRouter.get('/stats/songs', verifyAccount, topSongListens)
spotifyRouter.get('/stats/artists', verifyAccount, topArtistListens)
spotifyRouter.get('/me', verifyAccount, getUserData)
spotifyRouter.get('/:user/me', verifyAccount, getUserData)
spotifyRouter.get('/me/playback', verifyAccount, getUserPlayback)
spotifyRouter.get('/:user/me/playback', verifyAccount, getUserPlayback)

export { spotifyRouter }