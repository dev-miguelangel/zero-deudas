import { useState } from 'react'
import { useVault } from '../../context/VaultContext'
import AvatarPicker from './AvatarPicker'

export default function ChangeAvatarModal({ onClose }) {
  const { activeProfile, updateAvatar } = useVault()
  const [avatarId, setAvatarId] = useState(activeProfile?.avatarId)

  function handleSubmit(event) {
    event.preventDefault()
    updateAvatar(avatarId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Cambiar avatar</h2>
        <p className="mt-2 text-sm text-slate-600">Elige uno nuevo para este perfil.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <AvatarPicker value={avatarId} onChange={setAvatarId} />

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
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
