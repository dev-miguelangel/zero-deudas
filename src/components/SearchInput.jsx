import { SearchIcon } from './icons'

export default function SearchInput({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  )
}
