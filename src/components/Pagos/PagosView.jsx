import { useState } from 'react'
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
import { formatCurrency, formatUF } from '../../lib/format'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { CheckCircleIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons'

export default function PagosView() {
  const { debts, updateDebt } = useDebts()
  const { data: indicadores } = useIndicadores()
  const ufValue = indicadores?.uf?.valor ?? null
  const [monthKey, setMonthKey] = useState(currentMonthKey())
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
              {unknownAmount ? '—' : formatCurrency(totalMes)}
            </p>
          </div>
          <div className="rounded-md bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Pagado</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {unknownAmount ? '—' : formatCurrency(pagadoMes)}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Pendiente</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {unknownAmount ? '—' : formatCurrency(pendienteMes)}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeDebts.map((debt) => {
          const paid = isPaidForMonth(debt, monthKey)
          const hipotecario = isHipotecario(debt)
          const record = paid ? debt.pagos.find((p) => p.mes === monthKey) : null
          const monto = record ? record.monto : debt.pagoMinimo
          const TypeIcon = debtTypeIcon(debt.tipo)

          return (
            <div
              key={debt.id}
              className={`rounded-lg border p-4 transition-colors ${
                paid ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{debt.acreedor}</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <TypeIcon className="h-3.5 w-3.5" />
                    {debtTypeLabel(debt.tipo)}
                  </span>
                </div>
                {paid && <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-600" />}
              </div>

              <p
                className={`mt-3 text-2xl font-bold ${
                  paid ? 'text-emerald-700' : 'text-slate-900'
                }`}
              >
                {hipotecario ? formatUF(monto) : formatCurrency(monto)}
              </p>
              <p className="text-xs text-slate-500">
                Saldo actual: {hipotecario ? formatUF(debt.saldo) : formatCurrency(debt.saldo)}
              </p>

              <button
                type="button"
                onClick={() => handleToggle(debt)}
                disabled={isFutureMonth && !paid}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  paid
                    ? 'border border-emerald-600 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckIcon className="h-4 w-4" />
                {paid ? 'Deshacer pago' : 'Marcar como pagada'}
              </button>
            </div>
          )
        })}
      </div>

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
