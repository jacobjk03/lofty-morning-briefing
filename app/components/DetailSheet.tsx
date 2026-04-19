'use client'
import { motion } from 'framer-motion'
import {
  XIcon,
  AlarmIcon,
  LightningIcon,
  CheckCircleIcon,
  CircleIcon,
  WarningCircleIcon,
  ArrowRightIcon,
  PaperPlaneTiltIcon,
  CalendarPlusIcon,
  ClockCountdownIcon,
  PlayIcon,
} from '@phosphor-icons/react'

export type DetailView = 'johnson' | 'bloom'

interface DetailSheetProps {
  view: DetailView
  onClose: () => void
  onAction: (msg: string) => void
}

export default function DetailSheet({ view, onClose, onAction }: DetailSheetProps) {
  const isJohnson = view === 'johnson'
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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-pill flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close"
        >
          <XIcon size={15} weight="regular" />
        </button>

        {isJohnson ? <JohnsonBody onAction={onAction} onClose={onClose} /> : <BloomBody onAction={onAction} onClose={onClose} />}
      </motion.div>
    </motion.div>
  )
}

/* ─────────── Johnson transaction ─────────── */

function JohnsonBody({ onAction, onClose }: { onAction: (m: string) => void; onClose: () => void }) {
  const checklist = [
    { label: 'Mutual contract signed', state: 'done' as const },
    { label: 'Earnest money received', state: 'done' as const },
    { label: 'Inspection scheduled', state: 'warn' as const, note: 'Open — agent action needed' },
    { label: 'Appraisal ordered', state: 'done' as const },
    { label: 'Loan contingency removed', state: 'todo' as const },
    { label: 'Final walkthrough', state: 'todo' as const },
    { label: 'Closing', state: 'todo' as const, note: 'In 72 hours' },
  ]
  return (
    <>
      <div className="px-8 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider2 font-semibold text-amber-600 mb-3">
          <AlarmIcon size={12} weight="regular" />
          Deadline alert · 72 hours
        </div>
        <h2 className="font-headline font-bold italic text-[30px] tracking-tightest text-ink-900 leading-[1.05]">
          Johnson deal · $485K
        </h2>
        <p className="text-[13px] text-ink-500 mt-2">
          650 Elm St · Buyer-side · Stage: <span className="font-semibold text-ink-800">Under contract</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="px-8 pb-5 grid grid-cols-3 gap-3">
        <Stat label="Close in" value="72 hrs" tone="amber" />
        <Stat label="Contract" value="$485K" />
        <Stat label="Open items" value="1" tone="amber" />
      </div>

      {/* Open issue callout */}
      <div className="mx-8 mb-6 p-5 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <div className="flex items-start gap-3">
          <WarningCircleIcon size={18} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-ink-900">Inspection note still open</p>
            <p className="text-[12px] text-ink-600 mt-1 leading-relaxed">
              The buyer flagged two items (roof patch, kitchen outlet). Two tasks overdue by 36 hours.
              Reschedule the walk and ping the client before end-of-day to stay on track.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-8 pb-4">
        <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">
          Transaction checklist
        </div>
        <div className="space-y-2">
          {checklist.map((c) => (
            <ChecklistRow key={c.label} label={c.label} state={c.state} note={c.note} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-ink-100 flex flex-wrap gap-2.5 bg-ink-50/40">
        <button
          onClick={() => { onAction('Inspection rescheduled · client notified'); onClose() }}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
          }}
        >
          <CalendarPlusIcon size={14} weight="fill" />
          Reschedule + notify
        </button>
        <button
          onClick={() => { onAction('Closing checklist sent to client'); onClose() }}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:border-blue-400 hover:text-blue-700 transition-all"
        >
          <PaperPlaneTiltIcon size={13} weight="regular" />
          Send checklist
        </button>
        <button
          onClick={() => { onAction('Snoozed for 24 hours'); onClose() }}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:border-ink-300 transition-all"
        >
          <ClockCountdownIcon size={13} weight="regular" />
          Snooze
        </button>
      </div>
    </>
  )
}

/* ─────────── Bloom Smart Plan ─────────── */

function BloomBody({ onAction, onClose }: { onAction: (m: string) => void; onClose: () => void }) {
  const steps = [
    { day: 'Day 1',  label: 'Welcome email — Phoenix buyer intro', state: 'done' as const },
    { day: 'Day 3',  label: 'Neighborhood fit questionnaire',     state: 'done' as const },
    { day: 'Day 7',  label: 'Listing digest · weekly',            state: 'done' as const },
    { day: 'Day 10', label: 'Open house round-up',                state: 'warn' as const, note: '2 bounces here' },
    { day: 'Day 14', label: 'Financing partner intro',            state: 'paused' as const },
    { day: 'Day 21', label: 'Mortgage rate check-in',             state: 'todo' as const },
    { day: 'Day 28', label: 'Showing availability survey',        state: 'todo' as const },
  ]
  const bounced = [
    { name: 'Jenna Whitmore', email: 'jenna.wh@email.com', reason: 'Hard bounce · invalid address' },
    { name: 'Theo Martinez',  email: 't.martin@email.com', reason: 'Hard bounce · mailbox not found' },
  ]

  return (
    <>
      <div className="px-8 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider2 font-semibold text-amber-600 mb-3">
          <LightningIcon size={12} weight="regular" />
          Smart Plan · Auto-paused
        </div>
        <h2 className="font-headline font-bold italic text-[30px] tracking-tightest text-ink-900 leading-[1.05]">
          Bloom Companion · 28-day buyer nurture
        </h2>
        <p className="text-[13px] text-ink-500 mt-2">
          28 steps · Currently day 10 · <span className="font-semibold text-amber-700">Paused after 2 bounces</span>
        </p>
      </div>

      {/* Stats row */}
      <div className="px-8 pb-5 grid grid-cols-3 gap-3">
        <Stat label="Total enrolled" value="14" />
        <Stat label="Affected" value="2" tone="amber" />
        <Stat label="Delivery rate" value="86%" />
      </div>

      {/* Progress bar */}
      <div className="px-8 pb-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider2 font-semibold text-ink-400 mb-2">
          <span>Timeline</span>
          <span>10 / 28 days</span>
        </div>
        <div className="h-2 rounded-pill bg-ink-100 overflow-hidden">
          <div className="h-full rounded-pill" style={{ width: '36%', background: 'linear-gradient(90deg, #2563EB, #06B6D4)' }} />
        </div>
      </div>

      {/* Plan steps */}
      <div className="px-8 pb-4">
        <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">
          Plan steps
        </div>
        <div className="space-y-2">
          {steps.map((s) => (
            <ChecklistRow key={s.day} label={`${s.day} · ${s.label}`} state={s.state} note={s.note} />
          ))}
        </div>
      </div>

      {/* Bounced recipients */}
      <div className="px-8 pb-6">
        <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">
          Bounced recipients
        </div>
        <div className="rounded-xl border border-ink-200 divide-y divide-ink-100 overflow-hidden">
          {bounced.map((b) => (
            <div key={b.email} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-pill bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-[11px]">
                {b.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-ink-800 truncate">{b.name}</p>
                <p className="text-[11px] text-ink-400 truncate">{b.email} · {b.reason}</p>
              </div>
              <span className="text-[10px] font-semibold tracking-wider2 uppercase text-amber-700">Remove</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-ink-100 flex flex-wrap gap-2.5 bg-ink-50/40">
        <button
          onClick={() => { onAction('Contacts cleaned · Bloom plan resumed'); onClose() }}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
          }}
        >
          <PlayIcon size={14} weight="fill" />
          Fix and resume
        </button>
        <button
          onClick={() => { onAction('Opening Smart Plan editor…'); onClose() }}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:border-blue-400 hover:text-blue-700 transition-all"
        >
          Edit plan
          <ArrowRightIcon size={13} weight="regular" />
        </button>
      </div>
    </>
  )
}

/* ─────────── Shared bits ─────────── */

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'amber' }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: tone === 'amber' ? 'rgba(245,158,11,0.06)' : '#f7f9fb',
        border: `1px solid ${tone === 'amber' ? 'rgba(245,158,11,0.2)' : 'rgba(195,198,215,0.3)'}`,
      }}
    >
      <p className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400">{label}</p>
      <p
        className="font-headline font-bold italic text-[22px] tracking-tightest mt-0.5 leading-none"
        style={{ color: tone === 'amber' ? '#B45309' : '#0F172A' }}
      >
        {value}
      </p>
    </div>
  )
}

function ChecklistRow({
  label,
  state,
  note,
}: {
  label: string
  state: 'done' | 'todo' | 'warn' | 'paused'
  note?: string
}) {
  const icon =
    state === 'done' ? (
      <CheckCircleIcon size={16} weight="fill" className="text-blue-600" />
    ) : state === 'warn' ? (
      <WarningCircleIcon size={16} weight="fill" className="text-amber-600" />
    ) : state === 'paused' ? (
      <CircleIcon size={16} weight="regular" className="text-amber-500" />
    ) : (
      <CircleIcon size={16} weight="regular" className="text-ink-300" />
    )
  const labelColor =
    state === 'done'
      ? 'text-ink-500 line-through decoration-ink-300'
      : state === 'warn' || state === 'paused'
        ? 'text-ink-900'
        : 'text-ink-600'
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] font-medium ${labelColor}`}>{label}</p>
        {note && <p className="text-[11px] text-amber-700 mt-0.5 font-medium">{note}</p>}
      </div>
    </div>
  )
}
