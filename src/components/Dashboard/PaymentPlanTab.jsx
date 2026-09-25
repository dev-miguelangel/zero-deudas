import { useState } from 'react'
import { usePlans } from '../../context/PlansContext'
import { buildPaymentPlan, snapshotAllocations } from '../../domain/paymentPlan'
import { formatCurrency } from '../../lib/format'
import { InfoIcon } from '../icons'
import NumericInput from '../NumericInput'
import NormativaModal from './NormativaModal'
import PlanResultPanel from './PlanResultPanel'
import PriorityOrderList from './PriorityOrderList'
import SavePlanModal from './SavePlanModal'

const OBJETIVOS = [
  { id: 'interes', label: 'Ahorrar en intereses' },
  { id: 'flujo', label: 'Bajar gasto mensual' },
]

/** Suma, en pesos, cuánto ahorra en intereses (neto de comisión) repartir el monto según este plan. */
function totalInterestSavingsClp(plan) {
  return plan.allocations.reduce((sum, a) => sum + Math.max(0, a.interestSavedNetoClp ?? 0), 0)
}

/**
 * Suma, en pesos por mes, cuánto flujo de caja libera este plan: la cuota
 * completa de las deudas que quedan saldadas, más la reducción de cuota
 * de las que solo reciben un abono parcial.
 */
function totalMonthlyReliefClp(plan) {
  return plan.allocations.reduce((sum, a) => {
    if (a.fullyPaid) return sum + a.cuotaActualClp
    return sum + (a.ahorroCuotaMensualClp ?? 0)
  }, 0)
}

/**
 * Suma, en pesos, el ahorro en intereses acumulado (neto de comisión) de
 * este plan "bajar gasto mensual": las deudas que quedan saldadas
 * eliminan su interés igual que en "ahorrar en intereses", y las que
 * solo reciben abono parcial ahorran según la modalidad "reducción de
 * cuota" (menos que reduciendo plazo, pero no cero).
 */
function totalAccumulatedSavingsFlujoClp(plan) {
  return plan.allocations.reduce((sum, a) => {
    if (a.fullyPaid) return sum + Math.max(0, a.interestSavedNetoClp ?? 0)
    const netoOpcion2 =
      a.interestSavedCuotaClp != null ? a.interestSavedCuotaClp - a.comisionClp : null
    return sum + Math.max(0, netoOpcion2 ?? 0)
  }, 0)
}

function StepHeading({ number, title, caption }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {caption && <p className="mt-0.5 text-xs text-slate-500">{caption}</p>}
      </div>
    </div>
  )
}

export default function PaymentPlanTab({ debts, ufValue }) {
  const { savePlan } = usePlans()
  const [montoDisponible, setMontoDisponible] = useState('')
  const [showNormativa, setShowNormativa] = useState(false)
  const [objetivo, setObjetivo] = useState('interes')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const montoNumber = montoDisponible === '' ? 0 : montoDisponible
  const tieneMonto = Number(montoDisponible) > 0

  const planInteres = buildPaymentPlan(debts, montoNumber, ufValue, 'interes')
  const planFlujo = buildPaymentPlan(debts, montoNumber, ufValue, 'flujo')
  const plan = objetivo === 'flujo' ? planFlujo : planInteres

  if (debts.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Selecciona al menos una deuda para armar un plan de pago.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <StepHeading number={1} title="¿Qué prefieres priorizar?" />
            <div className="mt-2 flex rounded-md border border-slate-300 p-0.5 text-xs font-medium">
              {OBJETIVOS.map((o) => {
                const totalPlan = o.id === 'flujo' ? planFlujo : planInteres
                const subtitleLines = !tieneMonto
                  ? []
                  : o.id === 'flujo'
                    ? [
                        `Liberas ${formatCurrency(totalMonthlyReliefClp(totalPlan))}/mes`,
                        `Ahorro total: ${formatCurrency(totalAccumulatedSavingsFlujoClp(totalPlan))}`,
                      ]
                    : [`Ahorras ${formatCurrency(totalInterestSavingsClp(totalPlan))}`]
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setObjetivo(o.id)}
                    aria-pressed={objetivo === o.id}
                    className={`flex-1 rounded px-2 py-1.5 text-center transition-colors ${
                      objetivo === o.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="block">{o.label}</span>
                    {subtitleLines.map((line) => (
                      <span
                        key={line}
                        className={`block text-[10px] font-normal ${
                          objetivo === o.id ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {line}
                      </span>
                    ))}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <StepHeading number={2} title="¿Cuánto tienes disponible para abonar?" />
            <NumericInput
              id="montoDisponible"
              value={montoDisponible}
              onChange={setMontoDisponible}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          {objetivo === 'flujo' ? (
            <>
              Ordenamos tus deudas de <strong>menor a mayor saldo</strong> — estrategia
              &quot;bola de nieve&quot;: pagar primero las más chicas te permite saldarlas
              por completo antes, eliminando su cuota entera — es lo que más rápido baja tu
              gasto mensual total. A veces conviene repartir el abono entre dos deudas
              chicas en vez de concentrarlo en una sola deuda grande.
            </>
          ) : (
            <>
              Ordenamos tus deudas de <strong>mayor a menor tasa de interés real</strong> —
              estrategia &quot;avalancha&quot;: pagar primero la más cara es lo que menos
              interés total te hace pagar en el tiempo, sin importar cuál tenga el saldo más
              grande.
            </>
          )}
        </div>
      </div>

      {tieneMonto && (
        <div className="rounded-lg border border-slate-200 p-4">
          <PlanResultPanel
            title={
              <StepHeading
                number={3}
                title={`Con ${formatCurrency(Number(montoDisponible))}, te conviene`}
                caption="Reparto automático de ese monto entre las deudas seleccionadas, siguiendo el orden de prioridad de abajo."
              />
            }
            actions={
              plan.allocations.length > 0 && (
                <div className="flex items-center gap-2">
                  {justSaved && <span className="text-xs text-emerald-700">Guardado ✓</span>}
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Guardar plan
                  </button>
                </div>
              )
            }
            allocations={plan.allocations}
            objetivo={objetivo}
            sobranteClp={plan.sobranteClp}
            ufValue={ufValue}
          />
        </div>
      )}

      {showSaveModal && (
        <SavePlanModal
          onCancel={() => setShowSaveModal(false)}
          onSave={(alias) => {
            savePlan({
              alias,
              objetivo,
              montoDisponible: Number(montoDisponible),
              ufValue,
              allocations: snapshotAllocations(plan.allocations),
              sobranteClp: plan.sobranteClp,
            })
            setShowSaveModal(false)
            setJustSaved(true)
            setTimeout(() => setJustSaved(false), 2500)
          }}
        />
      )}

      <div className="rounded-lg border border-slate-200 p-4">
        <StepHeading
          number={4}
          title="Orden recomendado para pagar"
          caption="Según lo que elegiste arriba. Prueba un abono puntual a cualquier deuda para explorar su efecto — no usa el monto disponible."
        />
        <PriorityOrderList priorityOrder={plan.priorityOrder} ufValue={ufValue} />
        {plan.excluded.length > 0 && (
          <p className="mt-2 text-xs text-amber-700">
            Sin valor de UF, no se pueden incluir en este plan:{' '}
            {plan.excluded.map((d) => d.acreedor).join(', ')}.
          </p>
        )}
      </div>

      <div className="flex items-start gap-1.5 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowNormativa(true)}
          aria-label="Ver normativa completa (Art. 10, Ley 18.010)"
          title="Ver normativa completa (Art. 10, Ley 18.010)"
          className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-600"
        >
          <InfoIcon className="h-3.5 w-3.5" />
        </button>
        <p className="text-[11px] text-slate-400">
          Mínimo legal, modalidad y comisión de prepago según el Art. 10 de la Ley N° 18.010
          y normativa de la CMF sobre prepagos en Chile — son estimaciones para orientarte,
          la condición exacta la confirma tu banco. El cálculo asume que mantienes el valor
          de la cuota y reduces el plazo (la modalidad que más ahorra en intereses); el
          banco también puede ofrecerte reducir la cuota manteniendo el plazo, lo que libera
          flujo de caja pero ahorra menos.
        </p>
      </div>

      {showNormativa && <NormativaModal onClose={() => setShowNormativa(false)} />}
    </div>
  )
}
