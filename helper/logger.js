import { args } from "./args";

//https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
}

export const APILogger = {
  log: (message) => {
    console.log(`${colors.FgBlue}[API] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    console.log(`${colors.FgBlue}[API] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    console.log(`${colors.FgBlue}[API] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export const TwitterLogger = {
  log: (message) => {
    console.log(`${colors.FgCyan}[Twitter] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    console.log(`${colors.FgCyan}[Twitter] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    console.log(`${colors.FgCyan}[Twitter] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export const DBLogger = {
  log: (message) => {
    if(args['debug']) console.log(`${colors.FgGreen}[DB Manager] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    if(args['debug']) console.log(`${colors.FgGreen}[DB Manager] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    if(args['debug']) console.log(`${colors.FgGreen}[DB Manager] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export const SpotifyLogger = {
  log: (message) => {
    console.log(`${colors.FgGreen}[Spotify API] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    console.log(`${colors.FgGreen}[Spotify API] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    console.log(`${colors.FgGreen}[Spotify API] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export const TwitchLogger = {
  log: (message) => {
    console.log(`${colors.FgMagenta}[Twitch Chat API] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    console.log(`${colors.FgMagenta}[Twitch Chat API] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    console.log(`${colors.FgMagenta}[Twitch Chat API] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export const AccountLogger = {
  log: (message) => {
    console.log(`${colors.FgRed}[Account Manager] ${colors.Reset}${message}${colors.Reset}`)
  },
  info: (message) => {
    console.log(`${colors.FgRed}[Account Manager] ${colors.FgYellow}${message}${colors.Reset}`)
  },
  error: (message) => {
    console.log(`${colors.FgRed}[Account Manager] ${colors.FgRed}Error: ${message}${colors.Reset}`)
  }
}

export { colors as LogColors }