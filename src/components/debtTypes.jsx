import { DEBT_TYPES } from '../domain/debts'
import { CardIcon, DuckIcon, ExclamationIcon, HomeIcon, MoneyBagIcon } from './icons'

const ICONS = {
  CC: MoneyBagIcon,
  CH: HomeIcon,
  TC: CardIcon,
  LC: ExclamationIcon,
  OT: DuckIcon,
}

// Colores sólidos por tipo, usados en la vista de tabla (chip) y de
// gráficos (dona + barras) — mismo color en ambas para que se reconozcan
// a simple vista.
const COLORS = {
  CC: '#059669', // emerald-600
  CH: '#4f46e5', // indigo-600
  TC: '#d97706', // amber-600
  LC: '#e11d48', // rose-600
  OT: '#64748b', // slate-500
}

export function debtTypeLabel(tipo) {
  return DEBT_TYPES.find((t) => t.id === tipo)?.label ?? 'Otras transacciones'
}

export function debtTypeIcon(tipo) {
  return ICONS[tipo] ?? DuckIcon
}

export function debtTypeColor(tipo) {
  return COLORS[tipo] ?? COLORS.OT
}
