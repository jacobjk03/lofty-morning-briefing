'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoftyMark from './LoftyMark'

interface TransitionIntroProps {
  onDone: () => void
}

const BEFORE_POINTS = [
  '36 pages',
  '8 unread notifications',
  '47% setup complete',
  '12 dashboard widgets',
  '"Where do I start?"',
]

const AFTER_POINTS = [
  'One briefing',
  'Three moves',
  'Zero searching',
]

/**
 * Plays once on first load. localStorage-gated.
 * Beat 1: before points fade in (2.2s)
 * Beat 2: tagline (1.6s)
 * Beat 3: after points resolve + CTA (1.4s, then auto-dismiss)
 */
export default function TransitionIntro({ onDone }: TransitionIntroProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2200)
    const t2 = setTimeout(() => setStage(2), 3800)
    const t3 = setTimeout(() => onDone(), 5600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#f7f9fb] overflow-hidden"
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-pill"
           style={{ background: '#2563eb', filter: 'blur(140px)', opacity: 0.10 }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-pill"
           style={{ background: '#67E8F9', filter: 'blur(140px)', opacity: 0.10 }} />

      {/* Skip — prominent pill so it never traps the viewer */}
      <button
        onClick={onDone}
        className="absolute top-5 right-6 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-pill bg-white/90 backdrop-blur border border-ink-200 text-[11px] text-ink-700 font-semibold hover:text-ink-900 hover:border-ink-300 transition-all shadow-sm"
      >
        Skip intro
        <span className="text-ink-400">→</span>
      </button>

      <div className="relative z-10 max-w-2xl w-full px-8 text-center">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="before"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-5">
                Baylee's Monday morning · before
              </div>
              <h1 className="font-headline font-bold italic text-[38px] md:text-[48px] tracking-tightest text-ink-900 leading-[1.05]">
                Too many places<br />to look first.
              </h1>
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {BEFORE_POINTS.map((p, i) => (
                  <motion.span
                    key={p}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                    className="inline-flex items-center h-8 px-3.5 rounded-pill bg-white border border-ink-200 text-[11.5px] text-ink-500 font-medium"
                  >
                    {p}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <LoftyMark size={64} halo pulse />
              <h1 className="mt-7 font-headline font-bold italic text-[38px] md:text-[52px] tracking-tightest text-ink-900 leading-[1.02] max-w-xl">
                What if Lofty was simpler than a conversation?
              </h1>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80 mb-5">
                <LoftyMark size={12} />
                Baylee's Monday morning · with Lofty Copilot
              </div>
              <h1 className="font-headline font-bold italic text-[38px] md:text-[52px] tracking-tightest text-ink-900 leading-[1.02]">
                One briefing.<br />Three moves.<br />Zero searching.
              </h1>
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {AFTER_POINTS.map((p, i) => (
                  <motion.span
                    key={p}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center h-9 px-4 rounded-pill text-white text-[12px] font-semibold tracking-tight"
                    style={{
                      background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 18px -6px rgba(37,99,235,0.4)',
                    }}
                  >
                    {p}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-10 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 rounded-pill transition-all duration-500"
            style={{
              width: stage === i ? 24 : 6,
              background: stage >= i ? '#2563EB' : '#CBD5E1',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
