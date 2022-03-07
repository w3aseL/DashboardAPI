import { getAPIByUsername } from "../api"

import { DEFAULT_CHANNEL } from ".."

/**
 * 
 * @param {[string]} args 
 * @param {import("tmi.js").ChatUserstate} user 
 * @param {import("tmi.js").Client} client 
 * @returns 
 */
export const setTitleOfStream = async (args, user, client) => {
  const title = args.join(" "), api = getAPIByUsername(DEFAULT_CHANNEL)

  api.request(`/channels?broadcaster_id=${api.getId()}`, "PATCH", { title })
  .then(_ => client.say(DEFAULT_CHANNEL, `@${user.username}, updated title!`))
  .catch(err => {
    console.log(err)
    client.say(DEFAULT_CHANNEL, `@${user.username}, unable to update the current game being played. An error occurred on my side!`)
  })

  return
}