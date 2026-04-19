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

const STAGES = 4 as const

/**
 * Four-beat story:
 *   0. Acknowledge Lofty is powerful → pivot to the pain
 *   1. "Too many places to look first" with chip list
 *   2. "What if Lofty was simpler than a conversation?" with LoftyMark
 *   3. "One briefing. Three moves. Zero searching."
 *
 * Plays on first load (localStorage-gated via parent) and every time the
 * user crosses Before → After. Skippable at any time.
 */
export default function TransitionIntro({ onDone }: TransitionIntroProps) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0)

  const advance = () => {
    if (stage < STAGES - 1) setStage((s) => (s + 1) as 0 | 1 | 2 | 3)
    else onDone()
  }

  // Keyboard control: arrow keys / space / enter advance, Esc skips.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        advance()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setStage((s) => Math.max(0, s - 1) as 0 | 1 | 2 | 3)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onDone()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  const isLast = stage === STAGES - 1

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={advance}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#f7f9fb] overflow-hidden cursor-pointer select-none"
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-pill"
           style={{ background: '#2563eb', filter: 'blur(140px)', opacity: 0.10 }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-pill"
           style={{ background: '#67E8F9', filter: 'blur(140px)', opacity: 0.10 }} />

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); onDone() }}
        className="absolute top-5 right-6 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-pill bg-white/90 backdrop-blur border border-ink-200 text-[11px] text-ink-700 font-semibold hover:text-ink-900 hover:border-ink-300 transition-all shadow-sm z-20"
      >
        Skip intro
        <span className="text-ink-400">→</span>
      </button>

      {/* Paradox-stage clutter chips — pinned to top & bottom of the viewport
          (NOT the stage content box) so they never overlap the headline. */}
      {stage === 0 && (
        <>
          <div className="pointer-events-none absolute top-16 left-0 right-0 z-0 flex flex-wrap justify-center gap-2 px-6 opacity-35">
            {['36 pages', '12 widgets', '8 alerts'].map((p) => (
              <span key={p}
                className="inline-flex items-center h-7 px-3 rounded-pill bg-white border border-ink-200 text-[10px] text-ink-400 font-medium">
                {p}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-24 left-0 right-0 z-0 flex flex-wrap justify-center gap-2 px-6 opacity-35">
            {['Smart Plans', 'Hot Sheets', 'Pipelines'].map((p) => (
              <span key={p}
                className="inline-flex items-center h-7 px-3 rounded-pill bg-white border border-ink-200 text-[10px] text-ink-400 font-medium">
                {p}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="relative z-10 max-w-3xl w-full px-8 text-center">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="acknowledge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[10px] font-semibold tracking-wider2 uppercase text-ink-400 mb-5">
                The paradox
              </div>
              <h1 className="font-headline font-bold italic text-[38px] md:text-[52px] tracking-tightest text-ink-900 leading-[1.02]">
                Lofty has every feature<br />a real estate agent could want.
              </h1>
              <p className="mt-6 text-[18px] md:text-[20px] text-ink-500 font-medium max-w-xl mx-auto">
                So why does Monday morning still start with <span className="text-ink-900 italic">"where do I even begin?"</span>
              </p>
            </motion.div>
          )}

          {stage === 1 && (
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

          {stage === 2 && (
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

          {stage === 3 && (
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

      {/* Bottom controls — progress dots + tap-to-continue hint + next button */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-10">
        <div className="flex gap-1.5">
          {Array.from({ length: STAGES }).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setStage(i as 0 | 1 | 2 | 3) }}
              className="h-1.5 rounded-pill transition-all duration-500 cursor-pointer"
              style={{
                width: stage === i ? 28 : 6,
                background: stage >= i ? '#2563EB' : '#CBD5E1',
              }}
              aria-label={`Go to beat ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-ink-400 font-medium tracking-tight">
            Tap anywhere or press → to continue
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); advance() }}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-pill text-[12px] font-semibold tracking-tight text-white transition-all active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 20px -8px rgba(37,99,235,0.5)',
            }}
          >
            {isLast ? 'Let\u2019s go' : 'Next'}
            <span className="text-white/85">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
