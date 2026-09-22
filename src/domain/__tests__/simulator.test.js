import { describe, expect, it } from 'vitest'
import { simulate } from '../simulator'

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
