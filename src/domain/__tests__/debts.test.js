import { describe, expect, it } from 'vitest'
import {
  computeDerivedFields,
  createDebt,
  debtCalculatedSummary,
  isHipotecario,
  matchesAcreedorOrAlias,
  migrateDebt,
  validateDebt,
} from '../debts'

const validDebt = {
  acreedor: 'Banco X',
  tipo: 'CC',
  cantidadCuotas: 12,
  valorCuota: 15000,
  cuotasPagadas: 3,
}

describe('validateDebt', () => {
  it('no devuelve errores con datos válidos (sin monto original)', () => {
    expect(validateDebt(validDebt)).toEqual({})
  })

  it('no devuelve errores con monto original válido', () => {
    expect(validateDebt({ ...validDebt, montoOriginal: 150000 })).toEqual({})
  })

  it('exige un tipo de crédito válido', () => {
    const errors = validateDebt({ ...validDebt, tipo: 'no-existe' })
    expect(errors.tipo).toBeTruthy()
  })

  it('acepta los cinco tipos de crédito definidos', () => {
    for (const tipo of ['CC', 'CH', 'TC', 'LC', 'OT']) {
      expect(validateDebt({ ...validDebt, tipo })).toEqual({})
    }
  })

  it('exige cantidad de cuotas entera y mayor a 0', () => {
    expect(validateDebt({ ...validDebt, cantidadCuotas: 0 }).cantidadCuotas).toBeTruthy()
    expect(validateDebt({ ...validDebt, cantidadCuotas: 1.5 }).cantidadCuotas).toBeTruthy()
  })

  it('exige valor de cuota mayor a 0', () => {
    expect(validateDebt({ ...validDebt, valorCuota: 0 }).valorCuota).toBeTruthy()
  })

  it('exige cuotas pagadas presentes, enteras y no negativas', () => {
    expect(validateDebt({ ...validDebt, cuotasPagadas: '' }).cuotasPagadas).toBeTruthy()
    expect(validateDebt({ ...validDebt, cuotasPagadas: -1 }).cuotasPagadas).toBeTruthy()
    expect(validateDebt({ ...validDebt, cuotasPagadas: 1.5 }).cuotasPagadas).toBeTruthy()
  })

  it('rechaza cuotas pagadas mayores al total', () => {
    expect(validateDebt({ ...validDebt, cantidadCuotas: 12, cuotasPagadas: 13 }).cuotasPagadas).toBeTruthy()
  })

  it('el monto original es opcional, pero si se ingresa debe ser mayor a 0', () => {
    expect(validateDebt({ ...validDebt, montoOriginal: '' })).toEqual({})
    expect(validateDebt({ ...validDebt, montoOriginal: 0 }).montoOriginal).toBeTruthy()
  })
})

describe('isHipotecario', () => {
  it('identifica un crédito hipotecario por su código CH', () => {
    expect(isHipotecario({ tipo: 'CH' })).toBe(true)
    expect(isHipotecario({ tipo: 'CC' })).toBe(false)
    expect(isHipotecario(undefined)).toBe(false)
  })
})

describe('migrateDebt', () => {
  it('asigna tipo "OT" a una deuda guardada antes de tener tipo', () => {
    const legacyDebt = { id: '1', acreedor: 'Banco X', saldo: 1000, tasaInteresAnual: 10, pagoMinimo: 100 }
    expect(migrateDebt(legacyDebt).tipo).toBe('OT')
  })

  it('migra los tipos antiguos a los nuevos códigos de 2 letras', () => {
    expect(migrateDebt({ tipo: 'consumo' }).tipo).toBe('CC')
    expect(migrateDebt({ tipo: 'hipotecario' }).tipo).toBe('CH')
    expect(migrateDebt({ tipo: 'otro' }).tipo).toBe('OT')
  })

  it('no toca una deuda que ya tiene un tipo nuevo', () => {
    const debt = { acreedor: 'Banco X', tipo: 'CH' }
    expect(migrateDebt(debt)).toBe(debt)
  })
})

describe('computeDerivedFields', () => {
  it('sin monto original: tasa 0% y saldo simple (cuotas que faltan × valor cuota)', () => {
    const result = computeDerivedFields({
      cantidadCuotas: 12,
      valorCuota: 1000,
      cuotasPagadas: 5,
    })
    expect(result.tasaDisponible).toBe(false)
    expect(result.tasaInteresAnual).toBe(0)
    expect(result.saldo).toBe(7000)
    expect(result.montoTotalAPagar).toBe(12000)
    expect(result.cuotasRestantes).toBe(7)
  })

  it('con monto original: calcula tasa real y saldo vía amortización', () => {
    const result = computeDerivedFields({
      montoOriginal: 22121564,
      cantidadCuotas: 60,
      valorCuota: 516790,
      cuotasPagadas: 32,
    })
    expect(result.tasaDisponible).toBe(true)
    expect(result.tasaInteresAnual).toBeCloseTo(14.18, 1)
    expect(result.saldo).toBeGreaterThan(12000000)
    expect(result.saldo).toBeLessThan(12500000)
    expect(result.montoTotalAPagar).toBe(516790 * 60)
    expect(result.cuotasRestantes).toBe(28)
  })

  it('redondea la tasa real a 2 decimales', () => {
    const result = computeDerivedFields({
      montoOriginal: 22121564,
      cantidadCuotas: 60,
      valorCuota: 516790,
      cuotasPagadas: 32,
    })
    expect(result.tasaInteresAnual).toBe(Math.round(result.tasaInteresAnual * 100) / 100)
    expect(String(result.tasaInteresAnual).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(2)
  })

  it('con campos de cuotas incompletos, no calcula nada', () => {
    const result = computeDerivedFields({ cantidadCuotas: '', valorCuota: '', cuotasPagadas: '' })
    expect(result.saldo).toBeNull()
    expect(result.tasaInteresAnual).toBeNull()
    expect(result.montoTotalAPagar).toBeNull()
  })

  it('si el monto original no alcanza a explicar la cuota, cae a saldo simple sin tasa', () => {
    const result = computeDerivedFields({
      montoOriginal: 1000000,
      cantidadCuotas: 12,
      valorCuota: 1000,
      cuotasPagadas: 3,
    })
    expect(result.tasaDisponible).toBe(false)
    expect(result.tasaInteresAnual).toBe(0)
    expect(result.error).toBeTruthy()
    expect(result.saldo).toBe(9000)
  })
})

describe('createDebt', () => {
  it('guarda pagoMinimo igual al valor de la cuota y calcula saldo/tasa', () => {
    const debt = createDebt({
      acreedor: 'León',
      tipo: 'TC',
      alias: 'Compra notebook',
      cantidadCuotas: 6,
      valorCuota: 100000,
      cuotasPagadas: 2,
    })
    expect(debt.pagoMinimo).toBe(100000)
    expect(debt.saldo).toBe(400000)
    expect(debt.tasaInteresAnual).toBe(0)
    expect(debt.alias).toBe('Compra notebook')
    expect(debt.pagos).toEqual([])
    expect(debt.id).toBeTruthy()
  })
})

describe('debtCalculatedSummary', () => {
  it('sin monto original, no calcula pago en exceso', () => {
    const debt = createDebt({
      acreedor: 'León',
      tipo: 'TC',
      cantidadCuotas: 6,
      valorCuota: 100000,
      cuotasPagadas: 2,
    })
    const summary = debtCalculatedSummary(debt)
    expect(summary.excesoMonto).toBeNull()
    expect(summary.excesoPct).toBeNull()
  })

  it('con monto original, calcula el pago en exceso en monto y %', () => {
    const debt = createDebt({
      acreedor: 'León',
      tipo: 'TC',
      montoOriginal: 500000,
      cantidadCuotas: 6,
      valorCuota: 100000,
      cuotasPagadas: 0,
    })
    const summary = debtCalculatedSummary(debt)
    // monto total a pagar = 600.000, prestado = 500.000 → exceso de 100.000 (20%)
    expect(summary.excesoMonto).toBe(100000)
    expect(summary.excesoPct).toBe(20)
  })
})

describe('matchesAcreedorOrAlias', () => {
  const debt = { acreedor: 'Banco Estado', alias: 'Notebook trabajo' }

  it('calza por substring del acreedor, sin importar mayúsculas', () => {
    expect(matchesAcreedorOrAlias(debt, 'estado')).toBe(true)
    expect(matchesAcreedorOrAlias(debt, 'BANCO')).toBe(true)
  })

  it('calza por substring del alias', () => {
    expect(matchesAcreedorOrAlias(debt, 'trabajo')).toBe(true)
    expect(matchesAcreedorOrAlias(debt, 'note')).toBe(true)
  })

  it('no calza si no aparece en ninguno de los dos', () => {
    expect(matchesAcreedorOrAlias(debt, 'falabella')).toBe(false)
  })

  it('una búsqueda vacía siempre calza', () => {
    expect(matchesAcreedorOrAlias(debt, '')).toBe(true)
    expect(matchesAcreedorOrAlias(debt, '   ')).toBe(true)
    expect(matchesAcreedorOrAlias(debt, undefined)).toBe(true)
  })

  it('funciona sin alias', () => {
    expect(matchesAcreedorOrAlias({ acreedor: 'León' }, 'león')).toBe(true)
    expect(matchesAcreedorOrAlias({ acreedor: 'León' }, 'algo')).toBe(false)
  })
})
