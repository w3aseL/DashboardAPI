import { DEBUG } from "./args";
import winston, { createLogger, format, transports } from "winston"

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

const { combine, timestamp, printf } = format;

const mainLogger = createLogger({
  format: combine(
    timestamp(),
    format.json(),
    printf(({level, message, label, timestamp}) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/all.log'
    }),
    new transports.File({
      filename: 'logs/info.log',
      level: 'info'
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  ]
})

// exception loggers
winston.add(
  new transports.File({
    filename: 'logs/exceptions.log',
    handleExceptions: true
  })
)
winston.add(
  new transports.File({
    filename: 'logs/rejections.log',
    handleRejections: true
  })
)

const apiLogger = mainLogger.child({ label: "API" })

export const APILogger = {
  warn: (message) => {
    apiLogger.warn(message)
  },
  info: (message) => {
    apiLogger.info(message)
  },
  error: (message) => {
    apiLogger.error(message)
  }
}

const twitterLogger = mainLogger.child({ label: "Twitter" })

export const TwitterLogger = {
  warn: (message) => {
    twitterLogger.warn(message)
  },
  info: (message) => {
    twitterLogger.info(message)
  },
  error: (message) => {
    twitterLogger.error(message)
  }
}

const dbLogger = mainLogger.child({ label: "DB Manager" })

export const DBLogger = {
  warn: (message) => {
    if(DEBUG) dbLogger.warn(message)
  },
  info: (message) => {
    if(DEBUG) dbLogger.info(message)
  },
  error: (message) => {
    if(DEBUG) dbLogger.error(message)
  }
}

const spotifyLogger = mainLogger.child({ label: "Spotify API" })

export const SpotifyLogger = {
  warn: (message) => {
    spotifyLogger.warn(message)
  },
  info: (message) => {
    spotifyLogger.info(message)
  },
  error: (message) => {
    spotifyLogger.error(message)
  }
}

const twitchLogger = mainLogger.child({ label: "Twitch API" })

export const TwitchLogger = {
  warn: (message) => {
    twitchLogger.warn(message)
  },
  info: (message) => {
    twitchLogger.info(message)
  },
  error: (message) => {
    twitchLogger.error(message)
  }
}

const accountLogger = mainLogger.child({ label: "Account Manager" })

export const AccountLogger = {
  warn: (message) => {
    accountLogger.warn(message)
  },
  info: (message) => {
    accountLogger.info(message)
  },
  error: (message) => {
    accountLogger.error(message)
  }
}

const destinyLogger = mainLogger.child({ label: "Destiny API" })

export const DestinyLogger = {
  warn: (message) => {
    destinyLogger.warn(message)
  },
  info: (message) => {
    destinyLogger.info(message)
  },
  error: (message) => {
    destinyLogger.error(message)
  }
}

const applicationLogger = mainLogger.child({ label: "Application" })

export const ApplicationLogger = {
  warn: (message) => {
    applicationLogger.warn(message)
  },
  info: (message) => {
    destinapplicationLoggeryLogger.info(message)
  },
  error: (message) => {
    applicationLogger.error(message)
  }
}

export { colors as LogColors }