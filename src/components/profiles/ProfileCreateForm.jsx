import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { AVATARS } from '../avatars'

export default function ProfileCreateForm() {
  const { createProfile, backToSelect, error, profiles } = useVault()
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState(AVATARS[0].id)
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [formError, setFormError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Ponle un nombre a tu perfil.')
      return
    }
    if (profiles.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError('Ya existe un perfil con ese nombre.')
      return
    }
    if (passphrase.length < 8) {
      setFormError('La clave debe tener al menos 8 caracteres.')
      return
    }
    if (passphrase !== confirmPassphrase) {
      setFormError('Las claves no coinciden.')
      return
    }
    createProfile(trimmedName, passphrase, avatarId)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-bold text-slate-900">Nuevo perfil</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cada perfil tiene su propia clave y sus propios datos, separados de los
          demás perfiles. Si la olvidas, no hay forma de recuperarlos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-700">Avatar</p>
            <div className="mt-2 flex justify-between">
              {AVATARS.map(({ id, label, src }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  aria-label={label}
                  className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
                    avatarId === id ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                  }`}
                >
                  <img src={src} alt={label} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

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
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
              Confirmar clave
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {(formError || error) && <p className="text-sm text-red-600">{formError || error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={backToSelect}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
