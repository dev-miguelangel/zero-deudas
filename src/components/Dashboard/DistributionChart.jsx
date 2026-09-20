import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { colorAt } from '../../lib/palette'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DistributionChart({ debts }) {
  if (debts.length === 0) return null

  const data = {
    labels: debts.map((d) => d.acreedor),
    datasets: [
      {
        data: debts.map((d) => d.saldo),
        backgroundColor: debts.map((_, i) => colorAt(i)),
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900">Distribución por acreedor</h3>
      <div className="relative mx-auto mt-4 w-full max-w-xs">
        <Doughnut data={data} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  )
}
