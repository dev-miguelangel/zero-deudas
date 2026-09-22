import { describe, expect, it } from 'vitest'
import { isHipotecario, migrateDebt, validateDebt } from '../debts'

const validDebt = {
  acreedor: 'Banco X',
  tipo: 'consumo',
  saldo: 100000,
  tasaInteresAnual: 20,
  pagoMinimo: 15000,
}

describe('validateDebt', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateDebt(validDebt)).toEqual({})
  })

  it('exige un tipo de crédito válido', () => {
    const errors = validateDebt({ ...validDebt, tipo: 'no-existe' })
    expect(errors.tipo).toBeTruthy()
  })

  it('acepta los tres tipos de crédito definidos', () => {
    for (const tipo of ['consumo', 'hipotecario', 'otro']) {
      expect(validateDebt({ ...validDebt, tipo })).toEqual({})
    }
  })
})

describe('isHipotecario', () => {
  it('identifica un crédito hipotecario', () => {
    expect(isHipotecario({ tipo: 'hipotecario' })).toBe(true)
    expect(isHipotecario({ tipo: 'consumo' })).toBe(false)
    expect(isHipotecario(undefined)).toBe(false)
  })
})

describe('migrateDebt', () => {
  it('asigna tipo "otro" a una deuda guardada antes de tener tipo', () => {
    const legacyDebt = { id: '1', acreedor: 'Banco X', saldo: 1000, tasaInteresAnual: 10, pagoMinimo: 100 }
    expect(migrateDebt(legacyDebt).tipo).toBe('otro')
  })

  it('no toca una deuda que ya tiene tipo', () => {
    const debt = { ...validDebt, tipo: 'hipotecario' }
    expect(migrateDebt(debt)).toBe(debt)
  })
})
