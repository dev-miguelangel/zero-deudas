import { useDebts } from '../../context/DebtsContext'
import { useIndicadores } from '../../context/IndicadoresContext'
import { allPayments, monthLabel } from '../../domain/payments'
import { formatCurrency, formatUF } from '../../lib/format'
import { debtTypeIcon, debtTypeLabel } from '../debtTypes'
import { ListIcon } from '../icons'

function formatDay(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export default function HistorialView() {
  const { debts } = useDebts()
  const { data: indicadores } = useIndicadores()
  const ufValue = indicadores?.uf?.valor ?? null

  const rows = allPayments(debts)

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600">
        Aún no has marcado ningún pago. Ve a la pestaña <strong>Pagos</strong> para
        registrar el primero.
      </div>
    )
  }

  function clpAmount(row) {
    if (row.tipo !== 'CH') return row.monto
    return ufValue ? row.monto * ufValue : null
  }

  let totalPagado = 0
  let unknownAmount = false
  rows.forEach((row) => {
    const clp = clpAmount(row)
    if (clp == null) unknownAmount = true
    else totalPagado += clp
  })

  const groups = []
  rows.forEach((row) => {
    const last = groups.at(-1)
    if (last && last.mes === row.mes) {
      last.rows.push(row)
    } else {
      groups.push({ mes: row.mes, rows: [row] })
    }
  })

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Historial de pagos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Todas las cuotas que has marcado como pagadas, más recientes primero.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total pagado</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {unknownAmount ? '—' : formatCurrency(totalPagado)}
            </p>
          </div>
          <div className="rounded-md bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Cuotas pagadas</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{rows.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group) => {
          const subtotalClp = group.rows.reduce((sum, row) => {
            const clp = clpAmount(row)
            return clp == null ? sum : sum + clp
          }, 0)
          return (
            <div key={group.mes}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {monthLabel(group.mes)}
                </h3>
                <span className="text-xs text-slate-500">{formatCurrency(subtotalClp)}</span>
              </div>
              <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {group.rows.map((row) => {
                  const TypeIcon = debtTypeIcon(row.tipo)
                  const hipotecario = row.tipo === 'CH'
                  return (
                    <div
                      key={`${row.debtId}-${row.mes}`}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <TypeIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {row.acreedor}
                          </p>
                          <p className="text-xs text-slate-500">
                            {debtTypeLabel(row.tipo)} · {formatDay(row.fecha)}
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        {hipotecario ? formatUF(row.monto) : formatCurrency(row.monto)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <ListIcon className="h-4 w-4" />
        Cada pago queda guardado junto a la deuda, cifrado en este navegador.
      </div>
    </section>
  )
}
