const PROFILES_KEY = 'zerodeudas:profiles'

export function listProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) ?? []
  } catch {
    return []
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  return profiles
}

export function addProfile(profile) {
  return saveProfiles([...listProfiles(), profile])
}

export function removeProfileRecord(id) {
  return saveProfiles(listProfiles().filter((p) => p.id !== id))
}

export function updateProfileRecord(id, updates) {
  return saveProfiles(listProfiles().map((p) => (p.id === id ? { ...p, ...updates } : p)))
}
