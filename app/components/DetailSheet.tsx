'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [rescheduleState, setRescheduleState] = useState<'idle' | 'working' | 'done'>('idle')
  const [checklistState, setChecklistState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [snoozeOpen, setSnoozeOpen] = useState(false)
  const [inspectionFixed, setInspectionFixed] = useState(false)

  const RESCHEDULE_STEPS = ['Rescheduling inspection', 'Notifying Johnson', 'Updating checklist']
  const [stepIdx, setStepIdx] = useState(-1)

  const handleReschedule = () => {
    if (rescheduleState !== 'idle') return
    setRescheduleState('working')
    setStepIdx(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setStepIdx(i)
      if (i >= RESCHEDULE_STEPS.length) {
        clearInterval(id)
        setRescheduleState('done')
        setInspectionFixed(true)
        setTimeout(() => {
          onAction('Inspection rescheduled · client notified')
          onClose()
        }, 1200)
      }
    }, 750)
  }

  const handleSendChecklist = () => {
    if (checklistState !== 'idle') return
    setChecklistState('sending')
    setTimeout(() => {
      setChecklistState('sent')
      onAction('Closing checklist sent to Johnson')
    }, 1600)
  }

  const handleSnooze = (label: string) => {
    setSnoozeOpen(false)
    onAction(`Snoozed · reminder set for ${label}`)
    onClose()
  }

  const checklist = [
    { label: 'Mutual contract signed', state: 'done' as const },
    { label: 'Earnest money received', state: 'done' as const },
    { label: 'Inspection scheduled', state: (inspectionFixed ? 'done' : 'warn') as 'done' | 'warn', note: inspectionFixed ? undefined : 'Open — agent action needed' },
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
        <Stat label="Open items" value={inspectionFixed ? '0' : '1'} tone={inspectionFixed ? undefined : 'amber'} />
      </div>

      {/* Open issue callout — fades out when fixed */}
      <AnimatePresence>
        {!inspectionFixed && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-8 mb-6 p-5 rounded-xl overflow-hidden"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule progress steps */}
      <AnimatePresence>
        {rescheduleState === 'working' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-8 mb-5 p-4 rounded-xl overflow-hidden"
            style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}
          >
            <div className="space-y-2.5">
              {RESCHEDULE_STEPS.map((s, i) => {
                const done = stepIdx > i
                const active = stepIdx === i
                return (
                  <div key={s} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 shrink-0 rounded-pill flex items-center justify-center"
                      style={{ background: done ? '#2563EB' : active ? 'transparent' : '#E2E8F0', border: active ? '2px solid #2563EB' : 'none' }}>
                      {done && <CheckCircleIcon size={12} weight="fill" className="text-white" />}
                      {active && <span className="w-2 h-2 rounded-pill bg-blue-600" style={{ animation: 'breathe 1s ease-in-out infinite' }} />}
                    </span>
                    <span className={`text-[12px] font-medium ${done ? 'text-ink-500 line-through' : active ? 'text-ink-900' : 'text-ink-400'}`}>{s}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Snooze picker */}
      <AnimatePresence>
        {snoozeOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mx-6 mb-3 p-3 rounded-xl bg-white border border-ink-200 shadow-sm"
          >
            <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider2 mb-2">Remind me in…</p>
            <div className="flex gap-2">
              {['1 hour', '3 hours', '24 hours'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSnooze(opt)}
                  className="flex-1 h-9 rounded-lg bg-ink-50 border border-ink-200 text-ink-700 text-[12px] font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-ink-100 flex flex-wrap gap-2.5 bg-ink-50/40">
        {/* Reschedule + notify */}
        <button
          onClick={handleReschedule}
          disabled={rescheduleState !== 'idle'}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98] disabled:opacity-70"
          style={{
            background: rescheduleState === 'done'
              ? 'linear-gradient(180deg, #10B981, #059669)'
              : 'linear-gradient(180deg, #2563EB, #1D4ED8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
          }}
        >
          {rescheduleState === 'idle' && <><CalendarPlusIcon size={14} weight="fill" />Reschedule + notify</>}
          {rescheduleState === 'working' && <><span className="w-3.5 h-3.5 rounded-pill border-2 border-white border-t-transparent animate-spin" />Working…</>}
          {rescheduleState === 'done' && <><CheckCircleIcon size={14} weight="fill" />Rescheduled ✓</>}
        </button>

        {/* Send checklist */}
        <button
          onClick={handleSendChecklist}
          disabled={checklistState !== 'idle'}
          className={`inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[12.5px] font-semibold transition-all disabled:cursor-default
            ${checklistState === 'sent'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
              : 'bg-white border border-ink-200 text-ink-700 hover:border-blue-400 hover:text-blue-700'}`}
        >
          {checklistState === 'idle' && <><PaperPlaneTiltIcon size={13} weight="regular" />Send checklist</>}
          {checklistState === 'sending' && <><span className="w-3 h-3 rounded-pill border-2 border-blue-500 border-t-transparent animate-spin" />Sending…</>}
          {checklistState === 'sent' && <><CheckCircleIcon size={13} weight="fill" />Sent ✓</>}
        </button>

        {/* Snooze */}
        <button
          onClick={() => setSnoozeOpen(v => !v)}
          className={`inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[12.5px] font-semibold transition-all
            ${snoozeOpen ? 'bg-ink-900 text-white border border-ink-900' : 'bg-white border border-ink-200 text-ink-700 hover:border-ink-300'}`}
        >
          <ClockCountdownIcon size={13} weight="regular" />
          Snooze
        </button>
      </div>
    </>
  )
}

/* ─────────── Bloom Smart Plan ─────────── */

const INITIAL_BOUNCED = [
  { id: 'jenna', name: 'Jenna Whitmore', email: 'jenna.wh@email.com', reason: 'Hard bounce · invalid address' },
  { id: 'theo',  name: 'Theo Martinez',  email: 't.martin@email.com', reason: 'Hard bounce · mailbox not found' },
]

const FIX_STEPS = ['Removing bounced contacts', 'Re-validating recipients', 'Resuming Smart Plan']

function BloomBody({ onAction, onClose }: { onAction: (m: string) => void; onClose: () => void }) {
  const [bouncedList, setBouncedList] = useState(INITIAL_BOUNCED)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [fixState, setFixState] = useState<'idle' | 'working' | 'done'>('idle')
  const [fixStepIdx, setFixStepIdx] = useState(-1)
  const [resumed, setResumed] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [planName, setPlanName] = useState('Bloom Companion · 28-day buyer nurture')
  const [planFreq, setPlanFreq] = useState('Every 3–7 days')
  const [planStop, setPlanStop] = useState('After showing booked')
  const [saved, setSaved] = useState(false)

  const affected = bouncedList.length
  const deliveryRate = affected === 0 ? '100%' : affected === 1 ? '93%' : '86%'

  const removeContact = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      setBouncedList(l => l.filter(b => b.id !== id))
      setRemovingId(null)
    }, 400)
  }

  const handleFix = () => {
    if (fixState !== 'idle') return
    setFixState('working')
    setFixStepIdx(0)
    // Remove contacts one by one visually first
    setTimeout(() => removeContact('jenna'), 200)
    setTimeout(() => removeContact('theo'), 650)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setFixStepIdx(i)
      if (i >= FIX_STEPS.length) {
        clearInterval(id)
        setFixState('done')
        setResumed(true)
        setTimeout(() => {
          onAction('Contacts cleaned · Bloom plan resumed')
          onClose()
        }, 1200)
      }
    }, 800)
  }

  const handleSaveEdit = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setEditOpen(false)
      onAction('Smart Plan updated')
    }, 1200)
  }

  const steps = [
    { day: 'Day 1',  label: 'Welcome email — Phoenix buyer intro', state: 'done' as const },
    { day: 'Day 3',  label: 'Neighborhood fit questionnaire',     state: 'done' as const },
    { day: 'Day 7',  label: 'Listing digest · weekly',            state: 'done' as const },
    { day: 'Day 10', label: 'Open house round-up',                state: (resumed ? 'done' : 'warn') as 'done' | 'warn', note: resumed ? undefined : '2 bounces here' },
    { day: 'Day 14', label: 'Financing partner intro',            state: (resumed ? 'todo' : 'paused') as 'todo' | 'paused' },
    { day: 'Day 21', label: 'Mortgage rate check-in',             state: 'todo' as const },
    { day: 'Day 28', label: 'Showing availability survey',        state: 'todo' as const },
  ]

  return (
    <>
      <div className="px-8 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider2 font-semibold text-amber-600 mb-3">
          <LightningIcon size={12} weight="regular" />
          Smart Plan · {resumed ? 'Active' : 'Auto-paused'}
        </div>
        <h2 className="font-headline font-bold italic text-[30px] tracking-tightest text-ink-900 leading-[1.05]">
          {planName}
        </h2>
        <p className="text-[13px] text-ink-500 mt-2">
          28 steps · Currently day 10 ·{' '}
          <span className={`font-semibold ${resumed ? 'text-emerald-600' : 'text-amber-700'}`}>
            {resumed ? 'Running' : 'Paused after 2 bounces'}
          </span>
        </p>
      </div>

      {/* Stats row */}
      <div className="px-8 pb-5 grid grid-cols-3 gap-3">
        <Stat label="Total enrolled" value="14" />
        <Stat label="Affected" value={String(affected)} tone={affected > 0 ? 'amber' : undefined} />
        <Stat label="Delivery rate" value={deliveryRate} />
      </div>

      {/* Progress bar */}
      <div className="px-8 pb-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider2 font-semibold text-ink-400 mb-2">
          <span>Timeline</span>
          <span>10 / 28 days</span>
        </div>
        <div className="h-2 rounded-pill bg-ink-100 overflow-hidden">
          <motion.div
            className="h-full rounded-pill"
            animate={{ width: resumed ? '40%' : '36%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #2563EB, #06B6D4)' }}
          />
        </div>
      </div>

      {/* Fix progress steps */}
      <AnimatePresence>
        {fixState === 'working' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-8 mb-5 p-4 rounded-xl overflow-hidden"
            style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}
          >
            <div className="space-y-2.5">
              {FIX_STEPS.map((s, i) => {
                const done = fixStepIdx > i
                const active = fixStepIdx === i
                return (
                  <div key={s} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 shrink-0 rounded-pill flex items-center justify-center"
                      style={{ background: done ? '#2563EB' : active ? 'transparent' : '#E2E8F0', border: active ? '2px solid #2563EB' : 'none' }}>
                      {done && <CheckCircleIcon size={12} weight="fill" className="text-white" />}
                      {active && <span className="w-2 h-2 rounded-pill bg-blue-600" style={{ animation: 'breathe 1s ease-in-out infinite' }} />}
                    </span>
                    <span className={`text-[12px] font-medium ${done ? 'text-ink-500 line-through' : active ? 'text-ink-900' : 'text-ink-400'}`}>{s}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan steps */}
      <div className="px-8 pb-4">
        <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">Plan steps</div>
        <div className="space-y-2">
          {steps.map((s) => (
            <ChecklistRow key={s.day} label={`${s.day} · ${s.label}`} state={s.state} note={(s as any).note} />
          ))}
        </div>
      </div>

      {/* Bounced recipients */}
      <AnimatePresence>
        {bouncedList.length > 0 && (
          <motion.div
            exit={{ opacity: 0, height: 0 }}
            className="px-8 pb-6 overflow-hidden"
          >
            <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">Bounced recipients</div>
            <div className="rounded-xl border border-ink-200 divide-y divide-ink-100 overflow-hidden">
              <AnimatePresence>
                {bouncedList.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-3 px-4 py-3 overflow-hidden"
                  >
                    <div className={`w-8 h-8 rounded-pill flex items-center justify-center font-semibold text-[11px] transition-all ${removingId === b.id ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {removingId === b.id ? '✓' : b.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink-800 truncate">{b.name}</p>
                      <p className="text-[11px] text-ink-400 truncate">{b.email} · {b.reason}</p>
                    </div>
                    <button
                      onClick={() => removeContact(b.id)}
                      disabled={removingId !== null}
                      className="text-[10px] font-semibold tracking-wider2 uppercase text-amber-600 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit plan panel */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mx-6 mb-4 p-4 rounded-xl bg-white border border-ink-200 shadow-sm"
          >
            <p className="text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider2 mb-3">Plan settings</p>
            <div className="space-y-3">
              {[
                { label: 'Plan name', value: planName, setter: setPlanName },
                { label: 'Send frequency', value: planFreq, setter: setPlanFreq },
                { label: 'Stop condition', value: planStop, setter: setPlanStop },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <p className="text-[10.5px] text-ink-400 font-medium mb-1">{label}</p>
                  <input
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-ink-50 border border-ink-200 text-[12.5px] text-ink-800 font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 h-9 rounded-lg text-white text-[12.5px] font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ background: saved ? 'linear-gradient(180deg,#10B981,#059669)' : 'linear-gradient(180deg,#2563EB,#1D4ED8)' }}
              >
                {saved ? <><CheckCircleIcon size={13} weight="fill" />Saved ✓</> : 'Save changes'}
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="h-9 px-4 rounded-lg bg-ink-50 border border-ink-200 text-ink-600 text-[12.5px] font-semibold hover:bg-ink-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-ink-100 flex flex-wrap gap-2.5 bg-ink-50/40">
        <button
          onClick={handleFix}
          disabled={fixState !== 'idle'}
          className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-all active:scale-[0.98] disabled:opacity-70"
          style={{
            background: fixState === 'done'
              ? 'linear-gradient(180deg, #10B981, #059669)'
              : 'linear-gradient(180deg, #2563EB, #1D4ED8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
          }}
        >
          {fixState === 'idle'    && <><PlayIcon size={14} weight="fill" />Fix and resume</>}
          {fixState === 'working' && <><span className="w-3.5 h-3.5 rounded-pill border-2 border-white border-t-transparent animate-spin" />Working…</>}
          {fixState === 'done'    && <><CheckCircleIcon size={14} weight="fill" />Resumed ✓</>}
        </button>
        <button
          onClick={() => setEditOpen(v => !v)}
          className={`inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[12.5px] font-semibold transition-all
            ${editOpen ? 'bg-ink-900 text-white border border-ink-900' : 'bg-white border border-ink-200 text-ink-700 hover:border-blue-400 hover:text-blue-700'}`}
        >
          {editOpen ? 'Close editor' : 'Edit plan'}
          {!editOpen && <ArrowRightIcon size={13} weight="regular" />}
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
