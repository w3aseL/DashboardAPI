import request from "request"
import keys from "@/data/keys"
import { getInfoAboutDamageType, getInfoAboutEnergyType, getInfoAboutSandboxPerk } from "./manifest"
import { processBasicCharacterInfo, processCharacterItems } from "./processing"

const ROOT_ENDPOINT = "https://www.bungie.net/Platform"
const TOKEN_ENDPOINT = "https://www.bungie.net/platform/app/oauth/token/"

const DEFAULT_MEMBERSHIP_TYPE = 3   // STEAM

/**
 * 
 * @param {request.Response} resp 
 * @returns 
 */
const breakdownResponse = resp => ({
  statusCode: resp.statusCode,
  msg: resp.statusMessage,
  headers: resp.headers,
  method: resp.method,
  body: resp.body,
  request: resp.request
})

const SLOTS = {
  "PRIMARY": 0,
  "SECONDARY": 1,
  "POWER": 2,
  "HELMET": 3,
  "GAUNTLETS": 4,
  "CHESTPLATE": 5,
  "LEGGINGS": 6,
  "CLASS": 7
}

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
        else if(resp.statusCode > 400) reject(breakdownResponse(resp))
        else resolve(body)
      })
    })
  }

  async refreshAccessToken() {
    return new Promise((resolve, reject) => {
      request(`${ROOT_ENDPOINT}/App/OAuth/Token/`, {
        method: "POST",
        form: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: this.refreshToken
        },
        json: true,
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, (err, resp, body) => {
        if(err) reject(err)
        else if(resp.statusCode > 400) reject(breakdownResponse(resp))
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
        else if(resp.statusCode > 400) reject(breakdownResponse(resp))
        else resolve(body)
      })
    })
  }

  async retrieveManifest() {
    return this.request("/Destiny2/Manifest/")
  }

  async cacheUserInfoIfNotAvailable() {
    var { destinyMemberships } = (await this.request(`/User/GetMembershipsForCurrentUser/`))['Response']
    
    for(let i = 0; i < destinyMemberships.length; i++) {
      const destinyUserInfo = destinyMemberships[i]

      if(destinyUserInfo.membershipType === DEFAULT_MEMBERSHIP_TYPE) this.userGameInfo = destinyUserInfo
    }
  }

  async getListOfCharacters() {
    if(!this.userGameInfo) await this.cacheUserInfoIfNotAvailable()

    var { characters, characterEquipment } = (await this.request(`/Destiny2/${this.userGameInfo.membershipType}/Profile/${this.userGameInfo.membershipId}/?components=200,205`))["Response"], charKeys = Object.keys(characters.data)

    return charKeys.map(charKey => ({
      ...processBasicCharacterInfo(characters.data[charKey]),
      items: processCharacterItems(characterEquipment.data[charKey].items)
    }))
  }

  async getDetailsOfItem(itemId) {
    var { instance, perks } = (await this.request(`/Destiny2/${this.userGameInfo.membershipType}/Profile/${this.userGameInfo.membershipId}/Item/${itemId}/?components=304,300,302,305,307`))['Response']

    var perksArr = perks.data.perks.map(({ perkHash, visible }) => ({ ...getInfoAboutSandboxPerk(perkHash), visible })).filter(({ visible }) => visible).map(({ displayProperties }) => displayProperties.name)

    return {
      damageType: instance.data.damageType != 0 ? getInfoAboutDamageType(instance.data.damageTypeHash).displayProperties.name : undefined,
      armorEnergy: instance.data.energy ? getInfoAboutEnergyType(instance.data.energy.energyTypeHash).displayProperties.name : undefined,
      light: instance.data.primaryStat.value,
      perks: perksArr.filter((perk, i) => perksArr.indexOf(perk) === i)
    }
  }

  async getSlotItemFromCurrentCharacter(slot) {
    const characters = await this.getListOfCharacters()

    const { name, type, itemHash, itemInstanceId } = characters[0].items[SLOTS[slot.toUpperCase()]]

    const { light, damageType, armorEnergy, perks } = await this.getDetailsOfItem(itemInstanceId)

    return { name, type, armorEnergy, damageType, light, perks, itemInstanceId, itemHash }
  }
}

export * from "./auth"