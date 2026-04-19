'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  SparkleIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  XIcon,
  ClockCountdownIcon,
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'
import LoftyMark from './LoftyMark'

interface DraftModalProps {
  leadId: number
  onClose: () => void
  onSent: (leadName: string) => void
}

export default function DraftModal({ leadId, onClose, onSent }: DraftModalProps) {
  const [phase, setPhase] = useState<'loading' | 'editing'>('loading')
  const [draft, setDraft] = useState('')
  const [leadName, setLeadName] = useState('')
  const [editMode, setEditMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setDraft(data.draft || '')
        setLeadName(data.lead || 'Lead')
        setPhase('editing')
      })
      .catch(() => {
        setDraft("Hey! I noticed you've been checking listings — want me to hold a showing slot this week?")
        setLeadName('Lead')
        setPhase('editing')
      })
  }, [leadId])

  useEffect(() => {
    if (editMode) textareaRef.current?.focus()
  }, [editMode])

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const firstName = leadName.split(' ')[0] || 'there'
  const subject =
    phase === 'editing'
      ? `Quick follow-up for ${firstName}`
      : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11, 18, 32, 0.55)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdrop}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white rounded-[18px] overflow-hidden relative"
        style={{
          border: '1px solid rgba(15,23,42,0.06)',
          boxShadow:
            '0 24px 64px -16px rgba(15,23,42,0.30), 0 8px 24px -12px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-pill flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close"
        >
          <XIcon size={14} weight="regular" />
        </button>

        {phase === 'loading' ? (
          <div className="px-10 py-14 flex flex-col items-center text-center">
            <div className="mb-5">
              <LoftyMark size={48} halo pulse />
            </div>
            <h2 className="font-headline font-bold text-[22px] tracking-tightest text-ink-900 italic">
              Drafting for {firstName}…
            </h2>
            <p className="text-[12.5px] text-ink-500 mt-1.5 max-w-xs">
              Reading live activity · composing a personalized follow-up
            </p>
          </div>
        ) : (
          <div>
            {/* Status header */}
            <div className="px-8 pt-8 pb-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-pill mb-4"
                   style={{
                     background: 'rgba(37,99,235,0.08)',
                     border: '1px solid rgba(37,99,235,0.14)',
                   }}>
                <CheckCircleIcon size={22} weight="fill" className="text-blue-600" />
              </div>
              <h2 className="font-headline font-bold text-[24px] tracking-tightest text-ink-900 italic leading-[1.1]">
                Drafting complete
              </h2>
              <p className="text-[12.5px] text-ink-500 mt-1.5">
                Ready for your review before sending to <span className="text-ink-800 font-medium">{leadName}</span>.
              </p>
            </div>

            {/* Preview card */}
            <div className="mx-6 mb-5 rounded-2xl overflow-hidden"
                 style={{
                   background: '#FAFBFC',
                   border: '1px solid rgba(195,198,215,0.35)',
                   boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 20px -12px rgba(15,23,42,0.10)',
                 }}>
              <div className="px-6 pt-5 pb-3 border-b border-ink-200/50">
                <div className="inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider2 font-semibold text-ink-400 mb-3">
                  <SparkleIcon size={11} weight="regular" className="text-blue-500" />
                  Text preview
                </div>
                <div className="space-y-1">
                  <div className="flex text-[12px]">
                    <span className="text-ink-400 w-14">To</span>
                    <span className="font-semibold text-ink-800">{leadName}</span>
                  </div>
                  <div className="flex text-[12px]">
                    <span className="text-ink-400 w-14">Subject</span>
                    <span className="font-semibold text-ink-800">{subject}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                {editMode ? (
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={5}
                    className="w-full text-[13.5px] text-ink-800 leading-[1.65] bg-transparent resize-none focus:outline-none"
                  />
                ) : (
                  <p className="text-[13.5px] text-ink-800 leading-[1.65] whitespace-pre-wrap">
                    {draft}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-2.5">
              <button
                onClick={() => {
                  onSent(leadName)
                  onClose()
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl
                           text-white text-[13px] font-semibold tracking-tight
                           transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 24px -10px rgba(37,99,235,0.55)',
                }}
              >
                <PaperPlaneTiltIcon size={14} weight="fill" />
                Send now
              </button>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl
                           bg-white border border-ink-200 text-ink-700 text-[13px] font-semibold
                           hover:bg-ink-50 hover:border-ink-300 transition-all active:scale-[0.98]"
              >
                <PencilSimpleIcon size={14} weight="regular" />
                {editMode ? 'Preview' : 'Edit draft'}
              </button>
            </div>

            {/* Secondary row */}
            <div className="px-6 pb-6 flex items-center justify-center gap-5 border-t border-ink-100 pt-4">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider2 font-semibold text-ink-400 hover:text-ink-800 transition-colors"
              >
                <ArrowCounterClockwiseIcon size={12} weight="regular" />
                Discard
              </button>
              <span className="w-1 h-1 rounded-pill bg-ink-200" />
              <button
                onClick={() => {
                  onSent(leadName)
                  onClose()
                }}
                className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider2 font-semibold text-ink-400 hover:text-ink-800 transition-colors"
              >
                <ClockCountdownIcon size={12} weight="regular" />
                Schedule later
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
