import { useVault } from '../context/VaultContext'
import { LockIcon } from './icons'

const tabs = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'deudas', label: 'Deudas' },
  { id: 'simulacion', label: 'Simulación' },
  { id: 'amortizacion', label: 'Amortización' },
  { id: 'aprende', label: 'Aprende' },
]

export default function Navbar({ activeTab, onChangeTab }) {
  const { lock, activeProfile } = useVault()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            0
          </span>
          ZeroDeudas
          {activeProfile && (
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {activeProfile.name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={activeTab === tab.id ? 'text-slate-900' : 'hover:text-slate-900'}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={lock}
            className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 hover:border-slate-400"
          >
            <LockIcon className="h-4 w-4" />
            Cambiar perfil
          </button>
        </div>
      </nav>
    </header>
  )
}
