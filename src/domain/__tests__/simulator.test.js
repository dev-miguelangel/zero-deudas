import { describe, expect, it } from 'vitest'
import { simulate, sortAvalanche, sortSnowball } from '../simulator'

const debts = [
  { id: 'a', acreedor: 'Tarjeta A', saldo: 1000, tasaInteresAnual: 20, pagoMinimo: 100 },
  { id: 'b', acreedor: 'Tarjeta B', saldo: 300, tasaInteresAnual: 35, pagoMinimo: 50 },
  { id: 'c', acreedor: 'Tarjeta C', saldo: 2000, tasaInteresAnual: 10, pagoMinimo: 150 },
]

describe('sortSnowball', () => {
  it('ordena de menor a mayor saldo', () => {
    expect(sortSnowball(debts).map((d) => d.id)).toEqual(['b', 'a', 'c'])
  })
})

describe('sortAvalanche', () => {
  it('ordena de mayor a menor tasa de interés', () => {
    expect(sortAvalanche(debts).map((d) => d.id)).toEqual(['b', 'a', 'c'])
  })
})

describe('simulate', () => {
  it('sin abono adicional, ambas estrategias pagan el mismo interés total', () => {
    const snowball = simulate(debts, 'snowball', 0)
    const avalanche = simulate(debts, 'avalanche', 0)
    expect(snowball.error).toBeNull()
    expect(avalanche.error).toBeNull()
    expect(snowball.totalInterest).toBeCloseTo(avalanche.totalInterest, 6)
  })

  it('con abono adicional, avalancha nunca paga más interés que bola de nieve', () => {
    const snowball = simulate(debts, 'snowball', 200)
    const avalanche = simulate(debts, 'avalanche', 200)
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest + 1e-6)
  })

  it('detecta pago mínimo que no cubre el interés mensual', () => {
    const stuckDebts = [
      { id: 'x', acreedor: 'Deuda imposible', saldo: 10000, tasaInteresAnual: 36, pagoMinimo: 10 },
    ]
    const result = simulate(stuckDebts, 'snowball', 0)
    expect(result.error).toEqual({ code: 'MIN_PAYMENT_TOO_LOW', debtId: 'x' })
  })

  it('termina en 0 meses si no hay deudas', () => {
    const result = simulate([], 'snowball', 0)
    expect(result).toEqual({ months: 0, totalInterest: 0, timeline: [], amortization: [], error: null })
  })

  it('el saldo total llega a 0 al final de la simulación', () => {
    const result = simulate(debts, 'avalanche', 100)
    const last = result.timeline.at(-1)
    expect(last.totalBalance).toBeCloseTo(0, 1)
  })
})
