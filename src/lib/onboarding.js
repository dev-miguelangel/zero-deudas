function keyFor(profileId) {
  return `zerodeudas:onboarding:${profileId}`
}

function read(profileId) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(profileId))) ?? {}
  } catch {
    return {}
  }
}

function write(profileId, patch) {
  localStorage.setItem(keyFor(profileId), JSON.stringify({ ...read(profileId), ...patch }))
}

export function getOnboardingState(profileId) {
  const { welcomeSeen = false, planSeen = false } = read(profileId)
  return { welcomeSeen, planSeen }
}

export function markWelcomeSeen(profileId) {
  write(profileId, { welcomeSeen: true })
}

export function markPlanSeen(profileId) {
  write(profileId, { planSeen: true })
}

export function markOnboardingComplete(profileId) {
  write(profileId, { welcomeSeen: true, planSeen: true })
}

export function clearOnboarding(profileId) {
  localStorage.removeItem(keyFor(profileId))
}
