import { useState } from 'react'
import { useIndicadores } from '../../context/IndicadoresContext'
import { useDebts } from '../../context/DebtsContext'
import { useVault } from '../../context/VaultContext'
import ConfirmPassphraseModal from '../ConfirmPassphraseModal'
import { debtTypeIcon } from '../debtTypes'
import { DEBT_TYPES, debtCalculatedSummary, isHipotecario } from '../../domain/debts'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonthsShort, formatUF } from '../../lib/format'
import { PencilIcon, PlusIcon, TrashIcon } from '../icons'
import DebtFormModal from './DebtFormModal'

export default function DebtList() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebts()
  const { data: indicadores } = useIndicadores()
  const { verifyPassphrase } = useVault()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [filterTipo, setFilterTipo] = useState('todos')

  const ufValue = indicadores?.uf?.valor ?? null
  const visibleDebts =
    filterTipo === 'todos' ? debts : debts.filter((debt) => debt.tipo === filterTipo)

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Deudas</h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <PlusIcon className="h-4 w-4" />
          Agregar
        </button>
      </div>

      {debts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterTipo('todos')}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filterTipo === 'todos'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            Todos
          </button>
          {DEBT_TYPES.map((type) => {
            const Icon = debtTypeIcon(type.id)
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFilterTipo(type.id)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                  filterTipo === type.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {type.label}
              </button>
            )
          })}
        </div>
      )}

      {debts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay deudas registradas.</p>
      ) : visibleDebts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay deudas de este tipo.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {DEBT_TYPES.map((type) => {
            const typeDebts = visibleDebts.filter((debt) => debt.tipo === type.id)
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
                            {debt.alias && (
                              <p className="text-xs text-slate-400">{debt.alias}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              aria-label="Editar"
                              onClick={() => setEditing(debt)}
                              className="text-slate-500 hover:text-slate-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Eliminar"
                              onClick={() => setDeleting(debt)}
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
                            <dt className="text-slate-500">Tasa real</dt>
                            <dd className="text-right font-semibold text-slate-900">
                              {summary.tasaDisponible
                                ? `${summary.tasaInteresAnual}% anual`
                                : `${summary.tasaInteresAnual}% (sin monto original)`}
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
                              Sin el monto original no se puede calcular la tasa real: se usa
                              0% y el saldo es solo cuotas que faltan × valor de la cuota.
                            </p>
                          )}
                          {payoff.error && (
                            <p className="mt-2 text-xs text-red-600">
                              {describeSimulationError(payoff.error, debt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {creating && (
        <DebtFormModal
          onClose={() => setCreating(false)}
          onSubmit={(values) => {
            addDebt(values)
            setCreating(false)
          }}
        />
      )}

      {editing && (
        <DebtFormModal
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSubmit={(values) => {
            updateDebt(editing.id, values)
            setEditing(null)
          }}
        />
      )}

      {deleting && (
        <ConfirmPassphraseModal
          message={
            <>
              Esto borra permanentemente la deuda con <strong>{deleting.acreedor}</strong>
              {deleting.alias ? ` (${deleting.alias})` : ''} y su historial de pagos. No se
              puede deshacer.
            </>
          }
          confirmLabel="Eliminar deuda"
          verify={verifyPassphrase}
          onConfirm={() => removeDebt(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  )
}
