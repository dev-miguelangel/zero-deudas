import { useState } from 'react'
import { buildPaymentPlan, minAbonoLegalClp } from '../../domain/paymentPlan'
import { formatCurrency, formatMonthsShort, formatRate } from '../../lib/format'
import { debtTypeIcon } from '../debtTypes'
import { InfoIcon } from '../icons'
import NumericInput from '../NumericInput'
import NormativaModal from './NormativaModal'

export default function PaymentPlanTab({ debts, ufValue }) {
  const [montoDisponible, setMontoDisponible] = useState('')
  const [showNormativa, setShowNormativa] = useState(false)

  const plan = buildPaymentPlan(debts, montoDisponible === '' ? 0 : montoDisponible, ufValue)
  const tieneMonto = Number(montoDisponible) > 0

  if (debts.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Selecciona al menos una deuda para armar un plan de pago.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Ordenamos tus deudas de <strong>mayor a menor tasa de interés real</strong> —
        estrategia &quot;avalancha&quot;: pagar primero la más cara es lo que menos interés
        total te hace pagar en el tiempo, sin importar cuál tenga el saldo más grande.
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Orden recomendado para pagar
        </p>
        <ol className="mt-2 space-y-2">
          {plan.priorityOrder.map((debt, i) => {
            const Icon = debtTypeIcon(debt.tipo)
            const minimoClp = minAbonoLegalClp(debt, ufValue)
            return (
              <li key={debt.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="min-w-0 truncate text-slate-700">
                      {debt.acreedor}
                      {debt.alias ? ` · ${debt.alias}` : ''}
                    </span>
                    <span className="ml-auto shrink-0 text-xs font-semibold text-slate-500">
                      {formatRate(debt.tasaInteresAnual)}% anual
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Abono parcial mínimo legal (10% del saldo):{' '}
                    {minimoClp != null ? formatCurrency(minimoClp) : '—'}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
        {plan.excluded.length > 0 && (
          <p className="mt-2 text-xs text-amber-700">
            Sin valor de UF, no se pueden incluir en este plan:{' '}
            {plan.excluded.map((d) => d.acreedor).join(', ')}.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="montoDisponible" className="block text-sm font-medium text-slate-700">
          ¿Cuánto tienes disponible para abonar?
        </label>
        <NumericInput
          id="montoDisponible"
          value={montoDisponible}
          onChange={setMontoDisponible}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      {tieneMonto && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Con {formatCurrency(Number(montoDisponible))}, te conviene
          </p>

          {plan.allocations.length === 0 ? (
            <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
              No hay ninguna deuda a la que aplicarle ese monto (o todas quedaron fuera del
              plan por falta del valor de la UF).
            </p>
          ) : (
            <div className="space-y-2">
              {plan.allocations.map((allocation, i) => (
                <div
                  key={allocation.debt.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {i + 1}. {allocation.debt.acreedor}
                        {allocation.debt.alias ? ` · ${allocation.debt.alias}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Abono: {formatCurrency(allocation.appliedClp)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        allocation.fullyPaid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {allocation.fullyPaid ? 'Salda completamente' : 'Abono a capital'}
                    </span>
                  </div>

                  {!allocation.fullyPaid && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Queda con saldo de {formatCurrency(allocation.saldoRestanteClp)}.
                    </p>
                  )}

                  {allocation.bajoMinimoLegal && (
                    <p className="mt-1.5 text-xs text-amber-700">
                      Este abono queda bajo el 10% mínimo legal (
                      {formatCurrency(allocation.montoMinimoClp)}) — el banco no está
                      obligado a aceptarlo como abono parcial, aunque muchos igual lo hacen.
                      Conviene confirmarlo antes con tu ejecutivo.
                    </p>
                  )}

                  {allocation.interestSavedClp != null ? (
                    <>
                      <p className="mt-1.5 text-xs text-emerald-700">
                        Ahorro bruto en intereses: {formatCurrency(allocation.interestSavedClp)}
                        {allocation.monthsSaved > 0
                          ? ` (y ${formatMonthsShort(allocation.monthsSaved)} menos de plazo)`
                          : ''}
                        , comparado con seguir pagando solo el mínimo.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Comisión de prepago estimada ({allocation.debt.tipo === 'CH' ? '1,5' : '1'}{' '}
                        mes de interés sobre el abono): {formatCurrency(allocation.comisionClp)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-emerald-800">
                        Ahorro neto (descontando la comisión):{' '}
                        {formatCurrency(Math.max(0, allocation.interestSavedNetoClp))}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Esta deuda no convergía pagando el mínimo — este abono es un buen
                      primer paso para que empiece a bajar.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {plan.sobranteClp > 0 && (
            <p className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">
              Con ese monto alcanza para saldar por completo todas las deudas seleccionadas
              — te sobran {formatCurrency(plan.sobranteClp)}.
            </p>
          )}
        </div>
      )}

      <div className="flex items-start gap-1.5">
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
