import { formatCurrency } from '../../lib/format'

export default function PaymentPlanTable({ allocations, objetivo = 'interes' }) {
  const opcion1Highlight = objetivo === 'interes' ? 'bg-emerald-50' : ''
  const opcion2Highlight = objetivo === 'flujo' ? 'bg-emerald-50' : ''

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[780px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500">
            <th className="p-2 text-left font-medium">Deuda</th>
            <th className="p-2 text-right font-medium">Abono</th>
            <th className="p-2 text-center font-medium">Estado</th>
            <th className="p-2 text-right font-medium">Saldo restante</th>
            <th className={`p-2 text-right font-medium ${opcion1Highlight}`}>
              Opción 1 · Ahorro neto{objetivo === 'interes' ? ' ★' : ''}
            </th>
            <th className={`p-2 text-right font-medium ${opcion2Highlight}`}>
              Opción 2 · Cuota nueva{objetivo === 'flujo' ? ' ★' : ''}
            </th>
            <th className={`p-2 text-right font-medium ${opcion2Highlight}`}>
              Opción 2 · Ahorro bruto{objetivo === 'flujo' ? ' ★' : ''}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allocations.map((allocation, i) => (
            <tr key={allocation.debt.id} className="align-top hover:bg-slate-50">
              <td className="p-2">
                <p className="font-medium text-slate-900">
                  {i + 1}. {allocation.debt.acreedor}
                </p>
                {allocation.debt.alias && (
                  <p className="text-xs text-slate-400">{allocation.debt.alias}</p>
                )}
                {allocation.bajoMinimoLegal && (
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    Bajo el 10% mínimo legal
                  </p>
                )}
              </td>
              <td className="p-2 text-right text-slate-700">
                {formatCurrency(allocation.appliedClp)}
              </td>
              <td className="p-2 text-center">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    allocation.fullyPaid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {allocation.fullyPaid ? 'Salda completa' : 'Abono a capital'}
                </span>
              </td>
              <td className="p-2 text-right text-slate-700">
                {formatCurrency(allocation.saldoRestanteClp)}
              </td>
              <td className={`p-2 text-right font-medium text-emerald-700 ${opcion1Highlight}`}>
                {allocation.interestSavedNetoClp != null
                  ? formatCurrency(Math.max(0, allocation.interestSavedNetoClp))
                  : '—'}
              </td>
              <td className={`p-2 text-right text-slate-700 ${opcion2Highlight}`}>
                {allocation.nuevaCuotaClp != null
                  ? formatCurrency(allocation.nuevaCuotaClp)
                  : '—'}
              </td>
              <td className={`p-2 text-right text-emerald-700 ${opcion2Highlight}`}>
                {allocation.interestSavedCuotaClp != null
                  ? formatCurrency(allocation.interestSavedCuotaClp)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
