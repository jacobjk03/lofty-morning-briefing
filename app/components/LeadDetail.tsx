'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  HouseIcon,
  EnvelopeIcon,
  ArrowsClockwiseIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SpeakerHighIcon,
  SparkleIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  MapPinIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'
import Toast from './Toast'
import { useVoice } from '../hooks/useVoice'

interface LeadDetailProps {
  onBack: () => void
}

const SCORE_CATEGORIES = [
  {
    Icon: HouseIcon,
    label: 'Listing Activity',
    maxPts: 38,
    keywords: /view|saved|listing|maple|camelback|desert|property/i,
  },
  {
    Icon: EnvelopeIcon,
    label: 'Email Engagement',
    maxPts: 30,
    keywords: /email|opened|click|respond/i,
  },
  {
    Icon: ArrowsClockwiseIcon,
    label: 'Return Visit',
    maxPts: 22,
    keywords: /return|back|site|absence|revisit/i,
  },
  {
    Icon: ShieldCheckIcon,
    label: 'Contact Quality',
    maxPts: 10,
    keywords: /phone|verif|contact|call|valid|schedule|showing|request/i,
  },
]

type Breakdown = {
  Icon: typeof HouseIcon
  label: string
  pts: number
  description: string
  maxPts: number
}

function buildBreakdown(score: number, activity: string[]): Breakdown[] {
  const matched = SCORE_CATEGORIES
    .map(cat => ({ ...cat, desc: activity.find(a => cat.keywords.test(a)) || '' }))
    .filter(m => m.desc)
  if (matched.length === 0) {
    return [{
      Icon: HouseIcon,
      label: 'Overall Activity',
      pts: score,
      description: activity[0] || 'Recent activity',
      maxPts: 100,
    }]
  }
  const totalWeight = matched.reduce((s, m) => s + m.maxPts, 0)
  let remaining = score
  return matched.map((m, i) => {
    const pts = i === matched.length - 1 ? remaining : Math.round((m.maxPts / totalWeight) * score)
    remaining -= pts
    return { Icon: m.Icon, label: m.label, pts, description: m.desc, maxPts: m.maxPts }
  })
}

const DEFAULT_BREAKDOWN: Breakdown[] = [
  { Icon: HouseIcon,           label: 'Listing Activity', pts: 45, maxPts: 38, description: 'Viewed 650 Maple St 4 times today, saved it' },
  { Icon: EnvelopeIcon,        label: 'Email Engagement', pts: 22, maxPts: 30, description: 'Opened last 2 emails within 10 minutes' },
  { Icon: ArrowsClockwiseIcon, label: 'Return Visit',     pts: 15, maxPts: 22, description: 'Back on site today after 6-day absence' },
  { Icon: ShieldCheckIcon,     label: 'Contact Quality',  pts: 10, maxPts: 10, description: 'Valid phone, verified email' },
]

export default function LeadDetail({ onBack }: LeadDetailProps) {
  const [leadName, setLeadName] = useState('Scott Hayes')
  const [leadScore, setLeadScore] = useState(92)
  const [neighborhood, setNeighborhood] = useState('Phoenix, AZ')
  const [breakdown, setBreakdown] = useState<Breakdown[]>(DEFAULT_BREAKDOWN)
  const [draft, setDraft] = useState(
    "Hey Scott! I noticed you've been looking at 650 Maple four times this morning — it's a strong match for what you described. Want to hold a private showing this week before it moves?"
  )
  const [editMode, setEditMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const voice = useVoice()

  useEffect(() => {
    fetch('/api/leads/1')
      .then(r => r.json())
      .then((data: any) => {
        if (!data) return
        setLeadName(data.name || 'Scott Hayes')
        setLeadScore(data.score ?? 92)
        setNeighborhood(data.neighborhood || 'Phoenix, AZ')
        setBreakdown(buildBreakdown(data.score ?? 92, data.activity || []))
        const first = (data.name || 'Scott').split(' ')[0]
        const top = (data.activity?.[0] || '650 Maple').toLowerCase()
        setDraft(
          `Hey ${first}! I noticed you've been back on ${top} — it's a strong match for what you described. Want to hold a private showing this week before it moves?`
        )
      })
      .catch(() => {})
    return () => {
      voice.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initials = useMemo(
    () => leadName.split(' ').map(n => n[0]).join('').slice(0, 2),
    [leadName]
  )
  const firstName = leadName.split(' ')[0]

  const playReasoning = () => {
    if (playing) { voice.cancel(); setPlaying(false); return }
    const script = `${firstName}'s intent score is ${leadScore}. Strongest signal: ${breakdown[0]?.description}. Supporting: ${breakdown[1]?.description}. Net read — ready to act on today.`
    if (voice.supported) {
      setPlaying(true)
      voice.speak(script, { onEnd: () => setPlaying(false) })
    } else {
      setToast('Reasoning playback not supported in this browser.')
    }
  }

  const sendDraft = () => {
    setToast(`Message sent to ${leadName}`)
    setEditMode(false)
    setTimeout(() => onBack(), 1400)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-[#f7f9fb]">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-[460px] h-[460px] rounded-pill"
        style={{ background: '#2563eb', filter: 'blur(130px)', opacity: 0.08, zIndex: 0 }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 w-[360px] h-[360px] rounded-pill"
        style={{ background: '#67E8F9', filter: 'blur(130px)', opacity: 0.08, zIndex: 0 }}
      />

      {/* Breadcrumb */}
      <div className="relative z-10 shrink-0 bg-white/75 backdrop-blur border-b border-ink-200/70 px-6 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon size={13} weight="bold" />
          Back to briefing
        </button>
        <span className="text-ink-200">·</span>
        <span className="text-[11px] text-ink-400 font-medium">
          Leads <span className="text-ink-300">/</span> <span className="text-ink-700">Detail view</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1040px] mx-auto px-8 pt-10 pb-16">
          {/* ─── Hero ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-10"
          >
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-pill flex items-center justify-center text-white font-headline font-bold text-[34px] shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8 60%, #0B1220)',
                  boxShadow: '0 18px 48px -16px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-1.5">
                  Hot lead · Buyer
                </div>
                <h1 className="font-headline font-bold italic text-[46px] md:text-[52px] tracking-tightest text-ink-900 leading-[1.02]">
                  {leadName}
                </h1>
                <p className="text-[13px] text-ink-500 mt-2 flex items-center gap-1.5">
                  <MapPinIcon size={13} weight="regular" />
                  {neighborhood} · Active today
                </p>

                {/* Primary quick actions — always visible */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { Icon: PhoneIcon,           label: 'Call',            msg: `Calling ${firstName}…`,             primary: true },
                    { Icon: EnvelopeIcon,        label: 'Message',         msg: `Composing new message to ${firstName}…` },
                    { Icon: ArrowsClockwiseIcon, label: 'Sync CRM',        msg: 'Syncing activity to Lofty CRM…' },
                    { Icon: CheckCircleIcon,     label: 'Mark contacted',  msg: `${firstName} marked as contacted today.` },
                  ].map(({ Icon, label, msg, primary }) => (
                    <button
                      key={label}
                      onClick={() => setToast(msg)}
                      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill text-[12px] font-semibold tracking-tight transition-all active:scale-[0.98]
                        ${primary
                          ? 'text-white shadow-sm'
                          : 'bg-white border border-ink-200 text-ink-700 hover:border-blue-400 hover:text-blue-700 shadow-sm'}`}
                      style={primary ? {
                        background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 16px -6px rgba(37,99,235,0.45)',
                      } : undefined}
                    >
                      <Icon size={13} weight={primary ? 'fill' : 'regular'} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right md:pb-2 shrink-0">
              <div
                className="font-headline font-bold italic leading-none tracking-tightest inline-block"
                style={{
                  fontSize: 84,
                  paddingRight: 14,
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {leadScore}
              </div>
              <div className="text-[10px] font-semibold tracking-wider2 text-blue-600/80 uppercase mt-1">
                Intent score · of 100
              </div>
            </div>
          </motion.div>

          {/* ─── 7/5 Grid ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Score breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <div
                className="bg-white rounded-[18px] p-7"
                style={{
                  border: '1px solid rgba(15,23,42,0.06)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 12px 32px -16px rgba(15,23,42,0.10)',
                }}
              >
                <div className="flex justify-between items-center mb-7">
                  <h2 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                    Score breakdown
                  </h2>
                  <button
                    onClick={playReasoning}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-pill text-[11.5px] font-semibold tracking-tight transition-all
                      ${playing
                        ? 'bg-ink-900 text-white'
                        : 'bg-ink-50 text-ink-700 border border-ink-200 hover:bg-ink-100 hover:text-ink-900'}`}
                  >
                    <SpeakerHighIcon size={12} weight={playing ? 'fill' : 'regular'} />
                    {playing ? 'Playing…' : 'Play reasoning'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {breakdown.map((row) => (
                    <div
                      key={row.label}
                      className="group flex items-center justify-between p-4 rounded-xl bg-[#f7f9fb] hover:bg-ink-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-white text-blue-600 transition-transform group-hover:scale-[1.06]"
                          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 12px -6px rgba(15,23,42,0.12)' }}
                        >
                          <row.Icon size={17} weight="regular" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink-900 leading-tight">{row.label}</p>
                          <p className="text-[11.5px] text-ink-500 mt-0.5 leading-tight line-clamp-1">
                            {row.description}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center px-2.5 h-6 rounded-pill text-[11px] font-bold tabular-nums"
                            style={{ background: '#EEF4FF', color: '#2563EB' }}>
                        +{row.pts} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pull quote */}
                <div
                  className="mt-8 p-5 rounded-xl"
                  style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)' }}
                >
                  <p className="font-headline italic text-[15px] text-ink-700 leading-relaxed tracking-tight">
                    &ldquo;Previously, Lofty showed a number. Now you see why — and act.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: AI draft */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex flex-col"
            >
              <div
                className="bg-white rounded-[18px] p-7 flex flex-col h-full"
                style={{
                  border: '1px solid rgba(15,23,42,0.06)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 12px 32px -16px rgba(15,23,42,0.10)',
                }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-7 h-7 rounded-pill flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)',
                      boxShadow: '0 6px 18px -6px rgba(37,99,235,0.45)',
                    }}
                  >
                    <SparkleIcon size={12} weight="fill" className="text-white" />
                  </div>
                  <h2 className="font-headline font-bold italic text-[18px] tracking-tightest text-ink-900">
                    AI draft message
                  </h2>
                </div>

                {/* Recipient */}
                <div className="mb-3 text-[11.5px] text-ink-500">
                  <span className="text-ink-400 mr-2">To</span>
                  <span className="font-semibold text-ink-800">{leadName}</span>
                  <span className="text-ink-300 mx-2">·</span>
                  <span>SMS · iMessage fallback</span>
                </div>

                {/* Draft box */}
                <div
                  className="rounded-xl p-5 flex-1 mb-5"
                  style={{ background: '#f7f9fb', border: '1px solid rgba(195,198,215,0.3)' }}
                >
                  {editMode ? (
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={5}
                      autoFocus
                      className="w-full text-[14px] text-ink-800 leading-[1.6] bg-transparent resize-none focus:outline-none"
                    />
                  ) : (
                    <p className="text-[14px] text-ink-800 leading-[1.6]">{draft}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                  <button
                    onClick={sendDraft}
                    className="w-full h-12 rounded-xl inline-flex items-center justify-center gap-2 text-white text-[13.5px] font-semibold tracking-tight transition-transform active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 12px 28px -10px rgba(37,99,235,0.55)',
                    }}
                  >
                    <PaperPlaneTiltIcon size={14} weight="fill" />
                    Send now
                  </button>
                  <button
                    onClick={() => setEditMode(v => !v)}
                    className="w-full h-11 rounded-xl inline-flex items-center justify-center gap-2 bg-ink-50 border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100 hover:border-ink-300 transition-all"
                  >
                    <PencilSimpleIcon size={13} weight="regular" />
                    {editMode ? 'Preview' : 'Edit message'}
                  </button>
                </div>

                {/* Footnote */}
                <div className="mt-6 pt-5 border-t border-ink-100 flex items-center justify-between text-[11px]">
                  <span className="text-ink-400">Recommended via</span>
                  <span className="text-blue-600 font-semibold">Lofty Lead Analysis</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Editorial grid ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7 items-center"
          >
            <div className="md:col-span-1">
              <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-3">
                Insight summary
              </div>
              <h3 className="font-headline font-bold italic text-[30px] md:text-[34px] tracking-tightest text-ink-900 leading-[1.05] mb-4">
                High probability to transact within 30 days.
              </h3>
              <p className="text-[13px] text-ink-600 leading-relaxed">
                Pattern matches top-decile buyers from the last two years. Four return visits in 10 hours,
                saved listing, email re-engagement — classic pre-offer signature.
              </p>
            </div>

            <div className="md:col-span-2">
              <div
                className="relative overflow-hidden rounded-2xl h-56 md:h-64"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #0ea5e9 100%)',
                  boxShadow: '0 24px 48px -20px rgba(30,58,138,0.45)',
                }}
              >
                {/* Decorative shapes */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-20 -right-10 w-[280px] h-[280px] rounded-pill" style={{ background: 'rgba(103,232,249,0.2)', filter: 'blur(40px)' }} />
                  <div className="absolute -bottom-24 left-1/3 w-[240px] h-[240px] rounded-pill" style={{ background: 'rgba(37,99,235,0.35)', filter: 'blur(50px)' }} />
                </div>

                <div className="relative h-full flex flex-col justify-between p-7 text-white">
                  <div className="flex items-center gap-2 text-[10px] tracking-wider2 uppercase font-semibold text-white/70">
                    <span className="w-1.5 h-1.5 rounded-pill bg-cyan-300" />
                    Market match
                  </div>
                  <div>
                    <p className="text-[11.5px] text-white/70 mb-2">
                      Best-fit listing based on viewing pattern
                    </p>
                    <h4 className="font-headline font-bold italic text-[28px] tracking-tightest leading-[1.1]">
                      650 Maple St · 94.2% match
                    </h4>
                    <div className="flex items-center gap-3 mt-4 text-[11.5px] text-white/80">
                      <span>4 bd · 3 ba · $725K</span>
                      <span className="w-1 h-1 rounded-pill bg-white/40" />
                      <span>12 days on market</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setToast('Opening 650 Maple St listing…')}
                    className="absolute top-5 right-5 inline-flex items-center gap-1.5 h-8 px-3 rounded-pill bg-white/12 hover:bg-white/20 border border-white/20 text-[11px] font-semibold backdrop-blur transition-all"
                  >
                    View listing
                    <ArrowUpRightIcon size={11} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
