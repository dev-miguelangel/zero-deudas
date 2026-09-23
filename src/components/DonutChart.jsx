const SIZE = 160
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Gráfico de dona genérico, sin dependencias externas (solo SVG). Cada
 * segmento es un `<circle>` con `stroke-dasharray` recortado a su
 * proporción del total, rotados en conjunto para empezar arriba (-90°).
 *
 * Si se pasa `onToggle`, la leyenda queda clickeable: tocar un tipo lo
 * saca (o lo vuelve a meter) del gráfico — útil para aislar uno o pocos
 * grupos. `excludedIds` es el set de ids actualmente ocultos, y el
 * porcentaje/total se recalculan solo sobre los que quedan visibles.
 */
export default function DonutChart({
  segments,
  totalLabel,
  showValues = true,
  showPercent = false,
  excludedIds,
  onToggle,
}) {
  const visible = excludedIds ? segments.filter((s) => !excludedIds.has(s.id)) : segments
  const total = visible.reduce((sum, s) => sum + s.value, 0)

  const lengths = visible.map((s) => (total > 0 ? (s.value / total) * CIRCUMFERENCE : 0))
  const arcs = visible.map((s, i) => ({
    ...s,
    length: lengths[i],
    offset: lengths.slice(0, i).reduce((sum, l) => sum + l, 0),
  }))

  const interactive = Boolean(onToggle)

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.id}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={-arc.offset}
              className="transition-all"
            />
          ))}
        </svg>
        {totalLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Total</span>
            <span className="text-sm font-bold text-slate-900">{totalLabel}</span>
          </div>
        )}
      </div>

      <ul className="w-full space-y-1 text-sm">
        {segments.map((s) => {
          const isExcluded = Boolean(excludedIds?.has(s.id))
          const percent = total > 0 && !isExcluded ? Math.round((s.value / total) * 100) : 0

          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!interactive}
                onClick={interactive ? () => onToggle(s.id) : undefined}
                className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
                  interactive ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                } ${isExcluded ? 'opacity-40' : ''}`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className={`truncate text-slate-600 ${isExcluded ? 'line-through' : ''}`}>
                  {s.label}
                </span>
                {showPercent && !isExcluded && (
                  <span className="shrink-0 text-slate-400">{percent}%</span>
                )}
                {showValues && !isExcluded && (
                  <span className="shrink-0 font-semibold text-slate-900">{s.valueLabel}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
