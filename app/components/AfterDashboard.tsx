'use client'
import { useState, useCallback } from 'react'
import {
  SparkleIcon, PhoneIcon, EnvelopeIcon, ChatCircleIcon,
  HouseIcon, WarningCircleIcon, CheckCircleIcon, ArrowLeftIcon,
  ArrowsClockwiseIcon, FlameIcon,
  CalendarIcon, ClipboardTextIcon, CurrencyDollarIcon,
  PaperPlaneTiltIcon, PencilSimpleIcon, MapPinIcon,
  ArrowUpRightIcon, ChartBarIcon, XIcon, MicrophoneIcon,
  KeyboardIcon, SpeakerHighIcon, VideoIcon, PlusIcon,
  PhoneXIcon, CaretDownIcon,
} from '@phosphor-icons/react'
import SetupAssistant from './SetupAssistant'
import LoftyMark from './LoftyMark'

/* ── Google Fonts ── */
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700;900&family=Manrope:wght@400;500;600;700;800&display=swap');`

/* ─── Static data ──────────────────────────────────────────────── */
const LEADS_DEFAULT = [
  {
    name: 'Scott Hayes', score: 92, location: 'Phoenix · Buyer', ago: '3 min ago',
    status: 'High Intent',
    sub: '4BD in North Scottsdale ($750K–$900K)',
    breakdown: [
      { label: 'Activity', pct: 100 }, { label: 'Intent', pct: 88 },
      { label: 'Profile', pct: 80 },  { label: 'Engage', pct: 92 },
    ],
    reasons: ['Viewed 650 Maple St 4× this morning', 'Score jumped 14 pts overnight', 'Updated saved search for 4bd'],
    draft: "Hey Scott! I noticed you've been looking at 650 Maple four times this morning — it's a strong match for what you described. Want to hold a private showing this week before it moves?",
    match: { address: '650 Maple St', detail: '4 bd · 3 ba · $725K', dom: '12 days on market', pct: '94.2%' },
    scoreBreakdown: [
      { label: 'Listing Activity', pts: 38, max: 38, desc: 'Viewed 650 Maple 4×, saved listing' },
      { label: 'Email Engagement', pts: 28, max: 30, desc: 'Opened last 2 emails in 10 min' },
      { label: 'Return Visit', pts: 18, max: 22, desc: 'Back after 6-day absence' },
      { label: 'Contact Quality', pts: 8, max: 10, desc: 'Valid phone, verified email' },
    ],
  },
  {
    name: 'Maria Gonzalez', score: 78, location: 'Scottsdale · Buyer', ago: '1 hr ago',
    status: 'Warm',
    sub: 'Condo in Downtown Phoenix ($350K–$500K)',
    breakdown: [
      { label: 'Activity', pct: 75 }, { label: 'Intent', pct: 80 },
      { label: 'Profile', pct: 70 },  { label: 'Engage', pct: 85 },
    ],
    reasons: ['Opened listing email twice today', 'Calculated mortgage on 7th Ave listing'],
    draft: "Hi Maria! I saw you were checking out 7th Ave — great pick for your budget. I have similar condos that just hit the market. Want me to send over the details?",
    match: { address: '7th Ave Condos', detail: '2 bd · 2 ba · $435K', dom: '5 days on market', pct: '88.7%' },
    scoreBreakdown: [
      { label: 'Email Engagement', pts: 30, max: 30, desc: 'Opened email twice, clicked once' },
      { label: 'Listing Activity', pts: 28, max: 38, desc: 'Mortgage calc on 7th Ave listing' },
      { label: 'Contact Quality', pts: 10, max: 10, desc: 'Verified contact info on file' },
      { label: 'Return Visit', pts: 10, max: 22, desc: 'Second visit this week' },
    ],
  },
  {
    name: 'David Kim', score: 61, location: 'Tempe · Seller', ago: '4 hr ago',
    status: 'Nurture',
    sub: 'Sell 3BD in Tempe (est. $420K)',
    breakdown: [
      { label: 'Activity', pct: 60 }, { label: 'Intent', pct: 55 },
      { label: 'Profile', pct: 65 },  { label: 'Engage', pct: 50 },
    ],
    reasons: ['Requested instant home valuation'],
    draft: "Hey David! Our latest data puts 3BDs in Tempe at strong prices right now. Mind if I put together a proper estimate for your home?",
    match: { address: 'Tempe Market', detail: '3 bd avg · $418K median', dom: 'Strong seller conditions', pct: '72.1%' },
    scoreBreakdown: [
      { label: 'Listing Activity', pts: 24, max: 38, desc: 'Requested home valuation' },
      { label: 'Email Engagement', pts: 22, max: 30, desc: 'Opened market report' },
      { label: 'Return Visit', pts: 10, max: 22, desc: 'Site visit 4 days ago' },
      { label: 'Contact Quality', pts: 5, max: 10, desc: 'Phone unverified' },
    ],
  },
]

const TRANSACTIONS_DEFAULT = [
  { name: 'Johnson — 650 Maple St', stage: 'Closing', deadline: 'Apr 21', amount: '$485K', alert: true, issue: 'Inspection note open' },
  { name: 'Williams — 1842 Camelback', stage: 'Inspection', deadline: 'Apr 25', amount: '$520K', alert: false, issue: null },
  { name: 'Martinez — 88 Sunridge', stage: 'Offer', deadline: 'Apr 22', amount: '$610K', alert: true, issue: '2 tasks overdue' },
]
const LISTINGS_DEFAULT = [
  { address: '650 Maple St, Scottsdale', price: '$749,000', bed: 4, bath: 3, status: 'Active', views: 42 },
  { address: '1842 Camelback Rd, Phoenix', price: '$520,000', bed: 3, bath: 2, status: 'Showing', views: 28 },
  { address: '234 Desert View Dr, Tempe', price: '$389,000', bed: 2, bath: 2, status: 'Active', views: 17 },
]
const APPT_DEFAULT = [
  { contact: 'Martinez', address: '1842 Camelback', time: '2:00 PM', type: 'Showing' },
  { contact: 'Roberts', address: '650 Maple St', time: '4:30 PM', type: 'Walkthrough' },
]

/* ─── Helpers ──────────────────────────────────────────────────── */
function scoreColor(s: number) {
  if (s >= 80) return { text: '#1d4ed8', bg: '#eff6ff', bar: '#3b82f6' }
  if (s >= 60) return { text: '#065f46', bg: '#ecfdf5', bar: '#10b981' }
  return { text: '#92400e', bg: '#fffbeb', bar: '#f59e0b' }
}
function initials(name: string) { return name.split(' ').map(n => n[0]).join('').slice(0, 2) }

/* ─── Inline Dialer ─────────────────────────────────────────────── */
function Dialer({ name, onClose }: { name: string; onClose: () => void }) {
  const [muted, setMuted] = useState(false)
  const [secs, setSecs] = useState(0)
  useState(() => { const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t) })
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  return (
    <div className="mt-5 rounded-3xl p-7 text-white" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a8a)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-lg">{initials(name)}</div>
          <div>
            <p className="font-bold text-[15px]">Calling {name.split(' ')[0]}…</p>
            <p className="text-white/50 text-[11px] tabular-nums">{fmt}</p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Active</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-7 text-center">
        {[
          { Icon: muted ? MicrophoneIcon : MicrophoneIcon, label: muted ? 'Unmute' : 'Mute', action: () => setMuted(m => !m), active: muted },
          { Icon: KeyboardIcon, label: 'Keypad', action: () => {}, active: false },
          { Icon: SpeakerHighIcon, label: 'Speaker', action: () => {}, active: false },
          { Icon: PlusIcon, label: 'Add', action: () => {}, active: false },
          { Icon: VideoIcon, label: 'Video', action: () => {}, active: false },
          { Icon: PaperPlaneTiltIcon, label: 'Notes', action: () => {}, active: false },
        ].map(({ Icon, label, action, active }) => (
          <button key={label} onClick={action} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}>
              <Icon size={18} weight="regular" />
            </div>
            <span className="text-[9px] font-bold uppercase text-white/50">{label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[13px] transition-all"
        style={{ background: '#dc2626' }}
      >
        <PhoneXIcon size={16} weight="fill" />End Call
      </button>
    </div>
  )
}

/* ─── Lead Card ─────────────────────────────────────────────────── */
function LeadCard({ lead, idx }: { lead: typeof LEADS_DEFAULT[0]; idx: number }) {
  const [expanded, setExpanded] = useState(false)
  const [showDialer, setShowDialer] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(lead.draft)
  const [messageSent, setMessageSent] = useState(false)
  const [contacted, setContacted] = useState(false)
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle')
  const c = scoreColor(lead.score)
  const firstName = lead.name.split(' ')[0]

  const handleSync = useCallback(() => {
    if (syncState !== 'idle') return
    setSyncState('syncing')
    setTimeout(() => { setSyncState('done'); setTimeout(() => setSyncState('idle'), 3000) }, 1800)
  }, [syncState])

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden"
      style={{ boxShadow: '0 20px 40px rgba(25,28,31,0.05)' }}
    >
      <div className="p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-[16px]"
              style={{ background: c.bg, color: c.text }}
            >
              {initials(lead.name)}
            </div>
            <div>
              <h4 className="font-extrabold text-[18px] text-gray-900 leading-tight" style={{ fontFamily: "'Noto Serif', serif" }}>{lead.name}</h4>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPinIcon size={10} weight="regular" />{lead.location} · {lead.ago}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-2xl px-3.5 py-2" style={{ background: c.bg }}>
            <span className="font-black text-[22px] leading-none" style={{ color: c.text }}>{lead.score}</span>
            <span className="text-[7px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: c.text }}>Score</span>
          </div>
        </div>

        <p className="text-[12px] text-gray-400 mb-4">{lead.sub}</p>

        {/* One-line Copilot reasoning — trust builder without clutter */}
        <div className="flex items-start gap-2 mb-5 text-[12.5px] text-gray-600 leading-[1.5]">
          <LoftyMark size={13} className="mt-0.5" />
          <span><span className="font-semibold text-gray-800">Why now:</span> {lead.reasons[0]}.</span>
        </div>

        {/* Primary actions — collapsed to 2 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setShowDialer(d => !d); setContacted(true) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-[13px] transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(180deg,#2563eb,#1d4ed8)', boxShadow: '0 8px 20px -6px rgba(37,99,235,0.4)' }}
          >
            <PhoneIcon size={15} weight="fill" />
            {showDialer ? 'In Call…' : 'Call Scott'}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 text-[12px] font-bold hover:bg-gray-100 transition-all"
          >
            {expanded ? 'Less' : 'Why?'}
            <CaretDownIcon size={12} weight="bold" className="transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        {/* Dialer */}
        {showDialer && <Dialer name={lead.name} onClose={() => setShowDialer(false)} />}

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Score bars detail */}
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gray-400 mb-3">Score Breakdown</p>
              <div className="space-y-2.5">
                {lead.scoreBreakdown.map(row => (
                  <div key={row.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-gray-800">{row.label}</span>
                      <span className="text-[11px] font-extrabold tabular-nums" style={{ color: c.text }}>+{row.pts}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full" style={{ width: `${(row.pts / row.max) * 100}%`, background: c.bar }} />
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{row.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Draft + Market Match */}
            <div className="space-y-4">
              {/* Copilot Draft */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-3">
                  <LoftyMark size={12} />
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-blue-500">Drafted by Lofty Copilot · SMS</span>
                  <span className="ml-auto text-[9px] text-gray-400">To: {firstName}</span>
                </div>
                {messageSent ? (
                  <div className="rounded-xl py-5 flex flex-col items-center gap-2 bg-emerald-50 border border-emerald-100">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
                      <PaperPlaneTiltIcon size={16} weight="fill" className="text-white" />
                    </div>
                    <p className="text-[13px] font-bold text-emerald-800">Sent to {firstName}</p>
                    <p className="text-[10px] text-emerald-600">Logged to CRM timeline</p>
                  </div>
                ) : (
                  <div className="rounded-xl p-3 mb-3 bg-gray-50 border border-gray-100">
                    {editMode ? (
                      <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4} autoFocus className="w-full bg-transparent resize-none focus:outline-none text-[13px] text-gray-800" />
                    ) : (
                      <p className="text-[13px] text-gray-700 leading-relaxed">{draft}</p>
                    )}
                  </div>
                )}
                {!messageSent && (
                  <div className="flex gap-2">
                    <button onClick={() => { setMessageSent(true); setContacted(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: '#2563eb' }}>
                      <PaperPlaneTiltIcon size={12} weight="fill" />Send
                    </button>
                    <button onClick={() => setEditMode(v => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                      <PencilSimpleIcon size={11} weight="regular" />{editMode ? 'Preview' : 'Edit'}
                    </button>
                  </div>
                )}
                {messageSent && (
                  <button onClick={() => { setMessageSent(false); setDraft(lead.draft) }} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-gray-50 border border-gray-200 text-gray-600">
                    <SparkleIcon size={10} weight="regular" className="text-blue-500" />New draft
                  </button>
                )}
              </div>

              {/* Market Match */}
              <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 60%,#0ea5e9)' }}>
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: 'rgba(103,232,249,0.2)', filter: 'blur(20px)' }} />
                <div className="relative">
                  <p className="text-[8px] font-bold tracking-widest uppercase text-white/50 mb-1.5 flex items-center gap-1"><MapPinIcon size={9} weight="bold" />Market Match</p>
                  <h5 className="font-extrabold text-[15px] leading-snug mb-0.5">{lead.match.address} · {lead.match.pct}</h5>
                  <p className="text-[11px] text-white/70">{lead.match.detail}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{lead.match.dom}</p>
                  <button className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-white/80 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full hover:bg-white/20 transition-all">
                    View listing <ArrowUpRightIcon size={9} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────────── */
interface Props {
  onBack?: () => void
  leads?: any[]; transactions?: any[]; listings?: any[]; tasks?: any[]; appointments?: any[]
}

export default function AfterDashboard({ onBack, leads: lDb, transactions: tDb, listings: liDb, tasks: tkDb, appointments: aDb }: Props) {
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)

  const leads = lDb?.length
    ? lDb.slice(0, 3).map((l: any, i: number) => ({ ...LEADS_DEFAULT[i] ?? LEADS_DEFAULT[0], name: l.name, score: l.score, location: `${l.city ?? 'Phoenix'} · ${l.type}`, status: l.score >= 80 ? 'High Intent' : l.score >= 60 ? 'Warm' : 'Nurture' }))
    : LEADS_DEFAULT

  const txs = tDb?.length
    ? tDb.slice(0, 3).map((t: any) => ({ name: t.name, stage: t.stage, deadline: (t.deadline as string).split(',')[0], amount: `$${Math.round(t.value / 1000)}K`, alert: t.urgency === 'critical', issue: (t.openIssues ?? t.open_issues ?? [])[0] ?? null }))
    : TRANSACTIONS_DEFAULT

  const listings = liDb?.length
    ? liDb.slice(0, 3).map((l: any, i: number) => ({ address: l.address, price: `$${l.price.toLocaleString()}`, bed: l.beds, bath: l.baths, status: l.status, views: LISTINGS_DEFAULT[i]?.views ?? 20 }))
    : LISTINGS_DEFAULT

  const appts = aDb?.length ? aDb.slice(0, 2).map((a: any) => ({ contact: a.contact, address: a.address, time: a.time, type: a.type })) : APPT_DEFAULT
  const tasks = { Call: tkDb?.filter((t: any) => t.type === 'Call').length ?? 4, Text: tkDb?.filter((t: any) => t.type === 'Text').length ?? 2, Email: tkDb?.filter((t: any) => t.type === 'Email').length ?? 1, Other: tkDb?.filter((t: any) => t.type === 'Other').length ?? 3 }
  const totalTasks = Object.values(tasks).reduce((a, b) => a + b, 0)
  const hot = leads.filter(l => l.score >= 80).length
  const totalLeads = lDb?.length ?? 23
  const urgentTx = txs.filter(t => t.alert).length

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#f8f9fd' }}>
      <style>{FONT_IMPORT}</style>

      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-6 h-12 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
              <ArrowLeftIcon size={12} weight="bold" />Back
            </button>
          )}
          <span className="font-extrabold text-[15px] text-gray-900" style={{ fontFamily: "'Noto Serif', serif" }}>The Editorial Estate</span>
        </div>
        <span className="text-[11px] text-gray-400 font-medium tabular-nums">Apr 18, 2026</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-5 pt-8 pb-16">

          {/* ── Two column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — main */}
            <div className="lg:col-span-2 space-y-8">

              {/* Copilot Morning Briefing */}
              <section>
                <div className="inline-flex items-center gap-2 mb-3">
                  <LoftyMark size={14} halo />
                  <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-blue-500">Morning briefing · Lofty Copilot</p>
                </div>
                <h1 className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] text-gray-900 mb-3" style={{ fontFamily: "'Noto Serif', serif" }}>
                  Good morning, Baylee.{' '}
                  <span className="text-blue-600">{hot} hot leads</span> need your attention today.
                </h1>
                <p className="text-[14px] text-gray-400 font-light">
                  I reviewed {totalLeads} leads overnight — {urgentTx} transactions need immediate action.
                </p>
              </section>

              {/* Setup nudge — Copilot offers to finish what's left */}
              {!onboardingDismissed && (
                <div className="relative overflow-hidden rounded-3xl p-5 text-white flex items-center gap-4" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="flex-1">
                    <p className="font-bold text-[13px] mb-0.5 flex items-center gap-1.5">
                      <LoftyMark size={14} />
                      Finish setup with Lofty Copilot · 2 items left
                    </p>
                    <p className="text-[11px] text-white/75">Connect your dialer + sync your calendar. I'll walk you through it in 30 seconds — no guesswork.</p>
                  </div>
                  <button
                    onClick={() => setSetupOpen(true)}
                    className="shrink-0 h-8 px-3 rounded-full bg-white text-blue-700 text-[11px] font-extrabold hover:brightness-110 transition-all active:scale-[0.97]"
                  >
                    Let Copilot handle it
                  </button>
                  <button onClick={() => setOnboardingDismissed(true)} className="shrink-0 p-1.5 bg-white/15 hover:bg-white/25 rounded-full transition-colors">
                    <XIcon size={14} weight="bold" />
                  </button>
                </div>
              )}

              {/* Priority Lead Cards */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-gray-400">Priority Portfolios</p>
                  <span className="text-[11px] font-bold text-blue-600 cursor-pointer">View All</span>
                </div>
                <div className="space-y-5">
                  {leads.map((lead, i) => (
                    <LeadCard key={lead.name} lead={lead} idx={i} />
                  ))}
                </div>
              </section>

              {/* Transactions */}
              <section className="bg-white rounded-3xl p-6 shadow-sm" style={{ boxShadow: '0 20px 40px rgba(25,28,31,0.04)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon size={16} weight="bold" className="text-blue-600" />
                    <h3 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wide">Transactions</h3>
                  </div>
                  {urgentTx > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">{urgentTx} urgent</span>}
                </div>
                <div className="space-y-2.5">
                  {txs.map(tx => (
                    <div key={tx.name} className={`flex items-center justify-between p-4 rounded-2xl ${tx.alert ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                      <div>
                        <p className={`text-[13px] font-semibold ${tx.alert ? 'text-red-700' : 'text-gray-800'}`}>{tx.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{tx.stage} · {tx.deadline}</span>
                          {tx.alert && tx.issue && <span className="text-[11px] text-red-500 flex items-center gap-1"><WarningCircleIcon size={11} weight="fill" />{tx.issue}</span>}
                        </div>
                      </div>
                      <span className={`text-[14px] font-extrabold tabular-nums ${tx.alert ? 'text-red-600' : 'text-gray-700'}`}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-[11px] font-bold text-blue-600">
                  <LoftyMark size={12} />Copilot confirmed 2 close dates today
                </div>
              </section>

            </div>

            {/* RIGHT — sidebar */}
            <div className="space-y-5">
              <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-gray-400">Your day at a glance</p>

              {/* Bento: Tasks + Appointments */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-3xl p-5 border border-gray-100" style={{ boxShadow: '0 20px 40px rgba(25,28,31,0.04)' }}>
                  <ClipboardTextIcon size={18} weight="bold" className="text-blue-600 mb-2" />
                  <p className="font-extrabold text-[28px] text-gray-900 leading-none">{totalTasks}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">Tasks today</p>
                  <div className="mt-3 space-y-1">
                    {(['Call', 'Text', 'Email'] as const).map(k => (
                      <div key={k} className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-extrabold text-gray-800">{tasks[k]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[9.5px] font-bold text-blue-600 flex items-center gap-1">
                    <LoftyMark size={10} />Copilot drafted 4
                  </div>
                </div>

                <div className="rounded-3xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                  <CalendarIcon size={18} weight="bold" className="mb-2 opacity-80" />
                  <p className="font-extrabold text-[28px] leading-none">{appts.length + 1}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mt-1">Showings</p>
                  <div className="mt-3 space-y-1">
                    {appts.map(a => (
                      <div key={a.contact + a.time} className="flex justify-between text-[10px]">
                        <span className="text-white/70">{a.contact}</span>
                        <span className="font-extrabold">{a.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 text-[9.5px] font-bold text-white/80 flex items-center gap-1">
                    <LoftyMark size={10} />Copilot optimized your route
                  </div>
                </div>
              </div>

              {/* Listings — kept intentionally minimal so sidebar stays calm */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 hidden" style={{ boxShadow: '0 20px 40px rgba(25,28,31,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <HouseIcon size={15} weight="bold" className="text-blue-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray-700">My Listings</span>
                </div>
                <div className="space-y-3">
                  {listings.map(l => (
                    <div key={l.address} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <HouseIcon size={14} weight="regular" className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{l.address.split(',')[0]}</p>
                        <p className="text-[10px] text-gray-400">{l.price} · {l.bed}bd · {l.views}v</p>
                      </div>
                      <span className="text-[8px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {setupOpen && (
        <SetupAssistant
          onClose={() => setSetupOpen(false)}
          onDone={() => setOnboardingDismissed(true)}
        />
      )}
    </div>
  )
}
