import { describeExclusionReason } from '../../domain/simulator'
import { formatCurrency } from '../../lib/format'

export default function CombinedAmortizationTab({ selectedCount, result }) {
  if (selectedCount === 0) {
    return (
      <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Selecciona al menos una deuda para ver su amortización combinada.
      </p>
    )
  }

  if (result.months == null) {
    return (
      <p className="rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-500">
        Ninguna de las deudas seleccionadas pudo incluirse en el total.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {result.excluded.length > 0 && (
        <p className="text-xs text-amber-700">
          No se incluyeron en el total:{' '}
          {result.excluded
            .map(({ debt, reason }) => `${debt.acreedor} (${describeExclusionReason(reason)})`)
            .join(', ')}
          .
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-slate-500">Meses hasta liquidar todo</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">{result.months}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-slate-500">Interés total combinado</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {formatCurrency(result.totalInterest)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-slate-500">Cuota total (mes 1)</p>
          <p className="mt-0.5 text-sm font-bold text-slate-900">
            {formatCurrency(result.amortization[0].interest + result.amortization[0].principal)}
          </p>
        </div>
      </div>

      <div className="overflow-y-auto rounded-lg border border-slate-200 pr-3 md:max-h-[52vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-2 text-left font-medium">Mes</th>
              <th className="p-2 text-right font-medium">Interés</th>
              <th className="p-2 text-right font-medium">Capital</th>
              <th className="p-2 text-right font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.amortization.map((row) => {
              const isCurrent = row.month === 1
              return (
                <tr
                  key={row.month}
                  className={isCurrent ? 'border-l-2 border-emerald-500 bg-emerald-50' : ''}
                >
                  <td
                    className={`p-2 text-left ${
                      isCurrent ? 'font-semibold text-emerald-800' : 'text-slate-700'
                    }`}
                  >
                    {row.month}
                    {isCurrent && (
                      <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        Actual
                      </span>
                    )}
                  </td>
                  <td
                    className={`p-2 text-right ${isCurrent ? 'text-emerald-800' : 'text-slate-700'}`}
                  >
                    {formatCurrency(row.interest)}
                  </td>
                  <td
                    className={`p-2 text-right ${isCurrent ? 'text-emerald-800' : 'text-slate-700'}`}
                  >
                    {formatCurrency(row.principal)}
                  </td>
                  <td
                    className={`p-2 text-right font-medium ${
                      isCurrent ? 'text-emerald-900' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
