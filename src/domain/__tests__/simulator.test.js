import { describe, expect, it } from 'vitest'
import { projectUpcomingPayments, simulate, simulateCombined } from '../simulator'

const debtA = { id: 'a', acreedor: 'Tarjeta A', saldo: 1000, tasaInteresAnual: 20, pagoMinimo: 100 }
const debtB = { id: 'b', acreedor: 'Tarjeta B', saldo: 300, tasaInteresAnual: 35, pagoMinimo: 50 }

describe('simulate', () => {
  it('calcula meses e interés total de una deuda pagando el mínimo', () => {
    const result = simulate(debtA)
    expect(result.error).toBeNull()
    expect(result.months).toBeGreaterThan(0)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('detecta pago mínimo que no cubre el interés mensual', () => {
    const stuckDebt = { id: 'x', acreedor: 'Deuda imposible', saldo: 10000, tasaInteresAnual: 36, pagoMinimo: 10 }
    const result = simulate(stuckDebt)
    expect(result.error).toEqual({ code: 'MIN_PAYMENT_TOO_LOW', debtId: 'x' })
  })

  it('el saldo llega a 0 al final de la amortización', () => {
    const result = simulate(debtB)
    const last = result.timeline.at(-1)
    expect(last.totalBalance).toBeCloseTo(0, 1)
  })
})

describe('projectUpcomingPayments', () => {
  const typeOrder = ['CH', 'CC']

  it('suma el pago mensual (interés + capital) de cada deuda, agrupado por tipo', () => {
    const debts = [
      { ...debtA, tipo: 'CC' },
      { ...debtB, tipo: 'CC' },
    ]
    const { byType, totals } = projectUpcomingPayments(debts, typeOrder, null, 3)
    const row = byType.find((r) => r.tipo === 'CC')

    const resultA = simulate(debtA)
    const resultB = simulate(debtB)
    const expectedMonth0 =
      resultA.amortization[0].interest +
      resultA.amortization[0].principal +
      resultB.amortization[0].interest +
      resultB.amortization[0].principal

    expect(row.pendingUF).toBe(false)
    expect(row.amounts[0]).toBeCloseTo(expectedMonth0, 5)
    expect(totals[0]).toBeCloseTo(expectedMonth0, 5)
  })

  it('una deuda ya liquidada antes del mes proyectado aporta 0', () => {
    const shortDebt = { id: 's', acreedor: 'Corta', tipo: 'CC', saldo: 100, tasaInteresAnual: 0, pagoMinimo: 100 }
    const { byType } = projectUpcomingPayments([shortDebt], ['CC'], null, 3)
    const row = byType.find((r) => r.tipo === 'CC')
    expect(row.amounts[0]).toBeGreaterThan(0)
    expect(row.amounts[1]).toBe(0)
    expect(row.amounts[2]).toBe(0)
  })

  it('si la simulación no proyecta plazo, usa el pago mínimo como estimación', () => {
    const stuckDebt = { id: 'x', acreedor: 'Imposible', tipo: 'CC', saldo: 10000, tasaInteresAnual: 36, pagoMinimo: 10 }
    const { byType } = projectUpcomingPayments([stuckDebt], ['CC'], null, 2)
    const row = byType.find((r) => r.tipo === 'CC')
    expect(row.amounts[0]).toBe(10)
    expect(row.amounts[1]).toBe(10)
  })

  it('sin valor de UF, un tipo con hipotecarios queda pendiente y no calcula montos', () => {
    const mortgage = { id: 'h', acreedor: 'Banco', tipo: 'CH', saldo: 1000, tasaInteresAnual: 5, pagoMinimo: 50 }
    const { byType, totals } = projectUpcomingPayments([mortgage], ['CH'], null, 2)
    const row = byType.find((r) => r.tipo === 'CH')
    expect(row.pendingUF).toBe(true)
    expect(row.amounts).toEqual([null, null])
    expect(totals).toEqual([null, null])
  })

  it('con valor de UF, convierte los montos hipotecarios a pesos', () => {
    const mortgage = { id: 'h', acreedor: 'Banco', tipo: 'CH', saldo: 1000, tasaInteresAnual: 5, pagoMinimo: 50 }
    const ufValue = 39000
    const { byType, totals } = projectUpcomingPayments([mortgage], ['CH'], ufValue, 1)
    const result = simulate(mortgage)
    const expectedClp = (result.amortization[0].interest + result.amortization[0].principal) * ufValue
    const row = byType.find((r) => r.tipo === 'CH')
    expect(row.pendingUF).toBe(false)
    expect(row.amounts[0]).toBeCloseTo(expectedClp, 5)
    expect(totals[0]).toBeCloseTo(expectedClp, 5)
  })
})

describe('simulateCombined', () => {
  it('sin deudas seleccionadas, no hay nada que combinar', () => {
    const result = simulateCombined([], null)
    expect(result.months).toBeNull()
    expect(result.totalInterest).toBeNull()
    expect(result.amortization).toEqual([])
  })

  it('suma interés/capital/saldo de dos deudas mes a mes, hasta la más larga', () => {
    const result = simulateCombined([debtA, debtB], null)
    const resultA = simulate(debtA)
    const resultB = simulate(debtB)

    expect(result.months).toBe(Math.max(resultA.months, resultB.months))
    expect(result.amortization).toHaveLength(result.months)

    // Mes 1: ambas deudas siguen activas, se suman.
    expect(result.amortization[0].interest).toBeCloseTo(
      resultA.amortization[0].interest + resultB.amortization[0].interest,
      5,
    )
    expect(result.amortization[0].principal).toBeCloseTo(
      resultA.amortization[0].principal + resultB.amortization[0].principal,
      5,
    )

    // Último mes: solo la deuda más larga sigue activa (la otra aporta 0).
    const lastIndex = result.months - 1
    const shorter = resultA.months <= resultB.months ? resultA : resultB
    const longer = resultA.months <= resultB.months ? resultB : resultA
    expect(shorter.amortization[lastIndex]).toBeUndefined()
    expect(result.amortization[lastIndex].interest).toBeCloseTo(
      longer.amortization[lastIndex].interest,
      5,
    )
  })

  it('excluye deudas cuya simulación no converge, y las deja en `excluded`', () => {
    const stuckDebt = { id: 'x', acreedor: 'Imposible', saldo: 10000, tasaInteresAnual: 36, pagoMinimo: 10 }
    const result = simulateCombined([debtA, stuckDebt], null)
    expect(result.excluded).toHaveLength(1)
    expect(result.excluded[0].debt.id).toBe('x')
    expect(result.excluded[0].reason).toBe('MIN_PAYMENT_TOO_LOW')
    // El total solo considera debtA.
    const resultA = simulate(debtA)
    expect(result.months).toBe(resultA.months)
  })

  it('excluye hipotecarios sin valor de UF, y los convierte a pesos cuando sí lo hay', () => {
    const mortgage = { id: 'h', acreedor: 'Banco', tipo: 'CH', saldo: 1000, tasaInteresAnual: 5, pagoMinimo: 50 }

    const withoutUF = simulateCombined([mortgage], null)
    expect(withoutUF.excluded).toHaveLength(1)
    expect(withoutUF.excluded[0].reason).toBe('UF_PENDING')
    expect(withoutUF.months).toBeNull()

    const ufValue = 39000
    const withUF = simulateCombined([mortgage], ufValue)
    const result = simulate(mortgage)
    expect(withUF.excluded).toHaveLength(0)
    expect(withUF.amortization[0].interest).toBeCloseTo(result.amortization[0].interest * ufValue, 5)
  })
})
