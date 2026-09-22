import { DEBT_TYPES } from '../domain/debts'
import { CardIcon, DuckIcon, ExclamationIcon, HomeIcon, MoneyBagIcon } from './icons'

const ICONS = {
  CC: MoneyBagIcon,
  CH: HomeIcon,
  TC: CardIcon,
  LC: ExclamationIcon,
  OT: DuckIcon,
}

export function debtTypeLabel(tipo) {
  return DEBT_TYPES.find((t) => t.id === tipo)?.label ?? 'Otras transacciones'
}

export function debtTypeIcon(tipo) {
  return ICONS[tipo] ?? DuckIcon
}
