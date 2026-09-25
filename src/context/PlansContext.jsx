import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createSecureStorage } from '../lib/secureStorage'
import { useVault } from './VaultContext'

const PlansContext = createContext(null)

export function PlansProvider({ children }) {
  const { cryptoKey, activeProfileId } = useVault()
  const storage = useMemo(
    () => createSecureStorage(cryptoKey, activeProfileId),
    [cryptoKey, activeProfileId],
  )
  const [plans, setPlans] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    storage.getItem('savedPlans', []).then((stored) => {
      if (cancelled) return
      setPlans(stored)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoKey, activeProfileId])

  function persist(next) {
    setPlans(next)
    storage.setItem('savedPlans', next)
  }

  const value = useMemo(
    () => ({
      plans,
      loaded,
      /** Guarda una foto del paso 3 del plan de pago. Devuelve el id creado. */
      savePlan(plan) {
        const entry = { id: crypto.randomUUID(), createdAt: Date.now(), ...plan }
        persist([entry, ...plans])
        return entry.id
      },
      removePlan(id) {
        persist(plans.filter((p) => p.id !== id))
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plans, loaded],
  )

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}

export function usePlans() {
  const ctx = useContext(PlansContext)
  if (!ctx) throw new Error('usePlans debe usarse dentro de PlansProvider')
  return ctx
}
