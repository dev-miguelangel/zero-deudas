/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} acreedor
 * @property {number} saldo - en CLP
 * @property {number} tasaInteresAnual - porcentaje, ej. 24 = 24% anual
 * @property {number} pagoMinimo - en CLP
 */

export function createDebt({ acreedor, saldo, tasaInteresAnual, pagoMinimo }) {
  return {
    id: crypto.randomUUID(),
    acreedor,
    saldo: Number(saldo),
    tasaInteresAnual: Number(tasaInteresAnual),
    pagoMinimo: Number(pagoMinimo),
  }
}

export function validateDebt({ acreedor, saldo, tasaInteresAnual, pagoMinimo }) {
  const errors = {}
  if (!acreedor || !acreedor.trim()) errors.acreedor = 'El acreedor es obligatorio.'
  if (!(Number(saldo) > 0)) errors.saldo = 'El saldo debe ser mayor a 0.'
  if (!(Number(tasaInteresAnual) >= 0)) errors.tasaInteresAnual = 'La tasa no puede ser negativa.'
  if (!(Number(pagoMinimo) > 0)) errors.pagoMinimo = 'El pago mínimo debe ser mayor a 0.'
  return errors
}

export function isValidDebt(debt) {
  return Object.keys(validateDebt(debt)).length === 0
}
