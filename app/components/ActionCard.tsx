'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRightIcon, CheckIcon, CheckCircleIcon, type IconProps } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

export interface ActionCardProps {
  icon: ComponentType<IconProps>
  kicker: string
  title: string
  meta: string
  reasoning: string
  primaryLabel: string
  secondaryLabel: string
  source: string
  delayMs?: number
  approved?: boolean
  executing?: boolean
  accent?: boolean
  steps?: string[]
  doneLabel?: string
  onApprove?: () => void
  onSecondary?: () => void
}

const STEP_MS = 750

export default function ActionCard({
  icon: IconComponent,
  kicker,
  title,
  meta,
  reasoning,
  primaryLabel,
  secondaryLabel,
  source,
  delayMs = 0,
  approved = false,
  executing = false,
  accent = false,
  steps = [],
  doneLabel = 'Done',
  onApprove,
  onSecondary,
}: ActionCardProps) {
  // Progress through steps once approved
  const [stepIdx, setStepIdx] = useState<number>(-1)
  const allDone = steps.length > 0 && stepIdx >= steps.length

  useEffect(() => {
    if (!approved || steps.length === 0) return
    setStepIdx(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      if (i > steps.length) {
        clearInterval(id)
      }
      setStepIdx(i)
    }, STEP_MS)
    return () => clearInterval(id)
  }, [approved, steps.length])

  const showProgress = approved || executing

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delayMs / 1000, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col w-full min-w-0 rounded-lg overflow-hidden transition-all duration-300 bg-white"
      style={{
        border: accent ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
        padding: '18px 18px 16px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px -4px rgba(15,23,42,0.08)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2">
          <IconComponent size={14} weight="regular" className="text-ink-400" />
          <span className="text-[10px] font-semibold tracking-wider2 text-ink-400 uppercase">
            {kicker}
          </span>
        </div>
        {showProgress ? (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider2 uppercase text-blue-600">
            <span className="relative flex h-1.5 w-1.5">
              {!allDone && (
                <span className="absolute inline-flex h-full w-full rounded-pill bg-blue-400 opacity-60 animate-ping" />
              )}
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-pill"
                style={{ background: allDone ? '#10B981' : '#2563EB' }}
              />
            </span>
            {allDone ? 'Complete' : 'Executing'}
          </span>
        ) : (
          accent && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider2 text-blue-600 uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-pill bg-blue-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-pill bg-blue-500" />
              </span>
              Priority
            </span>
          )
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-ink-900 tracking-tighter leading-[1.25]">
        {title}
      </h3>
      <p className="text-[11px] text-ink-400 mt-0.5 font-medium tabular-nums">
        {meta}
      </p>

      {/* Reasoning OR progress list */}
      <AnimatePresence mode="wait" initial={false}>
        {showProgress && steps.length > 0 ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-2"
          >
            {steps.map((s, i) => {
              const done = stepIdx > i
              const active = stepIdx === i
              return (
                <div key={s} className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 shrink-0 rounded-pill flex items-center justify-center transition-all"
                    style={{
                      background: done ? '#2563EB' : active ? 'transparent' : '#E2E8F0',
                      border: active ? '2px solid #2563EB' : 'none',
                    }}
                  >
                    {done && <CheckIcon size={10} weight="bold" className="text-white" />}
                    {active && (
                      <span
                        className="w-2 h-2 rounded-pill"
                        style={{ background: '#2563EB', animation: 'breathe 1.2s ease-in-out infinite' }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[12px] font-medium tracking-tight transition-colors ${
                      done ? 'text-ink-700 line-through decoration-ink-300' : active ? 'text-ink-900' : 'text-ink-400'
                    }`}
                  >
                    {s}
                  </span>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.p
            key="reasoning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[13px] text-ink-600 mt-3 leading-[1.55]"
          >
            {reasoning}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {showProgress ? (
          <div
            className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-[12px] font-semibold transition-all"
            style={{
              background: allDone ? '#ECFDF5' : '#EFF6FF',
              border: `1px solid ${allDone ? '#A7F3D0' : '#BFDBFE'}`,
              color: allDone ? '#047857' : '#1D4ED8',
            }}
          >
            {allDone ? (
              <>
                <CheckCircleIcon size={14} weight="fill" />
                {doneLabel}
              </>
            ) : (
              <>
                <span
                  className="w-3.5 h-3.5 rounded-pill border-2 border-blue-600 border-t-transparent animate-spin"
                />
                Working…
              </>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={onApprove}
              className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-md
                         text-[12px] font-semibold tracking-tight transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                background: accent ? '#2563EB' : '#1E293B',
                color: '#FFFFFF',
                boxShadow: accent
                  ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px -4px rgba(37,99,235,0.5)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px -4px rgba(15,23,42,0.3)',
              }}
            >
              {primaryLabel}
            </button>
            <button
              onClick={onSecondary}
              className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md
                         bg-white border border-ink-200 text-ink-600 text-[12px] font-semibold
                         hover:bg-ink-50 hover:border-ink-300 hover:text-ink-800 transition-all"
            >
              {secondaryLabel}
              <ArrowUpRightIcon size={13} weight="regular" />
            </button>
          </>
        )}
      </div>

      {/* Source footnote */}
      <div className="mt-3 pt-2.5 border-t border-ink-100">
        <p className="text-[10px] text-ink-300 font-medium tracking-tight">
          {source}
        </p>
      </div>
    </motion.div>
  )
}
