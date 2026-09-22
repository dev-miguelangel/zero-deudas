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
