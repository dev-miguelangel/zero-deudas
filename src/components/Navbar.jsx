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
    <header
      className="sticky top-0 z-50 border-b border-slate-200 bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex shrink-0 items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            0
          </span>
          <span className="hidden sm:inline">ZeroDeudas</span>
          {activeProfile && (
            <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {activeProfile.name}
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center gap-4 overflow-x-auto text-sm font-medium text-slate-600">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`shrink-0 whitespace-nowrap ${
                activeTab === tab.id ? 'text-slate-900' : 'hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={lock}
          aria-label="Cambiar perfil"
          className="flex shrink-0 items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 hover:border-slate-400 sm:px-3"
        >
          <LockIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Cambiar perfil</span>
        </button>
      </nav>
    </header>
  )
}
