import { useState } from 'react'
import { useIndicadores } from '../../context/IndicadoresContext'
import { useDebts } from '../../context/DebtsContext'
import { useVault } from '../../context/VaultContext'
import ConfirmPassphraseModal from '../ConfirmPassphraseModal'
import { debtTypeIcon } from '../debtTypes'
import { DEBT_TYPES } from '../../domain/debts'
import EstimateNote from '../EstimateNote'
import { ChartBarIcon, GridIcon, PlusIcon, TableIcon } from '../icons'
import AmortizationTableModal from './AmortizationTableModal'
import DebtFormModal from './DebtFormModal'
import DebtsCardsView from './DebtsCardsView'
import DebtsChartsView from './DebtsChartsView'
import DebtsTableView from './DebtsTableView'

const VIEWS = [
  { id: 'table', label: 'Tabla', icon: TableIcon },
  { id: 'cards', label: 'Tarjetas', icon: GridIcon },
  { id: 'charts', label: 'Gráficos', icon: ChartBarIcon },
]

export default function DebtList() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebts()
  const { data: indicadores } = useIndicadores()
  const { verifyPassphrase } = useVault()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [viewingAmortization, setViewingAmortization] = useState(null)
  const [filterTipo, setFilterTipo] = useState('todos')
  const [view, setView] = useState('table')

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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
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

          <div className="flex shrink-0 rounded-md border border-slate-300 p-0.5 text-xs font-medium">
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
                    view === v.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {debts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay deudas registradas.</p>
      ) : visibleDebts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay deudas de este tipo.</p>
      ) : (
        <div className="mt-4">
          {view === 'table' && (
            <DebtsTableView
              debts={visibleDebts}
              ufValue={ufValue}
              onEdit={setEditing}
              onDelete={setDeleting}
              onViewAmortization={setViewingAmortization}
            />
          )}
          {view === 'charts' && <DebtsChartsView debts={visibleDebts} ufValue={ufValue} />}
          {view === 'cards' && (
            <DebtsCardsView
              debts={visibleDebts}
              ufValue={ufValue}
              onEdit={setEditing}
              onDelete={setDeleting}
              onViewAmortization={setViewingAmortization}
            />
          )}
          <EstimateNote className="mt-2" />
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

      {viewingAmortization && (
        <AmortizationTableModal
          debt={viewingAmortization}
          ufValue={ufValue}
          onClose={() => setViewingAmortization(null)}
        />
      )}
    </section>
  )
}
