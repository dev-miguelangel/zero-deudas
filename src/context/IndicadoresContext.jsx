import { createContext, useContext, useEffect, useState } from 'react'
import { fetchIndicadores } from '../lib/indicadores'

const IndicadoresContext = createContext(null)

export function IndicadoresProvider({ children }) {
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

  return (
    <IndicadoresContext.Provider value={{ data, error }}>{children}</IndicadoresContext.Provider>
  )
}

export function useIndicadores() {
  const ctx = useContext(IndicadoresContext)
  if (!ctx) throw new Error('useIndicadores debe usarse dentro de IndicadoresProvider')
  return ctx
}
