import { ChevronDownIcon } from './icons'

/**
 * Encabezado de tabla clickeable para ordenar por esa columna. La flecha
 * queda tenue cuando la columna no es la que ordena, y sólida + rotada
 * cuando sí (apuntando hacia arriba en 'asc', hacia abajo en 'desc').
 */
export default function SortableTh({ label, align = 'left', active, direction, onClick }) {
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <th className={`p-3 font-medium ${textAlign}`}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
      >
        <span>{label}</span>
        <ChevronDownIcon
          className={`h-3 w-3 shrink-0 transition-transform ${
            active ? 'text-slate-900' : 'text-slate-300'
          } ${active && direction === 'asc' ? 'rotate-180' : ''}`}
        />
      </button>
    </th>
  )
}
