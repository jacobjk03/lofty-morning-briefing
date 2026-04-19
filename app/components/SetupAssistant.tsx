'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon,
  PhoneIcon,
  CalendarIcon,
  AddressBookIcon,
  CheckCircleIcon,
  CircleIcon,
} from '@phosphor-icons/react'
import LoftyMark from './LoftyMark'

interface SetupAssistantProps {
  onClose: () => void
  onDone: () => void
}

interface Step {
  Icon: any
  label: string
  progress: string[]   // narration that streams per step
  success: string      // final line that sticks
}

const STEPS: Step[] = [
  {
    Icon: PhoneIcon,
    label: 'Connect your dialer',
    progress: [
      'Scanning for devices…',
      'Found iPhone 15 Pro · Mac desk line',
      'Registering with Lofty · encrypting credentials',
    ],
    success: 'Dialer ready · calls route to either device',
  },
  {
    Icon: CalendarIcon,
    label: 'Sync your calendar',
    progress: [
      'Checking connected accounts…',
      'Found Google · baylee@rhoadesrealty.com',
      'Syncing last 90 days + next 90 days',
    ],
    success: '47 events synced · busy blocks respected by AI',
  },
  {
    Icon: AddressBookIcon,
    label: 'Verify your contacts',
    progress: [
      'Reading 248 contacts from CRM…',
      'Cross-checking phone + email validity',
      '2 hard bounces found · auto-archived · 246 clean',
    ],
    success: '246 contacts validated · nothing will bounce next send',
  },
]

const LINE_MS = 900   // per narration line
const GAP_MS  = 400   // pause before next step

export default function SetupAssistant({ onClose, onDone }: SetupAssistantProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const step = STEPS[stepIdx]
    if (!step) { setDone(true); return }

    if (lineIdx < step.progress.length) {
      const t = setTimeout(() => setLineIdx((i) => i + 1), LINE_MS)
      return () => clearTimeout(t)
    }
    // Step finished — advance
    const t = setTimeout(() => {
      if (stepIdx + 1 < STEPS.length) {
        setStepIdx((s) => s + 1)
        setLineIdx(0)
      } else {
        setDone(true)
      }
    }, GAP_MS)
    return () => clearTimeout(t)
  }, [stepIdx, lineIdx, done])

  const finish = () => {
    onDone()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[55] flex items-center justify-center p-4"
      style={{ background: 'rgba(11, 18, 32, 0.55)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white rounded-[18px] overflow-hidden relative"
        style={{
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow: '0 24px 64px -16px rgba(15,23,42,0.30), 0 8px 24px -12px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-pill flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close"
        >
          <XIcon size={15} weight="regular" />
        </button>

        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center gap-2.5 mb-3">
            <LoftyMark size={22} halo pulse={!done} />
            <span className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80">
              Lofty Copilot · guided setup
            </span>
          </div>
          <h2 className="font-headline font-bold italic text-[24px] tracking-tightest text-ink-900 leading-[1.1]">
            {done ? "You're all set — I'll take it from here." : 'Finishing your setup…'}
          </h2>
          <p className="text-[12.5px] text-ink-500 mt-1.5">
            {done
              ? 'Everything below is live. No more broken integrations, no more guesswork.'
              : 'No forms. No docs. Watch me do it.'}
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 pb-5 space-y-2.5">
          {STEPS.map((s, i) => {
            const isActive = !done && i === stepIdx
            const isComplete = done || i < stepIdx
            return (
              <div
                key={s.label}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: isActive ? 'rgba(37,99,235,0.04)' : isComplete ? 'rgba(16,185,129,0.05)' : '#f7f9fb',
                  border: `1px solid ${isActive ? 'rgba(37,99,235,0.18)' : isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(195,198,215,0.3)'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isComplete ? 'rgba(16,185,129,0.1)' : isActive ? 'rgba(37,99,235,0.1)' : '#FFFFFF',
                      border: `1px solid ${isComplete ? 'rgba(16,185,129,0.25)' : isActive ? 'rgba(37,99,235,0.2)' : 'rgba(195,198,215,0.4)'}`,
                    }}
                  >
                    {isComplete ? (
                      <CheckCircleIcon size={16} weight="fill" className="text-emerald-600" />
                    ) : isActive ? (
                      <span className="w-3.5 h-3.5 rounded-pill border-2 border-blue-600 border-t-transparent animate-spin" />
                    ) : (
                      <s.Icon size={15} weight="regular" className="text-ink-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold ${isComplete ? 'text-ink-800' : isActive ? 'text-ink-900' : 'text-ink-400'}`}>
                      {s.label}
                    </p>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          key={`p-${i}-${lineIdx}`}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-[11.5px] text-blue-700/80 mt-1 font-medium"
                        >
                          {s.progress[Math.min(lineIdx, s.progress.length - 1)]}
                        </motion.p>
                      )}
                      {isComplete && (
                        <motion.p
                          key={`s-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11.5px] text-emerald-700/90 mt-1 font-medium"
                        >
                          {s.success}
                        </motion.p>
                      )}
                      {!isActive && !isComplete && (
                        <motion.p
                          key={`q-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] text-ink-400 mt-1"
                        >
                          Queued · Copilot will handle it
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Per-step progress dashes */}
                {isActive && (
                  <div className="mt-3 flex gap-1">
                    {s.progress.map((_, j) => (
                      <span
                        key={j}
                        className="h-[3px] flex-1 rounded-pill transition-all"
                        style={{ background: j < lineIdx ? '#2563EB' : j === lineIdx ? '#93C5FD' : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 border-t border-ink-100">
          {done ? (
            <div className="flex items-center gap-2 pt-5">
              <button
                onClick={finish}
                className="flex-1 h-11 rounded-xl text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
                }}
              >
                <CheckCircleIcon size={14} weight="fill" />
                Done — open my briefing
              </button>
            </div>
          ) : (
            <p className="text-center text-[10.5px] text-ink-400 pt-4 font-medium tracking-tight">
              Hands-free setup · Lofty Copilot handles everything
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
