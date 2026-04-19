'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const BeforeScreen = dynamic(() => import('./components/BeforeScreen'), { ssr: false })
const AfterScreen = dynamic(() => import('./components/AfterScreen'), { ssr: false })
const LeadDetail = dynamic(() => import('./components/LeadDetail'), { ssr: false })
const PitchMode = dynamic(() => import('./components/PitchMode'), { ssr: false })
const AIAssistant = dynamic(() => import('./components/AIAssistant'), { ssr: false })

type Screen = 'before' | 'after' | 'lead' | 'pitch' | 'chat' | 'dashboard'

const TABS: { id: Screen; label: string }[] = [
  { id: 'before', label: 'Today' },
  { id: 'after', label: 'Lofty AI' },
  { id: 'lead', label: 'Lead detail' },
  { id: 'chat', label: 'Conversation' },
  { id: 'pitch', label: 'Pitch' },
]

export default function Home() {
  const [screen, setScreen] = useState<Screen>('after')
  const [afterKey, setAfterKey] = useState(0)

  // DB state
  const [briefing, setBriefing] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/briefing')
      .then(r => r.json())
      .then(data => setBriefing(data))
      .catch(() => console.log('briefing fallback'))

    fetch('/api/leads')
      .then(r => r.json())
      .then(data => setLeads(data))
      .catch(() => console.log('leads fallback'))

    fetch('/api/transactions')
      .then(r => r.json())
      .then(data => setTransactions(data))
      .catch(() => console.log('transactions fallback'))

    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => setTasks(data))
      .catch(() => console.log('tasks fallback'))

    fetch('/api/listings')
      .then(r => r.json())
      .then(data => setListings(data))
      .catch(() => console.log('listings fallback'))

    fetch('/api/appointments')
      .then(r => r.json())
      .then(data => setAppointments(data))
      .catch(() => console.log('appointments fallback'))
  }, [])

  const goTo = (s: Screen) => {
    if (s === 'after') setAfterKey((k) => k + 1)
    setScreen(s)
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: '#f3f4f8' }}>
      {/* Top toggle bar — light, matches Lofty style */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b border-ink-200 shrink-0 bg-white">
        <div className="flex items-center gap-2 mr-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-pill bg-blue-500" />
            <span className="text-[10.5px] font-semibold tracking-wider2 text-ink-700">LOFTY AI</span>
          </span>
          <span className="text-ink-300 text-xs">/</span>
          <span className="text-[10px] text-ink-400 font-medium tracking-tight hidden md:inline">GlobeHack '26 demo</span>
        </div>

        <div className="flex items-center bg-ink-100 border border-ink-200 rounded-pill p-0.5 gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => goTo(tab.id)}
              className={`px-3 h-7 rounded-pill text-[11px] font-semibold whitespace-nowrap transition-all
                ${screen === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-white/60'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline text-[10px] text-ink-400 font-medium tracking-tight">
            Reimagining first-experience · ASU ACM
          </span>
        </div>
      </div>

      {/* Screen area */}
      <div className="flex-1 min-h-0 relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'before' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <BeforeScreen leads={leads} transactions={transactions} listings={listings} tasks={tasks} appointments={appointments} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'after' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <AfterScreen
            key={afterKey}
            onViewLead={() => goTo('lead')}
            onOpenChat={() => goTo('chat')}
            onOpenDashboard={() => goTo('dashboard')}
            briefingData={briefing}
            leads={leads}
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-300 flex flex-col bg-[#f3f4f8] ${
            screen === 'dashboard' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => goTo('after')}
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to Morning Briefing
            </button>
            <span className="text-ink-300">|</span>
            <span className="text-[12px] text-ink-500">My Dashboard</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <BeforeScreen leads={leads} transactions={transactions} listings={listings} tasks={tasks} appointments={appointments} />
          </div>
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'lead' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <LeadDetail onBack={() => goTo('after')} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'pitch' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <PitchMode />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'chat' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <AIAssistant />
        </div>
      </div>
    </div>
  )
}
