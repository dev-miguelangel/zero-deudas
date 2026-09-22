import { useDebts } from '../context/DebtsContext'
import { useVault } from '../context/VaultContext'
import { buildExportFile } from '../lib/vaultFile'
import { DownloadIcon } from './icons'

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ExportDataButton({ className, onDone }) {
  const { debts } = useDebts()
  const { activeProfile, cryptoKey } = useVault()

  async function handleExport() {
    const file = await buildExportFile({ profile: activeProfile, cryptoKey, debts })
    const blob = new Blob([JSON.stringify(file)], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `zerodeudas-${slugify(activeProfile.name)}.zero`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    onDone?.()
  }

  return (
    <button type="button" onClick={handleExport} className={className}>
      <DownloadIcon className="h-4 w-4" />
      Exportar datos
    </button>
  )
}
