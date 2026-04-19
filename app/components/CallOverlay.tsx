'use client'
import { useEffect, useRef, useState } from 'react'
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
} from '@phosphor-icons/react'

interface CallOverlayProps {
  name: string
  phone?: string
  initials: string
  onEnd: (durationSecs: number) => void
}

type CallPhase = 'dialing' | 'connected'

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function CallOverlay({ name, phone = '+1 (602) 555-0142', initials, onEnd }: CallOverlayProps) {
  const [phase, setPhase] = useState<CallPhase>('dialing')
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(false)
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [keypadInput, setKeypadInput] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-connect after 1.8s
  useEffect(() => {
    const t = setTimeout(() => setPhase('connected'), 1800)
    return () => clearTimeout(t)
  }, [])

  // Live call timer
  useEffect(() => {
    if (phase !== 'connected') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    onEnd(elapsed)
  }

  const KEYPAD = ['1','2','3','4','5','6','7','8','9','*','0','#']

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
        {/* Top status pill */}
        <div className="mt-8 mb-6">
          {phase === 'dialing' ? (
            <div className="inline-flex items-center gap-2 px-4 h-7 rounded-pill bg-white/8 border border-white/10 text-[11px] font-semibold text-white/60 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-pill bg-amber-400 animate-pulse" />
              Dialing…
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 h-7 rounded-pill bg-emerald-500/15 border border-emerald-400/25 text-[11px] font-semibold text-emerald-300 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-pill bg-emerald-400" />
              Active call · {formatTime(elapsed)}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative mb-5">
          <motion.div
            animate={phase === 'connected' ? { boxShadow: ['0 0 0 0px rgba(34,197,94,0.3)', '0 0 0 18px rgba(34,197,94,0)', '0 0 0 0px rgba(34,197,94,0)'] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="w-24 h-24 rounded-pill flex items-center justify-center text-white font-headline font-bold text-[34px]"
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
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-pill bg-emerald-500 border-2 border-[#0b1220] flex items-center justify-center"
            >
              <PhoneIcon size={12} weight="fill" className="text-white" />
            </motion.div>
          )}
        </div>

        {/* Name + number */}
        <h2 className="text-white font-semibold text-[22px] tracking-tighter mb-1">{name}</h2>
        <p className="text-white/40 text-[13px] font-medium mb-8">{phone}</p>

        {/* Keypad (conditionally shown) */}
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
                    <button
                      key={k}
                      onClick={() => setKeypadInput(v => v + k)}
                      className="h-11 rounded-xl bg-white/8 hover:bg-white/15 text-white font-semibold text-[16px] transition-colors active:scale-95"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control buttons */}
        <div className="flex items-center gap-5 mb-8">
          <ControlButton
            label={muted ? 'Unmute' : 'Mute'}
            active={muted}
            onClick={() => setMuted(v => !v)}
            icon={muted
              ? <MicrophoneSlashIcon size={20} weight="fill" />
              : <MicrophoneIcon size={20} weight="regular" />}
          />
          <ControlButton
            label={speakerOn ? 'Speaker on' : 'Speaker'}
            active={speakerOn}
            onClick={() => setSpeakerOn(v => !v)}
            icon={speakerOn
              ? <SpeakerHighIcon size={20} weight="fill" />
              : <SpeakerSlashIcon size={20} weight="regular" />}
          />
          <ControlButton
            label="Keypad"
            active={keypadOpen}
            onClick={() => setKeypadOpen(v => !v)}
            icon={<GridNineIcon size={20} weight="regular" />}
          />
          <ControlButton
            label="Add"
            active={false}
            onClick={() => {}}
            icon={<UserPlusIcon size={20} weight="regular" />}
            disabled
          />
        </div>

        {/* End call */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleEnd}
          className="w-16 h-16 rounded-pill flex items-center justify-center transition-all"
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
    </motion.div>
  )
}

function ControlButton({
  label,
  icon,
  active,
  onClick,
  disabled = false,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 disabled:opacity-30"
    >
      <div
        className={`w-14 h-14 rounded-pill flex items-center justify-center transition-all ${
          active ? 'text-white' : 'text-white/70 hover:text-white'
        }`}
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
