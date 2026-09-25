export default function EstimateNote({ className = '' }) {
  return (
    <p className={`text-[11px] text-slate-400 ${className}`}>
      Estos valores son estimaciones para orientarte: pueden no coincidir exactamente con lo
      que calcule tu entidad financiera.
    </p>
  )
}
