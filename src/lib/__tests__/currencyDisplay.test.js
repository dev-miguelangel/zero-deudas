import { describe, expect, it } from 'vitest'
import { convertAmount, formatDisplayAmount } from '../currencyDisplay'

const indicadores = { ufValue: 39000, dolarValue: 970 }

describe('convertAmount', () => {
  it('modo "original": no convierte, devuelve el monto en su propia moneda', () => {
    expect(convertAmount(100000, 'CLP', 'original', indicadores)).toEqual({
      value: 100000,
      currency: 'CLP',
    })
    expect(convertAmount(500, 'UF', 'original', indicadores)).toEqual({
      value: 500,
      currency: 'UF',
    })
  })

  it('convierte CLP -> UF y CLP -> USD usando los indicadores', () => {
    expect(convertAmount(39000, 'CLP', 'UF', indicadores)).toEqual({ value: 1, currency: 'UF' })
    expect(convertAmount(970, 'CLP', 'USD', indicadores)).toEqual({ value: 1, currency: 'USD' })
  })

  it('convierte UF -> CLP y UF -> USD pivoteando por CLP', () => {
    expect(convertAmount(1, 'UF', 'CLP', indicadores)).toEqual({ value: 39000, currency: 'CLP' })
    expect(convertAmount(1, 'UF', 'USD', indicadores)).toEqual({
      value: 39000 / 970,
      currency: 'USD',
    })
  })

  it('elegir el mismo modo que la moneda nativa es una identidad exacta (sin ida y vuelta)', () => {
    expect(convertAmount(1234.5678, 'UF', 'UF', indicadores)).toEqual({
      value: 1234.5678,
      currency: 'UF',
    })
  })

  it('si falta el indicador necesario, cae de vuelta a la moneda original en vez de romper', () => {
    expect(convertAmount(1, 'UF', 'CLP', { ufValue: null, dolarValue: 970 })).toEqual({
      value: 1,
      currency: 'UF',
    })
    expect(convertAmount(100000, 'CLP', 'USD', { ufValue: 39000, dolarValue: null })).toEqual({
      value: 100000,
      currency: 'CLP',
    })
  })

  it('con amount null, devuelve null sin intentar convertir', () => {
    expect(convertAmount(null, 'CLP', 'UF', indicadores)).toEqual({ value: null, currency: 'CLP' })
  })
})

describe('formatDisplayAmount', () => {
  it('formatea según la moneda resultante de la conversión', () => {
    expect(formatDisplayAmount(39000, 'CLP', 'UF', indicadores)).toBe('1 UF')
    expect(formatDisplayAmount(100000, 'CLP', 'original', indicadores)).toContain('100.000')
  })

  it('con amount null, muestra un guion', () => {
    expect(formatDisplayAmount(null, 'CLP', 'original', indicadores)).toBe('—')
  })
})
