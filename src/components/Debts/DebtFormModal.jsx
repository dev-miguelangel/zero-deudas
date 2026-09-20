import { useState } from 'react'
import { validateDebt } from '../../domain/debts'
import HelpTip from '../HelpTip'
import NumericInput from '../NumericInput'

const emptyForm = { acreedor: '', saldo: '', tasaInteresAnual: '', pagoMinimo: '' }

const helpText = {
  tasaInteresAnual:
    'El % que cobra el acreedor por prestarte dinero durante un año. Aparece en tu cartola o contrato. La tasa mensual es este valor dividido en 12.',
  pagoMinimo:
    'Lo mínimo que exige el acreedor cada mes. Si solo pagas esto, gran parte se va en interés y el saldo baja lento.',
}

export default function DebtFormModal({ initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState(initialValue ?? emptyForm)
  const [errors, setErrors] = useState({})

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateDebt(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit(form)
  }

  const fields = [
    { name: 'acreedor', label: 'Acreedor', numeric: false },
    { name: 'saldo', label: 'Saldo (CLP)', numeric: true },
    { name: 'tasaInteresAnual', label: 'Tasa de interés anual (%)', numeric: true },
    { name: 'pagoMinimo', label: 'Pago mínimo (CLP)', numeric: true },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialValue ? 'Editar deuda' : 'Nueva deuda'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="flex items-center text-sm font-medium text-slate-700"
              >
                {field.label}
                {helpText[field.name] && <HelpTip text={helpText[field.name]} />}
              </label>
              {field.numeric ? (
                <NumericInput
                  id={field.name}
                  value={form[field.name]}
                  onChange={(value) => handleChange(field.name, value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              ) : (
                <input
                  id={field.name}
                  type="text"
                  value={form[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              )}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
