'use client'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpIcon,
  NotePencilIcon,
  CalendarPlusIcon,
  ClockCounterClockwiseIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react'
import LoftyMark from './LoftyMark'
import { useElevenLabsVoice } from '../hooks/useElevenLabsVoice'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  "What's urgent today?",
  'Open Scott Hayes',
  'Status of Johnson closing?',
  'Take me to my briefing',
]

const FOLLOWUP_CHIPS = [
  { label: 'Draft follow-up', Icon: NotePencilIcon },
  { label: 'Schedule a call', Icon: CalendarPlusIcon },
  { label: 'See full activity', Icon: ClockCounterClockwiseIcon },
]

interface Source {
  kind: 'lead' | 'transaction' | 'plan' | 'listing'
  label: string
  detail: string
  match: RegExp
}

/** Known CRM entities Aria can reference in replies. */
const KNOWN_SOURCES: Source[] = [
  { kind: 'lead',        label: 'Scott Hayes',           detail: 'Buyer · Score 92 · Viewed 650 Maple 4×',         match: /\bscott|hayes\b/i },
  { kind: 'lead',        label: 'Maria Gonzalez',        detail: 'Buyer · Score 78 · Requested info on 1842 Camelback', match: /\bmaria|gonzalez\b/i },
  { kind: 'lead',        label: 'David Kim',             detail: 'Seller · Score 61 · Asked about comps',          match: /\bdavid kim\b/i },
  { kind: 'transaction', label: 'Johnson deal · $485K',  detail: '650 Elm · Closing in 72 hrs · Inspection open',  match: /\bjohnson\b/i },
  { kind: 'plan',        label: 'Bloom Companion',       detail: '28-day Smart Plan · Paused after 2 bounces',     match: /\bbloom\b/i },
  { kind: 'listing',     label: '650 Maple St',          detail: '4bd · $725K · 12 days on market · 94% match',    match: /\b650 maple\b/i },
  { kind: 'listing',     label: '1842 Camelback',        detail: 'Scottsdale · active showings this week',         match: /\bcamelback|1842\b/i },
]

function extractSources(content: string): Source[] {
  return KNOWN_SOURCES.filter((s) => s.match.test(content))
}

type NavTarget = 'after' | 'lead' | 'agents' | 'chat' | 'dashboard' | 'before'

interface Intent {
  target: NavTarget
  label: string
}

function detectIntent(text: string): Intent | null {
  const t = text.toLowerCase()
  if (/\b(scott|hayes|lead detail|open lead|lead page|view lead)\b/.test(t))
    return { target: 'lead', label: 'Scott Hayes' }
  if (/\b(briefing|morning|today'?s agenda|lofty ai home|go back)\b/.test(t))
    return { target: 'after', label: 'the morning briefing' }
  if (/\b(dashboard|crm|everything|full view|all widgets|old lofty)\b/.test(t))
    return { target: 'dashboard', label: 'the full dashboard' }
  if (/\b(ai agents?|show agents|social agent|sales agent|homeowner agent|workers|automat)\b/.test(t))
    return { target: 'agents', label: 'your AI Agents' }
  return null
}

function topicFromText(text: string): string {
  const t = text.toLowerCase()
  if (/scott|hayes|lead/.test(t)) return 'Scott Hayes strategy'
  if (/johnson|closing/.test(t)) return 'Johnson closing'
  if (/bloom|smart plan/.test(t)) return 'Bloom Smart Plan'
  return 'Today'
}

function splitReply(content: string): { lead: string; callout?: string; tail?: string } {
  const paras = content.split(/\n{2,}|\.\s{2,}/).map(s => s.trim()).filter(Boolean)
  if (paras.length >= 3) {
    return { lead: paras[0] + '.', callout: paras[1] + '.', tail: paras.slice(2).join(' ') }
  }
  if (paras.length === 2) {
    return { lead: paras[0] + '.', callout: paras[1] + '.' }
  }
  const sentences = content.split(/(?<=\.)\s+/).filter(Boolean)
  if (sentences.length >= 3) {
    return {
      lead: sentences[0],
      callout: sentences.slice(1, 2).join(' '),
      tail: sentences.slice(2).join(' '),
    }
  }
  return { lead: content }
}

interface AIAssistantProps {
  onNavigate?: (target: NavTarget) => void
  onOpenAddLead?: () => void
  onOpenSmartPlan?: () => void
  initialInput?: { text: string; nonce: number } | null
}

export default function AIAssistant({ onNavigate, onOpenAddLead, onOpenSmartPlan, initialInput }: AIAssistantProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [listening, setListening] = useState(false)
  const lastPrefillNonce = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const voiceOnRef = useRef(false)
  const recognitionRef = useRef<any>(null)
  const voice = useElevenLabsVoice()

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')

    const lower = trimmed.toLowerCase()
    if (onOpenAddLead && /\b(add|new|create|import)\b.*\b(lead|contact)\b|\blead\b.*\b(from|paste|note|email|referral)\b/.test(lower)) {
      setMessages([...newMessages, { role: 'assistant', content: 'Opening the Add Lead flow — paste anything and I\'ll extract the fields.' }])
      setTimeout(() => onOpenAddLead(), 700)
      return
    }
    if (onOpenSmartPlan && /\b(build|draft|create|new|start)\b.*\b(smart ?plan|plan|nurture|cadence|sequence|drip|campaign)\b/.test(lower)) {
      setMessages([...newMessages, { role: 'assistant', content: 'Opening the Smart Plan builder — describe the audience and I\'ll draft the cadence.' }])
      setTimeout(() => onOpenSmartPlan(), 700)
      return
    }

    const intent = onNavigate ? detectIntent(trimmed) : null
    if (intent) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Opening ${intent.label} for you now.` },
      ])
      setTimeout(() => onNavigate!(intent.target), 900)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const reply: string = data.message
      setMessages([...newMessages, { role: 'assistant', content: reply }])
      if (voiceOnRef.current) {
        voice.speak(reply)
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "I'm having trouble connecting — try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (recognitionRef.current) recognitionRef.current.abort()

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setListening(false)
      send(transcript)
    }

    recognition.start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!initialInput) return
    if (lastPrefillNonce.current === initialInput.nonce) return
    lastPrefillNonce.current = initialInput.nonce
    send(initialInput.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const hasConversation = messages.length > 0
  const lastUser = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'user') || null,
    [messages]
  )
  const topic = lastUser ? topicFromText(lastUser.content) : 'Today'

  const mode = useMemo(() => {
    if (!lastUser) return 'Ready'
    const t = lastUser.content.toLowerCase()
    if (/scott|hayes|lead/.test(t)) return 'Strategic advisor'
    if (/urgent|today|call|first/.test(t)) return 'Priority triage'
    if (/johnson|closing/.test(t)) return 'Transaction ops'
    return 'Assistant'
  }, [lastUser])

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#f7f9fb]">
      {/* Voice toggle — top right */}
      <div className="absolute top-4 right-5 z-20">
        <button
          onClick={() => {
            const next = !voiceOn
            voiceOnRef.current = next
            setVoiceOn(next)
            if (!next) voice.cancel()
          }}
          className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-pill text-[10.5px] font-semibold tracking-tight transition-all border backdrop-blur
                      ${voiceOn
                        ? 'bg-ink-900/90 text-white border-transparent'
                        : 'bg-white/80 text-ink-500 border-ink-200 hover:bg-white hover:text-ink-800'}`}
        >
          {voiceOn ? <MicrophoneIcon size={12} weight="regular" /> : <MicrophoneSlashIcon size={12} weight="regular" />}
          {voiceOn ? 'Voice on' : 'Voice off'}
        </button>
      </div>

      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-[440px] h-[440px] rounded-pill"
        style={{ background: '#2563eb', filter: 'blur(120px)', opacity: 0.08, zIndex: 0 }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-pill"
        style={{ background: '#67E8F9', filter: 'blur(130px)', opacity: 0.08, zIndex: 0 }}
      />

      {/* Scroll canvas */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto relative z-10">
        <div className="max-w-[720px] mx-auto w-full px-8 pt-14 pb-40">
          {!hasConversation ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center flex flex-col items-center"
            >
              <div className="mb-6">
                <LoftyMark size={56} halo pulse />
              </div>
              <div className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/70 mb-3">
                Lofty Copilot · Ready
              </div>
              <h1 className="font-headline font-bold italic text-[38px] md:text-[46px] tracking-tightest text-ink-900 leading-[1.05]">
                How can I help, Baylee?
              </h1>
              <p className="mt-4 text-[14px] text-ink-500 max-w-md">
                I know your leads, transactions, Smart Plans, and inbox. Ask a question — or tell me where to go.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-10">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="inline-flex items-center h-10 px-4 rounded-pill text-[12.5px] font-medium
                               text-ink-700 bg-white border border-ink-200
                               hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-16">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) =>
                  msg.role === 'user' ? (
                    <motion.div
                      key={`u-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex flex-col items-end"
                    >
                      <div className="max-w-[86%] text-right">
                        <span className="text-[10px] font-bold tracking-wider2 text-ink-300 uppercase mb-2 block">
                          {topicFromText(msg.content)}
                        </span>
                        <h2 className="font-headline font-bold italic text-[26px] md:text-[30px] tracking-tightest text-ink-900 leading-[1.15]">
                          {msg.content}
                        </h2>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`a-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                      className="flex flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-5">
                        <LoftyMark size={14} />
                        <span className="text-[10px] font-bold tracking-wider2 uppercase text-blue-600">
                          Lofty Copilot · Recommendation
                        </span>
                      </div>

                      <AssistantBody content={msg.content} />

                      {/* Grounding disclosure — what Aria read to compose this */}
                      <SourcesPanel sources={extractSources(msg.content)} onNavigate={onNavigate} />

                      {/* Action buttons below the last assistant message only */}
                      {i === messages.length - 1 && (
                        <div className="mt-8 flex flex-wrap gap-2.5">
                          {FOLLOWUP_CHIPS.map(({ label, Icon }) => (
                            <button
                              key={label}
                              onClick={() => send(label)}
                              className="inline-flex items-center gap-2 h-10 px-4 rounded-pill
                                         bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold
                                         hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
                            >
                              <Icon size={14} weight="regular" />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-ink-400"
                >
                  <span className="w-1.5 h-1.5 rounded-pill bg-blue-500 animate-pulse" />
                  <span className="text-[11.5px] font-medium tracking-tight">Thinking…</span>
                </motion.div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Floating bottom input bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, #f7f9fb 0%, #f7f9fb 60%, rgba(247,249,251,0.7) 85%, transparent 100%)',
        }}
      >
        <div className="max-w-[720px] mx-auto px-8 pb-7 pt-10 pointer-events-auto">
          <div className="relative">
            {/* Glow halo */}
            <div
              className="absolute inset-0 rounded-pill pointer-events-none"
              style={{ background: '#2563eb', filter: 'blur(42px)', opacity: 0.10 }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="relative flex items-center gap-1.5 h-14 pl-4 pr-2 rounded-pill bg-white border border-ink-200
                         shadow-[0_14px_40px_-16px_rgba(15,23,42,0.18)]
                         focus-within:border-blue-400 focus-within:shadow-[0_14px_40px_-10px_rgba(37,99,235,0.28)] transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? 'Listening…' : 'Ask Lofty AI for the next step…'}
                disabled={loading}
                autoFocus
                className="flex-1 bg-transparent text-[14px] text-ink-900 placeholder-ink-400 focus:outline-none ml-1"
              />
              {/* Mic button — prominent, always visible */}
              <button
                type="button"
                onClick={startListening}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all
                            ${listening
                              ? 'bg-red-500 text-white animate-pulse shadow-lg'
                              : voiceOn
                                ? 'bg-ink-900 text-white hover:bg-ink-700'
                                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
                aria-label="Speak"
              >
                <MicrophoneIcon size={17} weight={voiceOn ? 'fill' : 'regular'} />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 shrink-0 rounded-pill flex items-center justify-center transition-all
                           text-white disabled:opacity-35 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
                style={{
                  background: input.trim() ? 'linear-gradient(180deg, #2563EB, #1D4ED8)' : '#CBD5E1',
                  boxShadow: input.trim()
                    ? 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 20px -8px rgba(37,99,235,0.5)'
                    : 'none',
                }}
                aria-label="Send"
              >
                <ArrowUpIcon size={16} weight="bold" />
              </button>
            </form>

            {/* Meta */}
            <div className="mt-3 flex justify-center gap-6">
              <div className="text-[9.5px] uppercase tracking-wider2 font-semibold text-ink-300">
                Context <span className="text-ink-500 ml-1 tracking-tight normal-case">{topic}</span>
              </div>
              <div className="text-[9.5px] uppercase tracking-wider2 font-semibold text-ink-300">
                Mode <span className="text-ink-500 ml-1 tracking-tight normal-case">{mode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantBody({ content }: { content: string }) {
  const parts = useMemo(() => splitReply(content), [content])
  return (
    <div className="space-y-5 w-full">
      <p className="text-[17px] md:text-[18px] leading-[1.6] text-ink-700">
        {parts.lead}
      </p>

      {parts.callout && (
        <div
          className="rounded-2xl p-6 md:p-7"
          style={{
            background: '#eceef0',
            border: '1px solid rgba(195,198,215,0.45)',
          }}
        >
          <h3 className="font-headline font-bold italic text-[17px] tracking-tightest text-ink-900 mb-2">
            Strategic insight
          </h3>
          <p className="text-[14.5px] text-ink-700 leading-[1.65]">
            {parts.callout}
          </p>
        </div>
      )}

      {parts.tail && (
        <p className="text-[16px] md:text-[17px] leading-[1.6] text-ink-600">
          {parts.tail}
        </p>
      )}
    </div>
  )
}

function SourcesPanel({
  sources,
  onNavigate,
}: {
  sources: Source[]
  onNavigate?: (target: NavTarget) => void
}) {
  const [open, setOpen] = useState(false)
  if (sources.length === 0) return null

  const routeFor = (s: Source): NavTarget | null => {
    if (s.kind === 'lead') return 'lead'
    return null
  }

  return (
    <div className="mt-6 w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-wider2 uppercase text-ink-400 hover:text-blue-600 transition-colors"
      >
        <span className="inline-flex items-center gap-1.5">
          <LoftyMark size={11} />
          Grounded on {sources.length} thing{sources.length > 1 ? 's' : ''} from your CRM
        </span>
        <span
          className="inline-block transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <ArrowRightIcon size={10} weight="bold" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-1.5">
              {sources.map((s) => {
                const route = routeFor(s)
                const body = (
                  <>
                    <span className="shrink-0 inline-flex items-center px-1.5 h-4 rounded-sm text-[9px] font-bold tracking-wider2 uppercase"
                          style={{ background: kindBg(s.kind), color: kindFg(s.kind) }}>
                      {kindLabel(s.kind)}
                    </span>
                    <span className="text-[12.5px] font-semibold text-ink-800">{s.label}</span>
                    <span className="text-ink-300">·</span>
                    <span className="text-[11.5px] text-ink-500 truncate">{s.detail}</span>
                  </>
                )
                return route && onNavigate ? (
                  <button
                    key={s.label}
                    onClick={() => onNavigate(route)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-ink-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
                  >
                    {body}
                    <ArrowRightIcon size={11} weight="bold" className="ml-auto text-ink-300" />
                  </button>
                ) : (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-ink-200"
                  >
                    {body}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function kindLabel(k: Source['kind']) {
  return k === 'lead' ? 'Lead' : k === 'transaction' ? 'Deal' : k === 'plan' ? 'Plan' : 'Listing'
}
function kindBg(k: Source['kind']) {
  return k === 'lead' ? 'rgba(239,68,68,0.08)' : k === 'transaction' ? 'rgba(245,158,11,0.08)' : k === 'plan' ? 'rgba(37,99,235,0.08)' : 'rgba(22,163,74,0.08)'
}
function kindFg(k: Source['kind']) {
  return k === 'lead' ? '#b91c1c' : k === 'transaction' ? '#b45309' : k === 'plan' ? '#1d4ed8' : '#15803d'
}
