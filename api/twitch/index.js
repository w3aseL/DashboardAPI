import { Router } from "express"
import { verifyAccount } from "../auth"

import { isBotConnected, connectBot, disconnectBot } from "../../bots/chat"

var twitchRouter = Router()

const getIsOnline = (req, res, next) => {
  res.status(200).send({ status: isBotConnected() })
}

const performBotConnection = (req, res, next) => {
  if(isBotConnected()) {
    res.status(400).send({ message: "Bot is already connected!" })
    return
  }

  connectBot()
  res.status(200).send({ message: "Connected bot!" })
}

const performBotDisconnection = (req, res, next) => {
  if(!isBotConnected()) {
    res.status(400).send({ message: "Bot is not connected!" })
    return
  }

  disconnectBot()
  res.status(200).send({ message: "Disconnected bot!" })
}

twitchRouter.get("/is-connected", verifyAccount, getIsOnline)
twitchRouter.get("/connect", verifyAccount, performBotConnection)
twitchRouter.get("/disconnect", verifyAccount, performBotDisconnection)

export { twitchRouter }