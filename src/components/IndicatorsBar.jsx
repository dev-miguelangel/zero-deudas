import { useIndicadores } from '../context/IndicadoresContext'

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

  if (error) return null

  return (
    <div className="overflow-x-auto whitespace-nowrap border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-xs sm:px-6">
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
  )
}
