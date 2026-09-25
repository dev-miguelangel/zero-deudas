import { useCurrencyDisplay } from '../../context/CurrencyDisplayContext'
import { isHipotecario } from '../../domain/debts'
import { isPaidForMonth } from '../../domain/payments'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { CheckCircleIcon, CheckIcon } from '../icons'

export default function PagosCardsView({ debts, monthKey, isFutureMonth, onToggle }) {
  const { formatAmount } = useCurrencyDisplay()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {debts.map((debt) => {
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

            <p className={`mt-3 text-2xl font-bold ${paid ? 'text-emerald-700' : 'text-slate-900'}`}>
              {formatAmount(monto, hipotecario ? 'UF' : 'CLP')}
            </p>
            <p className="text-xs text-slate-500">
              Saldo actual: {formatAmount(debt.saldo, hipotecario ? 'UF' : 'CLP')}
            </p>

            <button
              type="button"
              onClick={() => onToggle(debt)}
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
  )
}
