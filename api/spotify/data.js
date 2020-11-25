import { SpotifySong, SpotifyArtist, SpotifyAlbum, SpotifySession, SpotifyTrackPlay } from "../../data/database"

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

export const getStoredSongs = async () => {
  const songs = await SpotifySong.findAll()

  const songList = []

  for(let i = 0; i < songs.length; i++)
    songList.push(await getFullSongData(songs[i]))

  return songList
}

export const getStoredSessions = async () => {
  const sessions = await SpotifySession.findAll()

  const sessionData = []

  for(let i = 0; i < sessions.length; i++) {
    var session = sessions[i]

    var data = { id: session.id, start_time: session.start_time, end_time: session.end_time, song_count: session.song_count, time_listening: session.time_listening }

    var tracksPlayed = await session.getTrackPlays(), tracks = []

    for(let j = 0; j < tracksPlayed.length; j++) {
      var trackPlayed = tracksPlayed[j], song = await trackPlayed.getSong()

      var songData = await getFullSongData(song)

      songData.time_played = trackPlayed.time_played
  
      tracks.push(songData)
    }

    data.tracks = tracks
    
    sessionData.push(data)
  }

  return sessionData
}