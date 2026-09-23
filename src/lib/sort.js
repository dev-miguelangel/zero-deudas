/**
 * Compara dos valores para ordenar una tabla: strings con `localeCompare`
 * (acentos/mayúsculas correctos en español), números por diferencia, y los
 * `null`/`undefined` siempre al final sin importar la dirección — es la
 * convención más predecible para columnas con datos que a veces faltan
 * (ej. "Tiempo restante" cuando la simulación no converge).
 */
export function compareValues(a, b, direction = 'asc') {
  const aNull = a == null
  const bNull = b == null
  if (aNull && bNull) return 0
  if (aNull) return 1
  if (bNull) return -1

  const cmp = typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b, 'es') : a - b
  return direction === 'asc' ? cmp : -cmp
}
