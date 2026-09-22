import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import { getAvatar } from '../avatars'
import { PlusIcon, TrashIcon, UploadIcon } from '../icons'
import DeleteProfileModal from './DeleteProfileModal'
import ImportProfileModal from './ImportProfileModal'

export default function ProfileSelect() {
  const { profiles, selectProfile, startCreateProfile } = useVault()
  const [managing, setManaging] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)
  const [importing, setImporting] = useState(false)

  const confirmingProfile = profiles.find((p) => p.id === confirmingId)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">¿Quién anda ahí?</h1>
      <p className="mt-2 text-sm text-slate-600">Elige tu perfil para continuar.</p>

      <div className="mt-10 flex flex-wrap justify-center gap-8">
        {profiles.map((profile) => {
          const avatar = getAvatar(profile.avatarId)
          return (
            <div key={profile.id} className="flex flex-col items-center gap-2">
              <div className="relative h-20 w-20">
                <button
                  type="button"
                  onClick={() =>
                    managing ? setConfirmingId(profile.id) : selectProfile(profile.id)
                  }
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
                >
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    className="h-full w-full object-cover"
                  />
                </button>
                {managing && (
                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white ring-2 ring-white">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
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

      {confirmingProfile && (
        <DeleteProfileModal
          profileId={confirmingProfile.id}
          profileName={confirmingProfile.name}
          onClose={() => setConfirmingId(null)}
        />
      )}
    </div>
  )
}
