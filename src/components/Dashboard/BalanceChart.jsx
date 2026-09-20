import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { simulate } from '../../domain/simulator'
import { colorAt } from '../../lib/palette'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function BalanceChart({ debts, strategy, extraPayment }) {
  const result = simulate(debts, strategy, extraPayment)

  if (result.error || result.timeline.length === 0) {
    return null
  }

  const data = {
    labels: result.timeline.map((point) => point.month),
    datasets: [
      {
        label: 'Saldo total',
        data: result.timeline.map((point) => point.totalBalance),
        borderColor: colorAt(1),
        backgroundColor: colorAt(1),
        pointRadius: 0,
        borderWidth: 2,
        tension: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Mes' } },
      y: { title: { display: true, text: 'Saldo' }, beginAtZero: true },
    },
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900">Proyección de saldo</h3>
      <div className="relative mt-4 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
