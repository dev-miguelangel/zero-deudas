import { useState } from 'react'
import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { GridIcon, TableIcon } from '../icons'
import PaymentPlanCards from './PaymentPlanCards'
import PaymentPlanTable from './PaymentPlanTable'
import PlanComparisonSummary from './PlanComparisonSummary'

const VIEWS = [
  { id: 'table', label: 'Tabla', icon: TableIcon },
  { id: 'cards', label: 'Tarjetas', icon: GridIcon },
]

/**
 * Contenido del paso 3 del plan de pago (reparto por deuda + comparación
 * "cómo estás vs. con el plan aplicado"). Lo usan tanto la vista en vivo
 * (`PaymentPlanTab`) como el modal de un plan guardado (`SavedPlanModal`),
 * para que ambas se vean exactamente igual.
 */
export default function PlanResultPanel({
  title,
  actions,
  allocations,
  objetivo,
  sobranteClp,
  ufValue,
}) {
  const { formatAmount } = useCurrencyDisplay()
  const [view, setView] = useState('table')

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        {title}
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {allocations.length > 0 && (
            <div className="flex rounded-md border border-slate-300 p-0.5 text-xs font-medium">
              {VIEWS.map((v) => {
                const Icon = v.icon
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setView(v.id)}
                    aria-label={v.label}
                    aria-pressed={view === v.id}
                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 transition-colors ${
                      view === v.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {allocations.length === 0 ? (
          <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
            No hay ninguna deuda a la que aplicarle ese monto (o todas quedaron fuera del plan
            por falta del valor de la UF).
          </p>
        ) : view === 'table' ? (
          <PaymentPlanTable allocations={allocations} objetivo={objetivo} />
        ) : (
          <PaymentPlanCards allocations={allocations} objetivo={objetivo} />
        )}

        {sobranteClp > 0 && (
          <p className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">
            Con ese monto alcanza para saldar por completo todas las deudas seleccionadas — te
            sobran {formatAmount(sobranteClp)}.
          </p>
        )}

        <PlanComparisonSummary allocations={allocations} objetivo={objetivo} ufValue={ufValue} />
      </div>
    </div>
  )
}
