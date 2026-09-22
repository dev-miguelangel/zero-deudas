/**
 * @typedef {'consumo' | 'hipotecario' | 'otro'} DebtType
 */

export const DEBT_TYPES = [
  { id: 'consumo', label: 'Crédito de consumo' },
  { id: 'hipotecario', label: 'Crédito hipotecario' },
  { id: 'otro', label: 'Otras cuotas' },
]

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} acreedor
 * @property {DebtType} tipo
 * @property {number} saldo - en CLP, salvo créditos hipotecarios (en UF)
 * @property {number} tasaInteresAnual - porcentaje, ej. 24 = 24% anual
 * @property {number} pagoMinimo - misma unidad que saldo
 */

export function isHipotecario(debt) {
  return debt?.tipo === 'hipotecario'
}

/**
 * Normaliza una deuda guardada antes de que existiera el campo `tipo`
 * (se guardaba solo `acreedor, saldo, tasaInteresAnual, pagoMinimo`).
 * Las clasifica como "otro" por defecto, ya que es la categoría más segura
 * cuando no se sabe si eran de consumo o hipotecarias (estas últimas
 * estarían en UF, no en CLP, y no se pueden inferir).
 */
export function migrateDebt(debt) {
  if (debt.tipo) return debt
  return { ...debt, tipo: 'otro' }
}

/**
 * Convierte una deuda hipotecaria (saldo/pago mínimo en UF) a su
 * equivalente en CLP usando el valor de UF del día, para poder sumarla o
 * proyectarla junto a deudas en CLP. El resultado no se guarda: es solo
 * para cálculos agregados (totales, gráficos). No hace falta convertir
 * para calcular cuotas/tiempo restante de una deuda sola, porque esa
 * cuenta es la misma en cualquier unidad.
 */
export function toCLPEquivalent(debt, ufValue) {
  if (!isHipotecario(debt) || !ufValue) return debt
  return {
    ...debt,
    saldo: debt.saldo * ufValue,
    pagoMinimo: debt.pagoMinimo * ufValue,
  }
}

export function createDebt({ acreedor, tipo, saldo, tasaInteresAnual, pagoMinimo }) {
  return {
    id: crypto.randomUUID(),
    acreedor,
    tipo,
    saldo: Number(saldo),
    tasaInteresAnual: Number(tasaInteresAnual),
    pagoMinimo: Number(pagoMinimo),
  }
}

export function validateDebt({ acreedor, tipo, saldo, tasaInteresAnual, pagoMinimo }) {
  const errors = {}
  if (!acreedor || !acreedor.trim()) errors.acreedor = 'El acreedor es obligatorio.'
  if (!DEBT_TYPES.some((t) => t.id === tipo)) errors.tipo = 'Elige un tipo de crédito.'
  if (!(Number(saldo) > 0)) errors.saldo = 'El saldo debe ser mayor a 0.'
  if (!(Number(tasaInteresAnual) >= 0)) errors.tasaInteresAnual = 'La tasa no puede ser negativa.'
  if (!(Number(pagoMinimo) > 0)) errors.pagoMinimo = 'El pago mínimo debe ser mayor a 0.'
  return errors
}

export function isValidDebt(debt) {
  return Object.keys(validateDebt(debt)).length === 0
}
