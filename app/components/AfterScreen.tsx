'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlameIcon,
  AlarmIcon,
  LightningIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  SparkleIcon,
  ArrowRightIcon,
  ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react'
import Orb, { OrbState } from './Orb'
import ActionCard from './ActionCard'
import CaptionStrip from './CaptionStrip'
import DraftModal from './DraftModal'
import { useVoice } from '../hooks/useVoice'

interface AfterScreenProps {
  onViewLead: () => void
  onOpenChat: (prefill?: string) => void
  onOpenDashboard: () => void
  briefingData?: any
  leads?: any[]
}

const BRIEFING_DEFAULT =
  "Good morning Baylee. I've reviewed your leads, your transactions, your Smart Plans, and your inbox. Three things matter today. Scott Hayes viewed six-fifty Maple four times this morning — I drafted his follow-up. Your Johnson closing is seventy-two hours out with an open inspection note. And your Bloom outreach paused because two leads bounced. Three moves. Say go, or approve the ones you want."

const CARDS = [
  {
    id: 'scott',
    icon: FlameIcon,
    kicker: 'Hot lead',
    title: 'Scott Hayes · 92',
    meta: 'Buyer · Phoenix · Back on site',
    reasoning:
      'Viewed 650 Maple St four times since 7 AM. Score jumped 14 points overnight. Follow-up text drafted.',
    primaryLabel: 'Send follow-up',
    secondaryLabel: 'Why?',
    source: 'Lofty Lead Analysis',
    accent: true,
    delayMs: 1800,
    leadId: 1,
    steps: ['Drafting personalized text', 'Delivering to Scott', 'Logging to CRM timeline'],
    doneLabel: 'Message sent',
  },
  {
    id: 'johnson',
    icon: AlarmIcon,
    kicker: 'Closing · 72 h',
    title: 'Johnson deal · $485K',
    meta: '650 Elm · Inspection contingency open',
    reasoning:
      'Inspection note still open. Two tasks overdue. I can reschedule and notify the client in one move.',
    primaryLabel: 'Reschedule + notify',
    secondaryLabel: 'Open deal',
    source: 'Transaction checklists',
    delayMs: 3400,
    steps: ['Rescheduling inspection', 'Notifying Johnson', 'Updating transaction checklist'],
    doneLabel: 'Inspection rescheduled',
  },
  {
    id: 'bloom',
    icon: LightningIcon,
    kicker: 'Auto-paused',
    title: 'Bloom outreach · paused',
    meta: '28-day Smart Plan · 2 leads affected',
    reasoning:
      'Two emails bounced — plan auto-paused. I can clean contacts and resume where it left off.',
    primaryLabel: 'Fix and resume',
    secondaryLabel: 'View plan',
    source: 'Smart Plans',
    delayMs: 5000,
    steps: ['Cleaning bounced contacts', 'Re-validating recipients', 'Resuming Smart Plan'],
    doneLabel: 'Smart Plan resumed',
  },
]

const SUCCESS_TOAST: Record<string, string> = {
  scott: 'Message sent to Scott Hayes',
  johnson: 'Inspection rescheduled · client notified',
  bloom: 'Contacts cleaned · Bloom plan resumed',
}

type Phase = 'idle' | 'thinking' | 'speaking' | 'done' | 'executing' | 'complete'

export default function AfterScreen({ onViewLead, onOpenChat, onOpenDashboard, briefingData, leads }: AfterScreenProps) {
  const BRIEFING = briefingData?.briefingText || BRIEFING_DEFAULT

  const cards = CARDS.map((card, i) => {
    const p = briefingData?.priorities?.[i]
    if (!p) return card
    return { ...card, kicker: p.badge || card.kicker, title: p.title || card.title, meta: p.subtitle || card.meta }
  })
  const [phase, setPhase] = useState<Phase>('idle')
  const [revealedChars, setRevealedChars] = useState(0)
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  const [voiceOn, setVoiceOn] = useState(false)
  const [draftLeadId, setDraftLeadId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [askInput, setAskInput] = useState('')
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null)
  const toastTimer = useRef<NodeJS.Timeout | null>(null)
  const voice = useVoice()

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }

  const orbState: OrbState = useMemo(() => {
    if (phase === 'thinking') return 'thinking'
    if (phase === 'speaking') return 'speaking'
    if (phase === 'executing') return 'executing'
    if (phase === 'complete' || phase === 'done') return 'done'
    return 'idle'
  }, [phase])

  const approvedCount = Object.values(approved).filter(Boolean).length

  const start = useCallback(() => {
    setApproved({})
    setRevealedChars(0)
    setPhase('thinking')

    setTimeout(() => {
      setPhase('speaking')

      if (voiceOn && voice.supported) {
        voice.speak(BRIEFING, {
          onBoundary: ({ charIndex }) => setRevealedChars(charIndex + 6),
          onEnd: () => {
            setRevealedChars(BRIEFING.length)
            setPhase('done')
          },
        })
      } else {
        let i = 0
        const id = setInterval(() => {
          i += 3
          setRevealedChars(Math.min(i, BRIEFING.length))
          if (i >= BRIEFING.length) {
            clearInterval(id)
            setPhase('done')
          }
        }, 55)
        fallbackTimer.current = id
      }
    }, 1100)
  }, [voice, voiceOn])

  useEffect(() => {
    start()
    return () => {
      if (fallbackTimer.current) clearInterval(fallbackTimer.current)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      voice.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markApproved = (id: string, toastMsg?: string) => {
    setApproved((a) => {
      if (a[id]) return a
      const next = { ...a, [id]: true }
      if (toastMsg) showToast(toastMsg)
      const count = Object.values(next).filter(Boolean).length
      if (count === 3) {
        setTimeout(() => setPhase('executing'), 350)
      }
      return next
    })
  }

  const handleApprove = (id: string) => {
    const card = cards.find((c) => c.id === id)
    if (id === 'scott' && card && 'leadId' in card && card.leadId) {
      setDraftLeadId(card.leadId as number)
      return
    }
    markApproved(id, SUCCESS_TOAST[id])
  }

  useEffect(() => {
    if (phase === 'executing') {
      const t = setTimeout(() => setPhase('complete'), 2900)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleApproveAll = () => {
    markApproved('scott', SUCCESS_TOAST.scott)
    setTimeout(() => markApproved('johnson', SUCCESS_TOAST.johnson), 450)
    setTimeout(() => markApproved('bloom', SUCCESS_TOAST.bloom), 900)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col h-full relative bg-[#f3f4f8]">
      {/* Floating Voice / Replay — no redundant header */}
      <div className="absolute top-4 right-5 z-20 flex items-center gap-1.5">
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill text-[10.5px] font-semibold tracking-tight transition-all border backdrop-blur
                      ${voiceOn
                        ? 'bg-ink-900/90 text-white border-transparent'
                        : 'bg-white/80 text-ink-500 border-ink-200 hover:bg-white hover:text-ink-800'}`}
        >
          {voiceOn ? <MicrophoneIcon size={12} weight="regular" /> : <MicrophoneSlashIcon size={12} weight="regular" />}
          {voiceOn ? 'Voice on' : 'Voice off'}
        </button>
        <button
          onClick={() => { voice.cancel(); start() }}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill text-[10.5px] font-semibold tracking-tight
                     bg-white/80 backdrop-blur text-ink-500 border border-ink-200 hover:bg-white hover:text-ink-800 transition-all"
        >
          <ArrowCounterClockwiseIcon size={12} weight="regular" />
          Replay
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 relative z-10">
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-5xl mx-auto px-6 pt-6 pb-20 flex flex-col items-center">
          {/* Orb */}
          <div className="relative -mb-10">
            <Orb state={orbState} size={116} />
          </div>

          {/* Greeting + dashboard escape hatch */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mt-0 w-full max-w-xl"
          >
            <h1 className="text-[28px] md:text-[32px] font-semibold text-ink-900 tracking-tightest leading-[1.02]">
              Good morning, Baylee
            </h1>
            <p className="mt-1.5 text-[11.5px] text-ink-400 font-medium tabular-nums tracking-tight">
              {today} · {time}
            </p>
          </motion.div>

          {/* Caption */}
          <div className="mt-4 min-h-[84px] w-full">
            <CaptionStrip
              text={BRIEFING}
              revealedChars={revealedChars}
              speaking={phase === 'speaking'}
            />
          </div>

          {/* Cards */}
          <AnimatePresence>
            {(phase === 'speaking' || phase === 'done' || phase === 'executing' || phase === 'complete') && (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {cards.map((c) => (
                  <ActionCard
                    key={c.id}
                    icon={c.icon}
                    kicker={c.kicker}
                    title={c.title}
                    meta={c.meta}
                    reasoning={c.reasoning}
                    primaryLabel={c.primaryLabel}
                    secondaryLabel={c.secondaryLabel}
                    source={c.source}
                    accent={!!c.accent}
                    delayMs={c.delayMs}
                    approved={!!approved[c.id]}
                    executing={phase === 'executing' && !!approved[c.id]}
                    steps={(c as any).steps}
                    doneLabel={(c as any).doneLabel}
                    onApprove={() => handleApprove(c.id)}
                    onSecondary={
                      c.id === 'scott'
                        ? onViewLead
                        : c.id === 'johnson'
                          ? () => showToast('Johnson deal opened in transactions')
                          : () => showToast('Bloom Smart Plan preview coming up')
                    }
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>


          {/* Controls / footer */}
          <AnimatePresence mode="wait">
            {phase === 'complete' ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 text-center"
              >
                <p className="text-ink-800 text-[14px] font-medium tracking-tight">
                  All three executing · I'll check back in an hour.
                </p>
                <p className="text-ink-400 text-[11px] mt-1.5">Inbox zero for your morning.</p>
              </motion.div>
            ) : phase === 'done' ? (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-9 flex flex-col items-center gap-3"
              >
                <button
                  onClick={handleApproveAll}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-pill
                             text-[#0B1220] text-[12.5px] font-semibold tracking-tight transition-all hover:brightness-110"
                  style={{
                    background: '#22D3EE',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px -8px rgba(34,211,238,0.55)',
                  }}
                >
                  <SparkleIcon size={14} weight="regular" />
                  Do all three
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    onOpenChat(askInput.trim() || undefined)
                    setAskInput('')
                  }}
                  className="flex items-center gap-2.5 w-[420px] h-10 px-4 rounded-pill
                             bg-white border border-ink-200 focus-within:border-blue-400 transition-all shadow-sm"
                >
                  <SparkleIcon size={14} weight="regular" className="text-blue-500 shrink-0" />
                  <input
                    type="text"
                    value={askInput}
                    onChange={(e) => setAskInput(e.target.value)}
                    placeholder="Ask Lofty AI anything…"
                    className="flex-1 bg-transparent text-[12.5px] text-ink-800 placeholder-ink-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 w-7 h-7 rounded-pill flex items-center justify-center transition-all
                               text-white disabled:opacity-40"
                    style={{ background: '#2563EB' }}
                    aria-label="Ask"
                  >
                    <ArrowRightIcon size={12} weight="bold" />
                  </button>
                </form>
                <p className="text-[10.5px] text-ink-400 mt-1">
                  {approvedCount > 0 && approvedCount < 3
                    ? `${approvedCount} approved · ${3 - approvedCount} pending`
                    : 'Say "go" or tap approve'}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Escape hatch */}
          <div className="fixed bottom-4 right-14 md:right-[52px] z-20">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-400 hover:text-ink-700
                         transition-colors font-medium tracking-tight"
            >
              Explore the full Lofty dashboard
              <ArrowRightIcon size={12} weight="regular" />
            </button>
          </div>
        </div>
        </div>

      </div>

      {/* AI draft modal — Scott Hayes primary flow */}
      <AnimatePresence>
        {draftLeadId !== null && (
          <DraftModal
            leadId={draftLeadId}
            onClose={() => setDraftLeadId(null)}
            onSent={(name) => {
              markApproved('scott', `Message sent to ${name}`)
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30
                       inline-flex items-center gap-2 h-10 px-4 rounded-pill
                       bg-ink-900 text-white text-[12.5px] font-medium shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-pill bg-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
