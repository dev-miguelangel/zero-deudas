import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { AVATARS } from '../avatars'
import { PlusIcon, UploadIcon } from '../icons'
import AvatarPicker from './AvatarPicker'
import ImportProfileModal from './ImportProfileModal'

export default function ProfileCreateForm() {
  const { createProfile, backToSelect, error, profiles } = useVault()
  const [mode, setMode] = useState('choice') // 'choice' | 'scratch' | 'import'
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

  if (mode === 'choice') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-bold text-slate-900">Nuevo perfil</h1>
          <p className="mt-2 text-sm text-slate-600">
            ¿Tienes un archivo <strong>.zero</strong> con tus datos, o prefieres partir de cero?
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setMode('import')}
              className="flex w-full items-start gap-3 rounded-md border border-slate-300 px-4 py-3 text-left hover:border-slate-400 hover:bg-slate-50"
            >
              <UploadIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Tengo un archivo .zero
                </span>
                <span className="block text-xs text-slate-500">
                  Trae tus deudas desde otro dispositivo
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('scratch')}
              className="flex w-full items-start gap-3 rounded-md border border-slate-300 px-4 py-3 text-left hover:border-slate-400 hover:bg-slate-50"
            >
              <PlusIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Quiero partir de cero
                </span>
                <span className="block text-xs text-slate-500">
                  Te guiamos paso a paso para agregar tus deudas
                </span>
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={backToSelect}
            className="mt-6 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'import') {
    return <ImportProfileModal onClose={() => setMode('choice')} />
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
            <div className="mt-2">
              <AvatarPicker value={avatarId} onChange={setAvatarId} />
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
              onClick={() => setMode('choice')}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Atrás
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
