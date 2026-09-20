import { useState } from 'react'
import { useVault } from '../context/VaultContext'
import { CloseIcon, LockIcon, MenuIcon } from './icons'

const tabs = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'deudas', label: 'Deudas' },
  { id: 'simulacion', label: 'Simulación' },
  { id: 'amortizacion', label: 'Amortización' },
  { id: 'aprende', label: 'Aprende' },
]

export default function Navbar({ activeTab, onChangeTab }) {
  const { lock, activeProfile } = useVault()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSelectTab(id) {
    onChangeTab(id)
    setMenuOpen(false)
  }

  function handleLock() {
    setMenuOpen(false)
    lock()
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200 bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            0
          </span>
          ZeroDeudas
          {activeProfile && (
            <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {activeProfile.name}
            </span>
          )}
        </div>

        {/* Nav de escritorio */}
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
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

        {/* Botón hamburguesa (solo mobile) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-700 sm:hidden"
        >
          {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 z-40 bg-black/20"
            style={{ top: 'calc(64px + env(safe-area-inset-top, 0px))' }}
          />
          <div className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white shadow-lg">
            <div className="flex flex-col divide-y divide-slate-100 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`py-3.5 text-left text-base font-medium ${
                    activeTab === tab.id ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleLock}
                className="flex items-center gap-2 py-3.5 text-left text-base font-medium text-slate-600"
              >
                <LockIcon className="h-4 w-4" />
                Cambiar perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
