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

/**
 * Monochrome priority card. No emoji, no coloured pill, no gradient.
 * Phosphor icons at regular weight — editorial feel.
 */
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
      className="group relative flex flex-col w-full min-w-0 rounded-lg overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '20px 20px 18px',
      }}
    >
      {/* Top row — icon + kicker */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2">
          <IconComponent size={15} weight="regular" className="text-white/45" />
          <span className="text-[10.5px] font-semibold tracking-wider2 text-white/45 uppercase">
            {kicker}
          </span>
        </div>
        {accent && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider2 text-cyan-300/90 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-pill bg-cyan-400 opacity-60 animate-ping"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-pill bg-cyan-300"></span>
            </span>
            Priority
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15.5px] font-semibold text-white tracking-tighter leading-[1.25]">
        {title}
      </h3>
      <p className="text-[11.5px] text-white/40 mt-1 font-medium tabular-nums">
        {meta}
      </p>

      {/* Reasoning */}
      <p className="text-[13px] text-white/65 mt-4 leading-[1.55]">
        {reasoning}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-5">
        {executing || approved ? (
          <div className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md
                          bg-white/[0.04] border border-white/[0.10] text-white/70 text-[12px] font-semibold">
            <CheckIcon size={14} weight="bold" className="text-cyan-300" />
            {executing ? 'Executing' : 'Approved'}
          </div>
        ) : (
          <>
            <button
              onClick={onApprove}
              className="flex-1 inline-flex items-center justify-center h-9 px-3 rounded-md
                         text-[#0B1220] text-[12px] font-semibold tracking-tight
                         transition-all hover:brightness-110"
              style={{
                background: accent ? '#22D3EE' : '#F1F5F9',
                boxShadow: accent
                  ? 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 18px -6px rgba(34,211,238,0.55)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px -4px rgba(0,0,0,0.3)',
              }}
            >
              {primaryLabel}
            </button>
            <button
              onClick={onSecondary}
              className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md
                         bg-transparent border border-white/[0.10] text-white/65 text-[12px] font-semibold
                         hover:bg-white/[0.04] hover:border-white/[0.18] hover:text-white transition-all"
            >
              {secondaryLabel}
              <ArrowUpRightIcon size={13} weight="regular" />
            </button>
          </>
        )}
      </div>

      {/* Source footnote */}
      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        <p className="text-[10px] text-white/25 font-medium tracking-tight">
          {source}
        </p>
      </div>
    </motion.div>
  )
}
