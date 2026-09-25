import {
  BoltIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  LockIcon,
  PlusIcon,
  TableIcon,
  TargetIcon,
  UploadIcon,
} from '../icons'
import AppMockupCarousel from './AppMockupCarousel'

const COMPARISON = [
  {
    planilla: 'Tú anotas los números a mano',
    zerodeudas: 'Calcula la tasa real solo con tus cuotas',
  },
  {
    planilla: 'No sabe qué deuda conviene pagar primero',
    zerodeudas: 'Te arma un plan de pago (avalancha o bola de nieve)',
  },
  {
    planilla: 'Cualquiera que abra el archivo ve todo',
    zerodeudas: 'Cifrado real en tu navegador — ni la app ve tus datos',
  },
  {
    planilla: 'No conoce la ley de prepagos',
    zerodeudas: 'Calcula el mínimo legal y la comisión según la Ley 18.010',
  },
  {
    planilla: 'Vive en un solo computador',
    zerodeudas: 'Se sincroniza entre dispositivos con un archivo cifrado',
  },
]

const STEPS = [
  {
    icon: LockIcon,
    title: 'Crea tu perfil y una clave',
    text: 'Todo se cifra en tu navegador con esa clave — nunca sale de tu equipo, ni siquiera hacia nosotros.',
  },
  {
    icon: PlusIcon,
    title: 'Agrega tus deudas con lo que sabes',
    text: 'Cuántas cuotas y cuánto pagas por cada una. La tasa real, el saldo y el interés total se calculan solos.',
  },
  {
    icon: TargetIcon,
    title: 'Revisa tu Resumen',
    text: 'Cuánto debes por tipo de crédito, y cuánto pagarás en cada uno de los próximos 6 meses.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Marca tus pagos cada mes',
    text: 'En "Pagos", marca lo que ya pagaste y lleva tu historial completo, mes a mes.',
  },
  {
    icon: TableIcon,
    title: 'Arma un plan de pago inteligente',
    text: 'En "Amortización", te decimos qué deuda conviene atacar primero y cuánto ahorras en intereses.',
  },
  {
    icon: UploadIcon,
    title: 'Cambia de dispositivo cuando quieras',
    text: 'Exporta un archivo .zero cifrado e impórtalo en otro dispositivo para traer tus actualizaciones.',
  },
]

function Rise({ delay = 0, className = '', children }) {
  return (
    <div
      className={`animate-[ld-rise_0.6s_ease-out_both] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function AppTourTab() {
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes ld-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ld-pop {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-6">
        <Rise>
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
              <span className="absolute inset-0 animate-ping rounded-full bg-slate-900/40" />
              <BoltIcon className="relative h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Esto no es una planilla de cálculo
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                ZeroDeudas calcula, recomienda y protege — una hoja de Excel solo guarda
                números.
              </p>
            </div>
          </div>
        </Rise>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
          Así se ve en acción
        </h3>
        <div className="mt-4">
          <AppMockupCarousel />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Planilla vs. ZeroDeudas
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            {COMPARISON.map((row, i) => (
              <Rise
                key={row.planilla}
                delay={i * 70}
                className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-500"
              >
                <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {row.planilla}
              </Rise>
            ))}
          </div>
          <div className="space-y-2">
            {COMPARISON.map((row, i) => (
              <Rise
                key={row.zerodeudas}
                delay={150 + i * 70}
                className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
              >
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {row.zerodeudas}
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Cómo se usa
        </h3>
        <ol className="mt-4 space-y-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Rise key={step.title} delay={i * 90} className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white [animation:ld-pop_0.5s_ease-out_both]"
                  style={{ animationDelay: `${i * 90 + 100}ms` }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">{step.text}</p>
                </div>
              </Rise>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
