import { describe, expect, it } from 'vitest'
import {
  allPayments,
  currentMonthKey,
  isPaidForMonth,
  isSettled,
  markPaid,
  monthLabel,
  shiftMonthKey,
  unmarkLastPaid,
} from '../payments'

const debt = {
  id: 'a',
  acreedor: 'Banco X',
  tipo: 'consumo',
  saldo: 1000,
  tasaInteresAnual: 12,
  pagoMinimo: 100,
}

const debtB = {
  id: 'b',
  acreedor: 'Banco Y',
  tipo: 'otro',
  saldo: 500,
  tasaInteresAnual: 24,
  pagoMinimo: 80,
}

describe('currentMonthKey / monthLabel', () => {
  it('formatea como YYYY-MM', () => {
    expect(currentMonthKey(new Date(2026, 0, 15))).toBe('2026-01')
    expect(currentMonthKey(new Date(2026, 10, 1))).toBe('2026-11')
  })

  it('genera una etiqueta legible en español', () => {
    expect(monthLabel('2026-01')).toMatch(/enero.*2026/i)
  })
})

describe('shiftMonthKey', () => {
  it('avanza y retrocede meses dentro del mismo año', () => {
    expect(shiftMonthKey('2026-05', 1)).toBe('2026-06')
    expect(shiftMonthKey('2026-05', -1)).toBe('2026-04')
  })

  it('cruza el límite de año hacia adelante y hacia atrás', () => {
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01')
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12')
  })
})

describe('markPaid', () => {
  it('agrega el pago y baja el saldo en el capital de esa cuota', () => {
    const paid = markPaid(debt, '2026-01')
    expect(paid.pagos).toHaveLength(1)
    expect(paid.pagos[0].mes).toBe('2026-01')
    expect(paid.saldo).toBeLessThan(debt.saldo)
    expect(paid.saldo).toBeCloseTo(debt.saldo - paid.pagos[0].capital, 6)
  })

  it('no marca dos veces el mismo mes', () => {
    const once = markPaid(debt, '2026-01')
    const twice = markPaid(once, '2026-01')
    expect(twice).toBe(once)
  })

  it('no marca una deuda ya liquidada', () => {
    const settled = { ...debt, saldo: 0 }
    expect(markPaid(settled, '2026-01')).toBe(settled)
  })
})

describe('unmarkLastPaid', () => {
  it('revierte exactamente el último pago', () => {
    const paid = markPaid(debt, '2026-01')
    const undone = unmarkLastPaid(paid)
    expect(undone.pagos).toHaveLength(0)
    expect(undone.saldo).toBeCloseTo(debt.saldo, 6)
  })

  it('no hace nada sin pagos registrados', () => {
    expect(unmarkLastPaid(debt)).toBe(debt)
  })
})

describe('isPaidForMonth / isSettled', () => {
  it('detecta si un mes ya fue pagado', () => {
    const paid = markPaid(debt, '2026-01')
    expect(isPaidForMonth(paid, '2026-01')).toBe(true)
    expect(isPaidForMonth(paid, '2026-02')).toBe(false)
  })

  it('detecta una deuda liquidada', () => {
    expect(isSettled({ ...debt, saldo: 0 })).toBe(true)
    expect(isSettled(debt)).toBe(false)
  })
})

describe('allPayments', () => {
  it('junta los pagos de varias deudas con sus datos', () => {
    const paidA = markPaid(debt, '2026-01')
    const paidB = markPaid(debtB, '2026-01')
    const rows = allPayments([paidA, paidB])
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.acreedor).sort()).toEqual(['Banco X', 'Banco Y'])
    expect(rows[0]).toHaveProperty('debtId')
    expect(rows[0]).toHaveProperty('tipo')
  })

  it('ordena del pago más reciente al más antiguo', () => {
    const old = markPaid(debt, '2025-01')
    old.pagos[0].fecha = '2025-01-05T00:00:00.000Z'
    const recent = markPaid(old, '2025-02')
    recent.pagos[1].fecha = '2025-02-05T00:00:00.000Z'
    const rows = allPayments([recent])
    expect(rows[0].mes).toBe('2025-02')
    expect(rows[1].mes).toBe('2025-01')
  })

  it('devuelve lista vacía sin pagos', () => {
    expect(allPayments([debt, debtB])).toEqual([])
  })
})
