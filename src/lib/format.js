export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

export function formatMonths(months) {
  if (months == null) return '—'
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} meses`
  if (rest === 0) return `${years} años`
  return `${years} años, ${rest} meses`
}
