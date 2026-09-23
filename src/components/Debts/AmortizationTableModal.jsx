import { useState } from 'react'
import { isHipotecario } from '../../domain/debts'
import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatUF } from '../../lib/format'
import { CloseIcon, InfoIcon } from '../icons'

export default function AmortizationTableModal({ debt, ufValue, onClose }) {
  const [showLegend, setShowLegend] = useState(true)
  const hipotecario = isHipotecario(debt)
  const formatAmount = hipotecario ? formatUF : formatCurrency
  const result = simulate(debt)
  // La simulación solo proyecta hacia adelante desde el saldo de hoy, así
  // que las cuotas ya pagadas no aparecen como filas (ya están reflejadas
  // en ese saldo) — se muestran resumidas en una sola fila tenue arriba.
  const cuotasPagadas = Number.isInteger(debt.cuotasPagadas) ? debt.cuotasPagadas : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8">
      <div className="max-h-full w-[90vw] overflow-y-auto rounded-lg bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">Tabla de amortización</h2>
            <p className="truncate text-sm text-slate-500">
              {debt.acreedor}
              {debt.alias ? ` · ${debt.alias}` : ''}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {result.error ? (
          <p className="mt-4 text-sm text-red-600">{describeSimulationError(result.error, debt)}</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-slate-500">Cuotas restantes</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{result.months}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-slate-500">Interés total</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {formatAmount(result.totalInterest)}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-slate-500">Pago mensual</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {formatAmount(debt.pagoMinimo)}
                </p>
                {hipotecario && (
                  <p className="mt-0.5 text-slate-400">
                    {ufValue ? `≈ ${formatCurrency(debt.pagoMinimo * ufValue)}` : 'Cargando UF…'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLegend((v) => !v)}
                className="text-xs font-medium text-emerald-700 underline"
              >
                {showLegend ? 'Ocultar tips' : 'Mostrar tips'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Pagada
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Actual
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full border border-slate-300 bg-white" />
                Futura
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-4 md:flex-row">
              <div className="min-w-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 pr-3 md:max-h-[65vh]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="p-2 text-left font-medium">Cuota</th>
                      <th className="p-2 text-right font-medium">Interés</th>
                      <th className="p-2 text-right font-medium">Capital</th>
                      <th className="p-2 text-right font-medium">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cuotasPagadas > 0 && (
                      <tr className="bg-slate-50 italic text-slate-400">
                        <td className="p-2 text-left" colSpan={4}>
                          Cuotas 1–{cuotasPagadas} ya pagadas (reflejadas en el saldo actual)
                        </td>
                      </tr>
                    )}
                    {result.amortization.map((row) => {
                      const isCurrent = row.month === 1
                      const cuotaNumero = cuotasPagadas != null ? cuotasPagadas + row.month : row.month
                      return (
                        <tr
                          key={row.month}
                          className={isCurrent ? 'border-l-2 border-emerald-500 bg-emerald-50' : ''}
                        >
                          <td
                            className={`p-2 text-left ${
                              isCurrent ? 'font-semibold text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            {cuotaNumero}
                            {isCurrent && (
                              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                                Actual
                              </span>
                            )}
                          </td>
                          <td
                            className={`p-2 text-right ${
                              isCurrent ? 'text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            {formatAmount(row.interest)}
                          </td>
                          <td
                            className={`p-2 text-right ${
                              isCurrent ? 'text-emerald-800' : 'text-slate-700'
                            }`}
                          >
                            {formatAmount(row.principal)}
                          </td>
                          <td
                            className={`p-2 text-right font-medium ${
                              isCurrent ? 'text-emerald-900' : 'text-slate-900'
                            }`}
                          >
                            {formatAmount(row.balance)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {showLegend && (
                <div className="overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 md:max-h-[65vh] md:w-80 md:shrink-0">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 shrink-0 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-900">
                      ¿Qué es esto y cómo te sirve?
                    </p>
                  </div>
                  <p className="mt-2">
                    Cada cuota se reparte entre <strong>interés</strong> (lo que ya
                    &quot;ganó&quot; el acreedor por prestarte, calculado sobre el saldo
                    pendiente ese mes) y <strong>capital</strong> (lo que realmente reduce
                    tu deuda). Por eso al principio del crédito la mayor parte de la cuota
                    es interés, y hacia el final es casi todo capital — revisa cómo cambia
                    esa proporción fila a fila.
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Tips para tomar decisiones con esta tabla
                  </p>
                  <ul className="mt-1.5 list-disc space-y-1.5 pl-4">
                    <li>
                      Si el <strong>interés total</strong> (arriba) es alto comparado con
                      lo que pediste, esta deuda te está costando caro — prioriza pagarla
                      antes que otras con tasas más bajas (estrategia
                      &quot;avalancha&quot;).
                    </li>
                    <li>
                      Un abono extra <strong>a capital</strong> reduce el saldo sobre el
                      que se calcula el interés desde ese mes en adelante — cuanto antes
                      lo hagas, más interés total te ahorras.
                    </li>
                    <li>
                      Si durante muchos meses casi toda la cuota se va en interés, evalúa
                      refinanciar a una tasa menor: el ahorro puede ser mayor que el costo
                      de cambiarte.
                    </li>
                    <li>
                      Al pedir un abono extra a tu banco, especifica que sea &quot;abono a
                      capital&quot; — si no, puede que solo adelanten la próxima cuota sin
                      reducir el interés total que pagarás.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
