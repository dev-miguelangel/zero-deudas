import { useState } from 'react'
import { estimateAnnualRate } from '../../domain/rateEstimator'
import NumericInput from '../NumericInput'

const emptyCalc = { montoCredito: '', montoCuota: '', numCuotas: '' }

const fields = [
  { name: 'montoCredito', label: 'Monto del crédito' },
  { name: 'montoCuota', label: 'Monto de la cuota' },
  { name: 'numCuotas', label: 'Número de cuotas' },
]

export default function RateCalculator({ onApply }) {
  const [open, setOpen] = useState(false)
  const [calc, setCalc] = useState(emptyCalc)
  const [result, setResult] = useState(null)

  function handleChange(field, value) {
    setCalc((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  function handleCalculate() {
    setResult(estimateAnnualRate(calc))
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 text-xs font-medium text-emerald-700 underline"
      >
        ¿No sabes la tasa? Calcúlala con tus cuotas
      </button>
    )
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Calculadora de tasa</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cerrar
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        La estima a partir del monto del crédito, la cuota fija y el número de cuotas
        (crédito en cuotas iguales).
      </p>

      <div className="mt-3 space-y-2">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={`calc-${field.name}`}
              className="block text-xs font-medium text-slate-600"
            >
              {field.label}
            </label>
            <NumericInput
              id={`calc-${field.name}`}
              value={calc[field.name]}
              onChange={(value) => handleChange(field.name, value)}
              className="mt-0.5 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
      >
        Calcular tasa
      </button>

      {result?.error && <p className="mt-2 text-xs text-red-600">{result.error}</p>}

      {result?.annualRate != null && (
        <div className="mt-2 rounded-md bg-white p-2 text-xs text-slate-700">
          Tasa anual estimada: <strong>{result.annualRate.toFixed(2)}%</strong>
          <button
            type="button"
            onClick={() => {
              onApply(result.annualRate.toFixed(2))
              setOpen(false)
            }}
            className="mt-2 block w-full rounded-md bg-slate-900 px-3 py-1.5 text-center font-semibold text-white hover:bg-slate-800"
          >
            Usar esta tasa
          </button>
        </div>
      )}
    </div>
  )
}
