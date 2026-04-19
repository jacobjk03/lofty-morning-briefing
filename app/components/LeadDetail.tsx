'use client'
import { useState, useEffect } from 'react'
import {
  ArrowLeftIcon,
  HouseIcon,
  EnvelopeIcon,
  ArrowsClockwiseIcon,
  PhoneIcon,
  ChartBarIcon,
  ChatTextIcon,
  CalendarIcon,
  ClipboardTextIcon,
  SparkleIcon,
} from '@phosphor-icons/react'
import Toast from './Toast'

interface LeadDetailProps {
  onBack: () => void
}

const SCORE_CATEGORIES = [
  {
    Icon: HouseIcon,
    label: 'Listing Activity',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    maxPts: 38,
    keywords: /view|saved|listing|maple|camelback|desert|property/i,
  },
  {
    Icon: EnvelopeIcon,
    label: 'Email Engagement',
    color: '#7c3aed',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    maxPts: 30,
    keywords: /email|opened|click|respond/i,
  },
  {
    Icon: ArrowsClockwiseIcon,
    label: 'Return Visit',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    maxPts: 22,
    keywords: /return|back|site|absence|revisit/i,
  },
  {
    Icon: PhoneIcon,
    label: 'Contact Quality',
    color: '#d97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    maxPts: 10,
    keywords: /phone|verif|contact|call|valid|schedule|showing|request/i,
  },
]

function buildBreakdown(score: number, activity: string[]) {
  const matched = SCORE_CATEGORIES
    .map(cat => ({ ...cat, desc: activity.find(a => cat.keywords.test(a)) || '' }))
    .filter(m => m.desc)
  if (matched.length === 0) {
    return [{
      Icon: ChartBarIcon,
      label: 'Overall Activity',
      pts: score,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      maxPts: 100,
      description: activity[0] || 'Lead activity',
    }]
  }
  const totalWeight = matched.reduce((s, m) => s + m.maxPts, 0)
  let remaining = score
  return matched.map((m, i) => {
    const pts = i === matched.length - 1 ? remaining : Math.round((m.maxPts / totalWeight) * score)
    remaining -= pts
    return { ...m, pts, description: m.desc }
  })
}

const DEFAULT_BREAKDOWN = [
  { Icon: HouseIcon,          label: 'Listing Activity',  pts: 35, color: '#2563EB', bgColor: '#EFF6FF',  borderColor: '#BFDBFE', maxPts: 38, description: 'Viewed 650 Maple St 4 times today, saved it' },
  { Icon: EnvelopeIcon,       label: 'Email Engagement',  pts: 28, color: '#7c3aed', bgColor: '#F5F3FF',  borderColor: '#DDD6FE', maxPts: 30, description: 'Opened last 2 emails within 10 minutes' },
  { Icon: ArrowsClockwiseIcon,label: 'Return Visit',      pts: 20, color: '#059669', bgColor: '#ECFDF5',  borderColor: '#A7F3D0', maxPts: 22, description: 'Back on site today after 6-day absence' },
  { Icon: PhoneIcon,          label: 'Contact Quality',   pts:  9, color: '#d97706', bgColor: '#FFFBEB',  borderColor: '#FDE68A', maxPts: 10, description: 'Valid phone, verified email' },
]

/** SVG ring meter */
function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" className="shrink-0">
      {/* track */}
      <circle cx="52" cy="52" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
      {/* fill — rotated so it starts at top */}
      <circle
        cx="52" cy="52" r={r}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 52 52)"
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x="52" y="48" textAnchor="middle" className="font-black" style={{ fontSize: 22, fontWeight: 900, fill: '#1e293b', fontFamily: 'inherit' }}>
        {score}
      </text>
      <text x="52" y="64" textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'inherit', fontWeight: 500 }}>
        / 100
      </text>
    </svg>
  )
}

export default function LeadDetail({ onBack }: LeadDetailProps) {
  const [leadName, setLeadName] = useState('Scott Hayes')
  const [leadScore, setLeadScore] = useState(92)
  const [scoreBreakdown, setScoreBreakdown] = useState(DEFAULT_BREAKDOWN)
  const [editMode, setEditMode] = useState(false)
  const [draftText, setDraftText] = useState(
    "Hey Scott! I noticed you've been looking at 650 Maple — it's a great match for what you described. Want to schedule a quick showing this week?"
  )
  const [toast, setToast] = useState<string | null>(null)

  const phone = '(602) 555-1234'
  const email = 'scott.hayes@email.com'
  const initials = leadName.split(' ').map(n => n[0]).join('')
  const firstName = leadName.split(' ')[0]

  useEffect(() => {
    fetch('/api/leads/1')
      .then(r => r.json())
      .then((data: any) => {
        setLeadName(data.name)
        setLeadScore(data.score)
        setScoreBreakdown(buildBreakdown(data.score, data.activity || []) as typeof DEFAULT_BREAKDOWN)
        setDraftText(`Hey ${data.name.split(' ')[0]}! I noticed you've been looking at 650 Maple — it's a great match for what you described. Want to schedule a quick showing this week?`)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f3f4f8]">
      {/* Header */}
      <div className="bg-white border-b border-ink-200 px-5 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          Back to Briefing
        </button>
        <span className="text-ink-200">|</span>
        <span className="text-[12px] text-ink-400">Lead Detail</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-4">

          {/* ── Profile card ── */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-sm animate-fade-in">

            {/* Top row: avatar+info / ring */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #06b6d4)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold text-ink-900 tracking-tight">{leadName}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Buyer</span>
                    <span className="text-[11px] text-ink-500">Phoenix, AZ · Active today</span>
                  </div>
                  {/* Contact info */}
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-600 hover:text-blue-600 transition-colors"
                    >
                      <PhoneIcon size={12} weight="regular" />
                      {phone}
                    </a>
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-600 hover:text-blue-600 transition-colors"
                    >
                      <EnvelopeIcon size={12} weight="regular" />
                      {email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Score ring */}
              <ScoreRing score={leadScore} />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-5">
              {[
                { Icon: PhoneIcon,        label: 'Call',     msg: `Calling ${firstName}…` },
                { Icon: ChatTextIcon,     label: 'Message',  msg: `Opening message to ${firstName}…` },
                { Icon: CalendarIcon,     label: 'Schedule', msg: 'Opening calendar…' },
                { Icon: ClipboardTextIcon,label: 'Note',     msg: 'Opening note editor…' },
              ].map(({ Icon, label, msg }) => (
                <button
                  key={label}
                  onClick={() => setToast(msg)}
                  className="flex-1 inline-flex flex-col items-center gap-1 py-2 rounded-lg border border-ink-200 bg-ink-50 hover:bg-white hover:border-blue-300 hover:text-blue-600 text-ink-600 transition-all text-[10.5px] font-semibold"
                >
                  <Icon size={16} weight="regular" />
                  {label}
                </button>
              ))}
            </div>

            {/* Score breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-ink-700 uppercase tracking-wider2">Score Breakdown</span>
                <span className="text-[11px] text-ink-400 tabular-nums">{leadScore} / 100 pts</span>
              </div>

              {/* Gradient top bar */}
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${leadScore}%`, background: 'linear-gradient(90deg, #2563EB, #06b6d4)' }}
                />
              </div>

              <div className="space-y-2">
                {scoreBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                    style={{ background: item.bgColor, borderColor: item.borderColor }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: item.color + '1A' }}
                    >
                      <item.Icon size={14} weight="regular" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-ink-800">{item.label}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: item.color }}>
                          +{item.pts} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 leading-snug">{item.description}</p>
                      {/* Proportional bar: bar width = pts / maxPts for this category */}
                      <div className="h-1 bg-white/60 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((item.pts / item.maxPts) * 100, 100)}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI Draft Message ── */}
          <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <SparkleIcon size={14} weight="regular" className="text-blue-500" />
                <h3 className="text-[12.5px] font-bold text-ink-800">AI Draft Message</h3>
              </div>
              <span className="text-[10.5px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                Ready to send
              </span>
            </div>

            {/* Recipient line */}
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span className="text-[10.5px] text-ink-400 font-medium">To:</span>
              <span className="text-[11.5px] font-semibold text-ink-700">{leadName}</span>
              <span className="text-ink-300">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                <PhoneIcon size={10} weight="regular" />
                {phone}
              </span>
            </div>

            {editMode ? (
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full text-[13px] text-ink-700 border border-blue-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-[13px] text-ink-700 bg-ink-50 rounded-lg p-3 leading-relaxed border border-ink-100">
                &ldquo;{draftText}&rdquo;
              </p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className="border border-ink-200 hover:border-blue-400 hover:text-blue-600 text-ink-600 text-[12px] font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {editMode ? 'Preview' : 'Edit'}
              </button>
              <button
                onClick={() => { setToast(`Text sent to ${leadName}!`); setEditMode(false) }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Send Now
              </button>
            </div>
          </div>

          {/* ── Context note (inline, not fixed overlay) ── */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 animate-fade-in text-[11.5px] text-amber-800" style={{ animationDelay: '0.2s' }}>
            <span className="text-amber-500 mt-0.5 shrink-0">ℹ</span>
            <p><strong>Before this:</strong> Lofty just showed &ldquo;92&rdquo; with no explanation. Now you see exactly why — and you can act in one tap.</p>
          </div>

        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
