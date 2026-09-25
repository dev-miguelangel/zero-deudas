import { useEffect, useState } from 'react'
import AppMockupModal from './AppMockupModal'
import { APP_MOCKUP_SCENES } from './appMockupScenes'

const SCENE_MS = 2800

export default function AppMockupCarousel() {
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (expanded) return
    const id = setInterval(
      () => setActive((i) => (i + 1) % APP_MOCKUP_SCENES.length),
      SCENE_MS,
    )
    return () => clearInterval(id)
  }, [expanded])

  const scene = APP_MOCKUP_SCENES[active]

  return (
    <div className="mx-auto w-full max-w-sm">
      <style>{`
        @keyframes ld-scene-in {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Ampliar captura"
        title="Toca para ver más grande"
        className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 text-left shadow-sm"
      >
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="ml-2 truncate text-[9px] text-slate-400">zerodeudas.app</span>
        </div>
        <div className="relative h-56 overflow-hidden bg-white sm:h-64">
          <img
            key={scene.id}
            src={scene.image}
            alt={`Captura de la sección ${scene.label}`}
            className="absolute inset-0 h-full w-full object-cover object-top [animation:ld-scene-in_0.6s_ease-out_both]"
          />
        </div>
      </button>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {APP_MOCKUP_SCENES.map((s) => (
          <span
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s.id === scene.id ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-slate-400">
        {scene.label} · toca la imagen para verla más grande
      </p>

      {expanded && (
        <AppMockupModal initialIndex={active} onClose={() => setExpanded(false)} />
      )}
    </div>
  )
}
