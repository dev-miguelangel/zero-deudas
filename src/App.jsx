import { useEffect, useState } from 'react'
import Summary from './components/Dashboard/Summary'
import DebtList from './components/Debts/DebtList'
import Footer from './components/Footer'
import HistorialView from './components/Historial/HistorialView'
import Learn from './components/Learn/Learn'
import Navbar from './components/Navbar'
import PagosView from './components/Pagos/PagosView'
import ProfileCreateForm from './components/profiles/ProfileCreateForm'
import ProfileSelect from './components/profiles/ProfileSelect'
import ProfileUnlockForm from './components/profiles/ProfileUnlockForm'
import { DebtsProvider, useDebts } from './context/DebtsContext'
import { IndicadoresProvider } from './context/IndicadoresContext'
import { useVault, VaultProvider } from './context/VaultContext'
import { requestPersistentStorage } from './lib/persistence'

function AppShell() {
  const { debts, loaded } = useDebts()
  const [activeTab, setActiveTab] = useState('deudas')

  useEffect(() => {
    requestPersistentStorage()
  }, [])

  if (!loaded) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-500">Cargando…</div>
  }

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {activeTab === 'deudas' && (
          <>
            <Summary debts={debts} />
            <DebtList />
          </>
        )}

        {activeTab === 'pagos' && (
          <>
            <PagosView />
            <HistorialView />
          </>
        )}

        {activeTab === 'aprende' && <Learn />}
      </main>
      <Footer />
    </div>
  )
}

function Gate() {
  const { status } = useVault()
  if (status === 'select') return <ProfileSelect />
  if (status === 'creating') return <ProfileCreateForm />
  if (status === 'unlocking') return <ProfileUnlockForm />
  return (
    <DebtsProvider>
      <IndicadoresProvider>
        <AppShell />
      </IndicadoresProvider>
    </DebtsProvider>
  )
}

function App() {
  return (
    <VaultProvider>
      <Gate />
    </VaultProvider>
  )
}

export default App
