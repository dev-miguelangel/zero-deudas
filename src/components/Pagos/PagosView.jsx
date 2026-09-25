import { useState } from 'react'
import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { useDebts } from '../../context/DebtsContext'
import { useIndicadores } from '../../context/IndicadoresContext'
import { isHipotecario } from '../../domain/debts'
import {
  currentMonthKey,
  isPaidForMonth,
  isSettled,
  markPaid,
  monthLabel,
  shiftMonthKey,
  unmarkLastPaid,
} from '../../domain/payments'
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, GridIcon, TableIcon } from '../icons'
import PagosCardsView from './PagosCardsView'
import PagosTableView from './PagosTableView'

const VIEWS = [
  { id: 'table', label: 'Tabla', icon: TableIcon },
  { id: 'cards', label: 'Tarjetas', icon: GridIcon },
]

export default function PagosView() {
  const { debts, updateDebt } = useDebts()
  const { formatAmount } = useCurrencyDisplay()
  const { data: indicadores } = useIndicadores()
  const ufValue = indicadores?.uf?.valor ?? null
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [view, setView] = useState('table')
  const isCurrentMonth = monthKey === currentMonthKey()
  const isFutureMonth = monthKey > currentMonthKey()

  if (debts.length === 0) {
    return <p className="text-sm text-slate-600">Agrega una deuda para ver sus pagos.</p>
  }

  const activeDebts = debts.filter((debt) => !isSettled(debt))
  const settledDebts = debts.filter((debt) => isSettled(debt))

  function clpAmount(debt, amount) {
    if (!isHipotecario(debt)) return amount
    return ufValue ? amount * ufValue : null
  }

  let totalMes = 0
  let pagadoMes = 0
  let pagadoCount = 0
  let unknownAmount = false

  activeDebts.forEach((debt) => {
    const paid = isPaidForMonth(debt, monthKey)
    const record = paid ? debt.pagos.find((p) => p.mes === monthKey) : null
    const monto = record ? record.monto : debt.pagoMinimo
    const clp = clpAmount(debt, monto)
    if (clp == null) {
      unknownAmount = true
    } else {
      totalMes += clp
      if (paid) pagadoMes += clp
    }
    if (paid) pagadoCount += 1
  })

  const pendienteMes = totalMes - pagadoMes
  const progresoPct =
    activeDebts.length > 0 ? Math.round((pagadoCount / activeDebts.length) * 100) : 0

  function handleToggle(debt) {
    const paid = isPaidForMonth(debt, monthKey)
    updateDebt(debt.id, paid ? unmarkLastPaid(debt) : markPaid(debt, monthKey))
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMonthKey((prev) => shiftMonthKey(prev, -1))}
          aria-label="Mes anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:border-slate-400"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Pagos de {monthLabel(monthKey)}
          </h2>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setMonthKey(currentMonthKey())}
              className="text-xs font-medium text-emerald-700 underline"
            >
              Volver a hoy
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMonthKey((prev) => shiftMonthKey(prev, 1))}
          aria-label="Mes siguiente"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:border-slate-400"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total del mes</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {unknownAmount ? '—' : formatAmount(totalMes)}
            </p>
          </div>
          <div className="rounded-md bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Pagado</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {unknownAmount ? '—' : formatAmount(pagadoMes)}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Pendiente</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {unknownAmount ? '—' : formatAmount(pendienteMes)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {pagadoCount} de {activeDebts.length} cuotas pagadas
            </span>
            <span>{progresoPct}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
        </div>
      </div>

      {isFutureMonth && (
        <p className="text-xs text-slate-500">
          Estás viendo un mes futuro — puedes ver el monto estimado, pero no marcarlo como
          pagado todavía.
        </p>
      )}

      <div className="flex justify-end">
        <div className="flex rounded-md border border-slate-300 p-0.5 text-xs font-medium">
          {VIEWS.map((v) => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-label={v.label}
                aria-pressed={view === v.id}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 transition-colors ${
                  view === v.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {view === 'table' ? (
        <PagosTableView
          debts={activeDebts}
          monthKey={monthKey}
          isFutureMonth={isFutureMonth}
          ufValue={ufValue}
          onToggle={handleToggle}
        />
      ) : (
        <PagosCardsView
          debts={activeDebts}
          monthKey={monthKey}
          isFutureMonth={isFutureMonth}
          onToggle={handleToggle}
        />
      )}

      {settledDebts.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
            Liquidadas
          </h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settledDebts.map((debt) => (
              <div
                key={debt.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">{debt.acreedor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
