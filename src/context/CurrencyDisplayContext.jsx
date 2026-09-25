import { createContext, useContext, useMemo, useState } from 'react'
import { formatDisplayAmount } from '../lib/currencyDisplay'
import { useIndicadores } from './IndicadoresContext'

const CurrencyDisplayContext = createContext(null)

export function CurrencyDisplayProvider({ children }) {
  const [mode, setMode] = useState('original')
  const { data } = useIndicadores()
  const ufValue = data?.uf?.valor ?? null
  const dolarValue = data?.dolar?.valor ?? null

  const value = useMemo(
    () => ({
      mode,
      setMode,
      /**
       * Formatea `amount` (en `fromCurrency`, 'CLP' o 'UF') según la
       * moneda elegida en el selector. Los montos que ya combinan varias
       * deudas (siempre calculados en CLP) deben pasar `fromCurrency:
       * 'CLP'` (el valor por defecto) — solo los montos de una deuda
       * puntual usan `fromCurrency: 'UF'` cuando es hipotecaria.
       */
      formatAmount(amount, fromCurrency = 'CLP') {
        return formatDisplayAmount(amount, fromCurrency, mode, { ufValue, dolarValue })
      },
    }),
    [mode, ufValue, dolarValue],
  )

  return (
    <CurrencyDisplayContext.Provider value={value}>{children}</CurrencyDisplayContext.Provider>
  )
}

export function useCurrencyDisplay() {
  const ctx = useContext(CurrencyDisplayContext)
  if (!ctx) throw new Error('useCurrencyDisplay debe usarse dentro de CurrencyDisplayProvider')
  return ctx
}
