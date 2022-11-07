import { v4 as uuidv4 } from "uuid"

import keys from '@/data/keys'
import { defaultUsername, getUserAPI } from './auth'
import { SpotifyLogger, LogColors } from '@/helper/logger'
import { SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay } from "@/data/database"

var state = {
  is_playing: false,
  current_song: null,
  previous_song: null,
  current_device: {
    is_active: false
  },
  session: {
    active: false,
    start_time: null,
    end_time: null,
    time_inactive: 0,
    total_session_time: 0,
    songs_played: 0,
    song_counted: false
  }
}

var sessionSongState = {
  list: []
}

export function getPlaybackState() {
  var playbackState = { ...state }

  delete playbackState.previous_sessions

  if(!playbackState.is_playing && !playbackState.session.active) {
    delete playbackState.current_song
    delete playbackState.previous_song
  }

  if(playbackState.previous_song === null)
    delete playbackState.previous_song

  delete playbackState.session

  if(!playbackState.current_device.is_active)
    delete playbackState.current_device

  return playbackState
}

export function getSimplePlayback() {
  var playback = { ...state }

  if(playback.is_playing) {
    var cur_song = {
      title: playback.current_song.name,
      artists: playback.current_song.artists.map(({ name, url }) => ({ name, url })),
      album: playback.current_song.album.name,
      artwork_url: playback.current_song.album.artwork_url,
      duration: playback.current_song.duration,
      position: playback.current_song.position
    }

    return {
      is_playing: true,
      song: cur_song
    }
  }
  
  return { is_playing: false }
}

export function getActiveSession() {
  return state.session.active ? { ...state.session, song_list: sessionSongState.list } : { active: false }
}

export function checkSong() {
  var api = getUserAPI(defaultUsername)

  if(api)
    api.getMyCurrentPlaybackState()
    .then(data => {
      updateStateFromPlaybackData(data.body)
    })
    .catch(err => SpotifyLogger.error(err))
}

function updateStateFromPlaybackData(data) {
  if(data.is_playing === undefined) return

  if(data.is_playing != state.is_playing) {
    state = { ...state, is_playing: data.is_playing }
    SpotifyLogger.info(`${defaultUsername} has ${(state.is_playing ? "started" : "stopped")} playing music!`)
  }

  if(!data.item) return

  if(data.device.is_active && !state.current_device.is_active)
    state = { ...state, current_device: { ...data.device }}
  else if(!data.device.is_active && state.current_device.is_active)
    state = { ...state, current_device: { ...state.current_device, is_active: false }}

  if(data.device.is_active && data.device.id != state.current_device.id)
    state = { ...state, current_device: { ...data.device } }

  if(data.device.volume_percent != state.current_device.volume_percent)
    state = { ...state, current_device: { ...state.current_device, volume_percent: data.device.volume_percent }}

  if(!state.current_song || state.current_song.name != data.item.name) {
    var prevSong = state.previous_song

    if(state.current_song && state.current_song.name != data.item.name && state.session.song_counted) {
      prevSong = state.current_song

      delete prevSong.position

      updateSessionSongList(prevSong)
    }

    state = {
      ...state,
      current_song: {
        name: data.item.name,
        id: data.item.id,
        uri: data.item.uri,
        url: data.item.external_urls && data.item.external_urls.spotify ? data.item.external_urls.spotify : "",
        explicit: data.item.explicit,
        artists: organizeArtists(data.item.artists),
        album: {
          name: data.item.album.name,
          id: data.item.album.id,
          uri: data.item.album.uri,
          url: data.item.album.external_urls && data.item.album.external_urls.spotify ? data.item.album.external_urls.spotify : "",
          artwork_url: data.item.album.images.length > 0 ? data.item.album.images[0].url : "",
          artists: organizeArtists(data.item.album.artists)
        },
        duration: Math.floor(data.item.duration_ms / 1000),
        position: Math.floor(data.progress_ms / 1000),
        time_played: 0
      },
      previous_song: prevSong,
      session: {
        ...state.session,
        song_counted: false
      }
    }
  }

  if(state.current_song && data.is_playing)
    state = { ...state, current_song: { ...state.current_song, position: Math.floor(data.progress_ms / 1000) } }
}

function organizeArtists(artists) {
  var artistArr = []

  for(let i = 0; i < artists.length; i++) {
    var artist = artists[i], artistObj = {}

    artistObj = {
      name: artist.name,
      id: artist.id,
      uri: artist.uri,
      url: artist.external_urls && artist.external_urls.spotify ? artist.external_urls.spotify : "",
    }

    artistArr.push(artistObj)
  }

  return artistArr
}

function getTimeElapsedFromSeconds(sec) {
  const formatTimeNum = timeNum => timeNum < 10 ? `0${timeNum}` : `${timeNum}`
  var hours, min, secs
  
  if(sec >= 3600) {
    hours = Math.floor(sec / 3600)
    min = Math.floor((sec - hours * 3600) / 60)
    secs = sec - (hours * 3600 + min * 3600)
  } else if(sec >= 60 && sec < 3600) {
    min = Math.floor(sec / 60)
    secs = sec - (min * 60)
  } else secs = sec

  return `${hours ? `${formatTimeNum(hours)}:` : ""}${min ? `${formatTimeNum(min)}:` : ""}${formatTimeNum(sec)}`
}

export function updateUserPlaybackState() {
  if(state.is_playing && state.session.active) {
    var sessionTime = state.session.total_session_time, songTime = state.current_song.time_played
    sessionTime++
    songTime++

    state = { ...state, session: { ...state.session, total_session_time: sessionTime, time_inactive: 0 }, current_song: { ...state.current_song, time_played: songTime } }
  }

  if(!state.is_playing && state.session.active) {
    var timeInactive = state.session.time_inactive
    timeInactive++

    state = { ...state, session: { ...state.session, time_inactive: timeInactive } }
  }

  if(state.is_playing && state.session.active && !state.session.song_counted && ((state.current_song.time_played / state.current_song.duration) >= 0.5)) {
    var songsPlayed = state.session.songs_played
    songsPlayed++

    state = { ...state, session: { ...state.session, songs_played: songsPlayed, song_counted: true } }
  }

  if(!state.is_playing && state.session.active && state.session.time_inactive >= 300) {
    if(state.session.song_counted && sessionSongState.list.length != state.session.songs_played)
      updateSessionSongList(state.current_song)

    var endSession = { ...state.session, end_time: new Date(), song_list: sessionSongState.list }, sessions = state.previous_sessions
    const defaultSession = {
      active: false,
      start_time: null,
      end_time: null,
      time_inactive: 0,
      total_session_time: 0,
      songs_played: 0,
      song_counted: false
    }

    delete endSession.time_inactive

    trackSession(endSession)

    state = { ...state, session: { ...defaultSession } }
    sessionSongState = { ...sessionSongState, list: [] }

    SpotifyLogger.info(`Spotify session for user ${defaultUsername} ended! Session lasted ${getTimeElapsedFromSeconds(endSession.total_session_time)}`)
  }

  checkSong()

  if(state.is_playing && !state.session.active) {
    state = { ...state, session: { ...state.session, active: true, start_time: new Date() } }
    SpotifyLogger.info(`Spotify session for user ${defaultUsername} started!`)
  }
}

function updateSessionSongList(song) {
  var oldSongs = sessionSongState.list

  oldSongs.push(song)
  sessionSongState = { ...sessionSongState, list: oldSongs }
}

async function trackSession(sessionData) {
  // Create session
  const session = await SpotifySession.create({
    start_time: sessionData.start_time,
    end_time: sessionData.end_time,
    song_count: sessionData.songs_played,
    time_listening: sessionData.total_session_time
  })

  // Register songs to session
  for(let i = 0; i < sessionData.song_list.length; i++) {
    let songPlayed = sessionData.song_list[i], artists = await getArtistModels(songPlayed.artists)

    // Find the song model
    let songModel = await SpotifySong.findOne({ where: { title: songPlayed.name, id: songPlayed.id }, include: [ { model: SpotifyArtist }, { model: SpotifyAlbum } ] })

    // If is valid, and album isn't contained, assign one
    if(songModel && songModel.Albums.length == 0) {
      let albumModel = await SpotifyAlbum.findOne({ where: { title: songPlayed.album.name, id: songPlayed.album.id } })

      if(!albumModel)
        albumModel = await SpotifyAlbum.findOne({ where: { title: songPlayed.album.name, url: "local" } })

      songModel.addAlbum(albumModel)
    }

    // Check for local instances (with artists)
    if(!songModel)
      songModel = await SpotifySong.findOne({ where: { title: songPlayed.name, url: "local" } })

    // Create the song if it does not exist
    if(!songModel) {
      songModel = await SpotifySong.create({
        id: songPlayed.id ? songPlayed.id : uuidv4(),
        title: songPlayed.name,
        url: songPlayed.url ? songPlayed.url : "local",
        duration: songPlayed.duration
      })

      // Set artists
      songModel.setArtists(artists)

      // Handle album
      let albumModel = await SpotifyAlbum.findOne({ where: { title: songPlayed.album.name, id: songPlayed.album.id } }), albumArtists = await getArtistModels(songPlayed.album.artists)

      if(!albumModel)
        albumModel = await SpotifyAlbum.findOne({ where: { title: songPlayed.album.name, url: "local" } })

      if(!albumModel) {
        albumModel = await SpotifyAlbum.create({
          id: songPlayed.album.id ? songPlayed.album.id : uuidv4(),
          title: songPlayed.album.name,
          url: songPlayed.album.url ? songPlayed.album.url : "local",
          artwork_url: songPlayed.album.artwork_url ? songPlayed.album.artwork_url : "local"
        })

        // Handling album setup
        if(albumArtists.length > 0) {
          albumModel.setArtists(albumArtists)
        } else {
          albumModel.setArtists([ artists[0] ])
        }
      }
      
      songModel.addAlbum(albumModel)
    }

    const trackPlay = await SpotifyTrackPlay.create({ time_played: songPlayed.time_played })
    trackPlay.setSong(songModel)
    trackPlay.setSession(session)
  }
}

async function getArtistModels(artistData) {
  let artists = []

  for(let j = 0; j < artistData.length; j++) {
    let artist = artistData[j], artistModel = await SpotifyArtist.findOne({ where: { name: artist.name, id: artist.id } })

    // If cannot be found, do check incase song is local (some values are null when the artist is local)
    if(!artistModel)
      artistModel = await SpotifyArtist.findOne({where: { name: artist.name, url: "local" }})
    
    // If the case is that it is for sure not available, create the artist
    if(!artistModel) {
      artistModel = await SpotifyArtist.create({
        id: artist.id ? artist.id : uuidv4(),
        name: artist.name,
        url: artist.url ? artist.url : "local"
      })
    }

    artists.push(artistModel)
  }

  return artists
}

const RESET_LIMIT = 5

export const fixMissingAlbumsIfAnyMissing = async () => {
  const songs = await SpotifySong.findAll({
    include: { model: SpotifyAlbum }
  })

  let count = 0, songsToFix = []

  for(let i = 0; i < songs.length; i++) 
    if(songs[i].Albums.length == 0 && songs[i].url !== "local") songsToFix.push(songs[i])

  for(let i = 0; i < songsToFix.length; i++) {
    let song = songsToFix[i]

    if(count == RESET_LIMIT)
      break;

    if(song.Albums.length == 0) {
      count++;

      let res = await getUserAPI(defaultUsername).getTrack(song.id)

      let albumModel = await SpotifyAlbum.findOne({ where: { id: res.body.album.id } })

      if(!albumModel) {
        SpotifyLogger.info(`Failed to find an available album for song "${song.tile}"`)
      } else {
        song.addAlbum(albumModel)
      }
    }
  }

  SpotifyLogger.info(`Fixed ${count} songs with albums!`)

  if(songsToFix.length != 0) {
    SpotifyLogger.info(`There are more songs to fix! Waiting 2 minutes to fix more songs...`)

    setTimeout(() => {
      fixMissingAlbumsIfAnyMissing()
    }, 1000 * 120)
  }
}

const ERROR = 0.1   // 10% ERROR

const checkMarginOfError = (actualValue, numToCheck, error) => {
  if (error > 1.0 || error < 0.0)
    throw new Error("Error must be in decimal form between 0 and 1")

  let actualError = actualValue * error

  return (actualValue + actualError) >= numToCheck && (actualValue - actualError) <= numToCheck
}

export const findListenAnomalies = async () => {
  const songs = await SpotifyTrackPlay.findAll({
    include: { model: SpotifySong }
  })

  let count = 0

  for(let i = 0; i < songs.length; i++) {
    const play = songs[i]

    if(play.time_played > (play.Song.duration * 2)) {
      count++
      play.update({ time_played: play.Song.duration })
    }
  }

  SpotifyLogger.info(`Fixed ${count} songs with abnormal durations!`)

  const sessions = await SpotifySession.findAll({
    include: { model: SpotifyTrackPlay }
  })

  let sessionCount = 0

  for(let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    var totalDuration = 0

    for(let j = 0; j < session.TrackPlays.length; j++) {
      totalDuration += session.TrackPlays[j].time_played
    }

    if(!checkMarginOfError(totalDuration, session.time_listening, ERROR) && (session.time_listening > 0 && session.TrackPlays.length != 0)) {
      sessionCount++
      session.update({ time_listening: totalDuration })
    }
  }

  SpotifyLogger.info(`Fixed ${sessionCount} sessions with abnormal durations!`)

  setTimeout(() => {
    findListenAnomalies()
  }, 1000 * 60 * 30)
}