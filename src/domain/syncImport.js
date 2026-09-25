import { migrateDebt } from './debts'

const COMPARABLE_FIELDS = [
  { key: 'acreedor', label: 'Acreedor' },
  { key: 'alias', label: 'Alias' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'montoOriginal', label: 'Monto original' },
  { key: 'cantidadCuotas', label: 'Cuotas totales' },
  { key: 'valorCuota', label: 'Valor cuota' },
  { key: 'cuotasPagadas', label: 'Cuotas pagadas' },
  { key: 'saldo', label: 'Saldo' },
  { key: 'tasaInteresAnual', label: 'Tasa' },
  { key: 'pagoMinimo', label: 'Pago mínimo' },
]

/**
 * Compara las deudas de un archivo importado contra las del perfil
 * actual, por `id` interno (no por nombre, para no confundirse con
 * typos o acreedores repetidos). Cada deuda del archivo queda
 * clasificada como:
 * - `'new'` — no existe todavía en el perfil actual.
 * - `'updated'` — existe, pero con datos distintos.
 * - `'identical'` — existe y es exactamente igual (nada que hacer).
 *
 * Cada deuda del archivo pasa por `migrateDebt` primero, por si viene de
 * una versión más vieja del modelo de datos.
 */
export function diffImportedDebts(fileDebts, currentDebts) {
  const currentById = new Map(currentDebts.map((d) => [d.id, d]))

  return fileDebts.map((raw) => {
    const debt = migrateDebt(raw)
    const existing = currentById.get(debt.id) ?? null
    if (!existing) return { debt, existing, status: 'new' }

    const identical = JSON.stringify(existing) === JSON.stringify(debt)
    return { debt, existing, status: identical ? 'identical' : 'updated' }
  })
}

/**
 * Para una entrada `'updated'` de `diffImportedDebts`, arma la lista de
 * qué campos cambiaron (y sus valores antes/después), para mostrarle al
 * usuario qué va a pasar si aplica esa actualización. Incluye también si
 * cambió la cantidad de pagos registrados (el detalle de cada pago no se
 * compara campo a campo, alcanza con saber que hay más o menos).
 */
export function describeDebtChanges(existing, incoming) {
  const changes = COMPARABLE_FIELDS.filter(({ key }) => existing[key] !== incoming[key]).map(
    ({ key, label }) => ({ label, from: existing[key], to: incoming[key] }),
  )

  const pagosAntes = existing.pagos?.length ?? 0
  const pagosDespues = incoming.pagos?.length ?? 0
  if (pagosAntes !== pagosDespues) {
    changes.push({ label: 'Pagos registrados', from: pagosAntes, to: pagosDespues })
  }

  return changes
}

/**
 * Aplica una selección de entradas (de `diffImportedDebts`, filtradas por
 * `selectedIds`) a la lista de deudas actuales: agrega las nuevas
 * seleccionadas y sobrescribe (por `id`, conservándolo) las actualizadas
 * seleccionadas — el resto del perfil actual queda intacto, incluidas las
 * deudas del archivo que no se seleccionaron.
 */
export function mergeSelectedDebts(currentDebts, entries, selectedIds) {
  const selected = entries.filter((entry) => selectedIds.has(entry.debt.id))
  const updatedById = new Map(
    selected.filter((entry) => entry.status === 'updated').map((entry) => [entry.debt.id, entry.debt]),
  )
  const newDebts = selected.filter((entry) => entry.status === 'new').map((entry) => entry.debt)

  const merged = currentDebts.map((debt) => updatedById.get(debt.id) ?? debt)
  return [...merged, ...newDebts]
}
