import { createContext, useContext, useMemo, useState } from 'react'
import { decryptJSON, deriveKey, encryptJSON, generateSalt } from '../lib/crypto'
import { addProfile, listProfiles, removeProfileRecord, updateProfileRecord } from '../lib/profiles'
import { clearProfileData } from '../lib/secureStorage'

const CHECK_VALUE = 'zerodeudas-ok'

const VaultContext = createContext(null)

async function verifyAgainst(profile, passphrase) {
  if (!profile) return null
  try {
    const key = await deriveKey(passphrase, profile.salt)
    const decrypted = await decryptJSON(key, profile.check)
    return decrypted === CHECK_VALUE ? key : null
  } catch {
    return null
  }
}

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
      /**
       * Registra un perfil nuevo a partir de un salt/check ya existentes
       * (viene de un archivo .zero importado, no de un passphrase nuevo).
       * Devuelve el id del perfil creado.
       */
      importProfile({ name, avatarId, salt, check }) {
        setError(null)
        const profile = { id: crypto.randomUUID(), name, avatarId, salt, check }
        setProfiles(addProfile(profile))
        return profile.id
      },
      /** Cambia el avatar del perfil activo (no involucra cifrado, es solo metadata). */
      updateAvatar(avatarId) {
        setProfiles(updateProfileRecord(activeProfileId, { avatarId }))
      },
      /** Entra directo a un perfil con una clave ya derivada (post-importación). */
      loginAs(profileId, key) {
        setError(null)
        setActiveProfileId(profileId)
        setCryptoKey(key)
        setStatus('unlocked')
      },
      /**
       * Confirma que `passphrase` es la clave actual del perfil activo.
       * Devuelve la clave derivada si es correcta, o null si no lo es.
       */
      async verifyPassphrase(passphrase) {
        return verifyAgainst(activeProfile, passphrase)
      },
      /**
       * Igual que `verifyPassphrase`, pero para un perfil cualquiera por id
       * (no necesariamente el activo) — se usa por ejemplo al confirmar el
       * borrado de un perfil desde la pantalla de selección, antes de haber
       * entrado a ninguno.
       */
      async verifyPassphraseFor(profileId, passphrase) {
        return verifyAgainst(
          profiles.find((p) => p.id === profileId),
          passphrase,
        )
      },
      /**
       * Calcula el "check" que usa `unlock()`/`verifyPassphrase()` para
       * validar el login, a partir de una clave ya derivada por otro medio
       * (por ejemplo, al importar un archivo .zero, donde la clave ya se
       * derivó y verificó contra el check propio del archivo — que usa un
       * valor distinto y no sirve para el login normal de este vault).
       */
      async computeCheckForKey(key) {
        return encryptJSON(key, CHECK_VALUE)
      },
      /** Genera salt/check/clave nuevos a partir de una passphrase nueva, sin aplicarlos todavía. */
      async generateNewCredentials(newPassphrase) {
        const salt = generateSalt()
        const key = await deriveKey(newPassphrase, salt)
        const check = await encryptJSON(key, CHECK_VALUE)
        return { salt, check, key }
      },
      /**
       * Aplica credenciales nuevas al perfil activo: guarda el salt/check y
       * pasa a usar la clave nueva. Se debe llamar solo después de haber
       * re-cifrado los datos del perfil con esa misma clave, para no dejar
       * el storage inconsistente.
       */
      commitNewCredentials(salt, check, key) {
        setProfiles(updateProfileRecord(activeProfileId, { salt, check }))
        setCryptoKey(key)
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
