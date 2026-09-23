import { isHipotecario } from './debts'
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
 * Arma un plan de pago tipo "avalancha": ordena las deudas de mayor a
 * menor tasa de interés real (así se minimiza el interés total que se
 * termina pagando) y reparte un monto disponible entre ellas en ese
 * orden — primero intenta saldarlas por completo, y si no alcanza, el
 * resto queda como abono a capital de la última que toca.
 *
 * Cada asignación incluye, según la normativa de prepagos chilena: el
 * abono mínimo legal para esa deuda (`montoMinimoClp`, 10% del saldo —
 * irrelevante si se salda completa), si el abono propuesto queda por
 * debajo de ese mínimo (`bajoMinimoLegal`, el banco no está obligado a
 * aceptarlo), la comisión de prepago estimada (`comisionClp`) y el
 * ahorro neto en intereses descontando esa comisión
 * (`interestSavedNetoClp`). El cálculo asume la modalidad "reducción de
 * plazo" (se mantiene el valor de la cuota) — es la que más ahorra en
 * intereses según la normativa; el banco también puede ofrecer reducir
 * la cuota manteniendo el plazo, lo que libera flujo de caja pero ahorra
 * menos.
 *
 * `montoDisponible` se entiende siempre en pesos. Los créditos
 * hipotecarios (guardados en UF) se convierten con `ufValue` para poder
 * repartir el monto de forma justa entre todas — si falta ese valor,
 * esos créditos quedan fuera del plan (no se puede saber cuántas UF
 * representa el monto disponible) y se listan en `excluded`.
 */
export function buildPaymentPlan(debts, montoDisponible, ufValue) {
  const usable = debts.filter((debt) => !isHipotecario(debt) || ufValue)
  const excluded = debts.filter((debt) => isHipotecario(debt) && !ufValue)

  const priorityOrder = [...usable].sort((a, b) => b.tasaInteresAnual - a.tasaInteresAnual)

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
