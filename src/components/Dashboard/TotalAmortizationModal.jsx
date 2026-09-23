import { useState } from 'react'
import { DEBT_TYPES } from '../../domain/debts'
import { simulateCombined } from '../../domain/simulator'
import { debtTypeIcon } from '../debtTypes'
import { ChevronRightIcon, CloseIcon } from '../icons'
import CombinedAmortizationTab from './CombinedAmortizationTab'
import PaymentPlanTab from './PaymentPlanTab'

const TABS = [
  { id: 'tabla', label: 'Tabla' },
  { id: 'plan', label: 'Plan de pago' },
]

export default function TotalAmortizationModal({ debts, ufValue, onClose }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(debts.map((d) => d.id)))
  const [showSelector, setShowSelector] = useState(true)
  const [activeTab, setActiveTab] = useState('tabla')

  function toggleDebt(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleType(typeDebts) {
    const allSelected = typeDebts.every((d) => selectedIds.has(d.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      typeDebts.forEach((d) => (allSelected ? next.delete(d.id) : next.add(d.id)))
      return next
    })
  }

  const selectedDebts = debts.filter((d) => selectedIds.has(d.id))
  const result = simulateCombined(selectedDebts, ufValue)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8">
      <div className="max-h-full w-[90vw] overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Amortización total</h2>
            <p className="text-sm text-slate-500">
              {selectedDebts.length} de {debts.length} deudas seleccionadas
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          {showSelector ? (
            <div className="space-y-4 overflow-y-auto rounded-lg border border-slate-200 p-3 md:max-h-[65vh] md:w-72 md:shrink-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Deudas a incluir
                </p>
                <button
                  type="button"
                  onClick={() => setShowSelector(false)}
                  className="shrink-0 text-xs font-medium text-emerald-700 underline"
                >
                  Ocultar
                </button>
              </div>
              {DEBT_TYPES.map((type) => {
                const typeDebts = debts.filter((d) => d.tipo === type.id)
                if (typeDebts.length === 0) return null
                const Icon = debtTypeIcon(type.id)
                const allSelected = typeDebts.every((d) => selectedIds.has(d.id))

                return (
                  <div key={type.id}>
                    <button
                      type="button"
                      onClick={() => toggleType(typeDebts)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {type.label}
                      <span className="font-normal text-slate-400">
                        ({allSelected ? 'quitar todas' : 'elegir todas'})
                      </span>
                    </button>
                    <div className="mt-1 space-y-0.5">
                      {typeDebts.map((debt) => (
                        <label
                          key={debt.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(debt.id)}
                            onChange={() => toggleDebt(debt.id)}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                          />
                          <span className="min-w-0 truncate text-slate-700">
                            {debt.acreedor}
                            {debt.alias && (
                              <span className="text-slate-400"> · {debt.alias}</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              aria-label="Mostrar deudas a incluir"
              title="Mostrar deudas a incluir"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-md border border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-900"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex rounded-md border border-slate-300 p-0.5 text-xs font-medium">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={`flex-1 rounded px-3 py-1.5 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'tabla' ? (
              <CombinedAmortizationTab selectedCount={selectedDebts.length} result={result} />
            ) : (
              <PaymentPlanTab debts={selectedDebts} ufValue={ufValue} />
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
