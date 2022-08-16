import { DEFAULT_CHANNEL } from ".."
import { getUserAPI } from "../../destiny"


const SLOTS = [ "primary", "secondary", "power", "helmet", "gauntlets", "chestplate", "leggings", "class" ]

/**
 * Get Weapon From Slot
 * 
 * @param {[string]} args
 * @param {import("tmi.js").ChatUserstate} user 
 * @param {import("tmi.js").Client} client 
 * @returns 
 */
export const getWeaponFromSlot = async (args, user, client) => {
  const api = getUserAPI("Weasel")

  var slot = SLOTS[Math.floor(Math.random() * SLOTS.length)]

  if(SLOTS.includes(args[0].toLowerCase())) slot = args[0].toLowerCase()

  const item = await api.getSlotItemFromCurrentCharacter(slot)

  const perkStr = `Perks: ${item.perks.map((perk, i) => `${perk}${i < item.perks.length-1 ? ", " : ""}`).join("")}`

  client.say(DEFAULT_CHANNEL, `@${user.username}, Weasel is using ${item.name} (${item.light} Light ${item.damageType ? `${item.damageType} ${item.type}` : item.type}${item.armorEnergy ? ` w/ ${item.armorEnergy} Armor Element` : ""}) - ${perkStr} -- https://light.gg/db/items/${item.itemHash}`)
}