import { useIndicadores } from '../../context/IndicadoresContext'
import { isHipotecario, toCLPEquivalent } from '../../domain/debts'
import { currentMonthKey, monthLabelShort, shiftMonthKey } from '../../domain/payments'
import { projectUpcomingPayments, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonths } from '../../lib/format'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { TargetIcon } from '../icons'

const TYPE_ORDER = ['CH', 'CC', 'TC', 'LC', 'OT']
const HORIZON_MONTHS = 6

export default function Summary({ debts }) {
  const { data: indicadores } = useIndicadores()

  if (debts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600">
        Agrega al menos una deuda para ver tu resumen.
      </div>
    )
  }

  const ufValue = indicadores?.uf?.valor ?? null

  const rows = TYPE_ORDER.map((tipo) => {
    const typeDebts = debts.filter((d) => d.tipo === tipo)
    if (typeDebts.length === 0) return null

    const pendingUF = typeDebts.some((d) => isHipotecario(d) && !ufValue)
    const countedDebts = typeDebts
      .filter((d) => !isHipotecario(d) || ufValue)
      .map((d) => toCLPEquivalent(d, ufValue))

    const subtotal = countedDebts.reduce((sum, d) => sum + d.saldo, 0)
    const results = typeDebts.map((d) => simulate(d))
    const errored = results.find((r) => r.error)
    const months = errored ? null : Math.max(...results.map((r) => r.months))

    return {
      tipo,
      pendingUF,
      subtotalValue: pendingUF ? 'Cargando UF…' : formatCurrency(subtotal),
      monthsValue: errored ? '—' : formatMonths(months),
    }
  }).filter(Boolean)

  const monthKeys = Array.from({ length: HORIZON_MONTHS }, (_, i) =>
    shiftMonthKey(currentMonthKey(), i),
  )
  const projection = projectUpcomingPayments(debts, TYPE_ORDER, ufValue, HORIZON_MONTHS)

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2">
        <TargetIcon className="h-5 w-5 text-slate-900" />
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
      </div>
      <div
        className={`mt-4 grid gap-4 ${
          rows.length >= 3
            ? 'sm:grid-cols-2 lg:grid-cols-3'
            : rows.length === 2
              ? 'sm:grid-cols-2'
              : ''
        }`}
      >
        {rows.map((row) => {
          const Icon = debtTypeIcon(row.tipo)
          return (
            <div key={row.tipo} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-medium text-slate-900">{debtTypeLabel(row.tipo)}</span>
              </div>
              <div className="mt-3 flex gap-6">
                <div>
                  <p className="text-xs text-slate-500">Deuda total</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">{row.subtotalValue}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tiempo restante</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">{row.monthsValue}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Pagos de los próximos {HORIZON_MONTHS} meses
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium text-slate-500">Tipo</th>
                {monthKeys.map((mk) => (
                  <th key={mk} className="p-2 text-right font-medium text-slate-500">
                    {monthLabelShort(mk)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projection.byType.map((row) => {
                const Icon = debtTypeIcon(row.tipo)
                return (
                  <tr key={row.tipo}>
                    <td className="p-2 text-left font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                        {debtTypeLabel(row.tipo)}
                      </span>
                    </td>
                    {row.amounts.map((amount, i) => (
                      <td key={monthKeys[i]} className="p-2 text-right text-slate-900">
                        {amount == null ? 'Cargando UF…' : formatCurrency(amount)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-900">
                <td className="p-2 text-left">Total</td>
                {projection.totals.map((total, i) => (
                  <td key={monthKeys[i]} className="p-2 text-right">
                    {total == null ? 'Cargando UF…' : formatCurrency(total)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
