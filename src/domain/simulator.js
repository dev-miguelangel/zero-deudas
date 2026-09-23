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

/**
 * Combina la amortización de varias deudas en una sola tabla mes a mes: en
 * cada mes suma el interés, el capital y el saldo de todas las deudas que
 * seleccionaste — cada una aporta según su propia amortización, y aporta 0
 * desde el mes en que ya se liquidó (las deudas más cortas dejan de sumar
 * antes que las más largas). Todo se expresa en pesos: los créditos
 * hipotecarios (en UF) se convierten con `ufValue`.
 *
 * Una deuda queda fuera de la combinación (y se lista en `excluded`) si es
 * hipotecaria y falta `ufValue`, o si `simulate` no pudo proyectarle un
 * plazo (pago mínimo insuficiente / excede el plazo máximo) — no hay forma
 * de sumarla a un total que sí converge.
 */
export function simulateCombined(debts, ufValue) {
  const perDebt = []
  const excluded = []

  debts.forEach((debt) => {
    if (isHipotecario(debt) && !ufValue) {
      excluded.push({ debt, reason: 'UF_PENDING' })
      return
    }
    const result = simulate(debt)
    if (result.error) {
      excluded.push({ debt, reason: result.error.code })
      return
    }
    perDebt.push({ debt, result })
  })

  if (perDebt.length === 0) {
    return { months: null, totalInterest: null, amortization: [], excluded }
  }

  const totalMonths = Math.max(...perDebt.map(({ result }) => result.months))
  const toCLP = (debt, value) => (isHipotecario(debt) ? value * ufValue : value)

  const amortization = Array.from({ length: totalMonths }, (_, i) => {
    let interest = 0
    let principal = 0
    let balance = 0
    perDebt.forEach(({ debt, result }) => {
      const row = result.amortization[i]
      if (row) {
        interest += toCLP(debt, row.interest)
        principal += toCLP(debt, row.principal)
        balance += toCLP(debt, row.balance)
      }
    })
    return { month: i + 1, interest, principal, balance }
  })

  const totalInterest = amortization.reduce((sum, row) => sum + row.interest, 0)

  return { months: totalMonths, totalInterest, amortization, excluded }
}

/**
 * Reconstruye la amortización de las cuotas YA PAGADAS de una deuda
 * (cuota 1 hasta `cuotasPagadas`), corriendo el mismo cálculo hacia
 * adelante desde `montoOriginal` — es lo mismo que hace
 * `estimateBalanceAfterInstallments`, pero guardando cada fila en vez de
 * solo el saldo final. `simulate()` no puede darnos esto: solo proyecta
 * hacia adelante desde el saldo de hoy, así que el historial ya está
 * "absorbido" en ese número.
 *
 * Sin `montoOriginal` no hay de dónde partir a reconstruir el historial,
 * así que devuelve un arreglo vacío (deudas migradas del modelo anterior,
 * o creadas sin ese dato opcional).
 */
export function simulateHistorical(debt) {
  if (debt.montoOriginal == null || !(debt.cuotasPagadas > 0) || !(debt.valorCuota > 0)) {
    return []
  }

  const rate = debt.tasaInteresAnual / 100 / 12
  const total = Math.floor(debt.cuotasPagadas)
  let saldo = Number(debt.montoOriginal)
  const rows = []

  for (let month = 1; month <= total; month += 1) {
    if (saldo <= 0.01) break
    const interest = saldo * rate
    const payment = Math.min(debt.valorCuota, saldo + interest)
    const principal = payment - interest
    saldo = Math.max(0, saldo - principal)
    rows.push({ month, interest, principal, balance: saldo })
  }

  return rows
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

/** Explica por qué una deuda quedó fuera de `simulateCombined` (su campo `excluded`). */
export function describeExclusionReason(reason) {
  if (reason === 'UF_PENDING') return 'sin valor de UF'
  if (reason === 'MIN_PAYMENT_TOO_LOW') return 'pago mínimo insuficiente'
  if (reason === 'EXCEEDS_MAX_TERM') return 'no converge en un plazo razonable'
  return 'no se pudo incluir'
}
