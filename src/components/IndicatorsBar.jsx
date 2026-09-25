import { useCurrencyDisplay } from '../context/CurrencyDisplayContext'
import { useIndicadores } from '../context/IndicadoresContext'
import { CURRENCY_MODES } from '../lib/currencyDisplay'

const FIELDS = [
  { key: 'uf', label: 'UF' },
  { key: 'dolar', label: 'Dólar' },
  { key: 'utm', label: 'UTM' },
  { key: 'tpm', label: 'TPM' },
  { key: 'ipc', label: 'IPC' },
]

function formatValue(indicator) {
  if (!indicator || typeof indicator.valor !== 'number') return '…'
  const formatted = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(
    indicator.valor,
  )
  if (indicator.unidad_medida === 'Porcentaje') return `${formatted}%`
  return `$${formatted}`
}

export default function IndicatorsBar() {
  const { data, error } = useIndicadores()
  const { mode, setMode } = useCurrencyDisplay()

  if (error) return null

  return (
    <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-xs sm:px-6">
      <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
        {FIELDS.map((field, i) => (
          <span key={field.key}>
            {i > 0 && <span className="mx-2.5 text-slate-300">|</span>}
            <span className="text-slate-500">{field.label} </span>
            <span className="font-semibold text-slate-800">
              {data ? formatValue(data[field.key]) : '…'}
            </span>
          </span>
        ))}
      </div>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        aria-label="Mostrar montos en"
        title="Mostrar montos en"
        className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-slate-500 focus:outline-none"
      >
        {CURRENCY_MODES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  )
}
