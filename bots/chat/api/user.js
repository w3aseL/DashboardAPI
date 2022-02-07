import request from "request"

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

  async refreshAccessToken() {
    return new Promise((res, rej) => request({
      url: encodeURI(`https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${this.refreshToken}&client_id=${this.clientId}&client_secret=${this.clientSecret}`),
      method: 'POST',
      json: true
    }, (err, resp, body) => {
      if(err) rej(err)
      else if(resp.statusCode > 400) rej(body)
      else res(body)
    }))
  }

  async validate() {
    return new Promise((res, rej) => request({
        url: `https://id.twitch.tv/oauth2/validate`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        json: true
      }, (err, resp, body) => {
        if(err) rej(err)
        else if(resp.statusCode > 400) rej(body)
        else res(body)
      }))
  }

  async request(url, method="GET", auth=true, headers={}) {
    var headers = { ...headers }

    if(auth) headers['Authorization'] = `Bearer ${this.accessToken}`

    return new Promise((res, rej) => request({
      url: `https://api.twitch.tv/helix${url}`,
      method,
      json: true,
      headers
    }, (err, resp, body) => {
      if(err) rej(err)
      else if(resp.statusCode > 400) rej(body)
      else res(body)
    }))
  }
}