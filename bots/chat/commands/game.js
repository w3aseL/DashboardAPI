import { getAPIByUsername } from "../api"

import { DEFAULT_CHANNEL } from ".."

/**
 * 
 * @param {[string]} args 
 * @param {import("tmi.js").ChatUserstate} user 
 * @param {import("tmi.js").Client} client 
 * @returns 
 */
export const setGameBeingStreamed = async (args, user, client) => {
  const game = args.join(" "), api = getAPIByUsername(DEFAULT_CHANNEL)

  var data = null

  try {
    data = (await api.request(`/games?name=${game}`)).data
  } catch(e) {
    console.log(e)
    client.say(DEFAULT_CHANNEL, `@${user.username}, unable to update the current game being played. An error occurred on my side!`)
    return
  }

  var gameId = -1

  for(let i = 0; i < data.length; i++) {
    var { name, id } = data[i]

    if(name === game) {
      gameId = id
      break
    }
  }

  if(gameId === -1) {
    client.say(DEFAULT_CHANNEL, `Sorry, @${user.username}, could not find game "${game}" to set the game info to!`)
    return
  }

  api.request(`/channels?broadcaster_id=${api.getId()}`, "PATCH", { game_id: gameId })
  .then(_ => client.say(DEFAULT_CHANNEL, `@${user.username}, set game to "${name}"!`))
  .catch(err => {
    console.log(err)
    client.say(DEFAULT_CHANNEL, `@${user.username}, unable to update the current game being played. An error occurred on my side!`)
  })

  return
}