'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  FlameIcon,
  SparkleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatCircleIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from '@phosphor-icons/react'
import Orb, { OrbState } from './Orb'
import { useVoice } from '../hooks/useVoice'

interface LeadsAiViewProps {
  onBack: () => void
  onOpenLead: (id: string) => void
}

type Temperature = 'hot' | 'warm' | 'cold'

interface Lead {
  id: string
  name: string
  score: number
  temperature: Temperature
  initials: string
  city: string
  role: 'Buyer' | 'Seller'
  reasoning: string
  lastActivity: string
  contactAction: 'text' | 'call' | 'email'
}

const LEADS: Lead[] = [
  {
    id: 'scott-hayes',
    name: 'Scott Hayes',
    score: 92,
    temperature: 'hot',
    initials: 'SH',
    city: 'Phoenix, AZ',
    role: 'Buyer',
    reasoning: 'Viewed 650 Maple four times since 7 AM. Back on site after 6-day absence.',
    lastActivity: 'active now',
    contactAction: 'text',
  },
  {
    id: 'maria-gonzalez',
    name: 'Maria Gonzalez',
    score: 84,
    temperature: 'hot',
    initials: 'MG',
    city: 'Scottsdale, AZ',
    role: 'Buyer',
    reasoning: 'Saved 3 new listings yesterday. Opened your market report this morning.',
    lastActivity: '14m ago',
    contactAction: 'call',
  },
  {
    id: 'wade-warren',
    name: 'Wade Warren',
    score: 78,
    temperature: 'hot',
    initials: 'WW',
    city: 'Tempe, AZ',
    role: 'Seller',
    reasoning: 'Requested a CMA last week. Has 62% equity on a $720K home — likely seller.',
    lastActivity: '2h ago',
    contactAction: 'email',
  },
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    score: 61,
    temperature: 'warm',
    initials: 'SM',
    city: 'Chandler, AZ',
    role: 'Buyer',
    reasoning: 'Responded to last week\'s drip. Hasn\'t engaged in 4 days — needs nudging.',
    lastActivity: '4d ago',
    contactAction: 'text',
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    score: 58,
    temperature: 'warm',
    initials: 'DK',
    city: 'Mesa, AZ',
    role: 'Buyer',
    reasoning: 'New lead from Zillow. Hasn\'t been contacted yet — 3-minute response window closes at 5 PM.',
    lastActivity: 'new',
    contactAction: 'call',
  },
  {
    id: 'amy-chen',
    name: 'Amy Chen',
    score: 44,
    temperature: 'cold',
    initials: 'AC',
    city: 'Gilbert, AZ',
    role: 'Seller',
    reasoning: 'Quiet for 3 weeks. Smart Plan already re-engaging — no action needed today.',
    lastActivity: '21d ago',
    contactAction: 'email',
  },
]

const NARRATION =
  "Here are your 24 active leads. Three are hot right now — Scott Hayes at 92, Maria Gonzalez at 84, and Wade Warren at 78. I've drafted opening messages for each. Two more are warm and need a nudge today. The rest are already being nurtured by Smart Plans — you don't need to do anything."

const TEMPERATURE_STYLES: Record<Temperature, { label: string; dot: string; accent: string }> = {
  hot: { label: 'HOT', dot: '#22D3EE', accent: 'text-cyan-300' },
  warm: { label: 'WARM', dot: '#A78BFA', accent: 'text-violet-300' },
  cold: { label: 'NURTURING', dot: '#64748B', accent: 'text-ink-400' },
}

const CONTACT_ICON = { text: ChatCircleIcon, call: PhoneIcon, email: EnvelopeIcon }

export default function LeadsAiView({ onBack, onOpenLead }: LeadsAiViewProps) {
  const [filter, setFilter] = useState<'all' | Temperature>('all')
  const [revealedChars, setRevealedChars] = useState(0)
  const [orbState, setOrbState] = useState<OrbState>('thinking')
  const voice = useVoice()

  useEffect(() => {
    setOrbState('thinking')
    const startTimer = setTimeout(() => {
      setOrbState('speaking')
      let i = 0
      const id = setInterval(() => {
        i += 3
        setRevealedChars(Math.min(i, NARRATION.length))
        if (i >= NARRATION.length) {
          clearInterval(id)
          setOrbState('done')
        }
      }, 55)
      return () => clearInterval(id)
    }, 800)
    return () => clearTimeout(startTimer)
  }, [])

  const filteredLeads = useMemo(
    () => (filter === 'all' ? LEADS : LEADS.filter((l) => l.temperature === filter)),
    [filter]
  )

  const counts = useMemo(() => {
    return {
      all: LEADS.length,
      hot: LEADS.filter((l) => l.temperature === 'hot').length,
      warm: LEADS.filter((l) => l.temperature === 'warm').length,
      cold: LEADS.filter((l) => l.temperature === 'cold').length,
    }
  }, [])

  return (
    <div className="canvas-dark canvas-grid flex flex-col h-full relative">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10.5px] font-semibold tracking-tight
                       bg-transparent text-white/60 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-all"
          >
            <ArrowLeftIcon size={12} weight="bold" />
            Back
          </button>
          <span className="inline-flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-pill bg-cyan-300" />
            <span className="text-[10px] font-semibold tracking-wider2 text-white/80">LOFTY AI</span>
          </span>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-[11px] text-white/40 font-medium">Your leads</span>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'hot', 'warm', 'cold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[10.5px] font-semibold tracking-tight transition-all
                ${filter === f
                  ? 'bg-white/[0.08] text-white border border-white/[0.14]'
                  : 'bg-transparent text-white/40 border border-white/[0.06] hover:bg-white/[0.04] hover:text-white/70'}`}
            >
              <span className="capitalize">{f === 'cold' ? 'Nurturing' : f}</span>
              <span className="tabular-nums text-white/40">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Narrative hero */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">
          {/* Orb + narration */}
          <div className="flex items-start gap-5 mb-8">
            <div className="shrink-0 -mt-2">
              <Orb state={orbState} size={72} />
            </div>
            <div className="flex-1 min-w-0 pt-6">
              <p className="text-[12px] text-white/40 font-medium tracking-tight mb-2">
                Lofty AI · Briefing
              </p>
              <p className="text-[17px] leading-[1.55] text-white/90 font-medium tracking-tight">
                <span>{NARRATION.slice(0, revealedChars)}</span>
                <span className="text-white/25">{NARRATION.slice(revealedChars)}</span>
                {orbState === 'speaking' && <span className="caret bg-white/80" />}
              </p>
            </div>
          </div>

          {/* Lead list */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-semibold tracking-wider2 text-white/40 uppercase">
              Ranked by score
            </h2>
            <span className="text-[11px] text-white/30 tabular-nums">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border border-white/[0.06]">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead, idx) => {
                const temp = TEMPERATURE_STYLES[lead.temperature]
                const ContactIcon = CONTACT_ICON[lead.contactAction]
                return (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-center gap-4 px-5 py-4 bg-white/[0.015] hover:bg-white/[0.04]
                               border-b border-white/[0.05] last:border-b-0 transition-colors cursor-pointer"
                    onClick={() => onOpenLead(lead.id)}
                  >
                    {/* Avatar */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-pill flex items-center justify-center text-[12px] font-semibold tracking-tight text-white/80"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(37,99,235,0.15))',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {lead.initials}
                    </div>

                    {/* Name / meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-white tracking-tight">
                          {lead.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider2 uppercase">
                          <span
                            className="w-1 h-1 rounded-pill"
                            style={{ background: temp.dot, boxShadow: `0 0 8px ${temp.dot}` }}
                          />
                          <span className={temp.accent}>{temp.label}</span>
                        </span>
                        {lead.temperature === 'hot' && (
                          <FlameIcon size={12} weight="fill" className="text-cyan-300/70" />
                        )}
                      </div>
                      <p className="text-[11.5px] text-white/45 mt-0.5">
                        {lead.role} · {lead.city} · {lead.lastActivity}
                      </p>
                      <p className="text-[12.5px] text-white/65 mt-1.5 leading-snug">
                        {lead.reasoning}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right w-14">
                      <p className={`text-[22px] font-semibold tabular-nums tracking-tightest ${temp.accent}`}>
                        {lead.score}
                      </p>
                      <p className="text-[9px] text-white/30 font-semibold tracking-wider2 uppercase">
                        Score
                      </p>
                    </div>

                    {/* Quick action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // in a real app this would execute via Aria
                      }}
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md
                                 bg-white/[0.04] border border-white/[0.08]
                                 hover:bg-white/[0.08] hover:border-white/[0.18] transition-all"
                      title={`AI will ${lead.contactAction}`}
                    >
                      <ContactIcon size={14} weight="regular" className="text-white/70" />
                    </button>

                    <ArrowUpRightIcon size={14} weight="regular" className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Footer: Aria offer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: orbState === 'done' ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center gap-3 px-5 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
          >
            <SparkleIcon size={16} weight="regular" className="text-cyan-300/70 shrink-0" />
            <p className="text-[12.5px] text-white/60 flex-1">
              Want me to call the top three in order? I'll brief you before each and take notes during.
            </p>
            <button
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11.5px] font-semibold tracking-tight
                         bg-cyan-300 text-[#0B1220] hover:brightness-110 transition-all"
              style={{ boxShadow: '0 4px 12px -4px rgba(34,211,238,0.55)' }}
            >
              Start call queue
              <ArrowRightIcon size={12} weight="bold" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
