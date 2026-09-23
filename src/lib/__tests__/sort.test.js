import { describe, expect, it } from 'vitest'
import { compareValues } from '../sort'

describe('compareValues', () => {
  it('ordena números ascendente y descendente', () => {
    expect(compareValues(1, 2, 'asc')).toBeLessThan(0)
    expect(compareValues(1, 2, 'desc')).toBeGreaterThan(0)
    expect(compareValues(5, 5, 'asc')).toBe(0)
  })

  it('ordena strings con localeCompare (acentos/mayúsculas correctos)', () => {
    expect(compareValues('ana', 'Beto', 'asc')).toBeLessThan(0)
    expect(compareValues('árbol', 'banana', 'asc')).toBeLessThan(0)
  })

  it('deja los null/undefined siempre al final, sin importar la dirección', () => {
    expect(compareValues(null, 5, 'asc')).toBeGreaterThan(0)
    expect(compareValues(5, null, 'asc')).toBeLessThan(0)
    expect(compareValues(null, 5, 'desc')).toBeGreaterThan(0)
    expect(compareValues(5, null, 'desc')).toBeLessThan(0)
    expect(compareValues(null, undefined, 'asc')).toBe(0)
  })

  it('una lista se ordena de forma estable y predecible con .sort()', () => {
    const values = [3, null, 1, 2]
    expect(values.slice().sort((a, b) => compareValues(a, b, 'asc'))).toEqual([1, 2, 3, null])
    expect(values.slice().sort((a, b) => compareValues(a, b, 'desc'))).toEqual([3, 2, 1, null])
  })
})
