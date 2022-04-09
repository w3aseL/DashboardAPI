import request from "request"
import { TwitchLogger } from "../../../helper/logger"

export class TwitchUserAPI {
  constructor(credentials) {
    const { clientId, clientSecret } = credentials

    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  setTokens(access, refresh) {
    this.accessToken = access
    if(refresh) this.refreshToken = refresh
  }

  initializeInfo(userId, username) {
    this.userId = userId
    this.username = username
  }

  getId() {
    return this.userId
  }

  getUsername() {
    return this.username
  }

  async refreshAccessToken() {
    return new Promise((res, rej) => request({
      url: encodeURI(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${this.refreshToken}&client_id=${this.clientId}&client_secret=${this.clientSecret}`),
      method: 'POST',
      json: true
    }, (err, resp, body) => {
      if(err) {
        TwitchLogger.error(e)
        rej(err)
      }
      else if(resp.statusCode > 400) rej(body)
      else res(body)
    }))
  }

  async validate() {
    return new Promise((res, rej) => request({
      url: `https://id.twitch.tv/oauth2/validate`,
      method: 'GET',
      headers: {
        'Client-Id': this.clientId,
        'Authorization': `Bearer ${this.accessToken}`
      },
      json: true
    }, (err, resp, body) => {
      if(err) {
        TwitchLogger.error(err)
        rej(err)
      }
      else if(resp.statusCode > 400) rej(body)
      else res(body)
    }))
  }

  async request(url, method="GET", data=undefined, auth=true, headers={}) {
    var headers = {
      'Client-Id': this.clientId,
      ...headers
    }

    if(auth) headers['Authorization'] = `Bearer ${this.accessToken}`

    return new Promise((res, rej) => request({
      url: encodeURI(`https://api.twitch.tv/helix${url}`),
      method,
      json: true,
      body: data,
      headers
    }, (err, resp, body) => {
      if(err) {
        TwitchLogger.error(err)
        rej(err)
      }
      else if(resp.statusCode > 400) rej(body)
      else res(body)
    }))
  }
}