import { formatCurrency } from '../../lib/format'
import { CloseIcon } from '../icons'
import PlanResultPanel from './PlanResultPanel'

const OBJETIVO_LABEL = { interes: 'Ahorrar en intereses', flujo: 'Bajar gasto mensual' }

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SavedPlanModal({ plan, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[90vh] w-[90vw] flex-col overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{plan.alias}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {OBJETIVO_LABEL[plan.objetivo] ?? plan.objetivo} · Guardado el{' '}
              {formatDate(plan.createdAt)}
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

        <div className="mt-4">
          <PlanResultPanel
            title={
              <p className="text-sm font-medium text-slate-700">
                Con {formatCurrency(plan.montoDisponible)}, te convenía
              </p>
            }
            allocations={plan.allocations}
            objetivo={plan.objetivo}
            sobranteClp={plan.sobranteClp}
            ufValue={plan.ufValue}
          />
        </div>
      </div>
    </div>
  )
}
