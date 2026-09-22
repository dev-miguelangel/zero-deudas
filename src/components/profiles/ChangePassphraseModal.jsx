import { useState } from 'react'
import { useDebts } from '../../context/DebtsContext'
import { useVault } from '../../context/VaultContext'
import { createSecureStorage } from '../../lib/secureStorage'

export default function ChangePassphraseModal({ onClose }) {
  const { activeProfileId, verifyPassphrase, generateNewCredentials, commitNewCredentials } =
    useVault()
  const { debts } = useDebts()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (next.length < 8) {
      setError('La clave nueva debe tener al menos 8 caracteres.')
      return
    }
    if (next !== confirm) {
      setError('Las claves nuevas no coinciden.')
      return
    }

    setBusy(true)
    try {
      const verified = await verifyPassphrase(current)
      if (!verified) {
        setError('La clave actual es incorrecta.')
        setBusy(false)
        return
      }

      const { salt, check, key } = await generateNewCredentials(next)
      // Re-cifra los datos con la clave nueva ANTES de aplicarla, para no
      // dejar el storage a medio migrar si algo falla en el camino.
      await createSecureStorage(key, activeProfileId).setItem('debts', debts)
      commitNewCredentials(salt, check, key)
      setDone(true)
    } catch {
      setError('No se pudo cambiar la clave. Intenta de nuevo.')
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center">
          <p className="text-sm text-slate-700">Tu clave se actualizó correctamente.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Listo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Cambiar clave</h2>
        <p className="mt-2 text-sm text-slate-600">
          Vuelve a cifrar todos tus datos con la clave nueva. No se guarda ninguna
          passphrase: si la olvidas, no hay forma de recuperar los datos.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="current-pass" className="block text-sm font-medium text-slate-700">
              Clave actual
            </label>
            <input
              id="current-pass"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="new-pass" className="block text-sm font-medium text-slate-700">
              Clave nueva
            </label>
            <input
              id="new-pass"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirm-pass" className="block text-sm font-medium text-slate-700">
              Confirmar clave nueva
            </label>
            <input
              id="confirm-pass"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

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
              disabled={busy}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? 'Cambiando…' : 'Cambiar clave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
