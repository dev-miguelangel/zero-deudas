import { useState } from 'react'
import { CloseIcon, InfoIcon } from '../icons'
import { APP_MOCKUP_SCENES } from './appMockupScenes'

export default function AppMockupModal({ initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const scene = APP_MOCKUP_SCENES[index]

  function go(delta) {
    setIndex((i) => (i + delta + APP_MOCKUP_SCENES.length) % APP_MOCKUP_SCENES.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-6">
      <div className="flex max-h-full w-[90vw] flex-col overflow-y-auto rounded-lg bg-white p-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            Así se ve en acción <span className="font-normal text-slate-400">· {scene.label}</span>
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto mt-3 w-fit max-w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="ml-2 truncate text-[10px] text-slate-400">zerodeudas.app</span>
          </div>
          <img
            src={scene.image}
            alt={`Captura de la sección ${scene.label}`}
            className="block max-h-[46vh] w-auto object-contain"
          />
        </div>

        <div className="mt-3 flex shrink-0 items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-sm text-slate-600">{scene.help}</p>
        </div>

        <div className="mt-3 flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {APP_MOCKUP_SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.label}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
