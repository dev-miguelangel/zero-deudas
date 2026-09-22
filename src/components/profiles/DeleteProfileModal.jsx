import { useState } from 'react'
import { useVault } from '../../context/VaultContext'

export default function DeleteProfileModal({ profileId, profileName, onClose }) {
  const { verifyPassphraseFor, removeProfile } = useVault()
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    const key = await verifyPassphraseFor(profileId, passphrase)
    if (!key) {
      setError('Clave incorrecta.')
      setBusy(false)
      return
    }
    removeProfile(profileId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <p className="text-sm text-slate-700">
          Esto borra permanentemente el perfil <strong>{profileName}</strong> y todos
          sus datos. No se puede deshacer.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="delete-passphrase"
              className="block text-sm font-medium text-slate-700"
            >
              Ingresa la clave de este perfil para confirmar
            </label>
            <input
              id="delete-passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? 'Verificando…' : 'Eliminar perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
