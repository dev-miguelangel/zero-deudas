import { debtCalculatedSummary, isHipotecario } from '../../domain/debts'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonthsShort, formatUF } from '../../lib/format'
import { debtTypeColor, debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { PencilIcon, TrashIcon } from '../icons'

export default function DebtsTableView({ debts, ufValue, onEdit, onDelete }) {
  const hasUnavailableRate = debts.some((d) => !debtCalculatedSummary(d).tasaDisponible)

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500">
            <th className="p-3 text-left font-medium">Deuda</th>
            <th className="p-3 text-left font-medium">Tipo</th>
            <th className="p-3 text-right font-medium">Saldo</th>
            <th className="p-3 text-right font-medium">Tasa real</th>
            <th className="p-3 text-right font-medium">Monto total</th>
            <th className="p-3 text-right font-medium">Tiempo restante</th>
            <th className="p-3 text-right font-medium">Pago en exceso</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {debts.map((debt) => {
            const hipotecario = isHipotecario(debt)
            const formatAmount = hipotecario ? formatUF : formatCurrency
            const summary = debtCalculatedSummary(debt)
            const payoff = simulate(debt)
            const Icon = debtTypeIcon(debt.tipo)

            return (
              <tr key={debt.id} className="align-top hover:bg-slate-50">
                <td className="p-3">
                  <p className="font-medium text-slate-900">{debt.acreedor}</p>
                  {debt.alias && <p className="text-xs text-slate-400">{debt.alias}</p>}
                </td>
                <td className="p-3">
                  <span
                    className="flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${debtTypeColor(debt.tipo)}1a`, color: debtTypeColor(debt.tipo) }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {debtTypeLabel(debt.tipo)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span className="font-semibold text-slate-900">{formatAmount(summary.saldo)}</span>
                  {hipotecario && (
                    <p className="text-xs text-slate-400">
                      {ufValue ? `≈ ${formatCurrency(summary.saldo * ufValue)}` : 'Cargando UF…'}
                    </p>
                  )}
                </td>
                <td className="p-3 text-right text-slate-700">
                  {summary.tasaDisponible ? `${summary.tasaInteresAnual}%` : `${summary.tasaInteresAnual}%*`}
                </td>
                <td className="p-3 text-right text-slate-700">
                  {summary.montoTotalAPagar != null ? formatAmount(summary.montoTotalAPagar) : '—'}
                </td>
                <td className="p-3 text-right text-slate-700">
                  {payoff.error ? (
                    <span
                      className="text-red-600"
                      title={describeSimulationError(payoff.error, debt) ?? undefined}
                    >
                      —
                    </span>
                  ) : (
                    formatMonthsShort(payoff.months)
                  )}
                </td>
                <td className="p-3 text-right text-slate-700">
                  {summary.excesoMonto != null
                    ? `${formatAmount(summary.excesoMonto)} (${summary.excesoPct}%)`
                    : '—'}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Editar"
                      onClick={() => onEdit(debt)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      onClick={() => onDelete(debt)}
                      className="text-slate-500 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {hasUnavailableRate && (
        <p className="border-t border-slate-100 p-2 text-xs text-slate-400">
          * Tasa 0% de respaldo — sin monto original no se pudo calcular una tasa real.
        </p>
      )}
    </div>
  )
}
