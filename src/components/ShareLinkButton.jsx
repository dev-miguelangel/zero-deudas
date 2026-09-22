import { useState } from 'react'
import { useDebts } from '../context/DebtsContext'
import { useVault } from '../context/VaultContext'
import { buildExportFile, encodeExportFileForUrl } from '../lib/vaultFile'
import { LinkIcon } from './icons'

export default function ShareLinkButton({ className }) {
  const { debts } = useDebts()
  const { activeProfile, cryptoKey } = useVault()
  const [status, setStatus] = useState(null) // null | 'shared' | 'copied' | 'error'

  async function handleClick() {
    const file = await buildExportFile({ profile: activeProfile, cryptoKey, debts })
    const encoded = encodeExportFileForUrl(file)
    const url = `${window.location.origin}${window.location.pathname}#import=${encoded}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Respaldo de ZeroDeudas', url })
        setStatus('shared')
      } catch (err) {
        if (err.name === 'AbortError') return
        setStatus('error')
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setStatus('copied')
      } catch {
        setStatus('error')
      }
    }
    setTimeout(() => setStatus(null), 2500)
  }

  const label =
    status === 'shared'
      ? '¡Listo!'
      : status === 'copied'
        ? 'Enlace copiado'
        : status === 'error'
          ? 'No se pudo generar'
          : 'Generar enlace'

  return (
    <button type="button" onClick={handleClick} className={className}>
      <LinkIcon className="h-4 w-4" />
      {label}
    </button>
  )
}
