import { useMemo, useState } from 'react'
import { debtCalculatedSummary, isHipotecario, matchesAcreedorOrAlias } from '../../domain/debts'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonthsShort, formatRate, formatUF } from '../../lib/format'
import { compareValues } from '../../lib/sort'
import { debtTypeColor, debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { PencilIcon, TableIcon, TrashIcon } from '../icons'
import SearchInput from '../SearchInput'
import SortableTh from '../SortableTh'

const COLUMNS = [
  { key: 'acreedor', label: 'Acreedor', align: 'left' },
  { key: 'alias', label: 'Alias', align: 'left' },
  { key: 'tipo', label: 'Tipo', align: 'left' },
  { key: 'saldo', label: 'Saldo', align: 'right' },
  { key: 'tasa', label: 'Tasa real', align: 'right' },
  { key: 'montoTotal', label: 'Monto total', align: 'right' },
  { key: 'tiempoRestante', label: 'Tiempo restante', align: 'right' },
  { key: 'exceso', label: 'Pago en exceso', align: 'right' },
]

export default function DebtsTableView({ debts, ufValue, onEdit, onDelete, onViewAmortization }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('acreedor')
  const [sortDir, setSortDir] = useState('asc')

  const rows = useMemo(() => {
    return debts
      .filter((debt) => matchesAcreedorOrAlias(debt, search))
      .map((debt) => {
        const hipotecario = isHipotecario(debt)
        const formatAmount = hipotecario ? formatUF : formatCurrency
        const summary = debtCalculatedSummary(debt)
        const payoff = simulate(debt)
        // Para ordenar montos de forma justa entre CLP y UF, todo se compara
        // en su equivalente en pesos (null si la deuda es en UF y aún no
        // carga el valor del día, para que quede al final del orden).
        const toCLP = (v) => (v == null ? null : hipotecario ? (ufValue ? v * ufValue : null) : v)

        return {
          debt,
          hipotecario,
          formatAmount,
          summary,
          payoff,
          sortValues: {
            acreedor: (debt.acreedor ?? '').toLowerCase(),
            alias: (debt.alias ?? '').toLowerCase(),
            tipo: debtTypeLabel(debt.tipo),
            saldo: toCLP(summary.saldo),
            tasa: summary.tasaInteresAnual,
            montoTotal: toCLP(summary.montoTotalAPagar),
            tiempoRestante: payoff.error ? null : payoff.months,
            exceso: toCLP(summary.excesoMonto),
          },
        }
      })
      .sort((a, b) => compareValues(a.sortValues[sortKey], b.sortValues[sortKey], sortDir))
  }, [debts, ufValue, search, sortKey, sortDir])

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const hasUnavailableRate = rows.some(({ summary }) => !summary.tasaDisponible)

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por acreedor o alias…" />

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[860px] text-sm">
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
              rows.map(({ debt, hipotecario, formatAmount, summary, payoff }) => {
                const Icon = debtTypeIcon(debt.tipo)
                return (
                  <tr key={debt.id} className="align-top hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{debt.acreedor}</td>
                    <td className="p-3 text-slate-600">{debt.alias || '—'}</td>
                    <td className="p-3">
                      <span
                        className="flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${debtTypeColor(debt.tipo)}1a`,
                          color: debtTypeColor(debt.tipo),
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {debtTypeLabel(debt.tipo)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-semibold text-slate-900">
                        {formatAmount(summary.saldo)}
                      </span>
                      {hipotecario && (
                        <p className="text-xs text-slate-400">
                          {ufValue ? `≈ ${formatCurrency(summary.saldo * ufValue)}` : 'Cargando UF…'}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-right text-slate-700">
                      {summary.tasaDisponible
                        ? `${formatRate(summary.tasaInteresAnual)}%`
                        : `${formatRate(summary.tasaInteresAnual)}%*`}
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
                          aria-label="Ver tabla de amortización"
                          onClick={() => onViewAmortization(debt)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <TableIcon className="h-4 w-4" />
                        </button>
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
              })
            )}
          </tbody>
        </table>
        {hasUnavailableRate && (
          <p className="border-t border-slate-100 p-2 text-xs text-slate-400">
            * Tasa 0% de respaldo — sin monto original no se pudo calcular una tasa real.
          </p>
        )}
      </div>
    </div>
  )
}
