import { describe, expect, it } from 'vitest'
import { estimateAnnualRate, estimateBalanceAfterInstallments } from '../rateEstimator'

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

describe('estimateBalanceAfterInstallments', () => {
  it('con 0% de interés, el saldo baja de forma lineal', () => {
    const { saldo, error } = estimateBalanceAfterInstallments({
      montoCredito: 1200,
      montoCuota: 100,
      numCuotas: 12,
      cuotasPagadas: 6,
    })
    expect(error).toBeNull()
    expect(saldo).toBeCloseTo(600, 0)
  })

  it('sin cuotas pagadas, el saldo es el monto original', () => {
    const { saldo, error } = estimateBalanceAfterInstallments({
      montoCredito: 1200,
      montoCuota: 100,
      numCuotas: 12,
      cuotasPagadas: 0,
    })
    expect(error).toBeNull()
    expect(saldo).toBe(1200)
  })

  it('estima el saldo de un crédito real (caso verificado a mano)', () => {
    const { saldo, error } = estimateBalanceAfterInstallments({
      montoCredito: 22121564,
      montoCuota: 516790,
      numCuotas: 60,
      cuotasPagadas: 32,
    })
    expect(error).toBeNull()
    // El saldo real reportado era $12.272.984; la tasa es una estimación,
    // así que se compara con tolerancia (~1%).
    expect(saldo).toBeGreaterThan(12000000)
    expect(saldo).toBeLessThan(12500000)
  })

  it('rechaza más cuotas pagadas que el total de cuotas', () => {
    const { saldo, error } = estimateBalanceAfterInstallments({
      montoCredito: 1200,
      montoCuota: 100,
      numCuotas: 12,
      cuotasPagadas: 13,
    })
    expect(saldo).toBeNull()
    expect(error).toMatch(/más cuotas/)
  })

  it('propaga el error de estimateAnnualRate si los datos base son inválidos', () => {
    const { saldo, error } = estimateBalanceAfterInstallments({
      montoCredito: 0,
      montoCuota: 100,
      numCuotas: 12,
      cuotasPagadas: 3,
    })
    expect(saldo).toBeNull()
    expect(error).toMatch(/Completa/)
  })
})
