export const palette = [
  '#0f172a', // slate-900
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#0284c7', // sky-600
  '#e11d48', // rose-600
  '#7c3aed', // violet-600
]

export function colorAt(index) {
  return palette[index % palette.length]
}
