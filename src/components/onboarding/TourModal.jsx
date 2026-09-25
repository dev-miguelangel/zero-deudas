import { useState } from 'react'
import { CloseIcon } from '../icons'

export default function TourModal({ steps, onClose }) {
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const isLast = index === steps.length - 1
  const Icon = step.icon

  function handlePrimary() {
    step.cta?.onClick()
    if (isLast) onClose()
    else setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="flex max-h-full w-full max-w-md flex-col overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <Icon className="h-5 w-5" />
          </span>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-3 text-base font-semibold text-slate-900">{step.title}</h2>
        <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex shrink-0 gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={handlePrimary}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {step.cta ? step.cta.label : isLast ? 'Entendido' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
