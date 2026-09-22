import { useIndicadores } from '../../context/IndicadoresContext'
import { isHipotecario, toCLPEquivalent } from '../../domain/debts'
import { simulate } from '../../domain/simulator'
import { formatCurrency, formatMonths } from '../../lib/format'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { TargetIcon } from '../icons'

const TYPE_ORDER = ['CH', 'CC', 'TC', 'LC', 'OT']

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
    </div>
  )
}
