import fs from "fs"
import jwt from "jsonwebtoken"

const PRIVATE_KEY = fs.readFileSync("./keys/private.key")
const PUBLIC_KEY = fs.readFileSync("./keys/public.key")

const ACCESS_OPTIONS = { expiresIn: "1h", algorithm: "RS256" }
const REFRESH_OPTIONS = { expiresIn: "7d", algorithm: "RS256"}

export const createTokenSet = userId => {
  const accessData = {
    user: userId,
    type: "ACCESS_TOKEN"
  }

  const accessToken = jwt.sign(accessData, PRIVATE_KEY, ACCESS_OPTIONS)

  const refreshData = {
    user: userId,
    type: "REFRESH_TOKEN"
  }

  const refreshToken = jwt.sign(refreshData, PRIVATE_KEY, REFRESH_OPTIONS)

  return {
    access_token: accessToken,
    refresh_token: refreshToken
  }
}

export const refreshAccessToken = token => {
  const { user, type } = jwt.verify(token, PUBLIC_KEY, REFRESH_OPTIONS)

  if(type !== "REFRESH_TOKEN") throw new Error("The token provided is not a valid refresh token!")

  const accessData = {
    user: user,
    type: "ACCESS_TOKEN"
  }

  return jwt.sign(accessData, PRIVATE_KEY, ACCESS_OPTIONS)
}

export const verifyAccessToken = token => {
  const { user, type } = jwt.verify(token, PUBLIC_KEY, ACCESS_OPTIONS)

  if(type !== "ACCESS_TOKEN") throw new Error("The token provided is not a valid access token!")

  return user
}