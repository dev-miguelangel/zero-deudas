import { useState } from 'react'
import { useDebts } from '../context/DebtsContext'
import { useVault } from '../context/VaultContext'
import { DEBT_TYPES } from '../domain/debts'
import { describeDebtChanges, diffImportedDebts } from '../domain/syncImport'
import { decryptExportFile, isValidExportFile } from '../lib/vaultFile'
import ConfirmPassphraseModal from './ConfirmPassphraseModal'
import { debtTypeIcon } from './debtTypes'
import { CheckCircleIcon, UploadIcon } from './icons'

function formatGeneratedAt(iso) {
  if (!iso) return 'Fecha no disponible'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  const label = date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Generado el ${label}`
}

function formatChangeValue(label, value) {
  if (value == null || value === '') return '—'
  if (label === 'Tasa') return `${value}%`
  if (typeof value === 'number') return value.toLocaleString('es-CL')
  return String(value)
}

export default function ImportUpdatesModal({ onClose }) {
  const { debts, applyImportedDebts } = useDebts()
  const { verifyPassphrase } = useVault()

  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [entries, setEntries] = useState(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(null)

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setError(null)
    setFile(null)
    setFileName(null)
    setEntries(null)
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
        setFileName(selected.name)
      } catch {
        setError('No se pudo leer el archivo.')
      }
    }
    reader.onerror = () => setError('No se pudo leer el archivo.')
    reader.readAsText(selected)
  }

  async function handleDecrypt(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { debts: fileDebts } = await decryptExportFile(file, passphrase)
      const diffed = diffImportedDebts(fileDebts, debts).filter((e) => e.status !== 'identical')
      setEntries(diffed)
      setSelectedIds(new Set(diffed.map((e) => e.debt.id)))
    } catch {
      setError('Clave incorrecta o archivo dañado.')
    } finally {
      setBusy(false)
    }
  }

  function toggleDebt(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleType(typeEntries) {
    const allSelected = typeEntries.every((e) => selectedIds.has(e.debt.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      typeEntries.forEach((e) => (allSelected ? next.delete(e.debt.id) : next.add(e.debt.id)))
      return next
    })
  }

  function handleConfirmed() {
    const newCount = entries.filter((e) => e.status === 'new' && selectedIds.has(e.debt.id)).length
    const updatedCount = entries.filter(
      (e) => e.status === 'updated' && selectedIds.has(e.debt.id),
    ).length
    applyImportedDebts(entries, selectedIds)
    setDone({ newCount, updatedCount })
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center">
          <CheckCircleIcon className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Importación aplicada</h2>
          <p className="mt-2 text-sm text-slate-600">
            {done.newCount} deuda{done.newCount === 1 ? '' : 's'} nueva
            {done.newCount === 1 ? '' : 's'} agregada{done.newCount === 1 ? '' : 's'} y{' '}
            {done.updatedCount} actualizada{done.updatedCount === 1 ? '' : 's'}.
          </p>
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
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Importar actualizaciones</h2>
        <p className="mt-1 text-sm text-slate-600">
          Trae los cambios que hiciste en otro dispositivo desde un archivo{' '}
          <strong>.zero</strong> exportado ahí. Solo agrega o actualiza deudas — no borra nada
          de este perfil, y no sincroniza eliminaciones hechas en el otro dispositivo.
        </p>

        {!entries ? (
          <form onSubmit={handleDecrypt} className="mt-4 space-y-4">
            <div>
              <label htmlFor="sync-file" className="block text-sm font-medium text-slate-700">
                Archivo .zero
              </label>
              <label
                htmlFor="sync-file"
                className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                  file
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {file ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    <span className="font-medium">{fileName}</span>
                    <span className="text-xs text-emerald-600 underline">
                      Elegir otro archivo
                    </span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-6 w-6" />
                    <span>
                      Toca para elegir el <strong>.zero</strong> del otro dispositivo
                    </span>
                  </>
                )}
              </label>
              <input
                id="sync-file"
                type="file"
                accept=".zero"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {file && (
              <div>
                <label
                  htmlFor="sync-passphrase"
                  className="block text-sm font-medium text-slate-700"
                >
                  Clave del archivo
                </label>
                <input
                  id="sync-passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  autoFocus
                />
              </div>
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
                {busy ? 'Descifrando…' : 'Continuar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm font-medium text-slate-700">{formatGeneratedAt(file.generatedAt)}</p>

            {entries.length === 0 ? (
              <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
                No hay diferencias: tu perfil ya tiene todas las deudas de este archivo, tal
                cual.
              </p>
            ) : (
              <div className="max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {DEBT_TYPES.map((type) => {
                  const typeEntries = entries.filter((e) => e.debt.tipo === type.id)
                  if (typeEntries.length === 0) return null
                  const Icon = debtTypeIcon(type.id)
                  const allSelected = typeEntries.every((e) => selectedIds.has(e.debt.id))

                  return (
                    <div key={type.id}>
                      <button
                        type="button"
                        onClick={() => toggleType(typeEntries)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {type.label}
                        <span className="font-normal text-slate-400">
                          ({allSelected ? 'quitar todas' : 'elegir todas'})
                        </span>
                      </button>
                      <div className="mt-1.5 space-y-2">
                        {typeEntries.map((entry) => {
                          const changes =
                            entry.status === 'updated'
                              ? describeDebtChanges(entry.existing, entry.debt)
                              : []
                          return (
                            <label
                              key={entry.debt.id}
                              className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(entry.debt.id)}
                                onChange={() => toggleDebt(entry.debt.id)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="min-w-0 truncate text-slate-700">
                                    {entry.debt.acreedor}
                                    {entry.debt.alias && (
                                      <span className="text-slate-400"> · {entry.debt.alias}</span>
                                    )}
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                      entry.status === 'new'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {entry.status === 'new' ? 'Nueva' : 'Actualización disponible'}
                                  </span>
                                </div>
                                {changes.length > 0 && (
                                  <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                                    {changes.map((change) => (
                                      <li key={change.label}>
                                        {change.label}: {formatChangeValue(change.label, change.from)}{' '}
                                        → {formatChangeValue(change.label, change.to)}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setConfirming(true)}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Importar seleccionadas ({selectedIds.size})
              </button>
            </div>
          </div>
        )}
      </div>

      {confirming && (
        <ConfirmPassphraseModal
          message="Ingresa tu clave de este perfil para aplicar la importación."
          confirmLabel="Importar"
          verify={verifyPassphrase}
          onConfirm={handleConfirmed}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
