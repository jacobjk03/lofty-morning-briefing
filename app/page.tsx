'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const BeforeScreen = dynamic(() => import('./components/BeforeScreen'), { ssr: false })
const AfterScreen = dynamic(() => import('./components/AfterScreen'), { ssr: false })
const LeadDetail = dynamic(() => import('./components/LeadDetail'), { ssr: false })
const PitchMode = dynamic(() => import('./components/PitchMode'), { ssr: false })
const AIAssistant = dynamic(() => import('./components/AIAssistant'), { ssr: false })
const AIAgents = dynamic(() => import('./components/AIAgents'), { ssr: false })

type Screen = 'before' | 'after' | 'lead' | 'agents' | 'pitch' | 'chat' | 'dashboard'

const TABS: { id: Screen; label: string }[] = [
  { id: 'before', label: 'Today' },
  { id: 'after', label: 'Lofty AI' },
  { id: 'lead', label: 'Lead detail' },
  { id: 'agents', label: 'AI Agents' },
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
          @keyframes sparkleTwinkle {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.2) rotate(20deg); }
          }
          @keyframes fadeInNav {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .navia-sparkle { display: inline-block; animation: sparkleTwinkle 3s ease-in-out infinite; color: #C4622D; line-height: 1; }
          .navia-word { animation: naviaGlow 2s ease-in-out infinite; text-decoration: none; }
          .navia-word:hover { text-decoration: underline; }
          .navia-wrapper { opacity: 0; animation: fadeInNav 0.8s ease-out 0.5s forwards; }
        `}</style>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <div
            className="navia-wrapper pointer-events-auto flex items-center gap-2"
            style={{
              background: '#fafafa',
              border: '1px solid #f3f4f6',
              borderRadius: 8,
              padding: '6px 14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <svg className="navia-sparkle" width="22" height="20" viewBox="0 0 28 24" fill="#C4622D" style={{ flexShrink: 0 }}>
              {/* Large star */}
              <path d="M8 5 L9.54 10.46 L15 12 L9.54 13.54 L8 19 L6.46 13.54 L1 12 L6.46 10.46 Z"/>
              {/* Medium star */}
              <path d="M19 1 L20.1 4.9 L24 6 L20.1 7.1 L19 11 L17.9 7.1 L14 6 L17.9 4.9 Z"/>
              {/* Small star */}
              <path d="M21 14.5 L21.77 17.23 L24.5 18 L21.77 18.77 L21 21.5 L20.23 18.77 L17.5 18 L20.23 17.23 Z"/>
            </svg>
            <span style={{ width: 1, height: 20, background: '#e5e7eb', display: 'inline-block', margin: '0 4px' }} />
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>
              from the team behind{' '}
              <a
                href="https://joinnavia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="navia-word"
                style={{ fontSize: 14, fontWeight: 700, color: '#C4622D' }}
              >
                Navia
              </a>
            </span>
          </div>
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
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'agents' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <AIAgents onGoToBriefing={() => goTo('after')} onGoToChat={() => openChatWith()} />
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
