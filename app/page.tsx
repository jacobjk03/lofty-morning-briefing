'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { BYOK_SAVED_EVENT, getCredsStatus, openByokModal } from '@/lib/byok-client'

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
const ByokModal = dynamic(() => import('./components/ByokModal'), { ssr: false })

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
  const [leadIndex, setLeadIndex] = useState<number>(1)
  const [chatPrefill, setChatPrefill] = useState<{ text: string; nonce: number } | null>(null)
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [smartPlanOpen, setSmartPlanOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [introOpen, setIntroOpen] = useState(false)
  const [navPayload, setNavPayload] = useState<{ target: Screen; label: string; rationale?: string } | null>(null)
  const [credsStatus, setCredsStatus] = useState<'admin' | 'byok' | 'none'>('none')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem('lofty_intro_seen')
    if (!seen) setIntroOpen(true)
    setCredsStatus(getCredsStatus())
    const onSaved = () => setCredsStatus(getCredsStatus())
    window.addEventListener(BYOK_SAVED_EVENT, onSaved)
    return () => window.removeEventListener(BYOK_SAVED_EVENT, onSaved)
  }, [])

  const dismissIntro = () => {
    setIntroOpen(false)
    try { window.localStorage.setItem('lofty_intro_seen', '1') } catch {}
  }

  /** Always replay the Before→After story when user crosses that boundary. */
  const transitionFromBeforeToAfter = () => {
    setIntroOpen(true)
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
    // Re-play the transition story whenever the user crosses Before → After.
    if (screen === 'before' && s === 'after') {
      transitionFromBeforeToAfter()
      setScreen(s)
      return
    }
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
      {/* Koala-style floating pill nav */}
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <header
            className="flex-1 flex items-center justify-between gap-4 rounded-pill bg-white pl-4 pr-2 h-12"
            style={{
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)',
            }}
          >
            {/* Wordmark */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="inline-block rounded-pill"
                style={{
                  width: 18, height: 18,
                  background: 'radial-gradient(circle at 30% 25%, #67E8F9 0%, #2563EB 55%, #0B1220 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              />
              <span className="font-headline font-bold text-[16px] leading-none tracking-tightest text-ink-900">
                Lofty
              </span>
              <span className="font-headline font-bold italic text-[16px] leading-none tracking-tightest text-blue-600">
                AI
              </span>
            </div>

            {/* Text nav */}
            <nav className="hidden md:flex items-center gap-1 mx-auto">
              {TABS.map((tab) => {
                const active = screen === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => goTo(tab.id)}
                    className={`px-3 h-8 rounded-pill text-[12.5px] whitespace-nowrap transition-colors
                      ${active
                        ? 'font-semibold text-ink-900 bg-ink-100/70'
                        : 'font-medium text-ink-500 hover:text-ink-900'}`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIntroOpen(true)}
                className="hidden sm:inline-flex items-center h-8 px-3 rounded-pill text-[11.5px] font-semibold tracking-tight text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-all"
                title="Replay the intro story"
              >
                Replay intro
              </button>

              {/* Unlock — judges & teammates enter the demo password here
                  before burning a call; visitors see it as a hint that BYOK
                  is available. */}
              <button
                onClick={() => openByokModal('admin')}
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-pill text-[11.5px] font-semibold tracking-tight transition-all"
                title={
                  credsStatus === 'admin'
                    ? 'Demo password saved — click to change'
                    : credsStatus === 'byok'
                      ? 'Your own API keys saved — click to change'
                      : 'Paste a demo password to skip the 1-call limit'
                }
                style={
                  credsStatus === 'none'
                    ? { background: 'transparent', color: 'rgb(71,85,105)', border: '1px solid rgba(15,23,42,0.10)' }
                    : {
                        background: 'rgba(37,99,235,0.08)',
                        color: '#1D4ED8',
                        border: '1px solid rgba(37,99,235,0.18)',
                      }
                }
              >
                <span style={{ fontSize: 12, lineHeight: 1 }}>
                  {credsStatus === 'none' ? '🔒' : '🔓'}
                </span>
                {credsStatus === 'none' ? 'Unlock' : 'Unlocked'}
              </button>
              <button
                onClick={() => setAddLeadOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-pill text-[12px] font-semibold tracking-tight text-white transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px -4px rgba(37,99,235,0.45)',
                }}
              >
                <span className="text-white/85 font-normal text-[13px] leading-none -mt-px">+</span>
                Add lead
              </button>
            </div>
          </header>

          {/* Navia founder-badge — sits beside the main pill, proud and on-brand */}
          <style>{`
            @keyframes naviaSparkleSpin {
              0%, 60%, 100% { transform: rotate(0deg) scale(1); }
              10% { transform: rotate(180deg) scale(1.18); }
              20% { transform: rotate(360deg) scale(1); }
            }
            @keyframes naviaShimmer {
              0%, 100% { background-position: 0% 50%; }
              50%      { background-position: 100% 50%; }
            }
            .navia-badge {
              position: relative;
              overflow: hidden;
            }
            .navia-badge::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(120deg, rgba(255,221,199,0) 0%, rgba(255,221,199,0.55) 50%, rgba(255,221,199,0) 100%);
              background-size: 220% 100%;
              animation: naviaShimmer 3.2s ease-in-out infinite;
              pointer-events: none;
              opacity: 0.9;
            }
            .navia-badge-spark { animation: naviaSparkleSpin 3s ease-in-out infinite; display: inline-block; }
          `}</style>

          <a
            href="https://joinnavia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navia-badge hidden md:inline-flex shrink-0 items-center gap-1.5 h-12 px-3.5 rounded-pill transition-all active:scale-[0.98] hover:brightness-[1.03] whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #FFF8F1 0%, #FFE8D5 100%)',
              border: '1px solid rgba(196,98,45,0.22)',
              boxShadow:
                '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(196,98,45,0.20), inset 0 1px 0 rgba(255,255,255,0.55)',
            }}
            title="joinnavia.com — built with love by team Navia"
          >
            <svg className="navia-badge-spark relative z-[1]" width={13} height={13} viewBox="0 0 28 24" fill="#C4622D">
              <path d="M8 5 L9.54 10.46 L15 12 L9.54 13.54 L8 19 L6.46 13.54 L1 12 L6.46 10.46 Z"/>
              <path d="M19 1 L20.1 4.9 L24 6 L20.1 7.1 L19 11 L17.9 7.1 L14 6 L17.9 4.9 Z"/>
              <path d="M21 14.5 L21.77 17.23 L24.5 18 L21.77 18.77 L21 21.5 L20.23 18.77 L17.5 18 L20.23 17.23 Z"/>
            </svg>
            <span className="relative z-[1] text-[11.5px] font-medium leading-none" style={{ color: '#7D2D00' }}>
              built with love by team{' '}
              <span className="font-headline font-bold italic tracking-tightest text-[13px]" style={{ color: '#C4622D' }}>
                Navia
              </span>
            </span>
          </a>
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
            <AfterDashboard onBack={() => goTo('after')} onOpenLead={(i) => { setLeadIndex(i); goTo('lead') }} leads={leads} transactions={transactions} listings={listings} tasks={tasks} appointments={appointments} />
          </div>
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${screen === 'lead' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}>
          <LeadDetail onBack={() => goTo('after')} leadIndex={leadIndex} />
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

      {/* Global BYOK / admin-password modal — opens on any 429. */}
      <ByokModal />
    </div>
  )
}
