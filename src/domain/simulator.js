import { isHipotecario } from './debts'

function monthlyRateOf(debt) {
  return debt.tasaInteresAnual / 100 / 12
}

/**
 * Calcula la amortización mes a mes de una deuda individual, pagando su
 * propio pago mínimo (cuota fija) hasta llegar a saldo $0.
 * @param {import('./debts').Debt} debt
 * @param {{ maxMonths?: number }} [options]
 */
export function simulate(debt, { maxMonths = 600 } = {}) {
  const rate = monthlyRateOf(debt)

  if (debt.pagoMinimo <= debt.saldo * rate) {
    return {
      months: null,
      totalInterest: null,
      timeline: [],
      amortization: [],
      error: { code: 'MIN_PAYMENT_TOO_LOW', debtId: debt.id },
    }
  }

  let saldo = Number(debt.saldo)
  const timeline = []
  const amortization = []
  let totalInterest = 0
  let month = 0

  while (saldo > 0.01 && month < maxMonths) {
    month += 1
    const interest = saldo * rate
    const payment = Math.min(debt.pagoMinimo, saldo + interest)
    const principal = payment - interest
    saldo = Math.max(0, saldo - principal)
    totalInterest += interest

    amortization.push({
      month,
      debtId: debt.id,
      acreedor: debt.acreedor,
      interest,
      principal,
      balance: saldo,
    })
    timeline.push({ month, totalBalance: saldo })
  }

  if (saldo > 0.01) {
    return {
      months: null,
      totalInterest: null,
      timeline,
      amortization,
      error: { code: 'EXCEEDS_MAX_TERM' },
    }
  }

  return { months: month, totalInterest, timeline, amortization, error: null }
}

/**
 * Proyecta cuánto se pagará en los próximos `months` meses, agrupado por
 * tipo de deuda (según `typeOrder`), sumando el pago mensual (interés +
 * capital) de la amortización de cada deuda. Si `simulate` no pudo
 * proyectar un plazo para una deuda (pago mínimo insuficiente o excede el
 * plazo máximo), usa su `pagoMinimo` como estimación de ese mes — ese pago
 * se seguiría haciendo igual, aunque no amortice.
 *
 * Los montos de créditos hipotecarios (guardados en UF) se convierten a
 * pesos con `ufValue`. Si falta ese valor y hay algún hipotecario en el
 * grupo, ese tipo (y por lo tanto el total) quedan con `amounts`/`totals`
 * en `null` para ese mes en vez de un número.
 */
export function projectUpcomingPayments(debts, typeOrder, ufValue, months = 6) {
  function paymentForMonth(debt, result, monthIndex) {
    const row = result.amortization[monthIndex]
    if (row) return row.interest + row.principal
    if (result.error) return debt.pagoMinimo
    return 0
  }

  const byType = typeOrder
    .map((tipo) => {
      const typeDebts = debts.filter((d) => d.tipo === tipo)
      if (typeDebts.length === 0) return null

      const pendingUF = typeDebts.some((d) => isHipotecario(d) && !ufValue)
      const amounts = Array.from({ length: months }, (_, i) => {
        if (pendingUF) return null
        return typeDebts.reduce((sum, debt) => {
          const result = simulate(debt)
          const amount = paymentForMonth(debt, result, i)
          return sum + (isHipotecario(debt) ? amount * ufValue : amount)
        }, 0)
      })

      return { tipo, pendingUF, amounts }
    })
    .filter(Boolean)

  const totals = Array.from({ length: months }, (_, i) => {
    if (byType.some((row) => row.pendingUF)) return null
    return byType.reduce((sum, row) => sum + row.amounts[i], 0)
  })

  return { byType, totals }
}

export function describeSimulationError(error, debt) {
  if (!error) return null
  if (error.code === 'MIN_PAYMENT_TOO_LOW') {
    return `El pago mínimo de "${debt?.acreedor ?? 'esta deuda'}" no cubre su interés mensual: el saldo nunca bajaría. Sube el pago mínimo.`
  }
  if (error.code === 'EXCEEDS_MAX_TERM') {
    return 'Con estos valores, la deuda no se liquida en un plazo razonable (50 años).'
  }
  return 'No se pudo calcular la simulación.'
}
