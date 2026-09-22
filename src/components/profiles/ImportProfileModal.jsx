import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { createSecureStorage } from '../../lib/secureStorage'
import { decryptExportFile, isValidExportFile } from '../../lib/vaultFile'

export default function ImportProfileModal({ onClose }) {
  const { profiles, importProfile, loginAs } = useVault()
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setError(null)
    setFile(null)
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
        setName(parsed.profile?.name ?? '')
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
      const newProfileId = importProfile({
        name: trimmedName,
        avatarId: file.profile?.avatarId,
        salt: file.salt,
        check: file.check,
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
          Elige el archivo <strong>.zero</strong> que exportaste antes, e ingresa la
          misma clave que usaste en ese perfil.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="import-file" className="block text-sm font-medium text-slate-700">
              Archivo
            </label>
            <input
              id="import-file"
              type="file"
              accept=".zero"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-600"
            />
          </div>

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
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  autoFocus
                />
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
