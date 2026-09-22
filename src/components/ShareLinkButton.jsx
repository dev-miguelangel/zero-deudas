import { useState } from 'react'
import { useDebts } from '../context/DebtsContext'
import { useVault } from '../context/VaultContext'
import { buildExportFile, encodeExportFileForUrl } from '../lib/vaultFile'
import { LinkIcon } from './icons'
import ShareLinkModal from './ShareLinkModal'

export default function ShareLinkButton({ className }) {
  const { debts } = useDebts()
  const { activeProfile, cryptoKey } = useVault()
  const [url, setUrl] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    const file = await buildExportFile({ profile: activeProfile, cryptoKey, debts })
    const encoded = encodeExportFileForUrl(file)
    setUrl(`${window.location.origin}${window.location.pathname}#import=${encoded}`)
    setBusy(false)
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={busy} className={className}>
        <LinkIcon className="h-4 w-4" />
        {busy ? 'Generando…' : 'Generar enlace'}
      </button>
      {url && <ShareLinkModal url={url} onClose={() => setUrl(null)} />}
    </>
  )
}
