import { useEffect, useState } from 'react'
import { fetchIndicadores } from '../../lib/indicadores'
import HelpTip from '../HelpTip'
import { ChartBarIcon } from '../icons'

const fields = [
  {
    key: 'uf',
    label: 'UF',
    help: 'Unidad de Fomento: sube con la inflación. Muchos créditos hipotecarios están en UF.',
  },
  {
    key: 'dolar',
    label: 'Dólar',
    help: 'Valor del dólar en pesos chilenos. Relevante si tienes deudas o gastos en dólares.',
  },
  {
    key: 'utm',
    label: 'UTM',
    help: 'Unidad Tributaria Mensual: la usa el Estado para multas, impuestos y algunos contratos.',
  },
  {
    key: 'tpm',
    label: 'TPM',
    help: 'Tasa de Política Monetaria del Banco Central. Cuando sube o baja, tiende a mover las tasas de interés de créditos nuevos.',
  },
]

function formatValue(indicator) {
  if (!indicator || typeof indicator.valor !== 'number') return '—'
  const formatted = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(
    indicator.valor,
  )
  return indicator.unidad_medida === 'Porcentaje' ? `${formatted}%` : formatted
}

export default function Indicators() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchIndicadores()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los indicadores del día.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-500">
        {error}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2">
        <ChartBarIcon className="h-5 w-5 text-slate-900" />
        <h3 className="text-sm font-semibold text-slate-900">Indicadores del día</h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fields.map(({ key, label, help }) => (
          <div key={key} className="rounded-md bg-slate-50 p-4">
            <p className="flex items-center text-xs text-slate-500">
              {label}
              <HelpTip text={help} />
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {data ? formatValue(data[key]) : 'Cargando…'}
            </p>
          </div>
        ))}
      </div>
      {data?.fecha && (
        <p className="mt-3 text-xs text-slate-400">
          Actualizado: {new Date(data.fecha).toLocaleDateString('es-CL')}
        </p>
      )}
    </div>
  )
}
