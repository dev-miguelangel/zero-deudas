import { summarizePlanComparison } from '../../domain/paymentPlan'
import { formatCurrency } from '../../lib/format'

export default function PlanComparisonSummary({ allocations, objetivo, ufValue }) {
  if (allocations.length === 0) return null

  const summary = summarizePlanComparison(allocations, objetivo, ufValue)
  const rows = [
    {
      label: 'Pago total acumulado',
      actual: summary.actual.pagoTotalClp,
      plan: summary.plan.pagoTotalClp,
      ahorro: summary.ahorroClp,
      highlight: true,
    },
    {
      label: 'Intereses',
      actual: summary.actual.interesClp,
      plan: summary.plan.interesClp,
      ahorro: summary.actual.interesClp - summary.plan.interesClp,
    },
    {
      label: 'Pago mensual',
      actual: summary.actual.pagoMensualClp,
      plan: summary.plan.pagoMensualClp,
      ahorro: summary.actual.pagoMensualClp - summary.plan.pagoMensualClp,
    },
  ]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Cómo estás vs. con el plan aplicado
      </p>
      <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500">
              <th className="p-2 text-left font-medium">Métrica (CLP)</th>
              <th className="p-2 text-right font-medium">Actual</th>
              <th className="p-2 text-right font-medium">Con plan aplicado</th>
              <th className="p-2 text-right font-medium">Ahorro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.label} className={row.highlight ? 'bg-emerald-50/60' : undefined}>
                <td
                  className={`p-2 ${row.highlight ? 'font-semibold text-slate-900' : 'text-slate-700'}`}
                >
                  {row.label}
                </td>
                <td className="p-2 text-right text-slate-500">{formatCurrency(row.actual)}</td>
                <td className="p-2 text-right font-medium text-slate-900">
                  {formatCurrency(row.plan)}
                </td>
                <td
                  className={`p-2 text-right font-semibold ${
                    row.ahorro > 0 ? 'text-emerald-700' : 'text-slate-400'
                  } ${row.highlight ? 'text-base' : ''}`}
                >
                  {formatCurrency(row.ahorro)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        El pago mensual &quot;con plan aplicado&quot; usa la modalidad{' '}
        {objetivo === 'flujo' ? '"reducción de cuota"' : '"reducción de plazo" (se mantiene igual)'}{' '}
        en las deudas que no quedan saldadas por completo. El ahorro de &quot;Pago total
        acumulado&quot; ya descuenta la comisión de prepago estimada.
      </p>
    </div>
  )
}
