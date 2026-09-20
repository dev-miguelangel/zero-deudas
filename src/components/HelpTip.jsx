import { useState } from 'react'
import { InfoIcon } from './icons'

export default function HelpTip({ text }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label="Más información"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex text-slate-400 hover:text-slate-600"
      >
        <InfoIcon className="h-4 w-4" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-6 z-20 w-56 max-w-[85vw] -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-600 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  )
}
