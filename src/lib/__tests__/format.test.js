import { describe, expect, it } from 'vitest'
import { formatRate } from '../format'

describe('formatRate', () => {
  it('redondea a un máximo de 2 decimales', () => {
    expect(formatRate(14.185)).toBe('14,19')
    expect(formatRate(14.180000000000003)).toBe('14,18')
    expect(formatRate(45)).toBe('45')
  })

  it('no agrega decimales de más cuando el valor ya es entero o de 1 decimal', () => {
    expect(formatRate(20)).toBe('20')
    expect(formatRate(3.4)).toBe('3,4')
  })

  it('devuelve un guion para valores nulos o no numéricos', () => {
    expect(formatRate(null)).toBe('—')
    expect(formatRate(undefined)).toBe('—')
    expect(formatRate(NaN)).toBe('—')
  })
})
