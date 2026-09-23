import { isHipotecario } from './debts'
import { installment } from './rateEstimator'
import { simulate } from './simulator'

/**
 * Condiciones de la banca chilena para abonos extraordinarios a capital
 * (prepagos), según la Ley N° 18.010 (Art. 10) y normativa de la CMF —
 * ver `src/assets/normativa.md`.
 */
// Art. 10, Ley 18.010: un abono PARCIAL solo es exigible por ley si es al
// menos el 10% del saldo de capital adeudado. Saldar por completo siempre
// se puede, sin este mínimo.
const MIN_ABONO_PCT = 0.1
// Comisión de prepago máxima que puede cobrar el banco, en meses de
// interés sobre el capital abonado: 1 mes para créditos en pesos, 1,5
// meses para créditos reajustables (en UF — típicamente hipotecarios).
const COMISION_MESES_CLP = 1
const COMISION_MESES_UF = 1.5

/**
 * Monto mínimo legal para un abono PARCIAL a capital de esta deuda (10%
 * de su saldo), en pesos. No aplica si vas a saldarla por completo. Sin
 * `ufValue` no se puede calcular para créditos hipotecarios (en UF).
 */
export function minAbonoLegalClp(debt, ufValue) {
  const saldoClp = isHipotecario(debt) ? (ufValue ? debt.saldo * ufValue : null) : debt.saldo
  return saldoClp == null ? null : saldoClp * MIN_ABONO_PCT
}

/**
 * Comisión de prepago estimada que el banco puede cobrar por abonar
 * `appliedNative` (en la unidad nativa de la deuda) antes de tiempo: 1 o
 * 1,5 meses de interés sobre ese capital, según si el crédito es
 * reajustable (UF) o no.
 */
function comisionPrepagoNative(debt, appliedNative) {
  const monthlyRate = debt.tasaInteresAnual / 100 / 12
  const meses = isHipotecario(debt) ? COMISION_MESES_UF : COMISION_MESES_CLP
  return appliedNative * monthlyRate * meses
}

/**
 * Arma un plan de pago repartiendo un monto disponible entre las deudas en
 * un orden de prioridad — primero intenta saldarlas por completo, y si no
 * alcanza, el resto queda como abono a capital de la última que toca. El
 * orden depende del `objetivo`:
 *
 * - `'interes'` (por defecto) — estrategia "avalancha": de mayor a menor
 *   tasa de interés real, así se minimiza el interés total que se termina
 *   pagando.
 * - `'flujo'` — estrategia "bola de nieve": de menor a mayor saldo, así se
 *   llega antes a saldar deudas por completo, eliminando su cuota entera
 *   en vez de solo reducirla — lo que más rápido baja el gasto mensual
 *   total. A veces conviene más repartir el abono entre dos deudas
 *   chicas (eliminando ambas cuotas) que concentrarlo en una sola deuda
 *   grande.
 *

 * Cada asignación incluye, según la normativa de prepagos chilena: el
 * abono mínimo legal para esa deuda (`montoMinimoClp`, 10% del saldo —
 * irrelevante si se salda completa), si el abono propuesto queda por
 * debajo de ese mínimo (`bajoMinimoLegal`, el banco no está obligado a
 * aceptarlo), la comisión de prepago estimada (`comisionClp`) y el
 * ahorro neto en intereses descontando esa comisión
 * (`interestSavedNetoClp`) — esto para la modalidad "reducción de plazo"
 * (se mantiene el valor de la cuota), la que más ahorra en intereses
 * según la normativa.
 *
 * También calcula la otra modalidad que puede ofrecer el banco,
 * "reducción de cuota" (se mantiene la tasa y la cantidad de cuotas
 * restantes, y se recalcula un dividendo más bajo para el saldo ya
 * reducido): `nuevaCuotaClp` y cuánto baja el pago mensual respecto a la
 * cuota actual (`ahorroCuotaMensualClp`). No aplica si la deuda queda
 * saldada por completo (ya no hay cuota que pagar).
 *
 * `montoDisponible` se entiende siempre en pesos. Los créditos
 * hipotecarios (guardados en UF) se convierten con `ufValue` para poder
 * repartir el monto de forma justa entre todas — si falta ese valor,
 * esos créditos quedan fuera del plan (no se puede saber cuántas UF
 * representa el monto disponible) y se listan en `excluded`.
 */
export function buildPaymentPlan(debts, montoDisponible, ufValue, objetivo = 'interes') {
  const usable = debts.filter((debt) => !isHipotecario(debt) || ufValue)
  const excluded = debts.filter((debt) => isHipotecario(debt) && !ufValue)
  const saldoClpOf = (debt) => (isHipotecario(debt) ? debt.saldo * ufValue : debt.saldo)

  const priorityOrder =
    objetivo === 'flujo'
      ? [...usable].sort((a, b) => saldoClpOf(a) - saldoClpOf(b))
      : [...usable].sort((a, b) => b.tasaInteresAnual - a.tasaInteresAnual)

  let remainingClp = Number(montoDisponible) || 0
  const allocations = []

  for (const debt of priorityOrder) {
    if (remainingClp <= 0.01) break

    const saldoClp = isHipotecario(debt) ? debt.saldo * ufValue : debt.saldo
    if (saldoClp <= 0.01) continue

    const appliedClp = Math.min(remainingClp, saldoClp)
    const appliedNative = isHipotecario(debt) ? appliedClp / ufValue : appliedClp
    const nuevoSaldoNative = Math.max(0, debt.saldo - appliedNative)
    const fullyPaid = nuevoSaldoNative <= 0.01
    const toClp = (value) => (isHipotecario(debt) ? value * ufValue : value)

    const before = simulate(debt)
    const after = simulate({ ...debt, saldo: nuevoSaldoNative })

    const interestSavedClp =
      before.error == null && after.error == null
        ? toClp(before.totalInterest) - toClp(after.totalInterest)
        : null
    const monthsSaved =
      before.error == null && after.error == null ? before.months - after.months : null

    const montoMinimoClp = minAbonoLegalClp(debt, ufValue)
    const bajoMinimoLegal =
      !fullyPaid && montoMinimoClp != null && appliedClp < montoMinimoClp - 0.01

    const comisionClp = toClp(comisionPrepagoNative(debt, appliedNative))
    const interestSavedNetoClp = interestSavedClp != null ? interestSavedClp - comisionClp : null

    // "Reducción de cuota": mismo plazo restante (el que tenía ANTES del
    // abono) y misma tasa, pero recalculado sobre el saldo ya reducido.
    const monthlyRate = debt.tasaInteresAnual / 100 / 12
    const remainingInstallments = before.error == null ? before.months : null
    const nuevaCuotaNative =
      !fullyPaid && remainingInstallments > 0
        ? installment(nuevoSaldoNative, monthlyRate, remainingInstallments)
        : null
    const nuevaCuotaClp = nuevaCuotaNative != null ? toClp(nuevaCuotaNative) : null
    const cuotaActualClp = toClp(debt.pagoMinimo)
    const ahorroCuotaMensualClp = nuevaCuotaClp != null ? cuotaActualClp - nuevaCuotaClp : null

    // Como la cuota nueva amortiza el saldo reducido exactamente en
    // `remainingInstallments` cuotas, el interés total de esta modalidad
    // es simplemente lo que se termina pagando menos el capital.
    const interesTotalOpcion2Native =
      nuevaCuotaNative != null ? nuevaCuotaNative * remainingInstallments - nuevoSaldoNative : null
    const interestSavedCuotaClp =
      interesTotalOpcion2Native != null && before.error == null
        ? toClp(before.totalInterest) - toClp(interesTotalOpcion2Native)
        : null

    allocations.push({
      debt,
      appliedClp,
      fullyPaid,
      saldoRestanteClp: Math.max(0, saldoClp - appliedClp),
      before,
      after,
      interestSavedClp,
      monthsSaved,
      montoMinimoClp,
      bajoMinimoLegal,
      comisionClp,
      interestSavedNetoClp,
      nuevaCuotaClp,
      cuotaActualClp,
      ahorroCuotaMensualClp,
      interestSavedCuotaClp,
    })

    remainingClp -= appliedClp
  }

  return {
    priorityOrder,
    allocations,
    sobranteClp: Math.max(0, remainingClp),
    excluded,
  }
}

/**
 * Resume, sumando todas las asignaciones de un plan, la comparación entre
 * seguir "como estás" (pagando solo el mínimo, sin abonar nada extra) y
 * aplicar el plan: pago total acumulado hasta liquidar, intereses totales
 * y pago mensual combinado, para ambos escenarios, más el ahorro neto
 * (después de la comisión de prepago).
 *
 * Para las deudas que quedan saldadas por completo, "con plan aplicado"
 * no tiene interés ni cuota (ya no hay deuda). Para las que solo reciben
 * un abono parcial, la modalidad usada depende de `objetivo`: reducción
 * de plazo (se mantiene la cuota) para `'interes'`, reducción de cuota
 * (se mantiene el plazo) para `'flujo'`.
 */
export function summarizePlanComparison(allocations, objetivo, ufValue) {
  const actual = { pagoTotalClp: 0, interesClp: 0, pagoMensualClp: 0 }
  const plan = { pagoTotalClp: 0, interesClp: 0, pagoMensualClp: 0 }

  allocations.forEach((a) => {
    const toClp = (value) => (isHipotecario(a.debt) ? value * ufValue : value)
    const saldoActualClp = a.saldoRestanteClp + a.appliedClp
    const interesActualClp = a.before.error == null ? toClp(a.before.totalInterest) : 0
    const pagoMensualActualClp = a.cuotaActualClp

    let interesPlanClp
    let pagoMensualPlanClp

    if (a.fullyPaid) {
      interesPlanClp = 0
      pagoMensualPlanClp = 0
    } else if (objetivo === 'flujo' && a.nuevaCuotaClp != null) {
      interesPlanClp =
        a.interestSavedCuotaClp != null
          ? interesActualClp - a.interestSavedCuotaClp
          : interesActualClp
      pagoMensualPlanClp = a.nuevaCuotaClp
    } else {
      interesPlanClp = a.after.error == null ? toClp(a.after.totalInterest) : interesActualClp
      pagoMensualPlanClp = pagoMensualActualClp
    }

    actual.pagoTotalClp += saldoActualClp + interesActualClp
    actual.interesClp += interesActualClp
    actual.pagoMensualClp += pagoMensualActualClp

    plan.pagoTotalClp += saldoActualClp + interesPlanClp + a.comisionClp
    plan.interesClp += interesPlanClp
    plan.pagoMensualClp += pagoMensualPlanClp
  })

  const ahorroClp = Math.max(0, actual.pagoTotalClp - plan.pagoTotalClp)

  return { actual, plan, ahorroClp }
}
