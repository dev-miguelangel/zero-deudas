import { simulate } from './simulator'

/**
 * @typedef {Object} Payment
 * @property {string} mes - "YYYY-MM"
 * @property {number} monto - interes + capital
 * @property {number} interes
 * @property {number} capital
 * @property {string} fecha - ISO
 */

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  const label = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  return currentMonthKey(new Date(year, month - 1 + delta, 1))
}

export function isPaidForMonth(debt, monthKey) {
  return (debt.pagos ?? []).some((p) => p.mes === monthKey)
}

export function isSettled(debt) {
  return debt.saldo <= 0.01
}

/**
 * Marca la cuota de `monthKey` como pagada: agrega el registro de pago y
 * reduce el saldo real de la deuda en el capital de esa cuota (calculado a
 * partir de la amortización vigente). No hace nada si ya estaba marcada o
 * si la deuda ya está liquidada.
 */
export function markPaid(debt, monthKey) {
  if (isPaidForMonth(debt, monthKey) || isSettled(debt)) return debt

  const result = simulate(debt)
  let interes = 0
  let capital = debt.pagoMinimo
  if (!result.error && result.amortization.length > 0) {
    ;({ interest: interes, principal: capital } = result.amortization[0])
  }
  capital = Math.min(capital, debt.saldo)

  const payment = {
    mes: monthKey,
    monto: interes + capital,
    interes,
    capital,
    fecha: new Date().toISOString(),
  }

  return {
    ...debt,
    saldo: Math.max(0, debt.saldo - capital),
    pagos: [...(debt.pagos ?? []), payment],
  }
}

/**
 * Deshace el último pago registrado (siempre el más reciente), devolviendo
 * su capital al saldo. Pensado para deshacer la marca del mes actual.
 */
export function unmarkLastPaid(debt) {
  const pagos = debt.pagos ?? []
  if (pagos.length === 0) return debt
  const last = pagos[pagos.length - 1]
  return {
    ...debt,
    saldo: debt.saldo + last.capital,
    pagos: pagos.slice(0, -1),
  }
}

/**
 * Junta los pagos de todas las deudas en una sola lista, cada uno con los
 * datos de su deuda, ordenados del más reciente al más antiguo.
 */
export function allPayments(debts) {
  const rows = []
  debts.forEach((debt) => {
    ;(debt.pagos ?? []).forEach((payment) => {
      rows.push({
        ...payment,
        debtId: debt.id,
        acreedor: debt.acreedor,
        tipo: debt.tipo,
      })
    })
  })
  return rows.sort((a, b) => b.fecha.localeCompare(a.fecha))
}
