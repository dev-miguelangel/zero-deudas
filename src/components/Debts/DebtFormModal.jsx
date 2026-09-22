import { useState } from 'react'
import { DEBT_TYPES, validateDebt } from '../../domain/debts'
import { debtTypeIcon } from '../debtTypes'
import HelpTip from '../HelpTip'
import NumericInput from '../NumericInput'
import RateCalculator from './RateCalculator'

const emptyForm = {
  acreedor: '',
  tipo: 'consumo',
  saldo: '',
  tasaInteresAnual: '',
  pagoMinimo: '',
}

const helpText = {
  tasaInteresAnual:
    'El % que cobra el acreedor por prestarte dinero durante un año. Aparece en tu cartola o contrato. La tasa mensual es este valor dividido en 12.',
  pagoMinimo:
    'Lo mínimo que exige el acreedor cada mes. Si solo pagas esto, gran parte se va en interés y el saldo baja lento.',
}

export default function DebtFormModal({ initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState(initialValue ?? emptyForm)
  const [errors, setErrors] = useState({})

  const esHipotecario = form.tipo === 'hipotecario'
  const unidad = esHipotecario ? 'UF' : 'CLP'

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
    { name: 'saldo', label: `Saldo (${unidad})`, numeric: true },
    { name: 'tasaInteresAnual', label: 'Tasa de interés anual (%)', numeric: true },
    { name: 'pagoMinimo', label: `Pago mínimo (${unidad})`, numeric: true },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialValue ? 'Editar deuda' : 'Nueva deuda'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Tipo de crédito</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {DEBT_TYPES.map((type) => {
                const Icon = debtTypeIcon(type.id)
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('tipo', type.id)}
                    className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium ${
                      form.tipo === type.id
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {type.label}
                  </button>
                )
              })}
            </div>
            {esHipotecario && (
              <p className="mt-1 text-xs text-slate-500">
                El saldo y la cuota se ingresan en UF, y se convierten a pesos con el
                valor de la UF del día.
              </p>
            )}
            {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
          </div>

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
              {field.name === 'tasaInteresAnual' && (
                <RateCalculator
                  onApply={(value) => handleChange('tasaInteresAnual', value)}
                />
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
