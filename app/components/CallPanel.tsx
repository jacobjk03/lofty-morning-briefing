'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneSlashIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  PhoneIcon,
  WaveformIcon,
  XIcon,
  SparkleIcon,
} from '@phosphor-icons/react'
import { ConversationProvider, useConversation } from '@elevenlabs/react'
import LoftyMark from './LoftyMark'
import { byoFetch } from '@/lib/byok-client'

interface TranscriptLine {
  speaker: 'agent' | 'user'
  text: string
  time: number
}

interface CallPanelProps {
  name: string
  phone?: string
  initials: string
  leadId?: string
  onEnd: (durationSecs: number) => void
}

export default function CallPanel(props: CallPanelProps) {
  const transcriptRef = useRef<TranscriptLine[]>([])
  const elapsedRef = useRef(0)
  // Trigger re-renders of the inner panel when transcript grows
  const [transcriptTick, setTranscriptTick] = useState(0)

  return (
    <ConversationProvider
      onMessage={(msg: { source: string; message: string }) => {
        console.log('[CallPanel] onMessage:', msg.source, JSON.stringify(msg.message).slice(0, 120))
        const text = msg.message?.trim() || ''
        if (!text) return
        // Suppress the silent "Hi" nudge we inject to make the agent speak first.
        if (msg.source !== 'ai' && text.toLowerCase() === 'hi') return
        transcriptRef.current.push({
          speaker: msg.source === 'ai' ? 'agent' : 'user',
          text,
          time: elapsedRef.current,
        })
        setTranscriptTick(t => t + 1)
      }}
      onError={(message: string, context?: unknown) => {
        console.error('[CallPanel] ElevenLabs onError:', message, context)
        window.dispatchEvent(new CustomEvent('lofty-call-status', { detail: { kind: 'error', message } }))
      }}
      onConnect={({ conversationId }: { conversationId: string }) => {
        console.log('[CallPanel] Connected. conversationId=', conversationId)
        window.dispatchEvent(new CustomEvent('lofty-call-status', { detail: { kind: 'connect' } }))
      }}
      onDisconnect={(details: unknown) => {
        console.warn('[CallPanel] Disconnected:', details)
        const reason = (() => {
          try {
            if (typeof details === 'string') return details
            const d = details as { reason?: string; context?: { reason?: string } }
            return d?.reason || d?.context?.reason || JSON.stringify(details).slice(0, 140)
          } catch { return 'unknown' }
        })()
        window.dispatchEvent(new CustomEvent('lofty-call-status', { detail: { kind: 'disconnect', message: reason } }))
      }}
      onStatusChange={(prop: { status: string }) => {
        console.log('[CallPanel] status →', prop?.status)
        window.dispatchEvent(new CustomEvent('lofty-call-status', { detail: { kind: 'status', message: prop?.status } }))
      }}
    >
      <CallPanelInner
        {...props}
        transcriptRef={transcriptRef}
        elapsedRef={elapsedRef}
        transcriptTick={transcriptTick}
      />
    </ConversationProvider>
  )
}

type CallPhase = 'ringing' | 'connecting' | 'connected' | 'summary'

interface CallSummary {
  summary: string
  sentiment: string
  nextStep: string
  topics: string[]
}

interface InnerProps extends CallPanelProps {
  transcriptRef: React.MutableRefObject<TranscriptLine[]>
  elapsedRef: React.MutableRefObject<number>
  transcriptTick: number
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function CallPanelInner({
  name,
  phone = '+1 (602) 555-0142',
  initials,
  leadId,
  onEnd,
  transcriptRef,
  elapsedRef,
  transcriptTick,
}: InnerProps) {
  const conversation = useConversation()

  const [phase, setPhase] = useState<CallPhase>('ringing')
  const [mode, setMode] = useState<'live' | 'ai-agent' | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [liveStatus, setLiveStatus] = useState<string>('pick a mode')
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [pointer, setPointer] = useState('')
  const [talkingPoints, setTalkingPoints] = useState<string[]>([])
  const [pointsLoading, setPointsLoading] = useState(false)
  const [summary, setSummary] = useState<CallSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [finalDuration, setFinalDuration] = useState(0)

  const briefingRef = useRef<{
    firstMessage?: string
    systemPrompt?: string
    dynamicVariables?: Record<string, string>
    pointer?: string
  }>({})
  const lastPointsAtRef = useRef(0)
  const lastPointsTurnsRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const endingRef = useRef(false)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)

  // Fetch the Lofty briefing once a mode is chosen. We do NOT start the
  // session here — startSession must be called inside a click handler to
  // preserve the browser's user-gesture (audio autoplay unlock).
  useEffect(() => {
    if (!leadId || !mode) return
    let cancelled = false
    setLiveStatus('ringing')
    ;(async () => {
      try {
        const res = await byoFetch('/api/lead-pointer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, mode }),
        })
        if (cancelled) return
        if (res.status === 429) {
          // byoFetch already dispatched the global quota event — the modal is popping.
          const data = await res.json().catch(() => ({}))
          setErrorMsg(data.message || 'Demo limit reached. Unlock with demo password or your own keys.')
          return
        }
        if (!res.ok) return
        const data = await res.json()
        briefingRef.current = data
        if (data.pointer) setPointer(data.pointer)
      } catch (e) {
        console.warn('[CallPanel] Failed to fetch lead pointer:', e)
      }
    })()
    return () => { cancelled = true }
  }, [leadId, mode])

  // Answer button — direct click = user gesture, audio unlocked.
  const handleAnswer = useCallback(async () => {
    // If the briefing fetch hit the quota cap, don't even try to start —
    // the live call would go through and burn credits. Show the BYO-key copy.
    if (errorMsg && errorMsg.toLowerCase().includes('demo limit')) {
      return
    }
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
      })
      setPhase('connected')

      // Inject the role-play briefing via contextual update (non-turn, so the
      // agent absorbs the persona without being treated as user speech).
      if (briefing.systemPrompt) {
        try {
          conversation.sendContextualUpdate?.(briefing.systemPrompt)
          console.log('[CallPanel] Role injected via contextual update')
        } catch (e) { console.warn('[CallPanel] context update failed:', e) }
      }

      // Tell the agent it just picked up — prompts the "Hello?" greeting.
      // Reinforce that the caller is Baylee (never Alex or anything else).
      setTimeout(() => {
        try {
          conversation.sendContextualUpdate?.(
            'You just picked up the phone. The person calling you is Baylee Rhoades, your real-estate agent. Greet her naturally now — short, like "Hello?" or "Hey Baylee". DO NOT call her Alex or any other name.'
          )
        } catch { /* ignore */ }
      }, 400)

      // Fallback: if the agent is still silent at 2.5s, force a response.
      setTimeout(() => {
        if (transcriptRef.current.length === 0) {
          try {
            console.log('[CallPanel] Fallback nudge — sendUserMessage')
            conversation.sendUserMessage?.('Hi')
          } catch (e) { console.warn('[CallPanel] nudge failed:', e) }
        }
      }, 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[CallPanel] startSession error:', msg, err)
      setErrorMsg(`Live AI error: ${msg.slice(0, 120)}`)
      setPhase('connected')
    }
  }, [conversation, transcriptRef])

  // Mirror SDK status to the UI without treating every onError as fatal —
  // the SDK fires onError for recoverable things (brief mic glitches, retries).
  // Only a real onDisconnect after a connect ends the call visually.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: string; message?: string }
      if (!detail) return
      if (detail.kind === 'connect') setLiveStatus('live')
      else if (detail.kind === 'status' && detail.message) setLiveStatus(detail.message)
      // onError / onDisconnect go to console only. We trust conversation.status
      // for the actual call state.
    }
    window.addEventListener('lofty-call-status', handler)
    return () => window.removeEventListener('lofty-call-status', handler)
  }, [])

  // Sync phase to the SDK's actual status — so if startSession's promise
  // settles before our local setPhase runs (or onConnect beats it), the UI
  // still flips to 'connected'. Also: if the SDK disconnects while we still
  // think we're 'connected', auto-progress to the summary screen.
  useEffect(() => {
    if (conversation.status === 'connected' && phase === 'connecting') {
      setPhase('connected')
    }
    if (conversation.status === 'disconnected' && phase === 'connected' && !endingRef.current) {
      console.log('[CallPanel] SDK disconnected unexpectedly — progressing to summary')
      handleEnd()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.status, phase])

  // Call timer
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

  // Mute sync — wrap in try/catch because the SDK briefly reports
  // status='connected' after the underlying session has been torn down.
  useEffect(() => {
    if (conversation.status !== 'connected') return
    try { conversation.setMuted(muted) } catch (e) { console.warn('[CallPanel] setMuted ignored:', e) }
  }, [muted, conversation])

  // Volume sync
  useEffect(() => {
    if (conversation.status !== 'connected') return
    try { conversation.setVolume({ volume: speakerOn ? 1 : 0.15 }) } catch (e) { console.warn('[CallPanel] setVolume ignored:', e) }
  }, [speakerOn, conversation])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight
    }
  }, [transcriptTick])

  // Live talking points — fast refresh: fire on every new turn, with a
  // minimum 3s floor between calls so Groq has time to respond.
  useEffect(() => {
    if (phase !== 'connected') return
    const turns = transcriptRef.current.length
    const now = Date.now()
    const enoughNewTurns = turns - lastPointsTurnsRef.current >= 1
    const enoughTime = now - lastPointsAtRef.current >= 3000
    const firstTime = lastPointsAtRef.current === 0
    if (!firstTime && (!enoughNewTurns || !enoughTime)) return
    if (firstTime && turns < 1) return // wait for at least the agent's first message

    lastPointsAtRef.current = now
    lastPointsTurnsRef.current = turns
    setPointsLoading(true)

    const payload = {
      leadId,
      transcript: transcriptRef.current.slice(-8),
    }
    byoFetch('/api/live-pointers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.talkingPoints)) setTalkingPoints(data.talkingPoints)
      })
      .catch(e => console.warn('[CallPanel] live-pointers error:', e))
      .finally(() => setPointsLoading(false))
  }, [phase, transcriptTick, leadId, transcriptRef])

  // End call → close SDK session, then fetch Groq summary and show the
  // post-call summary screen. The parent onEnd fires when user taps Save.
  const handleEnd = useCallback(async () => {
    // If we're already past the call (summary shown), just close.
    if (phase === 'summary') { onEnd(elapsed); return }
    if (endingRef.current) return
    endingRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    // Try to close the SDK session regardless of reported status —
    // ElevenLabs sometimes reports 'connected' after the session is dead
    // (or vice versa). endSession() is a no-op if already torn down.
    try { await conversation.endSession() } catch { /* already closed */ }
    // Ringing/connecting cancel → just close straight away, no summary.
    if (phase === 'ringing' || phase === 'connecting') {
      onEnd(0)
      return
    }
    setFinalDuration(elapsed)
    setPhase('summary')
    setSummaryLoading(true)
    try {
      const res = await byoFetch('/api/call-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: name,
          transcript: transcriptRef.current,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch (e) {
      console.warn('[CallPanel] summary fetch failed:', e)
    } finally {
      setSummaryLoading(false)
    }
  }, [conversation, elapsed, name, onEnd, phase, transcriptRef])

  // Save & close — logs the call (with summary notes) to InsForge, then dismisses.
  const handleSaveAndClose = useCallback(() => {
    const mins = Math.floor(finalDuration / 60)
    const secs = finalDuration % 60
    const durationLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    const notes = summary
      ? `${summary.summary}\n\nNext step: ${summary.nextStep}\nSentiment: ${summary.sentiment}\nDuration: ${durationLabel}`
      : `Call duration: ${durationLabel}`
    fetch('/api/log-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadName: name,
        leadId: leadId ?? null,
        durationSeconds: finalDuration,
        notes,
        transcript: transcriptRef.current,
      }),
    }).catch(e => console.warn('[CallPanel] Failed to log call:', e))
    onEnd(finalDuration)
  }, [finalDuration, leadId, name, onEnd, summary, transcriptRef])

  const agentSpeaking = conversation.isSpeaking ?? false
  const transcript = transcriptRef.current

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-[420px] shrink-0 flex flex-col h-full bg-white border-l border-ink-200/70 relative"
      style={{ boxShadow: '-20px 0 40px -30px rgba(15,23,42,0.12)' }}
    >
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-ink-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LoftyMark size={20} />
          <div>
            <p className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400">Lofty Call · {liveStatus}</p>
            <p className="text-[13px] font-semibold text-ink-900 leading-tight">
              {phase === 'ringing' && 'Incoming call'}
              {phase === 'connecting' && 'Connecting…'}
              {phase === 'connected' && `Live · ${formatTime(elapsed)}`}
              {phase === 'summary' && 'Call ended'}
            </p>
          </div>
        </div>
        <button
          onClick={handleEnd}
          className="w-7 h-7 rounded-pill flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
          aria-label="Close call"
        >
          <XIcon size={14} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Caller card */}
        <div className="flex items-center gap-3.5">
          <motion.div
            animate={
              phase === 'connecting'
                ? { boxShadow: ['0 0 0 0px rgba(59,130,246,0.4)', '0 0 0 14px rgba(59,130,246,0)', '0 0 0 0px rgba(59,130,246,0.4)'] }
                : phase === 'connected' && agentSpeaking
                ? { boxShadow: ['0 0 0 0px rgba(34,197,94,0.45)', '0 0 0 14px rgba(34,197,94,0)', '0 0 0 0px rgba(34,197,94,0.45)'] }
                : {}
            }
            transition={{ duration: phase === 'connecting' ? 1.4 : 1.1, repeat: Infinity, ease: 'easeOut' }}
            className="w-14 h-14 rounded-pill shrink-0 flex items-center justify-center text-white font-bold text-[18px]"
            style={{
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8 60%, #0B1220)',
              boxShadow: '0 10px 24px -10px rgba(37,99,235,0.45)',
            }}
          >
            {initials}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink-900 tracking-tight truncate">{name}</p>
            <p className="text-[11.5px] text-ink-500 font-medium">{phone}</p>
            {phase === 'connected' && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-pill bg-emerald-500" />
                {agentSpeaking ? 'Speaking' : muted ? 'You are muted' : 'Listening'}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-2 rounded-xl border border-amber-300/60 bg-amber-50 text-[11.5px] text-amber-800 font-medium"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lofty pointer */}
        {pointer && (
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <SparkleIcon size={12} weight="fill" className="text-blue-600" />
              <p className="text-[10px] font-bold tracking-widest uppercase text-blue-700">
                Lofty opening pointer
              </p>
            </div>
            <p className="text-[13px] leading-snug text-ink-900 font-medium">
              {pointer}
            </p>
          </div>
        )}

        {/* Live talking points */}
        <div className="rounded-2xl border border-ink-200/70 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <WaveformIcon size={12} weight="bold" className="text-blue-600" />
              <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500">
                Live talking points
              </p>
            </div>
            {pointsLoading && (
              <span className="text-[9.5px] font-semibold text-blue-500 animate-pulse">Thinking…</span>
            )}
          </div>
          {talkingPoints.length === 0 ? (
            <p className="text-[12px] text-ink-400 italic">
              {phase === 'connected'
                ? 'Listening for the first turns to generate pointers…'
                : 'Pointers will appear once the call is live.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {talkingPoints.map((pt, i) => (
                <motion.li
                  key={`${i}-${pt.slice(0, 12)}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-2 text-[12.5px] leading-snug text-ink-800"
                >
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-pill bg-blue-500 shrink-0" />
                  <span>{pt}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Live transcript */}
        {phase === 'connected' && transcript.length > 0 && (
          <div className="rounded-2xl border border-ink-200/70 bg-ink-50/60 p-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2 px-1">
              Live transcript
            </p>
            <div
              ref={transcriptScrollRef}
              className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1"
            >
              {transcript.slice(-12).map((line, i) => (
                <div
                  key={`${line.time}-${i}`}
                  className={`text-[11.5px] leading-snug ${line.speaker === 'agent' ? 'text-blue-700' : 'text-ink-800'}`}
                >
                  <span className="font-semibold">
                    {line.speaker === 'agent' ? name.split(' ')[0] : 'You'}:
                  </span>{' '}
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post-call summary screen */}
        {phase === 'summary' && (
          <div className="space-y-3">
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-emerald-50 border border-emerald-200 mb-2">
                <span className="w-1.5 h-1.5 rounded-pill bg-emerald-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700">Call ended</span>
              </div>
              <p className="text-[13px] font-semibold text-ink-900">
                {Math.floor(finalDuration / 60)}m {finalDuration % 60}s with {name.split(' ')[0]}
              </p>
            </div>

            {summaryLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-ink-500">
                <div className="w-4 h-4 rounded-pill border-2 border-blue-400/40 border-t-blue-600 animate-spin" />
                Lofty is writing the recap…
              </div>
            )}

            {!summaryLoading && summary && (
              <>
                <div className="rounded-2xl border border-ink-200/70 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500">Recap</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-pill ${
                        summary.sentiment === 'hot' ? 'bg-red-50 text-red-600' :
                        summary.sentiment === 'warm' ? 'bg-amber-50 text-amber-700' :
                        summary.sentiment === 'cool' ? 'bg-sky-50 text-sky-700' :
                        'bg-ink-100 text-ink-600'
                      }`}
                    >
                      {summary.sentiment}
                    </span>
                  </div>
                  <p className="text-[13px] leading-snug text-ink-800">{summary.summary}</p>
                </div>

                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-blue-700 mb-1.5">Next step</p>
                  <p className="text-[13px] leading-snug text-ink-900 font-medium">{summary.nextStep}</p>
                </div>

                {summary.topics.length > 0 && (
                  <div className="rounded-2xl border border-ink-200/70 bg-ink-50/60 p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-2">Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.topics.map((t, i) => (
                        <span key={i} className="inline-flex items-center h-6 px-2.5 rounded-pill bg-white border border-ink-200 text-[11px] text-ink-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sticky control dock */}
      <div className="shrink-0 border-t border-ink-100/80 bg-white px-5 py-4">
        {phase === 'ringing' && mode === null && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-ink-400 text-center mb-1">
              How do you want to run this call?
            </p>
            <button
              onClick={() => setMode('live')}
              className="w-full flex items-start gap-3 p-3 rounded-2xl border border-ink-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-pill bg-blue-100 flex items-center justify-center shrink-0">
                <PhoneIcon size={14} weight="fill" className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink-900 leading-tight">You call, Lofty coaches you</p>
                <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">
                  You talk to {name.split(' ')[0]}. Live pointers + talking points appear here.
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode('ai-agent')}
              className="w-full flex items-start gap-3 p-3 rounded-2xl border border-ink-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-pill bg-blue-100 flex items-center justify-center shrink-0">
                <SparkleIcon size={14} weight="fill" className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink-900 leading-tight">Let Lofty call for you</p>
                <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">
                  AI Baylee dials {name.split(' ')[0]}. You listen in and step in anytime.
                </p>
              </div>
            </button>
          </div>
        )}

        {phase === 'ringing' && mode !== null && (
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onEnd(0)}
                className="w-12 h-12 rounded-pill flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 20px -8px rgba(239,68,68,0.5)',
                }}
              >
                <PhoneSlashIcon size={18} weight="fill" />
              </motion.button>
              <span className="text-[10px] text-ink-500 font-semibold">Cancel</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                onClick={handleAnswer}
                className="w-12 h-12 rounded-pill flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 22px -8px rgba(34,197,94,0.6)',
                }}
              >
                <PhoneIcon size={18} weight="fill" />
              </motion.button>
              <span className="text-[10px] text-ink-500 font-semibold">
                {mode === 'ai-agent' ? 'Place call' : 'Answer'}
              </span>
            </div>
          </div>
        )}

        {phase === 'connecting' && (
          <div className="flex items-center justify-center gap-2 text-[12px] text-ink-500">
            <div className="w-4 h-4 rounded-pill border-2 border-blue-400/40 border-t-blue-600 animate-spin" />
            Connecting to {name.split(' ')[0]}…
          </div>
        )}

        {phase === 'connected' && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DockButton
                active={muted}
                onClick={() => setMuted(v => !v)}
                icon={muted ? <MicrophoneSlashIcon size={15} weight="fill" /> : <MicrophoneIcon size={15} />}
                label={muted ? 'Unmute' : 'Mute'}
              />
              <DockButton
                active={speakerOn}
                onClick={() => setSpeakerOn(v => !v)}
                icon={speakerOn ? <SpeakerHighIcon size={15} weight="fill" /> : <SpeakerSlashIcon size={15} />}
                label={speakerOn ? 'Speaker' : 'Muted out'}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleEnd}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill text-white text-[12px] font-semibold"
              style={{
                background: 'linear-gradient(180deg, #ef4444, #dc2626)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 24px -10px rgba(239,68,68,0.5)',
              }}
            >
              <PhoneSlashIcon size={13} weight="fill" />
              End call
            </motion.button>
          </div>
        )}

        {phase === 'summary' && (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onEnd(finalDuration)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-pill border border-ink-200 bg-white text-ink-700 text-[12px] font-semibold hover:border-ink-300 transition-all"
            >
              Discard
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSaveAndClose}
              disabled={summaryLoading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-pill text-white text-[12px] font-semibold disabled:opacity-50"
              style={{
                background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.5)',
              }}
            >
              {summaryLoading ? 'Saving…' : 'Save to CRM'}
            </motion.button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

function DockButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-pill border transition-all ${
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:border-ink-300'
      }`}
    >
      {icon}
      <span className="text-[11px] font-semibold tracking-tight">{label}</span>
    </button>
  )
}
