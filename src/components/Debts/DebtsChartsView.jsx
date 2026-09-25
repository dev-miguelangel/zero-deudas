import { useState } from 'react'
import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { DEBT_TYPES, isHipotecario, toCLPEquivalent } from '../../domain/debts'
import { projectUpcomingPayments } from '../../domain/simulator'
import { debtTypeColor, debtTypeLabel } from '../debtTypes'
import DonutChart from '../DonutChart'

const TYPE_ORDER = DEBT_TYPES.map((t) => t.id)

export default function DebtsChartsView({ debts, ufValue }) {
  const { formatAmount } = useCurrencyDisplay()
  const [excludedTypes, setExcludedTypes] = useState(() => new Set())
  const [excludedMonthTypes, setExcludedMonthTypes] = useState(() => new Set())
  const pendingUF = debts.some((d) => isHipotecario(d) && !ufValue)

  if (pendingUF) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600">
        Cargando el valor de la UF para poder graficar los créditos hipotecarios…
      </div>
    )
  }

  const converted = debts.map((d) => toCLPEquivalent(d, ufValue))

  const totalsByType = converted.reduce((acc, d) => {
    acc[d.tipo] = (acc[d.tipo] ?? 0) + d.saldo
    return acc
  }, {})

  const donutSegments = Object.entries(totalsByType)
    .map(([tipo, value]) => ({
      id: tipo,
      label: debtTypeLabel(tipo),
      value,
      valueLabel: formatAmount(value),
      color: debtTypeColor(tipo),
    }))
    .sort((a, b) => b.value - a.value)

  const visibleTotalSaldo = donutSegments
    .filter((s) => !excludedTypes.has(s.id))
    .reduce((sum, s) => sum + s.value, 0)

  function toggleType(tipo) {
    setExcludedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  function toggleMonthType(tipo) {
    setExcludedMonthTypes((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  const monthProjection = projectUpcomingPayments(debts, TYPE_ORDER, ufValue, 1)
  const monthSegments = monthProjection.byType
    .map((row) => ({
      id: row.tipo,
      label: debtTypeLabel(row.tipo),
      value: row.amounts[0] ?? 0,
      valueLabel: formatAmount(row.amounts[0] ?? 0),
      color: debtTypeColor(row.tipo),
    }))
    .sort((a, b) => b.value - a.value)

  const visibleMonthTotal = monthSegments
    .filter((s) => !excludedMonthTypes.has(s.id))
    .reduce((sum, s) => sum + s.value, 0)

  const groupsByAcreedorTipo = converted.reduce((acc, d) => {
    const key = `${d.acreedor}__${d.tipo}`
    if (!acc[key]) acc[key] = { key, acreedor: d.acreedor, tipo: d.tipo, saldo: 0, count: 0 }
    acc[key].saldo += d.saldo
    acc[key].count += 1
    return acc
  }, {})

  const rankedGroups = Object.values(groupsByAcreedorTipo).sort((a, b) => b.saldo - a.saldo)
  const maxGroupSaldo = Math.max(...rankedGroups.map((g) => g.saldo), 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Distribución del saldo por tipo
          </h3>
          <div className="mt-5">
            <DonutChart
              segments={donutSegments}
              totalLabel={formatAmount(visibleTotalSaldo)}
              showValues={false}
              showPercent
              excludedIds={excludedTypes}
              onToggle={toggleType}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">Toca un tipo para mostrarlo u ocultarlo.</p>
        </div>

        <div className="rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Distribución del pago de este mes por tipo
          </h3>
          <div className="mt-5">
            <DonutChart
              segments={monthSegments}
              totalLabel={formatAmount(visibleMonthTotal)}
              showValues={false}
              showPercent
              excludedIds={excludedMonthTypes}
              onToggle={toggleMonthType}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">Toca un tipo para mostrarlo u ocultarlo.</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900">Saldo por acreedor y tipo</h3>
        <div className="mt-5 space-y-3">
          {rankedGroups.map((group) => (
            <div key={group.key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: debtTypeColor(group.tipo) }}
                  />
                  <span className="min-w-0 truncate font-medium text-slate-700">
                    {group.acreedor} · {debtTypeLabel(group.tipo)}
                    {group.count > 1 ? ` (${group.count})` : ''}
                  </span>
                </span>
                <span className="shrink-0 font-semibold text-slate-900">
                  {formatAmount(group.saldo)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(3, (group.saldo / maxGroupSaldo) * 100)}%`,
                    backgroundColor: debtTypeColor(group.tipo),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
