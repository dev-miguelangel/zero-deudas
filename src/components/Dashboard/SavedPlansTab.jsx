import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { summarizePlanComparison } from '../../domain/paymentPlan'
import { formatCurrency } from '../../lib/format'
import EstimateNote from '../EstimateNote'
import { TrashIcon } from '../icons'
import SavedPlanModal from './SavedPlanModal'

const OBJETIVO_LABEL = { interes: 'Ahorrar en intereses', flujo: 'Bajar gasto mensual' }

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SavedPlansTab() {
  const { plans, removePlan } = usePlans()
  const [openId, setOpenId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const openPlan = plans.find((p) => p.id === openId)

  if (plans.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Todavía no has guardado ningún plan. Ve a &quot;Plan de pago&quot;, arma uno con el
        monto que quieras abonar y usa &quot;Guardar plan&quot; para verlo aquí.
      </p>
    )
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const summary = summarizePlanComparison(plan.allocations, plan.objetivo, plan.ufValue)
          const confirming = confirmDeleteId === plan.id

          return (
            <div key={plan.id} className="rounded-lg border border-slate-200 p-4">
              {confirming ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-2 text-center">
                  <p className="text-sm text-slate-700">
                    ¿Eliminar &quot;{plan.alias}&quot;?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removePlan(plan.id)
                        setConfirmDeleteId(null)
                      }}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Eliminar plan"
                    title="Eliminar plan"
                    onClick={() => setConfirmDeleteId(plan.id)}
                    className="absolute right-0 top-0 text-slate-300 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenId(plan.id)}
                    className="block w-full text-left"
                  >
                    <p className="truncate pr-6 text-sm font-semibold text-slate-900">
                      {plan.alias}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {OBJETIVO_LABEL[plan.objetivo] ?? plan.objetivo} ·{' '}
                      {formatDate(plan.createdAt)}
                    </p>

                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Pago total acumulado
                    </p>
                    <div className="mt-1 space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Actual</span>
                        <span className="text-slate-600">
                          {formatCurrency(summary.actual.pagoTotalClp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Con plan aplicado</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(summary.plan.pagoTotalClp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-1">
                        <span className="text-slate-500">Ahorro</span>
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(summary.ahorroClp)}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <EstimateNote className="mt-3" />

      {openPlan && <SavedPlanModal plan={openPlan} onClose={() => setOpenId(null)} />}
    </>
  )
}
