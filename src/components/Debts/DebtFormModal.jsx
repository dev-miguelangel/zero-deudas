import { useState } from 'react'
import { DEBT_TYPES, computeDerivedFields, validateDebt } from '../../domain/debts'
import { formatRate } from '../../lib/format'
import { debtTypeIcon } from '../debtTypes'
import HelpTip from '../HelpTip'
import NumericInput from '../NumericInput'

const emptyForm = {
  acreedor: '',
  tipo: 'CC',
  alias: '',
  montoOriginal: '',
  cantidadCuotas: '',
  valorCuota: '',
  cuotasPagadas: '',
}

const helpText = {
  montoOriginal:
    'Lo que pediste prestado o el valor de la compra original. Es opcional, pero sin él no se puede calcular la tasa real — el saldo se estimará de forma simple (cuotas que faltan × valor de la cuota).',
  cantidadCuotas: 'El número total de cuotas del crédito, de principio a fin.',
  valorCuota: 'El valor fijo que pagas cada mes por esta deuda.',
  cuotasPagadas: 'Cuántas de esas cuotas ya pagaste hasta hoy. Pon 0 si ninguna.',
}

function formatNumber(value, decimals = 2) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-CL', { maximumFractionDigits: decimals })
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
  )
}

export default function DebtFormModal({ initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState(() =>
    initialValue
      ? {
          acreedor: initialValue.acreedor ?? '',
          tipo: initialValue.tipo ?? 'CC',
          alias: initialValue.alias ?? '',
          montoOriginal: initialValue.montoOriginal != null ? String(initialValue.montoOriginal) : '',
          cantidadCuotas: initialValue.cantidadCuotas != null ? String(initialValue.cantidadCuotas) : '',
          valorCuota: initialValue.valorCuota != null ? String(initialValue.valorCuota) : '',
          cuotasPagadas: initialValue.cuotasPagadas != null ? String(initialValue.cuotasPagadas) : '',
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState({})

  const esHipotecario = form.tipo === 'CH'
  const unidad = esHipotecario ? 'UF' : 'CLP'

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateDebt(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit(form)
  }

  const derived = computeDerivedFields(form)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8">
      <div className="max-h-full w-[90vw] overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialValue ? 'Editar deuda' : 'Nueva deuda'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="min-w-0 flex-1 space-y-5">
              <div className="space-y-3">
                <SectionTitle>Identificación</SectionTitle>

                <div>
                  <p className="text-sm font-medium text-slate-700">Tipo de crédito</p>
                  <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {DEBT_TYPES.map((type) => {
                      const Icon = debtTypeIcon(type.id)
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleChange('tipo', type.id)}
                          className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium ${
                            form.tipo === type.id
                              ? 'border-slate-900 bg-slate-50 text-slate-900'
                              : 'border-slate-300 text-slate-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {type.label}
                        </button>
                      )
                    })}
                  </div>
                  {esHipotecario && (
                    <p className="mt-1 text-xs text-slate-500">
                      El monto original y la cuota se ingresan en UF, y se convierten a pesos
                      con el valor de la UF del día.
                    </p>
                  )}
                  {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="acreedor" className="block text-sm font-medium text-slate-700">
                      Acreedor
                    </label>
                    <input
                      id="acreedor"
                      type="text"
                      value={form.acreedor}
                      onChange={(e) => handleChange('acreedor', e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    {errors.acreedor && (
                      <p className="mt-1 text-xs text-red-600">{errors.acreedor}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="alias" className="block text-sm font-medium text-slate-700">
                      Alias <span className="font-normal text-slate-400">(opcional)</span>
                    </label>
                    <input
                      id="alias"
                      type="text"
                      placeholder="Ej. TV Samsung 55”"
                      value={form.alias}
                      onChange={(e) => handleChange('alias', e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <SectionTitle>Cuotas y monto</SectionTitle>

                <div>
                  <label
                    htmlFor="montoOriginal"
                    className="flex items-center text-sm font-medium text-slate-700"
                  >
                    Monto original del crédito ({unidad}){' '}
                    <span className="ml-1 font-normal text-slate-400">(opcional)</span>
                    <HelpTip text={helpText.montoOriginal} />
                  </label>
                  <NumericInput
                    id="montoOriginal"
                    value={form.montoOriginal}
                    onChange={(value) => handleChange('montoOriginal', value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                  {errors.montoOriginal && (
                    <p className="mt-1 text-xs text-red-600">{errors.montoOriginal}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="cantidadCuotas"
                      className="flex items-center text-sm font-medium text-slate-700"
                    >
                      Cuotas totales
                      <HelpTip text={helpText.cantidadCuotas} />
                    </label>
                    <NumericInput
                      id="cantidadCuotas"
                      value={form.cantidadCuotas}
                      onChange={(value) => handleChange('cantidadCuotas', value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    {errors.cantidadCuotas && (
                      <p className="mt-1 text-xs text-red-600">{errors.cantidadCuotas}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="cuotasPagadas"
                      className="flex items-center text-sm font-medium text-slate-700"
                    >
                      Pagadas
                      <HelpTip text={helpText.cuotasPagadas} />
                    </label>
                    <NumericInput
                      id="cuotasPagadas"
                      value={form.cuotasPagadas}
                      onChange={(value) => handleChange('cuotasPagadas', value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    {errors.cuotasPagadas && (
                      <p className="mt-1 text-xs text-red-600">{errors.cuotasPagadas}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="valorCuota"
                      className="flex items-center text-sm font-medium text-slate-700"
                    >
                      Valor cuota
                      <HelpTip text={helpText.valorCuota} />
                    </label>
                    <NumericInput
                      id="valorCuota"
                      value={form.valorCuota}
                      onChange={(value) => handleChange('valorCuota', value)}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    {errors.valorCuota && (
                      <p className="mt-1 text-xs text-red-600">{errors.valorCuota}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:w-72 md:shrink-0">
              <SectionTitle>Resultado</SectionTitle>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-700">Con esos datos, calculamos:</p>
                <dl className="mt-2 grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-slate-500">Tasa real</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {derived.tasaDisponible
                      ? `${formatRate(derived.tasaInteresAnual)}% anual`
                      : derived.tasaInteresAnual === 0
                        ? '0% (sin monto original)'
                        : '—'}
                  </dd>
                  <dt className="text-slate-500">Monto total a pagar</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {derived.montoTotalAPagar != null
                      ? `${formatNumber(derived.montoTotalAPagar, 0)} ${unidad}`
                      : '—'}
                  </dd>
                  <dt className="text-slate-500">Saldo</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {derived.saldo != null ? `${formatNumber(derived.saldo, 0)} ${unidad}` : '—'}
                  </dd>
                  <dt className="text-slate-500">Tiempo restante</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {derived.cuotasRestantes != null ? `${derived.cuotasRestantes} cuotas` : '—'}
                  </dd>
                </dl>
                {!derived.tasaDisponible && form.montoOriginal !== '' && derived.error && (
                  <p className="mt-2 text-xs text-red-600">{derived.error}</p>
                )}
                {!derived.tasaDisponible && form.montoOriginal === '' && (
                  <p className="mt-2 text-xs text-slate-500">
                    Sin el monto original no se puede calcular la tasa real: se usa 0% y el
                    saldo es solo cuotas que faltan × valor de la cuota.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
