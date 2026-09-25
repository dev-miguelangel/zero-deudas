import { useState } from 'react'
import AppTourTab from './AppTourTab'
import GlossaryTab from './GlossaryTab'

const TABS = [
  { id: 'tour', label: 'Cómo usar la app' },
  { id: 'glosario', label: 'Conceptos y glosario' },
]

export default function Learn({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('tour')

  return (
    <div>
      <div className="flex max-w-sm rounded-md border border-slate-300 p-0.5 text-xs font-medium">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`flex-1 rounded px-3 py-1.5 transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'tour' ? <AppTourTab onNavigate={onNavigate} /> : <GlossaryTab />}
      </div>
    </div>
  )
}
