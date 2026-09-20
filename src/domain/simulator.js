export function sortSnowball(debts) {
  return [...debts].sort((a, b) => a.saldo - b.saldo)
}

export function sortAvalanche(debts) {
  return [...debts].sort((a, b) => b.tasaInteresAnual - a.tasaInteresAnual)
}

function monthlyRateOf(debt) {
  return debt.tasaInteresAnual / 100 / 12
}

/**
 * Simula el pago de un conjunto de deudas mes a mes bajo una estrategia dada.
 * @param {import('./debts').Debt[]} debts
 * @param {'snowball' | 'avalanche'} strategy
 * @param {number} extraPayment - abono adicional mensual, se aplica en cascada
 *   siguiendo el orden de la estrategia una vez cubiertos todos los pagos mínimos.
 * @param {{ maxMonths?: number }} [options]
 */
export function simulate(debts, strategy, extraPayment = 0, { maxMonths = 600 } = {}) {
  if (debts.length === 0) {
    return { months: 0, totalInterest: 0, timeline: [], amortization: [], error: null }
  }

  const order = strategy === 'avalanche' ? sortAvalanche(debts) : sortSnowball(debts)
  const balances = order.map((d) => ({ ...d, saldo: Number(d.saldo) }))

  const stuck = balances.find((d) => d.pagoMinimo <= d.saldo * monthlyRateOf(d))
  if (stuck) {
    return {
      months: null,
      totalInterest: null,
      timeline: [],
      amortization: [],
      error: { code: 'MIN_PAYMENT_TOO_LOW', debtId: stuck.id },
    }
  }

  const timeline = []
  const amortization = []
  let totalInterest = 0
  let month = 0

  while (balances.some((d) => d.saldo > 0.01) && month < maxMonths) {
    month += 1
    let extraAvailable = extraPayment

    for (const debt of balances) {
      if (debt.saldo <= 0) continue
      const interest = debt.saldo * monthlyRateOf(debt)
      const payment = Math.min(debt.pagoMinimo, debt.saldo + interest)
      const principal = payment - interest
      debt.saldo = Math.max(0, debt.saldo - principal)
      totalInterest += interest
      amortization.push({
        month,
        debtId: debt.id,
        acreedor: debt.acreedor,
        interest,
        principal,
        balance: debt.saldo,
      })
    }

    for (const debt of balances) {
      if (extraAvailable <= 0) break
      if (debt.saldo <= 0) continue
      const applied = Math.min(extraAvailable, debt.saldo)
      debt.saldo -= applied
      extraAvailable -= applied
      const row = amortization.find((r) => r.month === month && r.debtId === debt.id)
      if (row) {
        row.principal += applied
        row.balance = debt.saldo
      }
    }

    timeline.push({
      month,
      totalBalance: balances.reduce((sum, d) => sum + d.saldo, 0),
    })
  }

  const unpaid = balances.some((d) => d.saldo > 0.01)
  if (unpaid) {
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

export function describeSimulationError(error, debts) {
  if (!error) return null
  if (error.code === 'MIN_PAYMENT_TOO_LOW') {
    const debt = debts.find((d) => d.id === error.debtId)
    return `El pago mínimo de "${debt?.acreedor ?? 'una deuda'}" no cubre su interés mensual: el saldo nunca bajaría. Sube el pago mínimo o el abono adicional.`
  }
  if (error.code === 'EXCEEDS_MAX_TERM') {
    return 'Con estos valores, la deuda no se liquida en un plazo razonable (50 años). Sube el abono adicional.'
  }
  return 'No se pudo calcular la simulación.'
}

export function compareStrategies(debts, extraPayment = 0, options) {
  return {
    snowball: simulate(debts, 'snowball', extraPayment, options),
    avalanche: simulate(debts, 'avalanche', extraPayment, options),
  }
}
