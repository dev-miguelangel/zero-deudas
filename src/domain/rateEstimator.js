export function installment(principal, monthlyRate, numInstallments) {
  if (monthlyRate === 0) return principal / numInstallments
  const factor = (1 + monthlyRate) ** numInstallments
  return (principal * monthlyRate * factor) / (factor - 1)
}

/**
 * Estima la tasa de interés anual nominal de un crédito en cuotas fijas
 * (amortización francesa), a partir del monto del crédito, el valor de la
 * cuota y el número de cuotas — resolviendo la tasa mensual por bisección,
 * ya que no tiene solución algebraica cerrada.
 */
export function estimateAnnualRate({ montoCredito, montoCuota, numCuotas }) {
  const principal = Number(montoCredito)
  const installmentAmount = Number(montoCuota)
  const numInstallments = Number(numCuotas)

  if (!(principal > 0) || !(installmentAmount > 0) || !(numInstallments > 0)) {
    return {
      annualRate: null,
      error: 'Completa el monto del crédito, la cuota y el número de cuotas (todos mayores a 0).',
    }
  }

  if (installmentAmount * numInstallments < principal) {
    return {
      annualRate: null,
      error: 'El total a pagar (cuota × número de cuotas) no puede ser menor al monto del crédito.',
    }
  }

  let lo = 0
  let hi = 1 // 100% mensual: cota superior generosa para créditos reales

  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2
    if (installment(principal, mid, numInstallments) < installmentAmount) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const monthlyRate = (lo + hi) / 2
  return { annualRate: monthlyRate * 12 * 100, error: null }
}

/**
 * Estima el saldo pendiente de un crédito en cuotas fijas a partir de lo
 * que normalmente es fácil de saber (monto original de la compra, valor de
 * la cuota, número de cuotas totales) y cuántas cuotas ya se pagaron — sin
 * necesitar saber la tasa ni el saldo actual. Pensado para tarjetas de
 * crédito, donde el saldo pendiente no siempre es fácil de ver, pero la
 * compra original y las cuotas sí.
 */
export function estimateBalanceAfterInstallments({ montoCredito, montoCuota, numCuotas, cuotasPagadas }) {
  const { annualRate, error } = estimateAnnualRate({ montoCredito, montoCuota, numCuotas })
  if (error) return { saldo: null, annualRate: null, error }

  const total = Number(numCuotas)
  const paid = Math.floor(Number(cuotasPagadas))
  if (!(paid >= 0)) {
    return { saldo: null, annualRate: null, error: 'Las cuotas ya pagadas no pueden ser negativas.' }
  }
  if (paid > total) {
    return {
      saldo: null,
      annualRate: null,
      error: 'No puedes haber pagado más cuotas que el total de cuotas.',
    }
  }

  const installmentAmount = Number(montoCuota)
  const monthlyRate = annualRate / 100 / 12
  let saldo = Number(montoCredito)

  for (let i = 0; i < paid; i += 1) {
    if (saldo <= 0.01) break
    const interest = saldo * monthlyRate
    const payment = Math.min(installmentAmount, saldo + interest)
    const principalPaid = payment - interest
    saldo = Math.max(0, saldo - principalPaid)
  }

  return { saldo, annualRate, error: null }
}
