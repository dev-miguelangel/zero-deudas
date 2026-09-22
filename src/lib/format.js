export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

export function formatUF(amount) {
  return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(amount)} UF`
}

export function formatMonths(months) {
  if (months == null) return '—'
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} meses`
  if (rest === 0) return `${years} años`
  return `${years} años, ${rest} meses`
}

export function formatMonthsShort(months) {
  if (months == null) return '—'
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest}m`
  if (rest === 0) return `${years}a`
  return `${years}a ${rest}m`
}
