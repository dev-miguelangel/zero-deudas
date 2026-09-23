import { describe, expect, it } from 'vitest'
import { buildPaymentPlan, minAbonoLegalClp, summarizePlanComparison } from '../paymentPlan'
import { installment } from '../rateEstimator'
import { simulate } from '../simulator'

const tarjeta = {
  id: 'a',
  acreedor: 'Tarjeta Falabella',
  tipo: 'TC',
  saldo: 500000,
  tasaInteresAnual: 45,
  pagoMinimo: 50000,
}

const consumo = {
  id: 'b',
  acreedor: 'Banco Estado',
  tipo: 'CC',
  saldo: 2000000,
  tasaInteresAnual: 18,
  pagoMinimo: 100000,
}

const hipotecario = {
  id: 'c',
  acreedor: 'Banco Chile',
  tipo: 'CH',
  saldo: 2000, // UF
  tasaInteresAnual: 4,
  pagoMinimo: 10,
}

describe('buildPaymentPlan', () => {
  it('ordena las deudas de mayor a menor tasa (estrategia avalancha)', () => {
    const { priorityOrder } = buildPaymentPlan([consumo, tarjeta], 0, null)
    expect(priorityOrder.map((d) => d.id)).toEqual(['a', 'b'])
  })

  it('con monto suficiente, salda por completo la deuda de mayor tasa y no toca la siguiente', () => {
    const { allocations, sobranteClp } = buildPaymentPlan([consumo, tarjeta], 500000, null)
    expect(allocations).toHaveLength(1)
    expect(allocations[0].debt.id).toBe('a')
    expect(allocations[0].appliedClp).toBe(500000)
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[0].saldoRestanteClp).toBe(0)
    expect(sobranteClp).toBe(0)
  })

  it('con monto insuficiente, hace abono parcial a capital de la de mayor tasa', () => {
    const { allocations } = buildPaymentPlan([consumo, tarjeta], 200000, null)
    expect(allocations).toHaveLength(1)
    expect(allocations[0].debt.id).toBe('a')
    expect(allocations[0].appliedClp).toBe(200000)
    expect(allocations[0].fullyPaid).toBe(false)
    expect(allocations[0].saldoRestanteClp).toBe(300000)
  })

  it('si sobra después de saldar la primera, sigue con la siguiente en la lista de prioridad', () => {
    const { allocations, sobranteClp } = buildPaymentPlan([consumo, tarjeta], 800000, null)
    expect(allocations).toHaveLength(2)
    expect(allocations[0].debt.id).toBe('a')
    expect(allocations[0].appliedClp).toBe(500000)
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[1].debt.id).toBe('b')
    expect(allocations[1].appliedClp).toBe(300000)
    expect(allocations[1].fullyPaid).toBe(false)
    expect(sobranteClp).toBe(0)
  })

  it('si el monto alcanza para saldar todo, el sobrante queda reflejado', () => {
    const { allocations, sobranteClp } = buildPaymentPlan([consumo, tarjeta], 3000000, null)
    expect(allocations).toHaveLength(2)
    expect(allocations.every((a) => a.fullyPaid)).toBe(true)
    expect(sobranteClp).toBe(3000000 - 500000 - 2000000)
  })

  it('calcula el interés y los meses que se ahorran con el abono', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 500000, null)
    const before = simulate(tarjeta)
    expect(allocations[0].interestSavedClp).toBeCloseTo(before.totalInterest, 5)
    expect(allocations[0].monthsSaved).toBe(before.months)
    expect(allocations[0].after.totalInterest).toBe(0)
  })

  it('deudas hipotecarias sin valor de UF quedan excluidas del plan', () => {
    const { excluded, allocations, priorityOrder } = buildPaymentPlan(
      [tarjeta, hipotecario],
      500000,
      null,
    )
    expect(excluded).toEqual([hipotecario])
    expect(priorityOrder.some((d) => d.id === 'c')).toBe(false)
    expect(allocations.some((a) => a.debt.id === 'c')).toBe(false)
  })

  it('con valor de UF, sí incluye e integra los créditos hipotecarios al mismo monto en pesos', () => {
    const ufValue = 39000
    const { priorityOrder, excluded } = buildPaymentPlan([tarjeta, hipotecario], 0, ufValue)
    expect(excluded).toEqual([])
    // hipotecario tasa 4% < tarjeta 45%, así que va después en la prioridad.
    expect(priorityOrder.map((d) => d.id)).toEqual(['a', 'c'])
  })

  it('sin monto disponible, no hay asignaciones', () => {
    const { allocations, sobranteClp } = buildPaymentPlan([consumo, tarjeta], 0, null)
    expect(allocations).toEqual([])
    expect(sobranteClp).toBe(0)
  })
})

describe('minAbonoLegalClp (Art. 10, Ley 18.010: 10% del saldo)', () => {
  it('para un crédito en pesos, es el 10% del saldo directo', () => {
    expect(minAbonoLegalClp(tarjeta, null)).toBe(50000)
  })

  it('para un hipotecario sin valor de UF, no se puede calcular', () => {
    expect(minAbonoLegalClp(hipotecario, null)).toBeNull()
  })

  it('para un hipotecario con valor de UF, convierte el saldo a pesos primero', () => {
    const ufValue = 39000
    expect(minAbonoLegalClp(hipotecario, ufValue)).toBe(2000 * ufValue * 0.1)
  })
})

describe('buildPaymentPlan — normativa de prepagos (Ley 18.010 / CMF)', () => {
  it('marca un abono parcial por debajo del 10% legal', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 10000, null) // 2% de 500.000
    expect(allocations[0].fullyPaid).toBe(false)
    expect(allocations[0].montoMinimoClp).toBe(50000)
    expect(allocations[0].bajoMinimoLegal).toBe(true)
  })

  it('un abono parcial igual o mayor al 10% no queda marcado', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 50000, null) // exactamente 10%
    expect(allocations[0].bajoMinimoLegal).toBe(false)
  })

  it('saldar por completo nunca queda marcado, aunque sea menor al 10% de otra deuda', () => {
    const barata = { id: 'z', acreedor: 'Chica', tipo: 'OT', saldo: 5000, tasaInteresAnual: 20, pagoMinimo: 1000 }
    const { allocations } = buildPaymentPlan([barata], 5000, null)
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[0].bajoMinimoLegal).toBe(false)
  })

  it('calcula la comisión de prepago (1 mes de interés) para créditos en pesos', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 100000, null)
    const monthlyRate = tarjeta.tasaInteresAnual / 100 / 12
    expect(allocations[0].comisionClp).toBeCloseTo(100000 * monthlyRate * 1, 5)
    expect(allocations[0].interestSavedNetoClp).toBeCloseTo(
      allocations[0].interestSavedClp - allocations[0].comisionClp,
      5,
    )
  })

  it('calcula la comisión de prepago (1,5 meses de interés) para créditos hipotecarios (UF)', () => {
    const ufValue = 39000
    const { allocations } = buildPaymentPlan([hipotecario], 500 * ufValue, ufValue)
    const monthlyRate = hipotecario.tasaInteresAnual / 100 / 12
    const appliedNative = allocations[0].appliedClp / ufValue
    const expectedComisionClp = appliedNative * monthlyRate * 1.5 * ufValue
    expect(allocations[0].comisionClp).toBeCloseTo(expectedComisionClp, 5)
  })

  it('con un abono parcial, calcula la nueva cuota manteniendo tasa y plazo restante (modalidad "reducción de cuota")', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 100000, null)
    const before = simulate(tarjeta)
    const monthlyRate = tarjeta.tasaInteresAnual / 100 / 12
    const nuevoSaldo = tarjeta.saldo - 100000
    const expectedCuota = installment(nuevoSaldo, monthlyRate, before.months)

    expect(allocations[0].nuevaCuotaClp).toBeCloseTo(expectedCuota, 5)
    expect(allocations[0].cuotaActualClp).toBe(tarjeta.pagoMinimo)
    expect(allocations[0].ahorroCuotaMensualClp).toBeCloseTo(
      tarjeta.pagoMinimo - expectedCuota,
      5,
    )
    expect(allocations[0].ahorroCuotaMensualClp).toBeGreaterThan(0)
  })

  it('calcula el ahorro bruto en intereses de la modalidad "reducción de cuota"', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 100000, null)
    const before = simulate(tarjeta)
    const nuevaCuota = allocations[0].nuevaCuotaClp
    const nuevoSaldo = tarjeta.saldo - 100000
    // La cuota nueva amortiza exactamente en `before.months` cuotas, así
    // que interés total = lo pagado en total menos el capital.
    const interesTotalOpcion2 = nuevaCuota * before.months - nuevoSaldo
    const expected = before.totalInterest - interesTotalOpcion2

    expect(allocations[0].interestSavedCuotaClp).toBeCloseTo(expected, 5)
    expect(allocations[0].interestSavedCuotaClp).toBeGreaterThan(0)
    // Reducir el plazo (Opción 1) siempre ahorra más interés que reducir
    // la cuota manteniendo el plazo (Opción 2), a igualdad de abono.
    expect(allocations[0].interestSavedClp).toBeGreaterThan(allocations[0].interestSavedCuotaClp)
  })

  it('si la deuda queda saldada por completo, no hay ahorro de la opción "reducción de cuota" que calcular', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 500000, null)
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[0].interestSavedCuotaClp).toBeNull()
  })

  it('si la deuda queda saldada por completo, no hay nueva cuota que calcular', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 500000, null)
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[0].nuevaCuotaClp).toBeNull()
    expect(allocations[0].ahorroCuotaMensualClp).toBeNull()
  })

  it('convierte la nueva cuota a pesos para créditos hipotecarios (UF)', () => {
    const ufValue = 39000
    const { allocations } = buildPaymentPlan([hipotecario], 500 * ufValue, ufValue)
    const before = simulate(hipotecario)
    const monthlyRate = hipotecario.tasaInteresAnual / 100 / 12
    const appliedNative = allocations[0].appliedClp / ufValue
    const nuevoSaldoNative = hipotecario.saldo - appliedNative
    const expectedCuotaClp = installment(nuevoSaldoNative, monthlyRate, before.months) * ufValue

    expect(allocations[0].nuevaCuotaClp).toBeCloseTo(expectedCuotaClp, 5)
    expect(allocations[0].cuotaActualClp).toBe(hipotecario.pagoMinimo * ufValue)
  })
})

describe('buildPaymentPlan — objetivo (\'interes\' vs \'flujo\')', () => {
  // Deliberadamente cruzadas: la barata tiene la tasa más baja pero el
  // saldo más chico, así el orden cambia según el objetivo.
  const barata = { id: 'x', acreedor: 'Chica', tipo: 'OT', saldo: 100000, tasaInteresAnual: 10, pagoMinimo: 20000 }
  const cara = { id: 'y', acreedor: 'Grande', tipo: 'TC', saldo: 1000000, tasaInteresAnual: 50, pagoMinimo: 100000 }

  it('por defecto (o con objetivo "interes"), ordena por tasa descendente — avalancha', () => {
    expect(buildPaymentPlan([barata, cara], 0, null).priorityOrder.map((d) => d.id)).toEqual([
      'y',
      'x',
    ])
    expect(
      buildPaymentPlan([barata, cara], 0, null, 'interes').priorityOrder.map((d) => d.id),
    ).toEqual(['y', 'x'])
  })

  it('con objetivo "flujo", ordena por saldo ascendente — bola de nieve', () => {
    const { priorityOrder } = buildPaymentPlan([barata, cara], 0, null, 'flujo')
    expect(priorityOrder.map((d) => d.id)).toEqual(['x', 'y'])
  })

  it('con objetivo "flujo", el monto se reparte empezando por la deuda de menor saldo', () => {
    const { allocations } = buildPaymentPlan([barata, cara], 150000, null, 'flujo')
    expect(allocations[0].debt.id).toBe('x')
    expect(allocations[0].fullyPaid).toBe(true)
    expect(allocations[1].debt.id).toBe('y')
    expect(allocations[1].appliedClp).toBe(50000)
  })
})

describe('summarizePlanComparison', () => {
  it('sin asignaciones, todos los totales quedan en 0', () => {
    const summary = summarizePlanComparison([], 'interes', null)
    expect(summary).toEqual({
      actual: { pagoTotalClp: 0, interesClp: 0, pagoMensualClp: 0 },
      plan: { pagoTotalClp: 0, interesClp: 0, pagoMensualClp: 0 },
      ahorroClp: 0,
    })
  })

  it('con una deuda saldada por completo, el interés y la cuota del plan bajan a 0', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 500000, null, 'interes')
    const summary = summarizePlanComparison(allocations, 'interes', null)
    const before = simulate(tarjeta)

    expect(summary.actual.pagoTotalClp).toBeCloseTo(500000 + before.totalInterest, 5)
    expect(summary.actual.interesClp).toBeCloseTo(before.totalInterest, 5)
    expect(summary.actual.pagoMensualClp).toBe(50000)

    expect(summary.plan.interesClp).toBe(0)
    expect(summary.plan.pagoMensualClp).toBe(0)
    expect(summary.plan.pagoTotalClp).toBeCloseTo(500000 + allocations[0].comisionClp, 5)

    expect(summary.ahorroClp).toBeGreaterThan(0)
    expect(summary.ahorroClp).toBeCloseTo(before.totalInterest - allocations[0].comisionClp, 5)
  })

  it('con abono parcial y objetivo "interes", el pago mensual del plan no cambia (reducción de plazo)', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 100000, null, 'interes')
    const summary = summarizePlanComparison(allocations, 'interes', null)

    expect(summary.plan.pagoMensualClp).toBe(summary.actual.pagoMensualClp)
    expect(summary.plan.interesClp).toBeLessThan(summary.actual.interesClp)
  })

  it('con abono parcial y objetivo "flujo", el pago mensual del plan baja (reducción de cuota)', () => {
    const { allocations } = buildPaymentPlan([tarjeta], 100000, null, 'flujo')
    const summary = summarizePlanComparison(allocations, 'flujo', null)

    expect(summary.plan.pagoMensualClp).toBeCloseTo(allocations[0].nuevaCuotaClp, 5)
    expect(summary.plan.pagoMensualClp).toBeLessThan(summary.actual.pagoMensualClp)
    // Reducir el plazo ahorra más interés que reducir la cuota, a igual abono.
    const summaryPlazo = summarizePlanComparison(allocations, 'interes', null)
    expect(summary.plan.interesClp).toBeGreaterThan(summaryPlazo.plan.interesClp)
  })

  it('convierte a pesos los montos de créditos hipotecarios (UF)', () => {
    const ufValue = 39000
    const { allocations } = buildPaymentPlan([hipotecario], 500 * ufValue, ufValue, 'interes')
    const summary = summarizePlanComparison(allocations, 'interes', ufValue)

    expect(summary.actual.pagoTotalClp).toBeGreaterThan(0)
    expect(summary.actual.pagoMensualClp).toBe(hipotecario.pagoMinimo * ufValue)
  })
})
