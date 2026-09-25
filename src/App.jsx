import { useEffect, useState } from 'react'
import AmortizacionView from './components/Dashboard/AmortizacionView'
import Summary from './components/Dashboard/Summary'
import DebtList from './components/Debts/DebtList'
import Footer from './components/Footer'
import HistorialView from './components/Historial/HistorialView'
import Learn from './components/Learn/Learn'
import Navbar from './components/Navbar'
import TourModal from './components/onboarding/TourModal'
import { planSteps, welcomeSteps } from './components/onboarding/tourSteps'
import PagosView from './components/Pagos/PagosView'
import ProfileCreateForm from './components/profiles/ProfileCreateForm'
import ProfileSelect from './components/profiles/ProfileSelect'
import ProfileUnlockForm from './components/profiles/ProfileUnlockForm'
import { DebtsProvider, useDebts } from './context/DebtsContext'
import { IndicadoresProvider } from './context/IndicadoresContext'
import { useVault, VaultProvider } from './context/VaultContext'
import { getOnboardingState, markOnboardingComplete, markPlanSeen, markWelcomeSeen } from './lib/onboarding'
import { requestPersistentStorage } from './lib/persistence'

function AppShell() {
  const { activeProfile } = useVault()
  const { debts, loaded } = useDebts()
  const [activeTab, setActiveTab] = useState('deudas')
  const [tourStep, setTourStep] = useState(null) // 'welcome' | 'plan' | null

  useEffect(() => {
    requestPersistentStorage()
  }, [])

  useEffect(() => {
    if (!loaded || !activeProfile) return
    const state = getOnboardingState(activeProfile.id)

    if (!state.welcomeSeen) {
      if (debts.length > 0) {
        // Perfil de antes de este tutorial: ya tiene datos propios, no
        // tiene sentido mostrarle el paseo de bienvenida.
        markOnboardingComplete(activeProfile.id)
      } else {
        markWelcomeSeen(activeProfile.id)
        setTourStep('welcome')
      }
      return
    }

    if (!state.planSeen && debts.length > 0) {
      markPlanSeen(activeProfile.id)
      setTourStep('plan')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, activeProfile?.id, debts.length])

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

        {activeTab === 'amortizacion' && <AmortizacionView />}

        {activeTab === 'aprende' && <Learn onNavigate={setActiveTab} />}
      </main>
      <Footer />

      {tourStep === 'welcome' && (
        <TourModal
          steps={welcomeSteps(() => setActiveTab('deudas'))}
          onClose={() => setTourStep(null)}
        />
      )}
      {tourStep === 'plan' && (
        <TourModal
          steps={planSteps(() => setActiveTab('amortizacion'))}
          onClose={() => setTourStep(null)}
        />
      )}
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
