import { useState } from 'react'
import { useVault } from '../context/VaultContext'
import { getAvatar } from './avatars'
import ExportDataButton from './ExportDataButton'
import { ChevronDownIcon, CloseIcon, KeyIcon, LockIcon, MenuIcon, UserIcon } from './icons'
import IndicatorsBar from './IndicatorsBar'
import ShareLinkButton from './ShareLinkButton'
import ChangeAvatarModal from './profiles/ChangeAvatarModal'
import ChangePassphraseModal from './profiles/ChangePassphraseModal'

const tabs = [
  { id: 'deudas', label: 'Deudas' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'amortizacion', label: 'Amortización' },
  { id: 'aprende', label: 'Aprende' },
]

export default function Navbar({ activeTab, onChangeTab }) {
  const { lock, activeProfile } = useVault()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [changingPassphrase, setChangingPassphrase] = useState(false)
  const [changingAvatar, setChangingAvatar] = useState(false)

  const avatar = activeProfile && getAvatar(activeProfile.avatarId)

  function handleSelectTab(id) {
    onChangeTab(id)
    setMenuOpen(false)
  }

  function handleLock() {
    setMenuOpen(false)
    setProfileMenuOpen(false)
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
            <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 sm:hidden">
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

          {activeProfile && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-expanded={profileMenuOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2.5 hover:border-slate-300"
              >
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="max-w-[8rem] truncate text-slate-700">
                  {activeProfile.name}
                </span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={() => setProfileMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <ExportDataButton
                      onDone={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                    />
                    <ShareLinkButton className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        setChangingAvatar(true)
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                    >
                      <UserIcon className="h-4 w-4" />
                      Cambiar avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        setChangingPassphrase(true)
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                    >
                      <KeyIcon className="h-4 w-4" />
                      Cambiar clave
                    </button>
                    <div className="border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLock}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                      >
                        <LockIcon className="h-4 w-4" />
                        Cambiar perfil
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
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

      <IndicatorsBar />

      {menuOpen && (
        <div className="sm:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 z-40 bg-black/20"
            style={{ top: 'calc(96px + env(safe-area-inset-top, 0px))' }}
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
              <ExportDataButton
                onDone={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3.5 text-left text-base font-medium text-slate-600"
              />
              <ShareLinkButton className="flex items-center gap-2 py-3.5 text-left text-base font-medium text-slate-600" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setChangingAvatar(true)
                }}
                className="flex items-center gap-2 py-3.5 text-left text-base font-medium text-slate-600"
              >
                <UserIcon className="h-4 w-4" />
                Cambiar avatar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setChangingPassphrase(true)
                }}
                className="flex items-center gap-2 py-3.5 text-left text-base font-medium text-slate-600"
              >
                <KeyIcon className="h-4 w-4" />
                Cambiar clave
              </button>
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

      {changingPassphrase && (
        <ChangePassphraseModal onClose={() => setChangingPassphrase(false)} />
      )}

      {changingAvatar && <ChangeAvatarModal onClose={() => setChangingAvatar(false)} />}
    </header>
  )
}
