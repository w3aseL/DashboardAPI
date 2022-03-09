import { getInfoAboutBucket, getInfoAboutClass, getInfoAboutItem } from "./manifest";


export const processBasicCharacterInfo = ({ classHash, minutesPlayedTotal, light }) => ({
  class: getInfoAboutClass(classHash).displayProperties.name,
  minutesPlayedTotal,
  light
})

export const processItem = ({ itemHash, itemInstanceId }) => {
  const { displayProperties, itemTypeDisplayName } = getInfoAboutItem(itemHash)

  return {
    name: displayProperties.name,
    type: itemTypeDisplayName,
    itemHash,
    itemInstanceId
  }
}

export const processCharacterItems = items => items.map(item => processItem(item))