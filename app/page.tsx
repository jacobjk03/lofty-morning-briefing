'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const BeforeScreen = dynamic(() => import('./components/BeforeScreen'), { ssr: false })
const AfterScreen = dynamic(() => import('./components/AfterScreen'), { ssr: false })
const AfterDashboard = dynamic(() => import('./components/AfterDashboard'), { ssr: false })
const LeadDetail = dynamic(() => import('./components/LeadDetail'), { ssr: false })
const AIAssistant = dynamic(() => import('./components/AIAssistant'), { ssr: false })
const AIAgents = dynamic(() => import('./components/AIAgents'), { ssr: false })
const AddLeadModal = dynamic(() => import('./components/AddLeadModal'), { ssr: false })
const SmartPlanModal = dynamic(() => import('./components/SmartPlanModal'), { ssr: false })
const Toast = dynamic(() => import('./components/Toast'), { ssr: false })
const TransitionIntro = dynamic(() => import('./components/TransitionIntro'), { ssr: false })
const NavigatingOverlay = dynamic(() => import('./components/NavigatingOverlay'), { ssr: false })

type Screen = 'before' | 'after' | 'lead' | 'agents' | 'chat' | 'dashboard'

const TABS: { id: Screen; label: string }[] = [
  { id: 'before', label: 'Before' },
  { id: 'dashboard', label: 'After' },
  { id: 'after', label: 'Lofty AI' },
  { id: 'lead', label: 'Lead detail' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'chat', label: 'Conversation' },
]

function targetLabel(s: Screen): string {
  switch (s) {
    case 'before':    return 'Today'
    case 'after':     return 'Morning briefing'
    case 'lead':      return 'Lead detail · Scott Hayes'
    case 'agents':    return 'AI Agents'
    case 'chat':      return 'Lofty Copilot'
    case 'dashboard': return 'My Dashboard'
  }
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('after')
  const [chatPrefill, setChatPrefill] = useState<{ text: string; nonce: number } | null>(null)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [smartPlanOpen, setSmartPlanOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [introOpen, setIntroOpen] = useState(false)
  const [navPayload, setNavPayload] = useState<{ target: Screen; label: string; rationale?: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem('lofty_intro_seen')
    if (!seen) setIntroOpen(true)
  }, [])

  const dismissIntro = () => {
    setIntroOpen(false)
    try { window.localStorage.setItem('lofty_intro_seen', '1') } catch {}
  }

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

  /** Play navigation beat, then land on destination. */
  const navigateWithOverlay = (target: Screen, label: string, rationale?: string) => {
    setNavPayload({ target, label, rationale })
  }
  const finishNavigation = () => {
    if (!navPayload) return
    const t = navPayload.target
    setNavPayload(null)
    setScreen(t)
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
            0%   { transform: rotate(0deg)   scale(1);    }
            12%  { transform: rotate(360deg) scale(1.2);  }
            24%  { transform: rotate(720deg) scale(1);    }
            36%  { transform: rotate(720deg) scale(1);    }
            48%  { transform: rotate(1080deg) scale(1.2); }
            60%  { transform: rotate(1440deg) scale(1);   }
            100% { transform: rotate(1440deg) scale(1);   }
          }
          @keyframes fadeInNav {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .navia-sparkle { display: inline-block; animation: sparkleSpin 2.5s ease-in-out infinite; color: #C4622D; line-height: 1; }
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
          <button
            onClick={() => setAddLeadOpen(true)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill text-[11px] font-semibold tracking-tight text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px -4px rgba(37,99,235,0.45)',
            }}
          >
            + Add lead
          </button>
          <span className="hidden md:inline text-[10px] text-ink-300 font-medium tracking-tight">
            GlobeHack '26
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
            onOpenAddLead={() => setAddLeadOpen(true)}
            onOpenSmartPlan={() => setSmartPlanOpen(true)}
            onOpenAgents={() => goTo('agents')}
            briefingData={briefing}
            leads={leads}
            visible={screen === 'after'}
          />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${
            screen === 'dashboard' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <AfterDashboard onBack={() => goTo('after')} leads={leads} transactions={transactions} listings={listings} tasks={tasks} appointments={appointments} />
          </div>
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'lead' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <LeadDetail onBack={() => goTo('after')} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'agents' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <AIAgents onGoToBriefing={() => goTo('after')} onGoToChat={() => openChatWith()} />
        </div>
<div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'chat' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <AIAssistant
            onNavigate={(target, label, rationale) =>
              navigateWithOverlay(target as Screen, label || targetLabel(target as Screen), rationale)
            }
            onOpenAddLead={() => setAddLeadOpen(true)}
            onOpenSmartPlan={() => setSmartPlanOpen(true)}
            initialInput={chatPrefill}
          />
        </div>
      </div>

      {/* Global modals */}
      {addLeadOpen && (
        <AddLeadModal
          onClose={() => setAddLeadOpen(false)}
          onSaved={(name) => setToast(`${name} added to CRM`)}
        />
      )}
      {smartPlanOpen && (
        <SmartPlanModal
          onClose={() => setSmartPlanOpen(false)}
          onLaunched={(name) => setToast(`${name} launched`)}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* First-visit transition intro */}
      {introOpen && <TransitionIntro onDone={dismissIntro} />}

      {/* Navigation agent overlay */}
      {navPayload && (
        <NavigatingOverlay
          payload={{ label: navPayload.label, rationale: navPayload.rationale }}
          onDone={finishNavigation}
        />
      )}
    </div>
  )
}
