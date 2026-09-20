import { useState } from 'react'
import { useDebts } from '../../context/DebtsContext'
import { formatCurrency } from '../../lib/format'
import { PencilIcon, PlusIcon, TrashIcon } from '../icons'
import DebtFormModal from './DebtFormModal'

export default function DebtList() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebts()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

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

      {debts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay deudas registradas.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {debts.map((debt) => (
            <div key={debt.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{debt.acreedor}</h3>
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
                    onClick={() => removeDebt(debt.id)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatCurrency(debt.saldo)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Tasa: {debt.tasaInteresAnual}% anual · Pago mínimo:{' '}
                {formatCurrency(debt.pagoMinimo)}
              </p>
            </div>
          ))}
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
    </section>
  )
}
