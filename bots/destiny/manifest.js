import request from "request"
import { DestinyLogger } from "../../helper/logger"

const DEFAULT_LANGUAGE = "en"

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

export const setupManifest = async ({ version, jsonWorldContentPaths }) => {
  const data = await getManifestRequestFromContentPaths(jsonWorldContentPaths)

  manifestCache = { version, ...data }

  DestinyLogger.info(`Manifest loaded! (latest version: ${version})`)
}

export const updateManifest = async ({ version, jsonWorldContentPaths }) => {
  if(manifestCache.version !== version) {
    const data = await getManifestRequestFromContentPaths(jsonWorldContentPaths)

    manifestCache = { version, ...data }

    DestinyLogger.info(`Manifest loaded! (latest version: ${version})`)
  }
}

export const getInfoAboutItem = hash => manifestCache['DestinyInventoryItemDefinition'][hash]

export const getInfoAboutClass = hash => manifestCache['DestinyClassDefinition'][hash]

export const getInfoAboutBucket = hash => manifestCache['DestinyInventoryBucketDefinition'][hash]

export const getInfoAboutDamageType = hash => manifestCache['DestinyDamageTypeDefinition'][hash]

export const getInfoAboutSandboxPerk = hash => manifestCache['DestinySandboxPerkDefinition'][hash]

export const getInfoAboutEnergyType = hash => manifestCache['DestinyEnergyTypeDefinition'][hash]