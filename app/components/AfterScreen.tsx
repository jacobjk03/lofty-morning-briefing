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
import { useVoice } from '../hooks/useVoice'

interface AfterScreenProps {
  onViewLead: () => void
  onOpenChat: () => void
}

const BRIEFING =
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
  },
  {
    id: 'johnson',
    icon: AlarmIcon,
    kicker: 'Closing · 72 h',
    title: 'Johnson deal · $485K',
    meta: '650 Elm · Inspection contingency open',
    reasoning:
      'Inspection note still open. Two tasks overdue. I can reschedule and notify the client in one move.',
    primaryLabel: 'Do all three',
    secondaryLabel: 'Open deal',
    source: 'Transaction checklists',
    delayMs: 3400,
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
  },
]

type Phase = 'idle' | 'thinking' | 'speaking' | 'done' | 'executing' | 'complete'

export default function AfterScreen({ onViewLead, onOpenChat }: AfterScreenProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [revealedChars, setRevealedChars] = useState(0)
  const [approved, setApproved] = useState<Record<string, boolean>>({})
  const [voiceOn, setVoiceOn] = useState(false)
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null)
  const voice = useVoice()

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
      voice.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApprove = (id: string) => {
    setApproved((a) => {
      const next = { ...a, [id]: true }
      const count = Object.values(next).filter(Boolean).length
      if (count === 3) {
        setTimeout(() => setPhase('executing'), 250)
      }
      return next
    })
  }

  useEffect(() => {
    if (phase === 'executing') {
      const t = setTimeout(() => setPhase('complete'), 1800)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleApproveAll = () => {
    setApproved({ scott: true, johnson: true, bloom: true })
    setTimeout(() => setPhase('executing'), 300)
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
    <div className="canvas-dark canvas-grid flex flex-col h-full relative">
      {/* Top bar — minimal, monochrome */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-pill bg-cyan-300" />
            <span className="text-[10px] font-semibold tracking-wider2 text-white/80">
              LOFTY AI
            </span>
          </span>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-[11px] text-white/40 font-medium">Morning briefing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10.5px] font-semibold tracking-tight transition-all
                        ${voiceOn
                          ? 'bg-white/[0.06] text-white/85 border border-white/[0.14]'
                          : 'bg-transparent text-white/40 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/70'}`}
          >
            {voiceOn ? <MicrophoneIcon size={12} weight="regular" /> : <MicrophoneSlashIcon size={12} weight="regular" />}
            {voiceOn ? 'Voice on' : 'Voice off'}
          </button>
          <button
            onClick={() => { voice.cancel(); start() }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10.5px] font-semibold tracking-tight
                       bg-transparent text-white/40 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/70 transition-all"
          >
            <ArrowCounterClockwiseIcon size={12} weight="regular" />
            Replay
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-20 flex flex-col items-center">
          {/* Orb */}
          <div className="relative -mb-10">
            <Orb state={orbState} size={116} />
          </div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mt-0"
          >
            <h1 className="text-[30px] md:text-[34px] font-semibold text-white tracking-tightest leading-[1.02]">
              Good morning, Baylee
            </h1>
            <p className="mt-1.5 text-[11.5px] text-white/35 font-medium tabular-nums tracking-tight">
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
                {CARDS.map((c) => (
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
                    onApprove={() => handleApprove(c.id)}
                    onSecondary={c.id === 'scott' ? onViewLead : () => {}}
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
                <p className="text-white/85 text-[14px] font-medium tracking-tight">
                  All three executing · I'll check back in an hour.
                </p>
                <p className="text-white/35 text-[11px] mt-1.5">Inbox zero for your morning.</p>
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
                <div
                  onClick={onOpenChat}
                  className="flex items-center gap-2.5 w-[420px] h-10 px-4 rounded-pill cursor-text
                             bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16] transition-all"
                >
                  <SparkleIcon size={14} weight="regular" className="text-cyan-300/80" />
                  <span className="flex-1 text-[12.5px] text-white/35">Ask Lofty AI anything…</span>
                  <ArrowRightIcon size={14} weight="regular" className="text-white/25" />
                </div>
                <p className="text-[10.5px] text-white/25 mt-1">
                  {approvedCount > 0 && approvedCount < 3
                    ? `${approvedCount} approved · ${3 - approvedCount} pending`
                    : 'Say "go" or tap approve'}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Escape hatch */}
          <div className="fixed bottom-4 right-6 z-20">
            <button className="inline-flex items-center gap-1.5 text-[10.5px] text-white/25 hover:text-white/70
                               transition-colors font-medium tracking-tight">
              Explore the full Lofty dashboard
              <ArrowRightIcon size={12} weight="regular" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
