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
  var songData = { title: song.title, id: song.id, url: song.url, duration: song.duration }

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

export const getStoredAlbum = async (albumId) => {
  const album = await SpotifyAlbum.findOne({ where: { id: albumId } })

  if(!album) throw new Error(`Unable to find album with id ${albumId}!`)

  const { id, title, url, artwork_url } = album

  const songList = await album.getSongs(), artists = processArtists(await album.getArtists())

  let songs = []

  for(let i = 0; i < songList.length; i++) {
    const { id, title, url } = songList[i]

    songs.push({ id, title, url })
  }

  return { id, title, url, artwork_url, songs, artists }
}

export const getStoredAlbums = async (limit=20, id=0, fullAlbum=false, albumLink, songLink) => {
  const albumCount = await SpotifyAlbum.count()
  const albums = await SpotifyAlbum.findAll({ offset: id, limit })

  let albumList = []

  for(let i = 0; i < albums.length; i++) {
    const { title, url, artwork_url } = albums[i]

    const songList = await albums[i].getSongs(), artists = processArtists(await albums[i].getArtists())

    if(fullAlbum) {
      let songs = []

      for(let i = 0; i < songList.length; i++) {
        const { title, url } = songList[i]
    
        songs.push({ id: songList[i].id, title, url, more_info: `${songLink}${songList[i].id}` })
      }

      albumList.push({ id: albums[i].id, title, url, artwork_url, songs, artists })
    } else {
      albumList.push({ id: albums[i].id, title, url, artwork_url, song_count: songList.length, artists, more_info: `${albumLink}${albums[i].id}` })
    }
  }

  return { albums: albumList, count: albumCount }
}

export const countTimesListened = async id => {
  const records = await SpotifyTrackPlay.findAll({
    include: {
      model: SpotifySong,
      where: { id }
    }
  })

  if(records.length == 0) {
    throw new Error(`Failed to find a song played with id "${id}"!`)
  }

  const record = records[0], song = record.Song, fullSong = await getFullSongData(song)

  var totalTimeListened = 0

  for(let i = 0; i < records.length; i++) {
    totalTimeListened += records[i].time_played
  }

  var data = { 
    times_played: records.length,
    total_time_listened: totalTimeListened,
    ...fullSong
  }

  return data
}

export const countTimesListenedByArtist = async id => {
  const songs = await SpotifySong.findAll({
    attributes: [
      'id'
    ],
    include: {
      model: SpotifyArtist,
      where: { id }
    }
  })

  if(songs.length == 0) {
    throw new Error(`Failed to find a song played by artist with id "${id}"!`)
  }

  const artist = songs[0].Artists[0]

  var songIds = [], totalTimeListened = 0

  songs.forEach(song => songIds.push(song.id))

  const records = await SpotifyTrackPlay.findAll({
    include: {
      model: SpotifySong,
      where: {
        id: { [Sequelize.Op.in]: songIds }
      }
    }
  })

  records.forEach(play => totalTimeListened += play.time_played)

  var data = {
    id: artist.id,
    name: artist.name,
    url: artist.url,
    songs_listened_to: songIds.length,
    total_listens: records.length,
    total_time: totalTimeListened
  }

  return data
}

export const getTopListensOfSongs = async (limit, offset=0) => {
  const records = await SpotifyTrackPlay.findAll({
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Song.id")), "times_listened"],
      [Sequelize.fn("SUM", Sequelize.col("time_played")), "total_time_played"]
    ],
    include: {
      model: SpotifySong
    },
    group: [ "Song.id" ],
    order: [
      [Sequelize.literal("times_listened"), "DESC"],
      [Sequelize.literal("total_time_played"), "DESC"]
    ]
  })

  var recordList = [], recordLimit = limit != 0 ? offset+limit : records.length

  if(recordLimit > records.length) {
    recordLimit = offset + (records.length % limit)
  }

  for(let i = offset; i < recordLimit; i++) {
    var record = records[i], song = await getFullSongData(record.Song)
    
    var data = { 
      times_listened: record.dataValues.times_listened,
      total_time_played: record.dataValues.total_time_played,
      song: song
    }

    recordList.push(data)
  }

  return { records: recordList, count: records.length }
}

export const getTopListensOfArtists = async (limit, offset=0) => {
  const records = await SpotifyTrackPlay.findAll({
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Song.Artists.id")), "times_listened"],
      [Sequelize.fn("SUM", Sequelize.col("time_played")), "total_time_played"]
    ],
    include: {
      model: SpotifySong,
      include: {
        model: SpotifyArtist
      }
    },
    group: [ "Song.Artists.id" ],
    order: [
      [Sequelize.literal("times_listened"), "DESC"],
      [Sequelize.literal("total_time_played"), "DESC"]
    ]
  })

  var recordList = [], recordLimit = limit != 0 ? offset+limit : records.length

  if(recordLimit > records.length) {
    recordLimit = offset + (records.length % limit)
  }

  for(let i = offset; i < recordLimit; i++) {
    var record = records[i], artist = record.Song.Artists[0]
    
    var data = { 
      times_listened: record.dataValues.times_listened,
      total_time_played: record.dataValues.total_time_played,
      artist: { id: artist.id, name: artist.name, url: artist.url }
    }

    recordList.push(data)
  }

  return { records: recordList, count: records.length }
}