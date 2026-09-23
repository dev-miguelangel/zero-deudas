import { DEBT_TYPES, debtCalculatedSummary, isHipotecario } from '../../domain/debts'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonthsShort, formatRate, formatUF } from '../../lib/format'
import { debtTypeIcon } from '../debtTypes'
import { PencilIcon, TableIcon, TrashIcon } from '../icons'

export default function DebtsCardsView({ debts, ufValue, onEdit, onDelete, onViewAmortization }) {
  return (
    <div className="space-y-6">
      {DEBT_TYPES.map((type) => {
        const typeDebts = debts.filter((debt) => debt.tipo === type.id)
        if (typeDebts.length === 0) return null
        const GroupIcon = debtTypeIcon(type.id)

        return (
          <div key={type.id}>
            <div className="flex items-center gap-2">
              <GroupIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">{type.label}</h3>
              <span className="text-xs text-slate-400">({typeDebts.length})</span>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {typeDebts.map((debt) => {
                const payoff = simulate(debt)
                const hipotecario = isHipotecario(debt)
                const summary = debtCalculatedSummary(debt)
                const formatAmount = hipotecario ? formatUF : formatCurrency
                return (
                  <div key={debt.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{debt.acreedor}</h4>
                        {debt.alias && <p className="text-xs text-slate-400">{debt.alias}</p>}
                      </div>
                      <div className="flex gap-2">
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
                    </div>

                    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Con esos datos, calculamos:
                      </p>
                      <dl className="mt-2 grid grid-cols-2 gap-y-2 text-xs">
                        {debt.montoOriginal != null && (
                          <>
                            <dt className="text-slate-500">Monto original del crédito</dt>
                            <dd className="text-right font-semibold text-slate-900">
                              {formatAmount(debt.montoOriginal)}
                            </dd>
                          </>
                        )}
                        <dt className="text-slate-500">Tasa real</dt>
                        <dd className="text-right font-semibold text-slate-900">
                          {summary.tasaDisponible
                            ? `${formatRate(summary.tasaInteresAnual)}% anual`
                            : `${formatRate(summary.tasaInteresAnual)}% (sin monto original)`}
                        </dd>
                        <dt className="text-slate-500">Monto total a pagar</dt>
                        <dd className="text-right font-semibold text-slate-900">
                          {summary.montoTotalAPagar != null
                            ? formatAmount(summary.montoTotalAPagar)
                            : '—'}
                        </dd>
                        <dt className="text-slate-500">Saldo</dt>
                        <dd className="text-right font-semibold text-slate-900">
                          {formatAmount(summary.saldo)}
                        </dd>
                        <dt className="text-slate-500">Tiempo restante</dt>
                        <dd className="text-right font-semibold text-slate-900">
                          {payoff.error ? '—' : formatMonthsShort(payoff.months)}
                        </dd>
                        <dt className="text-slate-500">Pago en exceso</dt>
                        <dd className="text-right font-semibold text-slate-900">
                          {summary.excesoMonto != null
                            ? `${formatAmount(summary.excesoMonto)} (${summary.excesoPct}%)`
                            : '—'}
                        </dd>
                      </dl>
                      {hipotecario && (
                        <p className="mt-2 text-xs text-slate-400">
                          {ufValue
                            ? `Saldo ≈ ${formatCurrency(summary.saldo * ufValue)} en pesos`
                            : 'Cargando valor de la UF…'}
                        </p>
                      )}
                      {!summary.tasaDisponible && (
                        <p className="mt-2 text-xs text-slate-500">
                          Sin el monto original no se puede calcular la tasa real: se usa 0%
                          y el saldo es solo cuotas que faltan × valor de la cuota.
                        </p>
                      )}
                      {payoff.error && (
                        <p className="mt-2 text-xs text-red-600">
                          {describeSimulationError(payoff.error, debt)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewAmortization(debt)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <TableIcon className="h-3.5 w-3.5" />
                      Ver tabla de amortización
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
