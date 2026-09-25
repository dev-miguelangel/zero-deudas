import { useState } from 'react'

export default function SavePlanModal({ onCancel, onSave }) {
  const [alias, setAlias] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = alias.trim()
    if (!trimmed) {
      setError('Ponle un nombre a este plan.')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Guardar plan</h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Ponle un nombre para reconocerlo después en &quot;Mis planes&quot;.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-1">
          <label htmlFor="plan-alias" className="block text-sm font-medium text-slate-700">
            Alias
          </label>
          <input
            id="plan-alias"
            type="text"
            value={alias}
            onChange={(e) => {
              setAlias(e.target.value)
              setError(null)
            }}
            placeholder="Ej. Plan agresivo octubre"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onCancel}
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
