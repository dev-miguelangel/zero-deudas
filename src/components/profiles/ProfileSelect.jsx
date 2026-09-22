import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { getAvatar } from '../avatars'
import { PlusIcon, TrashIcon, UploadIcon } from '../icons'
import ImportProfileModal from './ImportProfileModal'

export default function ProfileSelect() {
  const { profiles, selectProfile, startCreateProfile, removeProfile } = useVault()
  const [managing, setManaging] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [importing, setImporting] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">¿Quién anda ahí?</h1>
      <p className="mt-2 text-sm text-slate-600">Elige tu perfil para continuar.</p>

      <div className="mt-10 flex flex-wrap justify-center gap-8">
        {profiles.map((profile) => {
          const avatar = getAvatar(profile.avatarId)
          return (
            <div key={profile.id} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  managing ? setConfirmingId(profile.id) : selectProfile(profile.id)
                }
                className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
              >
                <img src={avatar.src} alt={avatar.label} className="h-full w-full object-cover" />
                {managing && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600 ring-1 ring-slate-200">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
              <span className="text-sm font-medium text-slate-700">{profile.name}</span>
            </div>
          )
        })}

        <button type="button" onClick={startCreateProfile} className="flex flex-col items-center gap-2">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400">
            <PlusIcon className="h-8 w-8" />
          </span>
          <span className="text-sm font-medium text-slate-500">Agregar perfil</span>
        </button>
      </div>

      <div className="mt-10 flex gap-2">
        {profiles.length > 0 && (
          <button
            type="button"
            onClick={() => setManaging((prev) => !prev)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {managing ? 'Listo' : 'Administrar perfiles'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setImporting(true)}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <UploadIcon className="h-4 w-4" />
          Importar
        </button>
      </div>

      {importing && <ImportProfileModal onClose={() => setImporting(false)} />}

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <p className="text-sm text-slate-700">
              Esto borra permanentemente el perfil y todos sus datos. No se puede
              deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  removeProfile(confirmingId)
                  setConfirmingId(null)
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Eliminar perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
