'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon,
  SparkleIcon,
  LightningIcon,
  PlayIcon,
  PencilSimpleIcon,
  TrashIcon,
  ChatCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarPlusIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import LoftyMark from './LoftyMark'

interface SmartPlanModalProps {
  onClose: () => void
  onLaunched: (name: string) => void
}

interface PlanStep {
  day: number
  channel: 'sms' | 'email' | 'call' | 'task'
  title: string
  body: string
}

interface GeneratedPlan {
  name: string
  audience: string
  steps: PlanStep[]
}

const PROMPT_SUGGESTIONS = [
  'Re-engage dormant buyers from the last 6 months',
  'Nurture Scott Hayes through his 650 Maple purchase',
  'Welcome + qualify new leads from my open house',
  'Past-client anniversary — ask for referrals',
]

type Phase = 'prompt' | 'thinking' | 'review' | 'launching' | 'done'

const CHANNEL_META: Record<PlanStep['channel'], { Icon: any; label: string; color: string; bg: string }> = {
  sms:   { Icon: ChatCircleIcon,     label: 'SMS',   color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  email: { Icon: EnvelopeIcon,       label: 'Email', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  call:  { Icon: PhoneIcon,          label: 'Call',  color: '#9333ea', bg: 'rgba(147,51,234,0.08)' },
  task:  { Icon: CalendarPlusIcon,   label: 'Task',  color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
}

export default function SmartPlanModal({ onClose, onLaunched }: SmartPlanModalProps) {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [prompt, setPrompt] = useState('')
  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase === 'prompt') inputRef.current?.focus()
  }, [phase])

  const generate = async (goal?: string) => {
    const g = (goal ?? prompt).trim()
    if (!g) return
    setPrompt(g)
    setPhase('thinking')
    try {
      const res = await fetch('/api/smart-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: g }),
      })
      const data = await res.json()
      setPlan(data.plan || fallbackPlan(g))
    } catch {
      setPlan(fallbackPlan(g))
    }
    setTimeout(() => setPhase('review'), 700)
  }

  const launch = () => {
    if (!plan) return
    setPhase('launching')
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => {
        onLaunched(plan.name)
        onClose()
      }, 900)
    }, 900)
  }

  const updateStep = (i: number, patch: Partial<PlanStep>) => {
    if (!plan) return
    const next = [...plan.steps]
    next[i] = { ...next[i], ...patch }
    setPlan({ ...plan, steps: next })
  }
  const removeStep = (i: number) => {
    if (!plan) return
    setPlan({ ...plan, steps: plan.steps.filter((_, ix) => ix !== i) })
  }
  const addStep = () => {
    if (!plan) return
    const last = plan.steps[plan.steps.length - 1]
    setPlan({
      ...plan,
      steps: [...plan.steps, {
        day: (last?.day ?? 0) + 7,
        channel: 'email',
        title: 'Check-in',
        body: 'Brief follow-up to keep the conversation alive.',
      }],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11, 18, 32, 0.55)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl bg-white rounded-[18px] overflow-hidden relative max-h-[92vh] overflow-y-auto"
        style={{
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow:
            '0 24px 64px -16px rgba(15,23,42,0.30), 0 8px 24px -12px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-pill flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close"
        >
          <XIcon size={15} weight="regular" />
        </button>

        <AnimatePresence mode="wait">
          {phase === 'prompt' && (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-8 pt-8 pb-6">
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-8 h-8 rounded-pill flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)',
                    boxShadow: '0 6px 18px -6px rgba(37,99,235,0.45)',
                  }}
                >
                  <LightningIcon size={14} weight="fill" className="text-white" />
                </div>
                <span className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80">
                  Smart Plan · AI builder
                </span>
              </div>
              <h2 className="font-headline font-bold italic text-[24px] tracking-tightest text-ink-900 leading-[1.1]">
                Describe what you want — I'll build the plan.
              </h2>
              <p className="text-[12.5px] text-ink-500 mt-1.5">
                Say your goal in plain English. I'll draft the cadence, channels, and copy.
                You review before it goes live.
              </p>

              <div
                className="mt-5 rounded-xl p-4"
                style={{ background: '#f7f9fb', border: '1px solid rgba(195,198,215,0.3)' }}
              >
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
                  rows={3}
                  placeholder="Re-engage dormant buyers from the last 6 months…"
                  className="w-full bg-transparent text-[13.5px] text-ink-800 leading-[1.55] resize-none focus:outline-none placeholder-ink-400"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setPrompt(s); generate(s) }}
                    className="inline-flex items-center h-8 px-3 rounded-pill bg-white border border-ink-200 text-ink-600 text-[11.5px] font-medium hover:border-blue-400 hover:text-blue-700 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => generate()}
                disabled={!prompt.trim()}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
                }}
              >
                <SparkleIcon size={14} weight="fill" />
                Build plan
              </button>
            </motion.div>
          )}

          {phase === 'thinking' && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-10 py-16 flex flex-col items-center text-center">
              <div className="mb-5">
                <LoftyMark size={48} halo pulse />
              </div>
              <h3 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                Composing the plan…
              </h3>
              <p className="text-[12.5px] text-ink-500 mt-1.5 max-w-xs">
                Mapping cadence, channel mix, and tone to your audience.
              </p>
            </motion.div>
          )}

          {(phase === 'review' || phase === 'launching') && plan && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <LoftyMark size={14} />
                  <span className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80">
                    Lofty Copilot · review + edit
                  </span>
                </div>
                <h2 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900 leading-[1.1]">
                  {plan.name}
                </h2>
                <p className="text-[12.5px] text-ink-500 mt-1.5">
                  {plan.audience} · {plan.steps.length} steps over {Math.max(...plan.steps.map(s => s.day))} days
                </p>
              </div>

              <div className="px-6 pb-4 space-y-2.5">
                {plan.steps.map((s, i) => {
                  const meta = CHANNEL_META[s.channel]
                  const isEditing = editingIdx === i
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-3.5 flex items-start gap-3 transition-all group"
                      style={{ background: '#f7f9fb', border: '1px solid rgba(195,198,215,0.3)' }}
                    >
                      <div
                        className="w-10 shrink-0 text-center py-1 rounded-lg"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}22` }}
                      >
                        <div className="text-[8.5px] font-semibold tracking-wider2 uppercase" style={{ color: meta.color }}>
                          Day
                        </div>
                        <div className="font-headline font-bold italic text-[15px] tracking-tightest text-ink-800 leading-none mt-0.5">
                          {s.day}
                        </div>
                      </div>

                      <div
                        className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                        style={{ background: meta.bg }}
                      >
                        <meta.Icon size={14} weight="fill" style={{ color: meta.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              value={s.title}
                              onChange={(e) => updateStep(i, { title: e.target.value })}
                              className="w-full bg-white border border-ink-200 rounded-md px-2 py-1 text-[12.5px] font-semibold text-ink-800 focus:outline-none focus:border-blue-400"
                            />
                            <textarea
                              value={s.body}
                              onChange={(e) => updateStep(i, { body: e.target.value })}
                              rows={2}
                              className="w-full bg-white border border-ink-200 rounded-md px-2 py-1 text-[11.5px] text-ink-700 focus:outline-none focus:border-blue-400 resize-none"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-[12.5px] font-semibold text-ink-900 leading-tight">{s.title}</p>
                            <p className="text-[11.5px] text-ink-500 mt-0.5 leading-snug line-clamp-2">{s.body}</p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingIdx(isEditing ? null : i)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-400 hover:bg-white hover:text-blue-600 transition-colors"
                          aria-label="Edit step"
                        >
                          <PencilSimpleIcon size={12} weight="regular" />
                        </button>
                        <button
                          onClick={() => removeStep(i)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-ink-400 hover:bg-white hover:text-red-600 transition-colors"
                          aria-label="Remove step"
                        >
                          <TrashIcon size={12} weight="regular" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="px-6 pb-4">
                <button
                  onClick={addStep}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-white border border-dashed border-ink-300 text-ink-500 text-[11.5px] font-semibold hover:border-blue-400 hover:text-blue-700 transition-all"
                >
                  <PlusIcon size={12} weight="bold" />
                  Add step
                </button>
              </div>

              <div className="px-6 py-5 border-t border-ink-100 flex flex-wrap gap-2.5 bg-ink-50/40">
                <button
                  onClick={launch}
                  disabled={phase === 'launching'}
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98] disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
                  }}
                >
                  {phase === 'launching' ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-pill border-2 border-white border-t-transparent animate-spin" />
                      Launching…
                    </>
                  ) : (
                    <>
                      <PlayIcon size={14} weight="fill" />
                      Launch plan
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPhase('prompt')}
                  disabled={phase === 'launching'}
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:border-ink-300 transition-all"
                >
                  <SparkleIcon size={13} weight="regular" />
                  Re-prompt
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'done' && plan && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-10 py-16 flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-pill flex items-center justify-center mb-5"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircleIcon size={22} weight="fill" className="text-emerald-600" />
              </div>
              <h3 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                {plan.name} launched
              </h3>
              <p className="text-[12.5px] text-ink-500 mt-1.5 max-w-xs">
                {plan.steps.length}-step cadence is live · first action fires {plan.steps[0]?.day === 0 ? 'now' : `day ${plan.steps[0]?.day}`}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function fallbackPlan(goal: string): GeneratedPlan {
  const g = goal.toLowerCase()
  if (/scott|hayes|650 maple/.test(g)) {
    return {
      name: 'Scott Hayes · 28-day buyer nurture',
      audience: 'Scott Hayes',
      steps: [
        { day: 0,  channel: 'sms',   title: 'Initial follow-up', body: 'Saw you were back on 650 Maple — want me to hold a showing?' },
        { day: 2,  channel: 'email', title: 'Neighborhood snapshot', body: 'Scottsdale comps + 650 Maple positioning deep-dive.' },
        { day: 5,  channel: 'call',  title: 'Check-in call', body: 'Confirm tour availability, flag price-adjustment on adjacent comp.' },
        { day: 10, channel: 'email', title: 'Financing intro', body: 'Warm intro to preferred lender for pre-approval refresh.' },
        { day: 18, channel: 'sms',   title: 'Open house round-up', body: 'Upcoming weekend tours in Scottsdale buyer likes.' },
        { day: 28, channel: 'call',  title: 'Decision check-in', body: 'Ask about timeline, surface next-tier listings if paused.' },
      ],
    }
  }
  if (/dormant|lost|re-?engage|re-?activate/.test(g)) {
    return {
      name: 'Dormant buyers · 21-day re-engagement',
      audience: 'Buyers with no activity in 90+ days',
      steps: [
        { day: 0,  channel: 'email', title: 'Market-change nudge', body: 'Rates moved — here\'s what that means for your price band.' },
        { day: 3,  channel: 'sms',   title: 'Personal check-in', body: 'Quick pulse: still looking? Different price, area, timing?' },
        { day: 7,  channel: 'email', title: 'Curated 3-pack', body: 'Three listings tuned to last search criteria.' },
        { day: 14, channel: 'call',  title: 'Human touch', body: 'Voice conversation to re-qualify or archive with warm intent tag.' },
        { day: 21, channel: 'task',  title: 'Final triage', body: 'Move to nurture archive if no response — set 90-day re-check.' },
      ],
    }
  }
  if (/open house|welcome|new lead|qualif/.test(g)) {
    return {
      name: 'Open house → qualified lead · 14-day plan',
      audience: 'New open-house visitors',
      steps: [
        { day: 0, channel: 'sms',   title: 'Same-day thank-you', body: 'Thanks for stopping by — quick follow-up on the listing.' },
        { day: 1, channel: 'email', title: 'Property deep-dive', body: 'Floor plan, HOA, taxes, comparable sales within 1 mile.' },
        { day: 3, channel: 'email', title: 'Neighborhood primer', body: 'Schools, walkability, upcoming developments.' },
        { day: 5, channel: 'call',  title: 'Qualify call', body: 'Budget, timeline, competing properties — 10-min discovery.' },
        { day: 10,channel: 'task',  title: 'Tier + route', body: 'Hot → showings; warm → nurture; cold → archive with note.' },
        { day: 14,channel: 'email', title: '14-day check-in', body: 'Market-match digest + showing availability next weekend.' },
      ],
    }
  }
  return {
    name: 'Custom plan',
    audience: goal.slice(0, 60),
    steps: [
      { day: 0,  channel: 'email', title: 'Opening touch',      body: 'Warm introduction and context-setting.' },
      { day: 3,  channel: 'sms',   title: 'Short check-in',     body: 'Personal pulse to invite a reply.' },
      { day: 7,  channel: 'email', title: 'Value-add content',  body: 'Tailored resource matching audience needs.' },
      { day: 14, channel: 'call',  title: 'Live conversation',  body: 'Qualify timing and decision criteria.' },
      { day: 21, channel: 'email', title: 'Recap + next step',  body: 'Summarize exchange and propose one concrete next action.' },
    ],
  }
}
