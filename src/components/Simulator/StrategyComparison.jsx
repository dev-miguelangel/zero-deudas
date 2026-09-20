import { compareStrategies, describeSimulationError } from '../../domain/simulator'
import { formatCurrency, formatMonths } from '../../lib/format'

export default function StrategyComparison({ debts, extraPayment }) {
  if (debts.length === 0) return null

  const { snowball, avalanche } = compareStrategies(debts, extraPayment)

  const rows = [
    { label: 'Bola de Nieve', result: snowball },
    { label: 'Avalancha', result: avalanche },
  ]

  return (
    <div className="mt-6 rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900">Comparación</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2 pr-4 font-medium">Estrategia</th>
              <th className="py-2 pr-4 font-medium">Tiempo</th>
              <th className="py-2 font-medium">Interés total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, result }) => (
              <tr key={label} className="border-t border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-900">{label}</td>
                <td className="py-2 pr-4 text-slate-700">
                  {result.error ? '—' : formatMonths(result.months)}
                </td>
                <td className="py-2 text-slate-700">
                  {result.error ? (
                    <span className="text-red-600">
                      {describeSimulationError(result.error, debts)}
                    </span>
                  ) : (
                    formatCurrency(result.totalInterest)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
