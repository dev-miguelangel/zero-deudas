import { estimateBalanceAfterInstallments } from './rateEstimator'

/**
 * @typedef {'CC' | 'CH' | 'TC' | 'LC' | 'OT'} DebtType
 */

export const DEBT_TYPES = [
  { id: 'CC', label: 'Crédito de consumo' },
  { id: 'CH', label: 'Crédito hipotecario' },
  { id: 'TC', label: 'Tarjeta de crédito' },
  { id: 'LC', label: 'Línea de crédito' },
  { id: 'OT', label: 'Otras transacciones' },
]

/**
 * @typedef {Object} Debt
 * @property {string} id
 * @property {string} acreedor
 * @property {DebtType} tipo
 * @property {string} alias - etiqueta personal para identificar la deuda (ej. "TV Samsung")
 * @property {number|null} montoOriginal - monto original del crédito/compra, si se conoce (misma unidad que saldo)
 * @property {number} cantidadCuotas - número total de cuotas del crédito
 * @property {number} valorCuota - valor fijo de cada cuota (misma unidad que saldo)
 * @property {number} cuotasPagadas - cuántas de esas cuotas ya se pagaron
 * @property {number} saldo - en CLP, salvo créditos hipotecarios (en UF) — calculado
 * @property {number} tasaInteresAnual - porcentaje, ej. 24 = 24% anual — calculado
 * @property {number} pagoMinimo - misma unidad que saldo — igual a valorCuota
 */

const LEGACY_TYPE_MAP = { consumo: 'CC', hipotecario: 'CH', otro: 'OT' }

function round2(value) {
  return Math.round(value * 100) / 100
}

export function isHipotecario(debt) {
  return debt?.tipo === 'CH'
}

/**
 * Normaliza una deuda guardada con una versión anterior del modelo:
 * - tipos antiguos ('consumo'/'hipotecario'/'otro') pasan a los nuevos códigos
 *   de 2 letras (CC/CH/OT).
 * - deudas sin `tipo` (guardadas antes de que existiera el campo) quedan como
 *   'OT', la categoría más segura cuando no se sabe si eran de consumo o
 *   hipotecarias (estas últimas estarían en UF, no en CLP, y no se pueden
 *   inferir).
 * Las deudas migradas desde este modelo antiguo no tienen `cantidadCuotas`/
 * `valorCuota`/`cuotasPagadas`: siguen funcionando con su saldo/tasa/pago
 * mínimo ya guardados, y esos campos quedan vacíos hasta que se editen.
 */
export function migrateDebt(debt) {
  if (debt.tipo && LEGACY_TYPE_MAP[debt.tipo]) {
    return { ...debt, tipo: LEGACY_TYPE_MAP[debt.tipo] }
  }
  if (!debt.tipo) return { ...debt, tipo: 'OT' }
  return debt
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

/**
 * Calcula, a partir de lo que normalmente es fácil de saber de un crédito en
 * cuotas (cantidad total de cuotas, valor de la cuota, cuántas ya se
 * pagaron), lo que realmente importa: la tasa real, el monto total a pagar,
 * el saldo pendiente y las cuotas restantes.
 *
 * El monto original del crédito es opcional: sin él no hay forma matemática
 * de despejar una tasa de interés (quedaría con dos incógnitas), así que en
 * ese caso `tasaInteresAnual` queda en 0% y el saldo se estima de forma
 * simple (cuotas restantes × valor de la cuota, sin modelar interés).
 */
export function computeDerivedFields({ montoOriginal, cantidadCuotas, valorCuota, cuotasPagadas }) {
  const numCuotas = Number(cantidadCuotas)
  const montoCuota = Number(valorCuota)
  const paid = Number(cuotasPagadas)
  const cuotasValidas = numCuotas > 0 && montoCuota > 0
  const cuotasPagadasValidas = cuotasValidas && paid >= 0 && paid <= numCuotas

  const montoTotalAPagar = cuotasValidas ? montoCuota * numCuotas : null
  const cuotasRestantes = cuotasPagadasValidas ? numCuotas - paid : null
  const simpleSaldo = cuotasPagadasValidas ? Math.max(0, montoCuota * (numCuotas - paid)) : null

  if (!cuotasValidas) {
    return {
      saldo: null,
      tasaInteresAnual: null,
      montoTotalAPagar: null,
      cuotasRestantes: null,
      tasaDisponible: false,
      error: null,
    }
  }

  const tieneMontoOriginal = montoOriginal !== '' && montoOriginal != null && Number(montoOriginal) > 0
  if (!tieneMontoOriginal) {
    return {
      saldo: simpleSaldo,
      tasaInteresAnual: 0,
      montoTotalAPagar,
      cuotasRestantes,
      tasaDisponible: false,
      error: null,
    }
  }

  const { saldo, annualRate, error } = estimateBalanceAfterInstallments({
    montoCredito: montoOriginal,
    montoCuota: valorCuota,
    numCuotas: cantidadCuotas,
    cuotasPagadas,
  })

  if (error) {
    return {
      saldo: simpleSaldo,
      tasaInteresAnual: 0,
      montoTotalAPagar,
      cuotasRestantes,
      tasaDisponible: false,
      error,
    }
  }

  return {
    saldo,
    tasaInteresAnual: round2(annualRate),
    montoTotalAPagar,
    cuotasRestantes,
    tasaDisponible: true,
    error: null,
  }
}

export function createDebt({ acreedor, tipo, alias, montoOriginal, cantidadCuotas, valorCuota, cuotasPagadas }) {
  const derived = computeDerivedFields({ montoOriginal, cantidadCuotas, valorCuota, cuotasPagadas })
  return {
    id: crypto.randomUUID(),
    acreedor: acreedor.trim(),
    tipo,
    alias: alias?.trim() || '',
    montoOriginal: montoOriginal !== '' && montoOriginal != null ? Number(montoOriginal) : null,
    cantidadCuotas: Number(cantidadCuotas),
    valorCuota: Number(valorCuota),
    cuotasPagadas: Number(cuotasPagadas),
    saldo: derived.saldo ?? 0,
    tasaInteresAnual: derived.tasaInteresAnual ?? 0,
    pagoMinimo: Number(valorCuota),
    pagos: [],
  }
}

export function validateDebt({ acreedor, tipo, cantidadCuotas, valorCuota, cuotasPagadas, montoOriginal }) {
  const errors = {}
  if (!acreedor || !acreedor.trim()) errors.acreedor = 'El acreedor es obligatorio.'
  if (!DEBT_TYPES.some((t) => t.id === tipo)) errors.tipo = 'Elige un tipo de crédito.'

  const numCuotas = Number(cantidadCuotas)
  if (!(numCuotas > 0) || !Number.isInteger(numCuotas)) {
    errors.cantidadCuotas = 'Ingresa la cantidad total de cuotas (un número entero mayor a 0).'
  }

  if (!(Number(valorCuota) > 0)) errors.valorCuota = 'El valor de la cuota debe ser mayor a 0.'

  if (cuotasPagadas === '' || cuotasPagadas == null) {
    errors.cuotasPagadas = 'Ingresa cuántas cuotas ya pagaste (0 si ninguna).'
  } else {
    const paid = Number(cuotasPagadas)
    if (!(paid >= 0) || !Number.isInteger(paid)) {
      errors.cuotasPagadas = 'Debe ser un número entero mayor o igual a 0.'
    } else if (Number.isFinite(numCuotas) && paid > numCuotas) {
      errors.cuotasPagadas = 'No puedes haber pagado más cuotas que el total.'
    }
  }

  if (montoOriginal !== '' && montoOriginal != null && !(Number(montoOriginal) > 0)) {
    errors.montoOriginal = 'Si lo ingresas, debe ser mayor a 0.'
  }

  return errors
}

export function isValidDebt(debt) {
  return Object.keys(validateDebt(debt)).length === 0
}

/**
 * Resume una deuda ya guardada con la misma información que se muestra al
 * crearla (tasa real, monto total a pagar, saldo), para reutilizar en las
 * tarjetas de "Deudas". A diferencia de `computeDerivedFields`, no vuelve a
 * calcular nada: lee los valores ya guardados en la deuda.
 *
 * `tasaDisponible` es `false` solo cuando la deuda se creó con el flujo de
 * cuotas (tiene `cantidadCuotas`) y no se ingresó `montoOriginal` — en ese
 * caso la tasa guardada es el 0% de respaldo, no un valor real. Una deuda
 * antigua (sin `cantidadCuotas`, migrada del modelo anterior) siempre se
 * trata como si su tasa fuera real, porque se ingresó a mano.
 */
export function debtCalculatedSummary(debt) {
  const tieneCuotas = debt.cantidadCuotas != null && debt.valorCuota != null
  const montoTotalAPagar = tieneCuotas ? debt.valorCuota * debt.cantidadCuotas : null
  const tasaDisponible = !tieneCuotas || debt.montoOriginal != null
  return {
    tasaInteresAnual: round2(debt.tasaInteresAnual),
    tasaDisponible,
    montoTotalAPagar,
    saldo: debt.saldo,
  }
}
