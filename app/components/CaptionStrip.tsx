'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface CaptionStripProps {
  text: string
  revealedChars: number
  speaking: boolean
}

export default function CaptionStrip({ text, revealedChars, speaking }: CaptionStripProps) {
  const shown = text.slice(0, revealedChars)
  const hidden = text.slice(revealedChars)

  return (
    <div className="min-h-[68px] max-w-[620px] mx-auto px-6 text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key="caption"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="text-[16px] leading-[1.55] text-ink-700 font-medium tracking-tight"
        >
          <span>{shown}</span>
          <span className="text-ink-300">{hidden}</span>
          {speaking && <span className="caret bg-ink-600" />}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
