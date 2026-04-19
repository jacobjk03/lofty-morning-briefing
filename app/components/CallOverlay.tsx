'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneSlashIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  GridNineIcon,
  UserPlusIcon,
  PhoneIcon,
  WaveformIcon,
} from '@phosphor-icons/react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'

interface TranscriptLine {
  speaker: 'agent' | 'user'
  text: string
  time: number
}

interface CallOverlayProps {
  name: string
  phone?: string
  initials: string
  leadId?: string
  onEnd: (durationSecs: number) => void
}

export default function CallOverlay(props: CallOverlayProps) {
  const transcriptRef = useRef<TranscriptLine[]>([])
  const elapsedRef = useRef(0)

  return (
    <ConversationProvider
      onMessage={(msg: { source: string; message: string }) => {
        console.log('[CallOverlay] onMessage:', msg.source, JSON.stringify(msg.message).slice(0, 120))
        if (msg.message?.trim()) {
          transcriptRef.current.push({
            speaker: msg.source === 'ai' ? 'agent' : 'user',
            text: msg.message.trim(),
            time: elapsedRef.current,
          })
        }
      }}
      onError={(message: string, context?: unknown) => {
        console.error('[CallOverlay] ElevenLabs onError:', message, context)
      }}
      onConnect={({ conversationId }: { conversationId: string }) => {
        console.log('[CallOverlay] Connected. conversationId=', conversationId)
      }}
      onDisconnect={(details: unknown) => {
        console.warn('[CallOverlay] Disconnected:', details)
      }}
    >
      <CallOverlayInner {...props} transcriptRef={transcriptRef} elapsedRef={elapsedRef} />
    </ConversationProvider>
  )
}

type CallPhase = 'ringing' | 'connecting' | 'connected'

interface InnerProps extends CallOverlayProps {
  transcriptRef: React.MutableRefObject<TranscriptLine[]>
  elapsedRef: React.MutableRefObject<number>
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

function CallOverlayInner({ name, phone = '+1 (602) 555-0142', initials, leadId, onEnd, transcriptRef, elapsedRef }: InnerProps) {
  const conversation = useConversation()

  const [phase, setPhase] = useState<CallPhase>('ringing')
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [keypadInput, setKeypadInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [pointer, setPointer] = useState<string>('')
  const briefingRef = useRef<{
    firstMessage?: string
    systemPrompt?: string
    dynamicVariables?: Record<string, string>
    pointer?: string
  }>({})

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const endingRef = useRef(false)

  // ── Start call timer once connected ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'connected') return
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1
        elapsedRef.current = next
        return next
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, elapsedRef])

  // ── Sync mute to ElevenLabs ───────────────────────────────────────────────
  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setMuted(muted)
    }
  }, [muted, conversation])

  // ── Speaker volume ────────────────────────────────────────────────────────
  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setVolume({ volume: speakerOn ? 1 : 0.15 })
    }
  }, [speakerOn, conversation])

  // ── Pre-fetch Lofty briefing while phone is ringing ─────────────────────
  useEffect(() => {
    if (!leadId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/lead-pointer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        briefingRef.current = data
        if (data.pointer) setPointer(data.pointer)
      } catch (e) {
        console.warn('[CallOverlay] Failed to fetch lead pointer:', e)
      }
    })()
    return () => { cancelled = true }
  }, [leadId])

  // ── Answer button — THIS is the user gesture that unlocks audio ──────────
  const handleAnswer = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
    if (!agentId) {
      setErrorMsg('Agent ID not configured')
      setPhase('connected')
      return
    }
    setPhase('connecting')
    const briefing = briefingRef.current

    try {
      await conversation.startSession({
        agentId,
        connectionType: 'websocket',
        ...(briefing.dynamicVariables ? { dynamicVariables: briefing.dynamicVariables } : {}),
        ...(briefing.systemPrompt || briefing.firstMessage
          ? {
              overrides: {
                agent: {
                  ...(briefing.systemPrompt ? { prompt: { prompt: briefing.systemPrompt } } : {}),
                  ...(briefing.firstMessage ? { firstMessage: briefing.firstMessage } : {}),
                },
              },
            }
          : {}),
      })
      setPhase('connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[CallOverlay] startSession error:', msg, err)
      setErrorMsg(`Live AI error: ${msg.slice(0, 80)}`)
      setPhase('connected')
    }
  }, [conversation, leadId])

  // ── End call ─────────────────────────────────────────────────────────────
  const handleEnd = useCallback(async () => {
    if (endingRef.current) return
    endingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    if (conversation.status === 'connected') {
      try { await conversation.endSession() } catch { /* ignore */ }
    }
    const mins = Math.floor(elapsed / 60)
    const secs = elapsed % 60
    const durationLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    // Log to InsForge — fire-and-forget
    fetch('/api/log-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadName: name,
        leadId: leadId ?? null,
        durationSeconds: elapsed,
        notes: `Call duration: ${durationLabel}`,
        transcript: transcriptRef.current,
      }),
    }).catch(e => console.warn('[CallOverlay] Failed to log call:', e))

    onEnd(elapsed)
  }, [conversation, elapsed, leadId, name, onEnd, transcriptRef])

  const agentSpeaking = conversation.isSpeaking ?? false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[340px] rounded-[32px] overflow-hidden flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg, #0f1e3a 0%, #0b1220 60%, #061018 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
          paddingBottom: 36,
        }}
      >
        {/* Status pill */}
        <div className="mt-8 mb-6">
          {phase === 'ringing' && (
            <div className="inline-flex items-center gap-2 px-4 h-7 rounded-full bg-white/8 border border-white/10 text-[11px] font-semibold text-white/60 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Incoming call…
            </div>
          )}
          {phase === 'connecting' && (
            <div className="inline-flex items-center gap-2 px-4 h-7 rounded-full bg-blue-500/15 border border-blue-400/25 text-[11px] font-semibold text-blue-300 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Connecting…
            </div>
          )}
          {phase === 'connected' && (
            <div className="inline-flex items-center gap-2 px-4 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-[11px] font-semibold text-emerald-300 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active call · {formatTime(elapsed)}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative mb-5">
          <motion.div
            animate={
              phase === 'ringing'
                ? { boxShadow: ['0 0 0 0px rgba(251,191,36,0.4)', '0 0 0 22px rgba(251,191,36,0)', '0 0 0 0px rgba(251,191,36,0.4)'] }
                : phase === 'connected' && agentSpeaking
                ? { boxShadow: ['0 0 0 0px rgba(34,197,94,0.5)', '0 0 0 22px rgba(34,197,94,0)', '0 0 0 0px rgba(34,197,94,0.5)'] }
                : phase === 'connected'
                ? { boxShadow: ['0 0 0 0px rgba(34,197,94,0.2)', '0 0 0 10px rgba(34,197,94,0)', '0 0 0 0px rgba(34,197,94,0.2)'] }
                : {}
            }
            transition={{ duration: phase === 'ringing' ? 1.4 : agentSpeaking ? 1.0 : 2.5, repeat: Infinity, ease: 'easeOut' }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-[34px]"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8 60%, #0B1220)',
              boxShadow: phase === 'connected'
                ? '0 0 0 3px rgba(34,197,94,0.5), 0 18px 48px -16px rgba(37,99,235,0.5)'
                : '0 18px 48px -16px rgba(37,99,235,0.4)',
            }}
          >
            {initials}
          </motion.div>
          {phase === 'connected' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0b1220] flex items-center justify-center"
            >
              <PhoneIcon size={12} weight="fill" className="text-white" />
            </motion.div>
          )}
        </div>

        {/* Name + number */}
        <h2 className="text-white font-semibold text-[22px] tracking-tighter mb-1">{name}</h2>
        <p className="text-white/40 text-[13px] font-medium mb-2">{phone}</p>

        {/* Lofty pointer — the one-liner brief Scott was handed before the call */}
        <AnimatePresence>
          {pointer && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mx-6 mb-3 px-3 py-2 rounded-2xl border border-blue-400/20 bg-blue-500/10"
            >
              <p className="text-[9.5px] font-bold tracking-widest uppercase text-blue-300/80 mb-1">
                Lofty pointer
              </p>
              <p className="text-[12px] leading-snug text-white/80 font-medium">
                {pointer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speaking / listening indicator */}
        <AnimatePresence mode="wait">
          {phase === 'connected' && agentSpeaking && (
            <motion.div key="speaking"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20"
            >
              <WaveformIcon size={13} className="text-emerald-400" weight="bold" />
              <span className="text-[11px] font-medium text-emerald-300">Speaking…</span>
            </motion.div>
          )}
          {phase === 'connected' && !agentSpeaking && (
            <motion.div key="listening"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/8"
            >
              <MicrophoneIcon size={13} className="text-white/50" weight="regular" />
              <span className="text-[11px] font-medium text-white/40">
                {muted ? 'You are muted' : 'Listening…'}
              </span>
            </motion.div>
          )}
          {(phase === 'ringing' || phase === 'connecting') && (
            <motion.div key="idle" className="mb-4 h-[30px]" />
          )}
        </AnimatePresence>

        {/* Error badge */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-3 text-[10px] text-amber-400/70 font-medium px-4 text-center"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <AnimatePresence>
          {keypadOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="w-full px-8 mb-6 overflow-hidden"
            >
              <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
                <p className="text-center text-white/60 font-mono text-[16px] tracking-widest mb-3 min-h-[24px]">
                  {keypadInput || <span className="opacity-30">···</span>}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {KEYPAD.map(k => (
                    <button key={k} onClick={() => setKeypadInput(v => v + k)}
                      className="h-11 rounded-xl bg-white/8 hover:bg-white/15 text-white font-semibold text-[16px] transition-colors active:scale-95"
                    >{k}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RINGING: Answer / Decline buttons ───────────────────────────── */}
        <AnimatePresence>
          {phase === 'ringing' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-10 mb-4"
            >
              {/* Decline */}
              <div className="flex flex-col items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEnd(0)}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 12px 32px -8px rgba(239,68,68,0.5)',
                  }}
                >
                  <PhoneSlashIcon size={24} weight="fill" className="text-white" />
                </motion.button>
                <span className="text-[11px] text-white/30 font-medium">Decline</span>
              </div>

              {/* Answer — this click IS the user gesture for audio */}
              <div className="flex flex-col items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  onClick={handleAnswer}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 12px 32px -8px rgba(34,197,94,0.6)',
                  }}
                >
                  <PhoneIcon size={24} weight="fill" className="text-white" />
                </motion.button>
                <span className="text-[11px] text-white/30 font-medium">Answer</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONNECTED: controls + end call ──────────────────────────────── */}
        <AnimatePresence>
          {phase === 'connected' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-5 mb-8">
                <ControlButton label={muted ? 'Unmute' : 'Mute'} active={muted}
                  onClick={() => setMuted(v => !v)}
                  icon={muted ? <MicrophoneSlashIcon size={20} weight="fill" /> : <MicrophoneIcon size={20} weight="regular" />}
                />
                <ControlButton label={speakerOn ? 'Speaker on' : 'Speaker'} active={speakerOn}
                  onClick={() => setSpeakerOn(v => !v)}
                  icon={speakerOn ? <SpeakerHighIcon size={20} weight="fill" /> : <SpeakerSlashIcon size={20} weight="regular" />}
                />
                <ControlButton label="Keypad" active={keypadOpen}
                  onClick={() => setKeypadOpen(v => !v)}
                  icon={<GridNineIcon size={20} weight="regular" />}
                />
                <ControlButton label="Add" active={false} onClick={() => {}} disabled
                  icon={<UserPlusIcon size={20} weight="regular" />}
                />
              </div>

              <motion.button whileTap={{ scale: 0.93 }} onClick={handleEnd}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 12px 32px -8px rgba(239,68,68,0.6)',
                }}
                aria-label="End call"
              >
                <PhoneSlashIcon size={24} weight="fill" className="text-white" />
              </motion.button>
              <p className="text-white/25 text-[11px] mt-3 font-medium">End call</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connecting spinner */}
        <AnimatePresence>
          {phase === 'connecting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 mb-8"
            >
              <div className="w-8 h-8 rounded-full border-2 border-blue-400/40 border-t-blue-400 animate-spin" />
              <span className="text-[11px] text-white/30 font-medium">Connecting to Scott…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function ControlButton({ label, icon, active, onClick, disabled = false }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1.5 disabled:opacity-30">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}
        style={{
          background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
          border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
        }}
      >
        {icon}
      </div>
      <span className="text-[10px] text-white/40 font-medium">{label}</span>
    </button>
  )
}
