import Sequelize from "sequelize"
import { SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay } from "../../data/database"

const Op = Sequelize.Op

const processArtists = artists => {
  var artistData = []

  for(let i = 0; i < artists.length; i++) {
    var artist = artists[i]

    artistData.push({ id: artist.id, name: artist.name, url: artist.url })
  }

  return artistData
}

const processAlbums = albums => {
  var albumData = []

  for(let i = 0; i < albums.length; i++) {
    var album = albums[i]

    albumData.push({ id: album.id, title: album.title, url: album.url, artwork_url: album.artwork_url })
  }

  return albumData
}

const getFullSongData = async song => {
  var songData = { title: song.title, id: song.id, url: song.url }

  songData.artists = processArtists(await song.getArtists())

  songData.albums = processAlbums(await song.getAlbums())

  return songData
}

export const getStoredSong = async (id) => {
  const song = await SpotifySong.findOne({ where: { id } })

  if(!song) throw new Error(`Unable to find song with id ${id}!`)

  return await getFullSongData(song)
}

export const getStoredSongs = async (limit=50, id=0, fullSong=true, dataLink) => {
  const songCount = await SpotifySong.count()
  const songs = await SpotifySong.findAll({ offset: id, limit })

  const songList = []

  for(let i = 0; i < songs.length; i++) {
    if(fullSong) {
      songList.push(await getFullSongData(songs[i]))
    } else {
      var song = { ...songs[i].dataValues }

      song.more_info = `${dataLink}${song.id}`
      songList.push(song)
    }
  }

  return { songs: songList, total_count: songCount }
}

export const getStoredSession = async (id) => {
  const session = await SpotifySession.findOne({ where: { id } })

  if(!session) throw new Error(`Unable to find session with id ${id}!`)

  var data = { id: session.id, start_time: session.start_time, end_time: session.end_time, song_count: session.song_count, time_listening: session.time_listening }

  var tracksPlayed = await session.getTrackPlays(), tracks = []

  for(let j = 0; j < tracksPlayed.length; j++) {
    var trackPlayed = tracksPlayed[j], song = await trackPlayed.getSong()

    var songData = await getFullSongData(song)

    songData.time_played = trackPlayed.time_played

    tracks.push(songData)
  }

  data.tracks = tracks

  return data
}

export const getStoredSessions = async (limit=10, id=0, songList=false, fullSong=true, songLink, sessionLink) => {
  const sessionCount = await SpotifySession.count()
  const sessions = await SpotifySession.findAll({ offset: id, limit })

  const sessionData = []

  for(let i = 0; i < sessions.length; i++) {
    var session = sessions[i]

    var data = { id: session.id, start_time: session.start_time, end_time: session.end_time, song_count: session.song_count, time_listening: session.time_listening }

    if(songList) {
      var tracksPlayed = await session.getTrackPlays(), tracks = []

      for(let j = 0; j < tracksPlayed.length; j++) {
        var trackPlayed = tracksPlayed[j], song = await trackPlayed.getSong()
  
        var songData = fullSong ? await getFullSongData(song) : { ...song.dataValues }

        if(!fullSong) {
          songData.more_info = `${songLink}${songData.id}`
        }
  
        songData.time_played = trackPlayed.time_played
    
        tracks.push(songData)
      }
  
      data.tracks = tracks
    } else {
      data.more_info = `${sessionLink}${data.id}`
    }
    
    sessionData.push(data)
  }

  return { sessions: sessionData, total_count: sessionCount }
}