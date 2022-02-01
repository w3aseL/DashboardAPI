import { getPlaybackState } from "../../spotify"

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
 * @param {function(string[],import("tmi.js").ChatUserstate)} process 
 * @param {function(import("tmi.js").ChatUserstate):boolean} checkPerms
 */
const addCommand = (name, process, checkPerms=(_) => true) => {
  commands.push({
    name,
    process,
    checkPerms
  })
}

addCommand("hello", (args, user) => {
  return `Hello, ${user.username}!`
})

addCommand("bot", (args, user) => {
  return "You want some info on me? I am a chatbot " +
  " working for w3aseL that answers questions (in the form of ! commands) " +
  "and shares information that may need to be shed! I am programmed by Weasel and will be improved " +
  "slowly once Weasel gets his time straight to program me out!"
})

addCommand("nowplaying", (args, user) => {
  const playbackState = getPlaybackState()

  if (playbackState.is_playing) {
    return `"${playbackState.current_song.name}" by ${artistsToStr(playbackState.current_song.artists)} is currently being played!${playbackState.current_song.id ? ` https://open.spotify.com/track/${playbackState.current_song.id}` : " (This is a locally saved song -- no link available!)"}`
  }

  return "Music is not being played!"
})

addCommand("grenade", (args, user) => {
  if (args.length == 0) {
    return `@${user.username} sat on dat grenade like it was a dildo!`
  } else if (args[0].toLowerCase() === "wslbot") {
    return `@${user.username}, I'm smart enough not to sit on a grenade.`
  }
    
  return `${args[0]} sat on that grenade like it was a dildo!`
})

/**
 * Process Command Message
 * ------------------------
 * Processes a message using the args and user passed from the event.
 * 
 * @param {Array<string>} args 
 * @param {import("tmi.js").ChatUserstate} user 
 * @param {function(string):void} sayFunc
 */
export const processCommandMessage = (args, user, sayFunc) => {
  const cmd = args.shift().toLowerCase()

  const idx = commands.findIndex(({name}) => cmd === name)

  if(idx > -1) {
    const { process, checkPerms } = commands[idx]

    if(checkPerms(user)) sayFunc(process(args, user))
  }
}