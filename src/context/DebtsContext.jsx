import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createDebt, migrateDebt } from '../domain/debts'
import { createSecureStorage } from '../lib/secureStorage'
import { useVault } from './VaultContext'

const DebtsContext = createContext(null)

export function DebtsProvider({ children }) {
  const { cryptoKey, activeProfileId } = useVault()
  const storage = useMemo(
    () => createSecureStorage(cryptoKey, activeProfileId),
    [cryptoKey, activeProfileId],
  )
  const [debts, setDebts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    storage.getItem('debts', []).then((stored) => {
      if (cancelled) return
      const migrated = stored.map(migrateDebt)
      setDebts(migrated)
      setLoaded(true)
      const needsPersist = migrated.some((debt, i) => debt !== stored[i])
      if (needsPersist) storage.setItem('debts', migrated)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoKey, activeProfileId])

  function persist(next) {
    setDebts(next)
    storage.setItem('debts', next)
  }

  const value = useMemo(
    () => ({
      debts,
      loaded,
      addDebt(input) {
        persist([...debts, createDebt(input)])
      },
      updateDebt(id, input) {
        persist(debts.map((d) => (d.id === id ? { ...d, ...input } : d)))
      },
      removeDebt(id) {
        persist(debts.filter((d) => d.id !== id))
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debts, loaded],
  )

  return <DebtsContext.Provider value={value}>{children}</DebtsContext.Provider>
}

export function useDebts() {
  const ctx = useContext(DebtsContext)
  if (!ctx) throw new Error('useDebts debe usarse dentro de DebtsProvider')
  return ctx
}
