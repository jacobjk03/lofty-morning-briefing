'use client'
import { motion } from 'framer-motion'
import { ArrowUpRightIcon, CheckIcon, type IconProps } from '@phosphor-icons/react'
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
  onApprove?: () => void
  onSecondary?: () => void
}

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
  onApprove,
  onSecondary,
}: ActionCardProps) {
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
      {/* Top row — icon + kicker */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2">
          <IconComponent size={14} weight="regular" className="text-ink-400" />
          <span className="text-[10px] font-semibold tracking-wider2 text-ink-400 uppercase">
            {kicker}
          </span>
        </div>
        {accent && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider2 text-blue-600 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-pill bg-blue-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-pill bg-blue-500" />
            </span>
            Priority
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-ink-900 tracking-tighter leading-[1.25]">
        {title}
      </h3>
      <p className="text-[11px] text-ink-400 mt-0.5 font-medium tabular-nums">
        {meta}
      </p>

      {/* Reasoning */}
      <p className="text-[13px] text-ink-600 mt-3 leading-[1.55]">
        {reasoning}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {executing || approved ? (
          <div className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md
                          bg-ink-50 border border-ink-200 text-ink-600 text-[12px] font-semibold">
            <CheckIcon size={14} weight="bold" className="text-blue-500" />
            {executing ? 'Executing…' : 'Approved'}
          </div>
        ) : (
          <>
            <button
              onClick={onApprove}
              className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-md
                         text-[12px] font-semibold tracking-tight transition-all hover:brightness-105"
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
