import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { getAvatar } from '../avatars'
import { LockIcon } from '../icons'

export default function ProfileUnlockForm() {
  const { activeProfile, unlock, backToSelect, error, removeProfile } = useVault()
  const [passphrase, setPassphrase] = useState('')
  const [confirmingReset, setConfirmingReset] = useState(false)

  if (!activeProfile) return null

  const avatar = getAvatar(activeProfile.avatarId)

  function handleSubmit(event) {
    event.preventDefault()
    unlock(passphrase)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
          <img src={avatar.src} alt={avatar.label} className="h-full w-full object-cover" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">{activeProfile.name}</h1>
        <p className="mt-1 text-sm text-slate-600">Ingresa tu clave para continuar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="passphrase" className="block text-sm font-medium text-slate-700">
              Clave
            </label>
            <input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LockIcon className="h-4 w-4" />
            Entrar
          </button>
        </form>

        <button
          type="button"
          onClick={backToSelect}
          className="mt-4 text-sm text-slate-500 underline hover:text-slate-700"
        >
          ¿Otro perfil?
        </button>

        <div className="mt-6 border-t border-slate-200 pt-4">
          {confirmingReset ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Esto borra permanentemente este perfil y sus datos. No se puede
                deshacer.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeProfile(activeProfile.id)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Borrar perfil
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="text-sm text-slate-500 underline hover:text-slate-700"
            >
              Olvidé mi clave
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
