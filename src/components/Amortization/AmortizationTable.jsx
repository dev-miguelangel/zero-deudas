import { useState } from 'react'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency } from '../../lib/format'
import { TableIcon } from '../icons'

export default function AmortizationTable({ debts, strategy, extraPayment }) {
  const [debtFilter, setDebtFilter] = useState('all')

  if (debts.length === 0) {
    return <p className="text-sm text-slate-600">No hay deudas registradas.</p>
  }

  const result = simulate(debts, strategy, extraPayment)

  if (result.error) {
    return (
      <p className="text-sm text-red-600">{describeSimulationError(result.error, debts)}</p>
    )
  }

  const rows =
    debtFilter === 'all'
      ? result.amortization
      : result.amortization.filter((row) => row.debtId === debtFilter)

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-slate-900" />
          <h2 className="text-lg font-semibold text-slate-900">Tabla de amortización</h2>
        </div>
        <select
          value={debtFilter}
          onChange={(e) => setDebtFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="all">Todas las deudas</option>
          {debts.map((debt) => (
            <option key={debt.id} value={debt.id}>
              {debt.acreedor}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-slate-500">
              <th className="py-2 pr-4 font-medium">Mes</th>
              <th className="py-2 pr-4 font-medium">Acreedor</th>
              <th className="py-2 pr-4 font-medium">Interés</th>
              <th className="py-2 pr-4 font-medium">Capital</th>
              <th className="py-2 font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.month}-${row.debtId}`} className="border-t border-slate-100">
                <td className="py-2 pr-4 text-slate-700">{row.month}</td>
                <td className="py-2 pr-4 text-slate-700">{row.acreedor}</td>
                <td className="py-2 pr-4 text-slate-700">
                  {formatCurrency(row.interest)}
                </td>
                <td className="py-2 pr-4 text-slate-700">
                  {formatCurrency(row.principal)}
                </td>
                <td className="py-2 text-slate-700">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
