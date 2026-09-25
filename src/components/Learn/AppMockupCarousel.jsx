import { useEffect, useState } from 'react'
import { CheckIcon, PlusIcon } from '../icons'

const SCENES = ['resumen', 'deudas', 'pagos', 'amortizacion']
const SCENE_LABELS = {
  resumen: 'Resumen',
  deudas: 'Deudas',
  pagos: 'Pagos',
  amortizacion: 'Amortización',
}
const SCENE_MS = 2800

function ResumenScene() {
  const bars = [40, 65, 50, 85, 55, 70]
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 rounded-md bg-slate-50 p-2">
          <p className="text-[9px] text-slate-400">Deuda total</p>
          <p className="text-sm font-bold text-slate-900">$4.250.000</p>
        </div>
        <div className="flex-1 rounded-md bg-emerald-50 p-2">
          <p className="text-[9px] text-emerald-600">Tiempo restante</p>
          <p className="text-sm font-bold text-emerald-700">14 meses</p>
        </div>
      </div>
      <div className="rounded-md border border-slate-100 p-2">
        <p className="text-[9px] font-medium text-slate-500">Pagos próximos meses</p>
        <div className="mt-1.5 flex h-10 items-end gap-1.5">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-3 rounded-t bg-slate-800 [animation:ld-grow_0.6s_ease-out_both]"
              style={{ height: `${h * 0.4}px`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DeudasScene() {
  const rows = [
    { a: 'Tarjeta Falabella', s: '$520.000' },
    { a: 'Banco Estado', s: '$1.800.000' },
  ]
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-700">Deudas</p>
        <span className="relative flex items-center gap-1 rounded-md bg-slate-900 px-1.5 py-1 text-[9px] font-medium text-white">
          <PlusIcon className="h-2.5 w-2.5" />
          Agregar
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.a}
          className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 text-[9px] [animation:ld-scene-in_0.5s_ease-out_both]"
          style={{ animationDelay: `${150 + i * 120}ms` }}
        >
          <span className="text-slate-600">{row.a}</span>
          <span className="font-semibold text-slate-900">{row.s}</span>
        </div>
      ))}
    </div>
  )
}

function PagosScene() {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-700">Pagos de septiembre</p>
      <div className="flex items-center justify-between rounded-md border border-emerald-500 bg-emerald-50 px-2 py-1.5 text-[9px]">
        <span className="font-medium text-emerald-800">Tarjeta Falabella</span>
        <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500" />
          <CheckIcon className="relative h-2.5 w-2.5" />
        </span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 text-[9px] text-slate-500">
        <span>Banco Estado</span>
        <span className="h-4 w-4 rounded-full border border-slate-300" />
      </div>
    </div>
  )
}

function AmortizacionScene() {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-700">Plan de pago</p>
      <div className="space-y-1 rounded-md bg-slate-50 p-2 text-[9px] text-slate-600">
        <p>
          1. Tarjeta Falabella <span className="font-semibold text-slate-900">45% anual</span>
        </p>
        <p>
          2. Banco Estado <span className="font-semibold text-slate-900">18% anual</span>
        </p>
      </div>
      <div className="rounded-md bg-emerald-50 p-2 text-[9px] font-semibold text-emerald-800 [animation:ld-scene-in_0.5s_ease-out_both]">
        Ahorras $186.000 en intereses
      </div>
    </div>
  )
}

const SCENE_COMPONENTS = {
  resumen: ResumenScene,
  deudas: DeudasScene,
  pagos: PagosScene,
  amortizacion: AmortizacionScene,
}

export default function AppMockupCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SCENES.length), SCENE_MS)
    return () => clearInterval(id)
  }, [])

  const sceneId = SCENES[active]
  const Scene = SCENE_COMPONENTS[sceneId]

  return (
    <div className="mx-auto w-full max-w-xs">
      <style>{`
        @keyframes ld-scene-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ld-grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>

      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="ml-2 truncate text-[9px] text-slate-400">zerodeudas.app</span>
        </div>
        <div className="h-40 overflow-hidden bg-white p-3">
          <div key={sceneId} className="[animation:ld-scene-in_0.5s_ease-out_both]">
            <Scene />
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {SCENES.map((id) => (
          <span
            key={id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              id === sceneId ? 'w-4 bg-slate-900' : 'w-1.5 bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-slate-400">{SCENE_LABELS[sceneId]}</p>
    </div>
  )
}
