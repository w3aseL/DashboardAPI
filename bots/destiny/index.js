import request from "request"
import keys from "../../keys.json"

const ROOT_ENDPOINT = "https://www.bungie.net/Platform"
const TOKEN_ENDPOINT = "https://www.bungie.net/platform/app/oauth/token/"

const DEFAULT_MEMBERSHIP_TYPE = 3   // STEAM

export class DestinyAPI {
  constructor() {
    this.apiKey = keys.destiny.apiKey
    this.clientId = keys.destiny.client.id
    this.clientSecret = keys.destiny.client.secret
  }

  setTokens(access, refresh) {
    if(access) this.accessToken = access
    if(refresh) this.refreshToken = refresh
  }
 
  setMembershipId(id) {
    this.userId = id
  }

  setDisplayName(username) {
    this.username = username
  }

  getId() {
    return this.userId
  }

  getDisplayName() {
    return this.username
  }

  async requestTokensViaCode(code) {
    return new Promise((resolve, reject) => {
      request(TOKEN_ENDPOINT, {
        method: "POST",
        form: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          code
        },
        json: true,
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, (err, resp, body) => {
        if(err) reject(err)
        else if(resp.statusCode > 400) reject(resp)
        else resolve(body)
      })
    })
  }

  async refreshAccessToken() {
    return new Promise((resolve, reject) => {
      request(`${ROOT_ENDPOINT}/App/OAuth/Token/`, {
        method: "POST",
        form: {
          grant_type: "refresh_token",
          refresh_token: this.refreshToken
        },
        json: true,
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")
        }
      }, (err, resp, body) => {
        if(err) reject(err)
        else if(resp.statusCode > 400) reject(resp)
        else resolve(body)
      })
    })
  }

  async request(url, method="GET", data=null, contentType="application/json", headers={}) {
    return new Promise((resolve, reject) => {
      request(`${ROOT_ENDPOINT}${url}`,{
        method,
        json: data ? data : true,
        headers: {
          "Content-Type": contentType,
          "X-API-Key": this.apiKey,
          "Authorization": `Bearer ${this.accessToken}`,
          ...headers
        }
      }, (err, resp, body) => {
        if(err) reject(err)
        else if(resp.statusCode > 400) reject(resp)
        else resolve(body)
      })
    })
  }

  async getListOfCharacters() {
    return this.request(`/Destiny2/${DEFAULT_MEMBERSHIP_TYPE}/Profile/${this.userId}/?components=100`)
  }
}

export * from "./auth"