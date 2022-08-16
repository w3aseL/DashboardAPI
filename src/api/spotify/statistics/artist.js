import { Op, Sequelize } from "sequelize/dist"
import { SpotifySong, SpotifySession, SpotifyArtist, SpotifyAlbum, SpotifyTrackPlay } from "@/data/database"

export const getArtistStatistics = async (offset=0, limit=15, songs=[], artists=[], albums=[], startDate, endDate) => {
  if(!startDate) startDate = new Date(2010, 1, 1)
  if(!endDate) endDate = Date.now()

  const records = await SpotifyTrackPlay.findAll({
    include: [
      {
        model: SpotifySong,
        attributes: [],
        where: songs.length > 0 ? {
          id: {
            [Op.in]: songs
          }
        } : {},
        include: [
          {
            model: SpotifyArtist,
            attributes: [],
            all: true,
            where: artists.length > 0 ? { 
              id: {
                [Op.in]: artists
              }
            } : {}
          },
          {
            model: SpotifyAlbum,
            attributes: [],
            all: true,
            where: albums.length > 0 ? { 
              id: {
                [Op.in]: albums
              }
            } : {}
          }
        ]
      },
      {
        model: SpotifySession,
        attributes: [],
        where: {
          [Op.or]: [{
            'start_time': {
              [Op.between]: [
                startDate,
                endDate
              ]
            }
          },
          {
            'end_time': {
              [Op.between]: [
                startDate,
                endDate
              ]
            }
          }]
        }
      }
    ],
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Song.id")), "times_listened"],
      [Sequelize.fn("SUM", Sequelize.col("time_played")), "total_time_played"],
      [Sequelize.col("Song.Artists.id"), "id"],
      [Sequelize.col("Song.Artists.name"), "name"],
      [Sequelize.col("Song.Artists.url"), "url"]
    ],
    group: [ "Song.Artists.id" ],
    order: [
      [Sequelize.literal("times_listened"), "DESC"],
      [Sequelize.literal("total_time_played"), "DESC"]
    ]
  })

  return {
    records: records.slice(offset, offset+limit),
    count: records.length
  }
}