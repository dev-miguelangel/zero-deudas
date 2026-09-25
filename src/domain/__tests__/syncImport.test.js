import { describe, expect, it } from 'vitest'
import { describeDebtChanges, diffImportedDebts, mergeSelectedDebts } from '../syncImport'

const base = {
  id: 'a',
  acreedor: 'Banco X',
  tipo: 'CC',
  saldo: 100000,
  tasaInteresAnual: 20,
  pagoMinimo: 15000,
  pagos: [],
}

describe('diffImportedDebts', () => {
  it('marca como "new" una deuda del archivo que no existe en el perfil actual', () => {
    const [entry] = diffImportedDebts([base], [])
    expect(entry.status).toBe('new')
    expect(entry.existing).toBeNull()
  })

  it('marca como "identical" una deuda igual en ambos lados', () => {
    const [entry] = diffImportedDebts([base], [base])
    expect(entry.status).toBe('identical')
    expect(entry.existing).toEqual(base)
  })

  it('marca como "updated" una deuda con el mismo id pero datos distintos', () => {
    const current = { ...base, saldo: 90000 }
    const [entry] = diffImportedDebts([base], [current])
    expect(entry.status).toBe('updated')
    expect(entry.existing).toEqual(current)
    expect(entry.debt).toEqual(base)
  })

  it('migra tipos antiguos de las deudas del archivo antes de comparar', () => {
    const legacyFileDebt = { ...base, tipo: 'consumo' }
    const [entry] = diffImportedDebts([legacyFileDebt], [])
    expect(entry.debt.tipo).toBe('CC')
  })

  it('no toca las deudas del perfil actual que no vienen en el archivo', () => {
    const otherCurrent = { ...base, id: 'z' }
    const entries = diffImportedDebts([base], [otherCurrent])
    expect(entries).toHaveLength(1)
    expect(entries[0].debt.id).toBe('a')
  })
})

describe('describeDebtChanges', () => {
  it('lista los campos que cambiaron, con su valor antes y después', () => {
    const existing = { ...base, saldo: 90000, cuotasPagadas: 3 }
    const incoming = { ...base, saldo: 80000, cuotasPagadas: 4 }
    const changes = describeDebtChanges(existing, incoming)

    expect(changes).toContainEqual({ label: 'Saldo', from: 90000, to: 80000 })
    expect(changes).toContainEqual({ label: 'Cuotas pagadas', from: 3, to: 4 })
  })

  it('no reporta cambios en campos que quedaron iguales', () => {
    const changes = describeDebtChanges(base, { ...base, saldo: 90000 })
    expect(changes).not.toContainEqual(expect.objectContaining({ label: 'Acreedor' }))
  })

  it('incluye la cantidad de pagos registrados si cambió', () => {
    const existing = { ...base, pagos: [{ mes: '2026-01' }] }
    const incoming = { ...base, pagos: [{ mes: '2026-01' }, { mes: '2026-02' }] }
    const changes = describeDebtChanges(existing, incoming)
    expect(changes).toContainEqual({ label: 'Pagos registrados', from: 1, to: 2 })
  })

  it('sin cambios reales, devuelve una lista vacía', () => {
    expect(describeDebtChanges(base, base)).toEqual([])
  })
})

describe('mergeSelectedDebts', () => {
  it('agrega las deudas nuevas seleccionadas', () => {
    const entries = diffImportedDebts([base], [])
    const result = mergeSelectedDebts([], entries, new Set(['a']))
    expect(result).toEqual([base])
  })

  it('no agrega las deudas nuevas que no se seleccionaron', () => {
    const entries = diffImportedDebts([base], [])
    const result = mergeSelectedDebts([], entries, new Set())
    expect(result).toEqual([])
  })

  it('sobrescribe (conservando el id) las deudas actualizadas seleccionadas', () => {
    const current = { ...base, saldo: 90000 }
    const entries = diffImportedDebts([base], [current])
    const result = mergeSelectedDebts([current], entries, new Set(['a']))
    expect(result).toEqual([base])
  })

  it('deja intacta una deuda actualizada que no se seleccionó', () => {
    const current = { ...base, saldo: 90000 }
    const entries = diffImportedDebts([base], [current])
    const result = mergeSelectedDebts([current], entries, new Set())
    expect(result).toEqual([current])
  })

  it('no toca deudas del perfil actual que no están en el archivo', () => {
    const otherCurrent = { ...base, id: 'z' }
    const entries = diffImportedDebts([base], [otherCurrent])
    const result = mergeSelectedDebts([otherCurrent], entries, new Set(['a']))
    expect(result).toEqual([otherCurrent, base])
  })
})
