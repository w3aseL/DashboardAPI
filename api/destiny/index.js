import { Router } from "express";
import { getUserAPI } from "../../bots/destiny";
import { verifyAccount } from "../auth";
import { login, loginCallback } from "./auth";

var destinyRouter = Router()

const testRoute = async (req, res, next) => {
  const DESTINY_API = getUserAPI("Weasel")

  try {
    var data = await DESTINY_API.getListOfCharacters()

    res.status(200).send({ data })
  } catch(err) {
    console.log(err)
    res.status(500).send({ message: "TEST ROUTE FAILED! D:" })
  }
}

destinyRouter.get("/login", verifyAccount, login)
destinyRouter.get("/redirect", loginCallback)
destinyRouter.get("/test", verifyAccount, testRoute)

export { destinyRouter }