import { client } from "tmi.js"
import { getPlaybackState } from "../../spotify"

import { DEFAULT_CHANNEL } from "../"
import { setGameBeingStreamed } from "./game"
import { setTitleOfStream } from "./title"

var channelState = {
  emoteOnly: false,
  subscriberOnly: false
}

// UTILITY COMMAND
function artistsToStr(artists) {
  var str = ""

  if(artists.length == 1) return artists[0].name

  for(let i = 0; i < artists.length; i++)
    str += `${i+1 == artists.length ? "and " : ""}${artists[i].name}${i-1 < artists.length ? "," : ""} `

  return str
}

var commands = []

/**
 * Add Custom Command
 * 
 * @param {string} name 
 * @param {function(string[],import("tmi.js").ChatUserstate,import("tmi.js").Client)} process 
 * @param {function(import("tmi.js").ChatUserstate):boolean} checkPerms
 */
const addCommand = (name, process, checkPerms=(_) => true) => {
  commands.push({
    name,
    process,
    checkPerms
  })
}

/**
 * Check if user is mod or owner
 * 
 * @param {import("tmi.js").ChatUserstate} user 
 */
export const isMod = user => user.mod || user["user-id"] === "admin" || user.username === DEFAULT_CHANNEL

addCommand("hello", (args, user, client) => {
  client.say(DEFAULT_CHANNEL, `Hello, ${user.username}!`)
  return
})

addCommand("bot", (args, user, client) => {
  const botStr = "You want some info on me? I am a chatbot " +
  " working for w3aseL that answers questions (in the form of ! commands) " +
  "and shares information that may need to be shed! I am programmed by Weasel and will be improved " +
  "slowly once Weasel gets his time straight to program me out!"

  client.say(DEFAULT_CHANNEL, botStr)
})

addCommand("nowplaying", (args, user, client) => {
  const playbackState = getPlaybackState()
  var retStr

  if (playbackState.is_playing) {
    retStr = `"${playbackState.current_song.name}" by ${artistsToStr(playbackState.current_song.artists)} is currently being played!${playbackState.current_song.id ? ` https://open.spotify.com/track/${playbackState.current_song.id}` : " (This is a locally saved song -- no link available!)"}`
  } else {
    retStr = "Music is not being played!"
  }

  client.say(DEFAULT_CHANNEL, retStr)
})

addCommand("grenade", (args, user, client) => {
  var retStr

  if (args.length == 0) {
    retStr = `@${user.username} sat on dat grenade like it was a dildo!`
  } else if (args[0].toLowerCase() === "wslbot") {
    retStr = `@${user.username}, I'm smart enough not to sit on a grenade.`
  } else {
    retStr = `${args[0]} sat on that grenade like it was a dildo!`
  }
    
  client.say(DEFAULT_CHANNEL, retStr)
})

addCommand("emoteonly", (args, user, client) => {
  if(!channelState.emoteOnly) {
    client.emoteonly(DEFAULT_CHANNEL).then(_  => channelState.emoteOnly = true)
  } else {
    client.emoteonlyoff(DEFAULT_CHANNEL).then(_ => channelState.emoteOnly = false)
  }
}, isMod)

addCommand("subscriberonly", (args, user, client) => {
  if(!channelState.subscriberOnly) {
    client.subscribers(DEFAULT_CHANNEL).then(_ => channelState.subscriberOnly = true)
  } else {
    client.subscribersoff(DEFAULT_CHANNEL).then(_ => channelState.subscriberOnly = false)
  }
}, isMod)

addCommand("setinfo", async (args, user, client) => {
  if(args.length == 0) {
    client.say(DEFAULT_CHANNEL, `@${user.username}, "!setinfo" requires more arguments!`)
  } else {
    const subCmd = args.shift().toLowerCase()

    switch(subCmd) {
      case "game": {
        await setGameBeingStreamed(args, user, client)
        return
      }
      case "title": {
        await setTitleOfStream(args, user, client)
        return
      }
      case "help": {
        client.say(DEFAULT_CHANNEL, `@${user.username}: "!setinfo title|game [sub-arguments]"`)
        return
      }
      default: {
        client.say(DEFAULT_CHANNEL, `@${user.username}, "!setinfo ${subCmd}" does not exist!`)
        return
      }
    }
  }
}, isMod)

/**
 * Process Command Message
 * ------------------------
 * Processes a message using the args and user passed from the event.
 * 
 * @param {Array<string>} args 
 * @param {import("tmi.js").ChatUserstate} user 
 * @param {import("tmi.js").Client} client
 */
export const processCommandMessage = (args, user, client) => {
  const cmd = args.shift().toLowerCase()

  const idx = commands.findIndex(({name}) => cmd === name.toLowerCase())

  if(idx > -1) {
    const { process, checkPerms } = commands[idx]

    if(checkPerms(user)) process(args, user, client)
  }
}