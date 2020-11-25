import { v4 as uuidv4 } from "uuid"

import keys from '../../keys.json'
import { defaultUsername, getUserAPI } from './auth'
import { SpotifyLogger, LogColors } from '../../helper/logger'
import { SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay } from "../../data/database"

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
    let songModel = await SpotifySong.findOne({ where: { title: songPlayed.name, id: songPlayed.id } })

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

        songModel.addAlbum(albumModel)
      }
    }

    const trackPlay = await SpotifyTrackPlay.create({ time_played: songPlayed.time_played })
    trackPlay.setSong(songModel)

    session.addTrackPlay(trackPlay)
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