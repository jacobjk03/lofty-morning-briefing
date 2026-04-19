'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon,
  SparkleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ClipboardTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  HouseIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  FileTextIcon,
} from '@phosphor-icons/react'
import LoftyMark from './LoftyMark'
import { byoFetch } from '@/lib/byok-client'

interface AddLeadModalProps {
  onClose: () => void
  onSaved: (name: string) => void
}

interface ParsedLead {
  name?: string
  email?: string
  phone?: string
  type?: string
  budget?: string
  neighborhood?: string
  notes?: string
}

type Phase = 'paste' | 'thinking' | 'review' | 'saving' | 'done'

const SAMPLE_NOTE = `Hey Baylee — I met Rachel Park at the open house on Saturday. She's relocating from SF to Scottsdale in July with her husband. Two kids (9 and 11). Looking for a 4bd in Scottsdale or Paradise Valley, budget ~$1.2–1.5M, needs a pool and good schools. She'll email you a pre-approval letter. 480-555-0112 / rachel.park@gmail.com.`

export default function AddLeadModal({ onClose, onSaved }: AddLeadModalProps) {
  const [phase, setPhase] = useState<Phase>('paste')
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState<ParsedLead>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (phase === 'paste') textareaRef.current?.focus()
  }, [phase])

  const parse = async () => {
    const text = rawText.trim() || SAMPLE_NOTE
    if (!rawText.trim()) setRawText(SAMPLE_NOTE)
    setPhase('thinking')

    try {
      const res = await byoFetch('/api/extract-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.status === 429) {
        // byoFetch already dispatched the quota event — modal is popping.
        setPhase('paste')
        return
      }
      const data = await res.json()
      setParsed(data.lead || {})
    } catch {
      setParsed(fallbackExtract(text))
    }
    setTimeout(() => setPhase('review'), 650)
  }

  const save = () => {
    setPhase('saving')
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => {
        onSaved(parsed.name || 'New lead')
        onClose()
      }, 900)
    }, 900)
  }

  const update = (k: keyof ParsedLead, v: string) => setParsed((p) => ({ ...p, [k]: v }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11, 18, 32, 0.55)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-pill flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close"
        >
          <XIcon size={15} weight="regular" />
        </button>

        <AnimatePresence mode="wait">
          {phase === 'paste' && (
            <motion.div
              key="paste"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-8 pt-8 pb-6"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-8 h-8 rounded-pill flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, #67E8F9, #2563EB 65%, #0B1220 100%)',
                    boxShadow: '0 6px 18px -6px rgba(37,99,235,0.45)',
                  }}
                >
                  <UserPlusIcon size={14} weight="fill" className="text-white" />
                </div>
                <span className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80">
                  Add lead · AI-assisted
                </span>
              </div>
              <h2 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                Paste anything — email, referral note, business card text.
              </h2>
              <p className="text-[12.5px] text-ink-500 mt-1.5">
                I'll extract the contact, type, budget, and neighborhood. You just review and save.
              </p>

              <div
                className="mt-5 rounded-xl p-4 relative"
                style={{ background: '#f7f9fb', border: '1px solid rgba(195,198,215,0.3)' }}
              >
                <ClipboardTextIcon size={13} weight="regular" className="absolute top-4 left-4 text-ink-400" />
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={6}
                  placeholder={SAMPLE_NOTE}
                  className="w-full pl-6 bg-transparent text-[13.5px] text-ink-800 leading-[1.6] resize-none focus:outline-none placeholder-ink-400"
                />
              </div>

              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={parse}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
                  }}
                >
                  <SparkleIcon size={14} weight="fill" />
                  Extract fields
                </button>
                <button
                  onClick={() => { setRawText(SAMPLE_NOTE); parse() }}
                  className="h-11 px-4 rounded-xl bg-ink-50 border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:bg-ink-100 hover:border-ink-300 transition-all"
                >
                  Try sample
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'thinking' && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-10 py-16 flex flex-col items-center text-center"
            >
              <div className="mb-5">
                <LoftyMark size={48} halo pulse />
              </div>
              <h3 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                Reading your note…
              </h3>
              <p className="text-[12.5px] text-ink-500 mt-1.5 max-w-xs">
                Extracting contact, type, budget, neighborhood, and notes.
              </p>
            </motion.div>
          )}

          {(phase === 'review' || phase === 'saving') && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-8 pt-8 pb-6"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <CheckCircleIcon size={18} weight="fill" className="text-blue-600" />
                <span className="text-[10px] font-semibold tracking-wider2 uppercase text-blue-600/80">
                  Extracted · review before saving
                </span>
              </div>
              <h2 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                {parsed.name || 'New lead'}
              </h2>

              <div className="mt-5 space-y-2.5">
                <Field Icon={UserPlusIcon} label="Name"         value={parsed.name}         onChange={(v) => update('name', v)} />
                <Field Icon={HouseIcon}    label="Type"         value={parsed.type}         onChange={(v) => update('type', v)} />
                <Field Icon={PhoneIcon}    label="Phone"        value={parsed.phone}        onChange={(v) => update('phone', v)} />
                <Field Icon={EnvelopeIcon} label="Email"        value={parsed.email}        onChange={(v) => update('email', v)} />
                <Field Icon={CurrencyDollarIcon} label="Budget" value={parsed.budget}       onChange={(v) => update('budget', v)} />
                <Field Icon={MapPinIcon}   label="Neighborhood" value={parsed.neighborhood} onChange={(v) => update('neighborhood', v)} />
                <Field Icon={FileTextIcon} label="Notes"        value={parsed.notes}        onChange={(v) => update('notes', v)} multiline />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={save}
                  disabled={phase === 'saving'}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-[13px] font-semibold tracking-tight transition-transform active:scale-[0.98] disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px -10px rgba(37,99,235,0.55)',
                  }}
                >
                  {phase === 'saving' ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-pill border-2 border-white border-t-transparent animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={14} weight="fill" />
                      Save to CRM
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPhase('paste')}
                  disabled={phase === 'saving'}
                  className="h-11 px-4 rounded-xl bg-white border border-ink-200 text-ink-700 text-[12.5px] font-semibold hover:border-ink-300 transition-all"
                >
                  Re-parse
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-10 py-16 flex flex-col items-center text-center"
            >
              <div
                className="w-14 h-14 rounded-pill flex items-center justify-center mb-5"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircleIcon size={22} weight="fill" className="text-emerald-600" />
              </div>
              <h3 className="font-headline font-bold italic text-[22px] tracking-tightest text-ink-900">
                {parsed.name || 'Lead'} added
              </h3>
              <p className="text-[12.5px] text-ink-500 mt-1.5 max-w-xs">
                Saved to CRM · enrolled in default 28-day nurture plan.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function Field({
  Icon,
  label,
  value,
  onChange,
  multiline = false,
}: {
  Icon: typeof UserPlusIcon
  label: string
  value: string | undefined
  onChange: (v: string) => void
  multiline?: boolean
}) {
  const highlight = !!value
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg transition-all"
      style={{
        background: highlight ? 'rgba(37,99,235,0.035)' : '#f7f9fb',
        border: `1px solid ${highlight ? 'rgba(37,99,235,0.15)' : 'rgba(195,198,215,0.3)'}`,
      }}
    >
      <Icon size={14} weight="regular" className={`shrink-0 mt-1 ${highlight ? 'text-blue-600' : 'text-ink-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[9.5px] font-semibold tracking-wider2 uppercase text-ink-400 mb-0.5">
          {label}
        </div>
        {multiline ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-[13px] text-ink-800 resize-none focus:outline-none placeholder-ink-400"
            placeholder="—"
          />
        ) : (
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-[13px] text-ink-800 focus:outline-none placeholder-ink-400"
            placeholder="—"
          />
        )}
      </div>
    </div>
  )
}

/** Heuristic fallback when Groq is unavailable. */
function fallbackExtract(text: string): ParsedLead {
  const nameMatch = text.match(/met\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)|([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is|has|was|will|moved)/)
  const phone = text.match(/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/)?.[0]
  const email = text.match(/\b[\w.-]+@[\w.-]+\.\w+\b/)?.[0]
  const budget = text.match(/\$[\d.,]+\s*[KMkm]?(?:\s*[-–to]+\s*\$?[\d.,]+\s*[KMkm]?)?/)?.[0]
  const neighborhood = text.match(/(?:in|to)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)(?:\s+in|,|\.|$)/)?.[1]
  const type = /buy|buying|buyer|looking for|relocat/i.test(text) ? 'Buyer' : /sell|listing/i.test(text) ? 'Seller' : 'Buyer'
  return {
    name: nameMatch?.[1] || nameMatch?.[2],
    phone,
    email,
    budget,
    neighborhood,
    type,
    notes: text.length > 200 ? text.slice(0, 200) + '…' : text,
  }
}
