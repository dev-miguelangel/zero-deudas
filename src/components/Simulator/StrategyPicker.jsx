import HelpTip from '../HelpTip'
import { AvalancheIcon, SnowballIcon } from '../icons'
import NumericInput from '../NumericInput'

const options = [
  {
    id: 'snowball',
    label: 'Bola de Nieve',
    description: 'Prioriza la deuda con menor saldo. Ideal para ver resultados rápido.',
    Icon: SnowballIcon,
  },
  {
    id: 'avalanche',
    label: 'Avalancha',
    description: 'Prioriza la deuda con mayor interés. Ideal para pagar menos interés total.',
    Icon: AvalancheIcon,
  },
]

export default function StrategyPicker({
  strategy,
  onChangeStrategy,
  extraPaymentInput,
  onChangeExtraPaymentInput,
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900">Simulación</h2>
      <p className="mt-1 text-sm text-slate-600">
        ¿No sabes cuál estrategia elegir? Revisa la pestaña{' '}
        <strong>Aprende</strong> para ver la diferencia con ejemplos.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map(({ id, label, description, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeStrategy(id)}
            className={`flex flex-col gap-2 rounded-lg border p-4 text-left ${
              strategy === id
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-slate-900" />
              <span className="font-medium text-slate-900">{label}</span>
            </span>
            <span className="text-xs text-slate-500">{description}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="extra" className="flex items-center text-sm font-medium text-slate-700">
          Abono adicional mensual
          <HelpTip text="Plata extra que pones cada mes, por encima del pago mínimo de todas tus deudas, para bajar el saldo más rápido." />
        </label>
        <NumericInput
          id="extra"
          value={extraPaymentInput}
          onChange={onChangeExtraPaymentInput}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
