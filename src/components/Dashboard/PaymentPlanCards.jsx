import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { formatMonthsShort } from '../../lib/format'

function RecomendadoBadge() {
  return (
    <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
      Recomendado
    </span>
  )
}

export default function PaymentPlanCards({ allocations, objetivo = 'interes' }) {
  const { formatAmount } = useCurrencyDisplay()
  return (
    <div className="space-y-2">
      {allocations.map((allocation, i) => {
        const opcion1 = (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Opción 1 — Reducción de plazo (mantienes la cuota)
              </p>
              {objetivo === 'interes' && <RecomendadoBadge />}
            </div>
            <p className="mt-0.5 text-xs text-emerald-700">
              Ahorro bruto en intereses: {formatAmount(allocation.interestSavedClp)}
              {allocation.monthsSaved > 0
                ? ` (y ${formatMonthsShort(allocation.monthsSaved)} menos de plazo)`
                : ''}
              , comparado con seguir pagando solo el mínimo.
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Comisión de prepago estimada ({allocation.debt.tipo === 'CH' ? '1,5' : '1'} mes
              de interés sobre el abono): {formatAmount(allocation.comisionClp)}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-emerald-800">
              Ahorro neto (descontando la comisión):{' '}
              {formatAmount(Math.max(0, allocation.interestSavedNetoClp))}
            </p>
          </div>
        )

        const opcion2 = allocation.nuevaCuotaClp != null && (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-700">
                Opción 2 — Reducción de cuota (mantienes el plazo)
              </p>
              {objetivo === 'flujo' && <RecomendadoBadge />}
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              Con la misma tasa y las mismas {allocation.before.months} cuotas que te
              quedaban, tu cuota bajaría de {formatAmount(allocation.cuotaActualClp)} a{' '}
              <strong>{formatAmount(allocation.nuevaCuotaClp)}</strong>.
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Liberas {formatAmount(allocation.ahorroCuotaMensualClp)}/mes de flujo de
              caja.
            </p>
            {allocation.interestSavedCuotaClp != null && (
              <p className="mt-0.5 text-xs text-emerald-700">
                Ahorro bruto en intereses: {formatAmount(allocation.interestSavedCuotaClp)}{' '}
                (menos que la Opción 1, que ahorra{' '}
                {formatAmount(allocation.interestSavedClp)}).
              </p>
            )}
          </div>
        )

        const opciones =
          objetivo === 'flujo' && opcion2 ? [opcion2, opcion1] : [opcion1, opcion2]

        return (
          <div key={allocation.debt.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {i + 1}. {allocation.debt.acreedor}
                  {allocation.debt.alias ? ` · ${allocation.debt.alias}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Abono: {formatAmount(allocation.appliedClp)}
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
                Queda con saldo de {formatAmount(allocation.saldoRestanteClp)}.
              </p>
            )}

            {allocation.bajoMinimoLegal && (
              <p className="mt-1.5 text-xs text-amber-700">
                Este abono queda bajo el 10% mínimo legal (
                {formatAmount(allocation.montoMinimoClp)}) — el banco no está obligado a
                aceptarlo como abono parcial, aunque muchos igual lo hacen. Conviene
                confirmarlo antes con tu ejecutivo.
              </p>
            )}

            {allocation.interestSavedClp != null ? (
              <div className="mt-2 space-y-2">
                {opciones.map((opcion, idx) =>
                  opcion ? (
                    <div key={idx} className={idx > 0 ? 'border-t border-slate-100 pt-2' : ''}>
                      {opcion}
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Esta deuda no convergía pagando el mínimo — este abono es un buen primer
                paso para que empiece a bajar.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
