import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { minAbonoLegalClp } from '../../domain/paymentPlan'
import { formatRate } from '../../lib/format'
import { debtTypeIcon } from '../debtTypes'
import NumericInput from '../NumericInput'

export default function PriorityOrderCards({ priorityOrder, ufValue, amounts, onChangeAmount, resultFor }) {
  const { formatAmount } = useCurrencyDisplay()
  return (
    <ol className="mt-2 divide-y divide-slate-100 text-xs">
      {priorityOrder.map((debt, i) => {
        const Icon = debtTypeIcon(debt.tipo)
        const minimoClp = minAbonoLegalClp(debt, ufValue)
        const montoManual = amounts[debt.id] ?? ''
        const resultado = resultFor(debt, montoManual)

        return (
          <li key={debt.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
              {i + 1}
            </span>
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="min-w-0 truncate text-slate-700">
              {debt.acreedor}
              {debt.alias ? ` · ${debt.alias}` : ''}
            </span>
            <span className="shrink-0 text-slate-500">
              {formatRate(debt.tasaInteresAnual)}% anual
            </span>
            <span className="shrink-0 text-slate-400">
              mín. {minimoClp != null ? formatAmount(minimoClp) : '—'}
            </span>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <label htmlFor={`abono-${debt.id}`} className="text-slate-400">
                Abonar:
              </label>
              <NumericInput
                id={`abono-${debt.id}`}
                value={montoManual}
                onChange={(value) => onChangeAmount(debt.id, value)}
                className="w-24 rounded border border-slate-300 px-1.5 py-0.5 text-xs focus:border-slate-500 focus:outline-none"
              />
            </div>

            {resultado && (
              <p className="basis-full text-[11px] text-slate-500">
                {resultado.fullyPaid ? (
                  <span className="font-medium text-emerald-700">Salda completa</span>
                ) : (
                  <>
                    Saldo {formatAmount(resultado.saldoRestanteClp)}
                    {resultado.bajoMinimoLegal && (
                      <span className="text-amber-700"> · bajo el 10% mínimo legal</span>
                    )}
                  </>
                )}
                {resultado.interestSavedNetoClp != null &&
                  ` · Ahorro neto ${formatAmount(Math.max(0, resultado.interestSavedNetoClp))}`}
                {resultado.nuevaCuotaClp != null &&
                  ` · Cuota nueva ${formatAmount(resultado.nuevaCuotaClp)}`}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
