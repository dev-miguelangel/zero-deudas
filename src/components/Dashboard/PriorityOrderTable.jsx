import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { minAbonoLegalClp } from '../../domain/paymentPlan'
import { formatRate } from '../../lib/format'
import { debtTypeIcon } from '../debtTypes'
import NumericInput from '../NumericInput'

export default function PriorityOrderTable({ priorityOrder, ufValue, amounts, onChangeAmount, resultFor }) {
  const { formatAmount } = useCurrencyDisplay()
  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-500">
            <th className="p-2 text-left font-medium">#</th>
            <th className="p-2 text-left font-medium">Deuda</th>
            <th className="p-2 text-right font-medium">Tasa</th>
            <th className="p-2 text-right font-medium">Mín. legal (10%)</th>
            <th className="p-2 text-right font-medium">Abono directo</th>
            <th className="p-2 text-left font-medium">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {priorityOrder.map((debt, i) => {
            const Icon = debtTypeIcon(debt.tipo)
            const minimoClp = minAbonoLegalClp(debt, ufValue)
            const montoManual = amounts[debt.id] ?? ''
            const resultado = resultFor(debt, montoManual)

            return (
              <tr key={debt.id} className="align-top hover:bg-slate-50">
                <td className="p-2 text-slate-500">{i + 1}</td>
                <td className="p-2">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate">
                      {debt.acreedor}
                      {debt.alias ? ` · ${debt.alias}` : ''}
                    </span>
                  </span>
                </td>
                <td className="p-2 text-right text-slate-600">
                  {formatRate(debt.tasaInteresAnual)}%
                </td>
                <td className="p-2 text-right text-slate-500">
                  {minimoClp != null ? formatAmount(minimoClp) : '—'}
                </td>
                <td className="p-2 text-right">
                  <NumericInput
                    id={`abono-tabla-${debt.id}`}
                    value={montoManual}
                    onChange={(value) => onChangeAmount(debt.id, value)}
                    className="w-24 rounded border border-slate-300 px-1.5 py-1 text-right text-xs focus:border-slate-500 focus:outline-none"
                  />
                </td>
                <td className="p-2 text-slate-600">
                  {resultado ? (
                    <>
                      {resultado.fullyPaid ? (
                        <span className="font-medium text-emerald-700">Salda completa</span>
                      ) : (
                        <>Saldo {formatAmount(resultado.saldoRestanteClp)}</>
                      )}
                      {resultado.interestSavedNetoClp != null && (
                        <span>
                          {' '}
                          · Ahorro neto{' '}
                          {formatAmount(Math.max(0, resultado.interestSavedNetoClp))}
                        </span>
                      )}
                      {resultado.nuevaCuotaClp != null && (
                        <span> · Cuota nueva {formatAmount(resultado.nuevaCuotaClp)}</span>
                      )}
                      {resultado.bajoMinimoLegal && (
                        <span className="text-amber-700"> · bajo el mínimo legal</span>
                      )}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
