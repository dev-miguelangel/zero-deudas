import { createContext, useContext, useMemo, useState } from 'react'
import { decryptJSON, deriveKey, encryptJSON, generateSalt } from '../lib/crypto'
import { addProfile, listProfiles, removeProfileRecord } from '../lib/profiles'
import { clearProfileData } from '../lib/secureStorage'

const CHECK_VALUE = 'zerodeudas-ok'

const VaultContext = createContext(null)

export function VaultProvider({ children }) {
  const [profiles, setProfiles] = useState(listProfiles)
  const [status, setStatus] = useState('select') // select | creating | unlocking | unlocked
  const [activeProfileId, setActiveProfileId] = useState(null)
  const [cryptoKey, setCryptoKey] = useState(null)
  const [error, setError] = useState(null)

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null

  const value = useMemo(
    () => ({
      profiles,
      status,
      activeProfile,
      activeProfileId,
      cryptoKey,
      error,
      startCreateProfile() {
        setError(null)
        setStatus('creating')
      },
      selectProfile(id) {
        setError(null)
        setActiveProfileId(id)
        setStatus('unlocking')
      },
      backToSelect() {
        setError(null)
        setActiveProfileId(null)
        setCryptoKey(null)
        setStatus('select')
      },
      async createProfile(name, passphrase, avatarId) {
        setError(null)
        const salt = generateSalt()
        const key = await deriveKey(passphrase, salt)
        const check = await encryptJSON(key, CHECK_VALUE)
        const profile = { id: crypto.randomUUID(), name, avatarId, salt, check }
        setProfiles(addProfile(profile))
        setActiveProfileId(profile.id)
        setCryptoKey(key)
        setStatus('unlocked')
      },
      async unlock(passphrase) {
        setError(null)
        try {
          const profile = profiles.find((p) => p.id === activeProfileId)
          const key = await deriveKey(passphrase, profile.salt)
          const decrypted = await decryptJSON(key, profile.check)
          if (decrypted !== CHECK_VALUE) throw new Error('mismatch')
          setCryptoKey(key)
          setStatus('unlocked')
        } catch {
          setError('Clave incorrecta.')
        }
      },
      lock() {
        setCryptoKey(null)
        setActiveProfileId(null)
        setStatus('select')
      },
      removeProfile(id) {
        clearProfileData(id)
        setProfiles(removeProfileRecord(id))
        if (activeProfileId === id) {
          setActiveProfileId(null)
          setCryptoKey(null)
          setStatus('select')
        }
      },
    }),
    [profiles, status, activeProfile, activeProfileId, cryptoKey, error],
  )

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault debe usarse dentro de VaultProvider')
  return ctx
}
