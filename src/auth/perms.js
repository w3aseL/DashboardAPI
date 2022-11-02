// LIMIT 64
export const PERMISSIONS_TITLES = {
  "administrator": "Administrator",
  "spotify-basic": "Spotify Permission",
  "spotify-connect": "Connecting Spotify Account",
  "spotify-playback": "Spotify Playback",
  "portfolio-all": "All Portfolio Access",
  "destiny-stats": "All Destiny Stats Access"
}

const PERM_KEYS = Object.keys(PERMISSIONS_TITLES)

/**
 * Extract Permissions
 * -------------------
 * Extracts the permissions of a given user from the number's binary values.
 * 
 * @param {number} permVal - The numerical value of the user's permission level.
 * @returns {Array} - The array with the permissions given.
 */
export const extractPermissions = permVal =>
  Array.from(Array(PERM_KEYS.length).keys())
    .map(i => (permVal >> i) & 1 ? PERM_KEYS[i] : -1)
    .filter(v => v != -1);

/**
 * Encode Permissions
 * ------------------
 * Takes a given permission set and encodes into a number.
 * 
 * @param {Array} perms - The permissions to encode.
 * @returns {number} The encoded number for the permissions.
 */
export const encodePermissions = perms =>
  perms
    .map(v => 1 << PERM_KEYS.indexOf(v))
    .reduce((pSum, v) => pSum + v, 0);

/**
 * Check for Permission
 * --------------------
 * Checks if a numerical permission encoding contains the specified permission.
 * @param {number} val 
 * @param {string} perm 
 * @returns 
 */
export const checkForPermission = (val, perm) =>
  (val >> PERM_KEYS.indexOf(perm)) & 1;