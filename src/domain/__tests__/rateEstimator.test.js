import { describe, expect, it } from 'vitest'
import { estimateAnnualRate } from '../rateEstimator'

describe('estimateAnnualRate', () => {
  it('estima la tasa anual de un crédito real (caso verificado a mano)', () => {
    const { annualRate, error } = estimateAnnualRate({
      montoCredito: 22121564,
      montoCuota: 516790,
      numCuotas: 60,
    })
    expect(error).toBeNull()
    expect(annualRate).toBeCloseTo(14.18, 1)
  })

  it('devuelve 0% cuando la cuota solo cubre el capital (sin interés)', () => {
    const { annualRate, error } = estimateAnnualRate({
      montoCredito: 1200,
      montoCuota: 100,
      numCuotas: 12,
    })
    expect(error).toBeNull()
    expect(annualRate).toBeCloseTo(0, 3)
  })

  it('rechaza cuotas que no alcanzan a cubrir el crédito', () => {
    const { annualRate, error } = estimateAnnualRate({
      montoCredito: 1000000,
      montoCuota: 1000,
      numCuotas: 12,
    })
    expect(annualRate).toBeNull()
    expect(error).toMatch(/menor al monto del crédito/)
  })

  it('rechaza campos incompletos o en cero', () => {
    const { annualRate, error } = estimateAnnualRate({
      montoCredito: 0,
      montoCuota: 100,
      numCuotas: 12,
    })
    expect(annualRate).toBeNull()
    expect(error).toMatch(/Completa/)
  })
})
