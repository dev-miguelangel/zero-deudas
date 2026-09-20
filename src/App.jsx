import { useState } from 'react'
import AmortizationTable from './components/Amortization/AmortizationTable'
import BalanceChart from './components/Dashboard/BalanceChart'
import DistributionChart from './components/Dashboard/DistributionChart'
import Indicators from './components/Dashboard/Indicators'
import Summary from './components/Dashboard/Summary'
import DebtList from './components/Debts/DebtList'
import Footer from './components/Footer'
import Learn from './components/Learn/Learn'
import Navbar from './components/Navbar'
import ProfileCreateForm from './components/profiles/ProfileCreateForm'
import ProfileSelect from './components/profiles/ProfileSelect'
import ProfileUnlockForm from './components/profiles/ProfileUnlockForm'
import StrategyComparison from './components/Simulator/StrategyComparison'
import StrategyPicker from './components/Simulator/StrategyPicker'
import { DebtsProvider, useDebts } from './context/DebtsContext'
import { useVault, VaultProvider } from './context/VaultContext'

function AppShell() {
  const { debts, loaded } = useDebts()
  const [activeTab, setActiveTab] = useState('resumen')
  const [strategy, setStrategy] = useState('snowball')
  const [extraPaymentInput, setExtraPaymentInput] = useState('')
  const extraPayment = Number(extraPaymentInput) || 0

  if (!loaded) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-500">Cargando…</div>
  }

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <Navbar activeTab={activeTab} onChangeTab={setActiveTab} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {activeTab === 'resumen' && (
          <>
            <Summary debts={debts} strategy={strategy} extraPayment={extraPayment} />
            <Indicators />
            <div className="grid gap-6 md:grid-cols-2">
              <BalanceChart debts={debts} strategy={strategy} extraPayment={extraPayment} />
              <DistributionChart debts={debts} />
            </div>
          </>
        )}

        {activeTab === 'deudas' && <DebtList />}

        {activeTab === 'simulacion' && (
          <>
            <StrategyPicker
              strategy={strategy}
              onChangeStrategy={setStrategy}
              extraPaymentInput={extraPaymentInput}
              onChangeExtraPaymentInput={setExtraPaymentInput}
            />
            <StrategyComparison debts={debts} extraPayment={extraPayment} />
          </>
        )}

        {activeTab === 'amortizacion' && (
          <AmortizationTable debts={debts} strategy={strategy} extraPayment={extraPayment} />
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
      <AppShell />
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
