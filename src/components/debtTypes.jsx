import { DEBT_TYPES } from '../domain/debts'
import { CardIcon, HomeIcon, ReceiptIcon } from './icons'

const ICONS = {
  consumo: CardIcon,
  hipotecario: HomeIcon,
  otro: ReceiptIcon,
}

export function debtTypeLabel(tipo) {
  return DEBT_TYPES.find((t) => t.id === tipo)?.label ?? 'Otras cuotas'
}

export function debtTypeIcon(tipo) {
  return ICONS[tipo] ?? ReceiptIcon
}
