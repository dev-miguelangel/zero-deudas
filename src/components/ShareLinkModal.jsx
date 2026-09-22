import { useState } from 'react'
import { CheckIcon, CloseIcon, LinkIcon } from './icons'

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M7 17.5V9a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-4.5L7 17.5Z" fill="white" />
    </svg>
  )
}

function TelegramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#26A5E4" />
      <path d="M6 12.2 17 7.5l-1.8 9.8-3.2-2.4-1.6 1.5-.3-2.6L6 12.2Z" fill="white" />
    </svg>
  )
}

const MESSAGE = 'Te comparto un respaldo de ZeroDeudas — necesitas la clave para abrirlo.'

export default function ShareLinkModal({ url, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // El textarea queda seleccionable como respaldo si falla el clipboard.
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${MESSAGE}\n${url}`)}`
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(MESSAGE)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <LinkIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Compartir enlace</h2>
              <p className="text-xs text-slate-500">Necesita tu clave para abrirse</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <textarea
          readOnly
          rows={3}
          value={url}
          onFocus={(e) => e.target.select()}
          className="mt-4 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600 focus:border-slate-500 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleCopy}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            copied
              ? 'border border-emerald-600 text-emerald-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Copiado
            </>
          ) : (
            'Copiar enlace'
          )}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            <TelegramIcon className="h-5 w-5" />
            Telegram
          </a>
        </div>
      </div>
    </div>
  )
}
