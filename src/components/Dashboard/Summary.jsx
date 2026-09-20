import { describeSimulationError, simulate } from '../../domain/simulator'
import { formatCurrency, formatMonths } from '../../lib/format'
import HelpTip from '../HelpTip'
import { TargetIcon } from '../icons'

const strategyLabels = { snowball: 'Bola de Nieve', avalanche: 'Avalancha' }

const cardHelp = {
  'Deuda total': 'La suma de los saldos pendientes de todas tus deudas hoy.',
  'Tiempo restante':
    'Cuántos meses faltan para llegar a $0, con la estrategia y el abono adicional elegidos.',
  'Ahorro en intereses':
    'Cuánto interés te ahorras por poner un abono adicional, comparado con pagar solo el mínimo.',
  Estrategia: 'El método que estás usando para decidir a qué deuda va tu abono adicional.',
}

export default function Summary({ debts, strategy, extraPayment }) {
  if (debts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600">
        Agrega al menos una deuda para ver tu resumen.
      </div>
    )
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.saldo, 0)
  const withExtra = simulate(debts, strategy, extraPayment)
  const baseline = simulate(debts, strategy, 0)

  if (withExtra.error) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
        <p className="mt-2 text-sm text-red-600">
          {describeSimulationError(withExtra.error, debts)}
        </p>
      </div>
    )
  }

  const ahorro = baseline.error ? null : baseline.totalInterest - withExtra.totalInterest

  const cards = [
    { label: 'Deuda total', value: formatCurrency(totalDebt) },
    { label: 'Tiempo restante', value: formatMonths(withExtra.months) },
    {
      label: 'Ahorro en intereses',
      value: ahorro == null ? '—' : formatCurrency(ahorro),
    },
    { label: 'Estrategia', value: strategyLabels[strategy] },
  ]

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2">
        <TargetIcon className="h-5 w-5 text-slate-900" />
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md bg-slate-50 p-4">
            <p className="flex items-center text-xs text-slate-500">
              {card.label}
              {cardHelp[card.label] && <HelpTip text={cardHelp[card.label]} />}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
