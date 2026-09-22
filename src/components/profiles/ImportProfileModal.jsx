import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { AVATARS, getAvatar } from '../avatars'
import { createSecureStorage } from '../../lib/secureStorage'
import { decryptExportFile, isValidExportFile } from '../../lib/vaultFile'
import { CheckCircleIcon, UploadIcon } from '../icons'
import AvatarPicker from './AvatarPicker'

function suggestUniqueName(base, profiles) {
  const taken = new Set(profiles.map((p) => p.name.trim().toLowerCase()))
  if (!taken.has(base.trim().toLowerCase())) return base
  let i = 2
  let candidate = `${base} (${i})`
  while (taken.has(candidate.toLowerCase())) {
    i += 1
    candidate = `${base} (${i})`
  }
  return candidate
}

export default function ImportProfileModal({ onClose, initialFile }) {
  const { profiles, importProfile, loginAs, computeCheckForKey } = useVault()

  function loadedState(parsed) {
    const baseName = parsed.profile?.name?.trim() || 'Perfil importado'
    const suggested = suggestUniqueName(baseName, profiles)
    return {
      name: suggested,
      nameWasAdjusted: suggested !== baseName,
      avatarId: getAvatar(parsed.profile?.avatarId).id,
    }
  }

  const initialLoaded = initialFile ? loadedState(initialFile) : null

  const [file, setFile] = useState(initialFile ?? null)
  const [fileName, setFileName] = useState(initialFile ? 'Enlace compartido' : null)
  const [fromLink] = useState(Boolean(initialFile))
  const [name, setName] = useState(initialLoaded?.name ?? '')
  const [nameWasAdjusted, setNameWasAdjusted] = useState(initialLoaded?.nameWasAdjusted ?? false)
  const [avatarId, setAvatarId] = useState(initialLoaded?.avatarId ?? AVATARS[0].id)
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setError(null)
    setFile(null)
    setFileName(null)
    if (!selected) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!isValidExportFile(parsed)) {
          setError('Este archivo no es un respaldo válido de ZeroDeudas (.zero).')
          return
        }
        setFile(parsed)
        setFileName(selected.name)
        const loaded = loadedState(parsed)
        setName(loaded.name)
        setNameWasAdjusted(loaded.nameWasAdjusted)
        setAvatarId(loaded.avatarId)
      } catch {
        setError('No se pudo leer el archivo.')
      }
    }
    reader.onerror = () => setError('No se pudo leer el archivo.')
    reader.readAsText(selected)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!file) {
      setError('Elige un archivo .zero primero.')
      return
    }
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Ponle un nombre a este perfil.')
      return
    }
    if (profiles.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe un perfil con ese nombre.')
      return
    }

    setBusy(true)
    try {
      const { key, debts } = await decryptExportFile(file, passphrase)
      // El "check" del archivo solo sirve para validar la clave al leerlo
      // (usa su propio valor interno). El perfil que queda guardado acá
      // necesita el check del vault local, para que el login normal
      // funcione después.
      const check = await computeCheckForKey(key)
      const newProfileId = importProfile({
        name: trimmedName,
        avatarId,
        salt: file.salt,
        check,
      })
      await createSecureStorage(key, newProfileId).setItem('debts', debts)
      loginAs(newProfileId, key)
    } catch {
      setError('Clave incorrecta o archivo dañado.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Importar perfil</h2>
        <p className="mt-2 text-sm text-slate-600">
          {fromLink
            ? 'Recibiste un enlace con un perfil de ZeroDeudas. Ingresa la misma clave que se usó para generarlo.'
            : 'Elige el archivo .zero que exportaste antes, e ingresa la misma clave que usaste en ese perfil.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {fromLink ? (
            <div className="flex items-center gap-2 rounded-md border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircleIcon className="h-5 w-5 shrink-0" />
              Perfil recibido por enlace
            </div>
          ) : (
            <div>
              <label htmlFor="import-file" className="block text-sm font-medium text-slate-700">
                Archivo .zero
              </label>
              <label
                htmlFor="import-file"
                className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                  file
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {file ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    <span className="font-medium">{fileName}</span>
                    <span className="text-xs text-emerald-600 underline">
                      Elegir otro archivo
                    </span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-6 w-6" />
                    <span>
                      Toca para elegir tu archivo <strong>.zero</strong>
                    </span>
                  </>
                )}
              </label>
              <input
                id="import-file"
                type="file"
                accept=".zero"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>
          )}

          {file && (
            <>
              <div>
                <label
                  htmlFor="import-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nombre del perfil
                </label>
                <input
                  id="import-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameWasAdjusted(false)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  autoFocus
                />
                {nameWasAdjusted && (
                  <p className="mt-1 text-xs text-slate-500">
                    Ya tienes un perfil con ese nombre — lo ajusté para que no se repita. Puedes
                    cambiarlo si quieres.
                  </p>
                )}
              </div>
              <div>
                <p className="block text-sm font-medium text-slate-700">Avatar</p>
                <div className="mt-2">
                  <AvatarPicker value={avatarId} onChange={setAvatarId} />
                </div>
              </div>
              <div>
                <label
                  htmlFor="import-passphrase"
                  className="block text-sm font-medium text-slate-700"
                >
                  Clave
                </label>
                <input
                  id="import-passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy || !file}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? 'Importando…' : 'Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
