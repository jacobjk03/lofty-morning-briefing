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
  const [chatPrefill, setChatPrefill] = useState<{ text: string; nonce: number } | null>(null)

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
    setScreen(s)
  }

  const openChatWith = (text?: string) => {
    if (text && text.trim()) {
      setChatPrefill({ text: text.trim(), nonce: Date.now() })
    }
    goTo('chat')
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: '#f3f4f8' }}>
      {/* Top toggle bar — minimal */}
      <div className="relative flex items-center gap-5 px-5 py-2 border-b border-ink-200/70 shrink-0 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-1.5 h-1.5 rounded-pill bg-blue-500" />
          <span className="text-[10.5px] font-semibold tracking-wider2 text-ink-800">LOFTY AI</span>
        </div>

        <nav className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => goTo(tab.id)}
              className={`relative px-2.5 h-7 rounded-md text-[11.5px] font-medium whitespace-nowrap transition-colors
                ${screen === tab.id
                  ? 'text-ink-900'
                  : 'text-ink-400 hover:text-ink-700'}`}
            >
              {tab.label}
              {screen === tab.id && (
                <span className="absolute left-2.5 right-2.5 -bottom-[9px] h-[2px] rounded-full bg-ink-900" />
              )}
            </button>
          ))}
        </nav>

        <style>{`
          @keyframes naviaGlow {
            0%, 100% { text-shadow: 0 0 8px #C4622D, 0 0 16px #C4622D; color: #C4622D; }
            50% { text-shadow: 0 0 20px #C4622D, 0 0 40px #C4622D, 0 0 60px #C4622D; color: #d4733d; }
          }
          @keyframes sparkleSpin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.3); }
            100% { transform: rotate(360deg) scale(1); }
          }
          @keyframes fadeInNav {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .navia-sparkle { display: inline-block; animation: sparkleSpin 3s ease-in-out infinite; color: #C4622D; }
          .navia-word { animation: naviaGlow 2s ease-in-out infinite; }
          .navia-word:hover { color: #d4733d !important; }
          .navia-wrapper { opacity: 0; animation: fadeInNav 0.8s ease-out 0.5s forwards; }
        `}</style>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span className="navia-wrapper flex items-center gap-1.5 pointer-events-auto">
            <span className="navia-sparkle" style={{ fontSize: 13 }}>✦</span>
            <span style={{ fontSize: 15, color: '#1e2a4a', fontWeight: 500, borderLeft: '2px solid #C4622D', paddingLeft: 8 }}>
              from the team behind{' '}
              <a
                href="https://joinnavia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="navia-word hover:underline"
                style={{ fontSize: 17, fontWeight: 800, textDecoration: 'none' }}
              >
                Navia
              </a>
            </span>
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline text-[10px] text-ink-300 font-medium tracking-tight">
            GlobeHack '26 · ASU ACM
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
            onViewLead={() => goTo('lead')}
            onOpenChat={(text) => openChatWith(text)}
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
          <AIAssistant
            onNavigate={(target) => goTo(target as Screen)}
            initialInput={chatPrefill}
          />
        </div>
      </div>
    </div>
  )
}
