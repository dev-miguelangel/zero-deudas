import { useMemo, useState } from 'react'
import { isHipotecario, matchesAcreedorOrAlias } from '../../domain/debts'
import { isPaidForMonth } from '../../domain/payments'
import { formatCurrency, formatUF } from '../../lib/format'
import { compareValues } from '../../lib/sort'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { CheckCircleIcon, CheckIcon } from '../icons'
import SearchInput from '../SearchInput'
import SortableTh from '../SortableTh'

const COLUMNS = [
  { key: 'acreedor', label: 'Acreedor', align: 'left' },
  { key: 'alias', label: 'Alias', align: 'left' },
  { key: 'tipo', label: 'Tipo', align: 'left' },
  { key: 'monto', label: 'Monto', align: 'right' },
  { key: 'saldo', label: 'Saldo actual', align: 'right' },
  { key: 'estado', label: 'Estado', align: 'center' },
]

export default function PagosTableView({ debts, monthKey, isFutureMonth, ufValue, onToggle }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('acreedor')
  const [sortDir, setSortDir] = useState('asc')

  const rows = useMemo(() => {
    return debts
      .filter((debt) => matchesAcreedorOrAlias(debt, search))
      .map((debt) => {
        const paid = isPaidForMonth(debt, monthKey)
        const hipotecario = isHipotecario(debt)
        const record = paid ? debt.pagos.find((p) => p.mes === monthKey) : null
        const monto = record ? record.monto : debt.pagoMinimo
        const formatAmount = hipotecario ? formatUF : formatCurrency
        const toCLP = (v) => (hipotecario ? (ufValue ? v * ufValue : null) : v)

        return {
          debt,
          paid,
          monto,
          formatAmount,
          sortValues: {
            acreedor: (debt.acreedor ?? '').toLowerCase(),
            alias: (debt.alias ?? '').toLowerCase(),
            tipo: debtTypeLabel(debt.tipo),
            monto: toCLP(monto),
            saldo: toCLP(debt.saldo),
            estado: paid ? 1 : 0,
          },
        }
      })
      .sort((a, b) => compareValues(a.sortValues[sortKey], b.sortValues[sortKey], sortDir))
  }, [debts, monthKey, ufValue, search, sortKey, sortDir])

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por acreedor o alias…" />

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs">
              {COLUMNS.map((col) => (
                <SortableTh
                  key={col.key}
                  label={col.label}
                  align={col.align}
                  active={sortKey === col.key}
                  direction={sortDir}
                  onClick={() => handleSort(col.key)}
                />
              ))}
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="p-6 text-center text-sm text-slate-500">
                  No hay deudas que coincidan con &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              rows.map(({ debt, paid, formatAmount, monto }) => {
                const TypeIcon = debtTypeIcon(debt.tipo)
                return (
                  <tr key={debt.id} className={paid ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-medium text-slate-900">{debt.acreedor}</td>
                    <td className="p-3 text-slate-600">{debt.alias || '—'}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <TypeIcon className="h-3.5 w-3.5" />
                        {debtTypeLabel(debt.tipo)}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-semibold ${
                        paid ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatAmount(monto)}
                    </td>
                    <td className="p-3 text-right text-slate-700">{formatAmount(debt.saldo)}</td>
                    <td className="p-3 text-center">
                      {paid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onToggle(debt)}
                        disabled={isFutureMonth && !paid}
                        className={`flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                          paid
                            ? 'border border-emerald-600 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                        {paid ? 'Deshacer' : 'Marcar'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
