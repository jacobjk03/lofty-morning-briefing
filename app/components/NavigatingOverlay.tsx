'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import LoftyMark from './LoftyMark'

export interface NavigatingPayload {
  label: string        // "Lead Detail · Scott Hayes"
  rationale?: string   // "High-priority lead · score 92"
}

interface NavigatingOverlayProps {
  payload: NavigatingPayload
  onDone: () => void
  durationMs?: number
}

/**
 * Plays for ~1.2s while the AI navigates. Visible proof that a navigation
 * agent just took action. Keeps the current page underneath visible through
 * a translucent dim so the destination transition feels continuous.
 */
export default function NavigatingOverlay({ payload, onDone, durationMs = 1200 }: NavigatingOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs)
    return () => clearTimeout(t)
  }, [onDone, durationMs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: 'rgba(247, 249, 251, 0.78)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 max-w-md text-center px-8"
      >
        <LoftyMark size={44} halo pulse />
        <div>
          <div className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80 mb-1.5">
            Lofty Copilot · navigating
          </div>
          <div className="font-headline font-bold italic text-[26px] md:text-[30px] tracking-tightest text-ink-900 leading-[1.1]">
            Opening {payload.label}
          </div>
          {payload.rationale && (
            <div className="text-[12.5px] text-ink-500 mt-2 font-medium">
              {payload.rationale}
            </div>
          )}
        </div>
        {/* Progress dash */}
        <div className="mt-1 w-40 h-[3px] rounded-pill bg-ink-100 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
            className="h-full rounded-pill"
            style={{ background: 'linear-gradient(90deg, #67E8F9, #2563EB)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
