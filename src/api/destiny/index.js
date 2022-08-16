import { Router } from "express";
import { getUserAPI } from "@/bots/destiny";
import { DestinyLogger } from "@/helper/logger";
import { verifyAccount } from "@/api/auth/index";
import { login, loginCallback } from "./auth";

var destinyRouter = Router()

const testRoute = async (req, res, next) => {
  const { slot } = req.query

  const DESTINY_API = getUserAPI("Weasel")

  try {
    var data = await DESTINY_API.getSlotItemFromCurrentCharacter(!slot ? "primary" : slot)

    res.status(200).send({ data })
  } catch(err) {
    DestinyLogger.error(err)
    res.status(500).send({ message: "TEST ROUTE FAILED! D:" })
  }
}

destinyRouter.get("/login", verifyAccount, login)
destinyRouter.get("/redirect", loginCallback)
destinyRouter.get("/test", verifyAccount, testRoute)

export { destinyRouter }