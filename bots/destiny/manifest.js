import request from "request"
import { getFirstAPI } from "."
import { DestinyLogger } from "../../helper/logger"

const DEFAULT_LANGUAGE = "en"

var isManifestUpdating = false

var manifestCache = {
  version: "???"
}

const getManifestRequestFromContentPaths = async jsonWorldContentPaths => new Promise((resolve, reject) => {
  request({
    url: `https://bungie.net${jsonWorldContentPaths[DEFAULT_LANGUAGE]}`,
    method: "GET",
    json: true
  }, (err, resp, body) => {
    if(err) reject(err)
    else if(resp.statusCode >= 400) reject(resp)
    else resolve(body) 
  })
})

export const doManifestUpdate = async () => {
  const api = getFirstAPI()

  if(!api) {
    DestinyLogger.info("No API available to setup the manifest!")
    return
  }

  if(isManifestUpdating) return

  isManifestUpdating = true

  var { version, jsonWorldContentPaths } = (await api.retrieveManifest())['Response']

  if(manifestCache.version !== version) {
    const data = await getManifestRequestFromContentPaths(jsonWorldContentPaths)

    manifestCache = { version, ...data }

    DestinyLogger.info(`Manifest loaded! (latest version: ${version})`)
  }

  isManifestUpdating = false
}

export const getInfoAboutItem = hash => manifestCache['DestinyInventoryItemDefinition'][hash]

export const getInfoAboutClass = hash => manifestCache['DestinyClassDefinition'][hash]

export const getInfoAboutBucket = hash => manifestCache['DestinyInventoryBucketDefinition'][hash]

export const getInfoAboutDamageType = hash => manifestCache['DestinyDamageTypeDefinition'][hash]

export const getInfoAboutSandboxPerk = hash => manifestCache['DestinySandboxPerkDefinition'][hash]

export const getInfoAboutEnergyType = hash => manifestCache['DestinyEnergyTypeDefinition'][hash]