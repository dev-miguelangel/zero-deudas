import { useState } from 'react'
import { buildPaymentPlan } from '../../domain/paymentPlan'
import { GridIcon, TableIcon } from '../icons'
import PriorityOrderCards from './PriorityOrderCards'
import PriorityOrderTable from './PriorityOrderTable'

const VIEWS = [
  { id: 'table', label: 'Tabla', icon: TableIcon },
  { id: 'cards', label: 'Lista', icon: GridIcon },
]

/**
 * Lista ordenada de prioridad, con un campo aparte por deuda para
 * simular un abono directo a esa deuda puntual — independiente del
 * "monto disponible" general, que se reparte automáticamente por todas.
 * Reutiliza `buildPaymentPlan` con un arreglo de una sola deuda, así el
 * cálculo (ambas modalidades, mínimo legal, comisión) es exactamente el
 * mismo que el del plan general.
 */
export default function PriorityOrderList({ priorityOrder, ufValue }) {
  const [amounts, setAmounts] = useState({})
  const [view, setView] = useState('table')

  function handleChangeAmount(debtId, value) {
    setAmounts((prev) => ({ ...prev, [debtId]: value }))
  }

  function resultFor(debt, montoManual) {
    if (!(Number(montoManual) > 0)) return null
    return buildPaymentPlan([debt], montoManual, ufValue).allocations[0]
  }

  return (
    <div>
      <div className="flex justify-end">
        <div className="flex shrink-0 rounded-md border border-slate-300 p-0.5 text-xs font-medium">
          {VIEWS.map((v) => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-label={v.label}
                aria-pressed={view === v.id}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors ${
                  view === v.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {view === 'table' ? (
        <PriorityOrderTable
          priorityOrder={priorityOrder}
          ufValue={ufValue}
          amounts={amounts}
          onChangeAmount={handleChangeAmount}
          resultFor={resultFor}
        />
      ) : (
        <PriorityOrderCards
          priorityOrder={priorityOrder}
          ufValue={ufValue}
          amounts={amounts}
          onChangeAmount={handleChangeAmount}
          resultFor={resultFor}
        />
      )}
    </div>
  )
}
