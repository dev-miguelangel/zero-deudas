import { decryptJSON, encryptJSON } from './crypto'

function prefixFor(profileId) {
  return `zerodeudas:data:${profileId}:`
}

export function createSecureStorage(cryptoKey, profileId) {
  const prefix = prefixFor(profileId)
  return {
    async setItem(key, value) {
      const payload = await encryptJSON(cryptoKey, value)
      localStorage.setItem(prefix + key, JSON.stringify(payload))
    },
    async getItem(key, fallback = null) {
      const raw = localStorage.getItem(prefix + key)
      if (!raw) return fallback
      try {
        return await decryptJSON(cryptoKey, JSON.parse(raw))
      } catch {
        return fallback
      }
    },
    removeItem(key) {
      localStorage.removeItem(prefix + key)
    },
  }
}

export function clearProfileData(profileId) {
  const prefix = prefixFor(profileId)
  Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => localStorage.removeItem(key))
}
