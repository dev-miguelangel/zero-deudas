import { AVATARS } from '../avatars'

export default function AvatarPicker({ value, onChange }) {
  return (
    <div className="flex justify-between">
      {AVATARS.map(({ id, label, src }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-label={label}
          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
            value === id ? 'ring-2 ring-offset-2 ring-slate-900' : ''
          }`}
        >
          <img src={src} alt={label} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  )
}
