import { formatCurrency, formatUF, formatUSD } from './format'

export const CURRENCY_MODES = [
  { id: 'original', label: 'Moneda original' },
  { id: 'CLP', label: 'CLP' },
  { id: 'UF', label: 'UF' },
  { id: 'USD', label: 'Dólar' },
]

/**
 * Convierte `amount` (expresado en `fromCurrency`, 'CLP' o 'UF') a la
 * moneda que corresponda mostrar según `mode`. Con `mode: 'original'` no
 * hay conversión: se devuelve tal cual, en su propia moneda. Si falta el
 * indicador necesario para convertir (UF o dólar aún no cargan), se cae de
 * vuelta a mostrar el monto en su moneda original en vez de romper la UI.
 */
export function convertAmount(amount, fromCurrency, mode, { ufValue, dolarValue } = {}) {
  if (amount == null) return { value: null, currency: fromCurrency }

  const target = mode === 'original' ? fromCurrency : mode
  if (target === fromCurrency) return { value: amount, currency: fromCurrency }

  const clp = fromCurrency === 'UF' ? (ufValue != null ? amount * ufValue : null) : amount
  if (clp == null) return { value: amount, currency: fromCurrency }

  if (target === 'CLP') return { value: clp, currency: 'CLP' }
  if (target === 'UF') {
    return ufValue != null
      ? { value: clp / ufValue, currency: 'UF' }
      : { value: amount, currency: fromCurrency }
  }
  if (target === 'USD') {
    return dolarValue != null
      ? { value: clp / dolarValue, currency: 'USD' }
      : { value: amount, currency: fromCurrency }
  }
  return { value: clp, currency: 'CLP' }
}

export function formatDisplayAmount(amount, fromCurrency, mode, indicadores) {
  const { value, currency } = convertAmount(amount, fromCurrency, mode, indicadores)
  if (value == null) return '—'
  if (currency === 'UF') return formatUF(value)
  if (currency === 'USD') return formatUSD(value)
  return formatCurrency(value)
}
