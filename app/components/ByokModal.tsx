'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LockKeyIcon, KeyIcon, SparkleIcon, CheckCircleIcon } from '@phosphor-icons/react'
import {
  BYOK_OPEN_EVENT,
  BYOK_SAVED_EVENT,
  QUOTA_EVENT,
  clearStoredCreds,
  getStoredCreds,
  setStoredCreds,
} from '@/lib/byok-client'

type Tab = 'admin' | 'byok'

/**
 * Global modal. Opens on:
 *   • `lofty:quota-exceeded` — dispatched by `byoFetch` on any 429
 *   • `lofty:open-byok` — dispatched manually (e.g. Unlock button in nav)
 *
 * Visitor can either:
 *   • paste the admin/demo password (judges + us) — server uses its own keys
 *   • paste their own Groq + ElevenLabs keys — they pay for tokens
 * Either path writes to localStorage so the next request auto-authenticates.
 */
export default function ByokModal() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('admin')
  const [quotaTrigger, setQuotaTrigger] = useState(false)
  const [admin, setAdmin] = useState('')
  const [groq, setGroq] = useState('')
  const [eleven, setEleven] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const creds = getStoredCreds()
    setAdmin(creds.admin)
    setGroq(creds.groq)
    setEleven(creds.elevenlabs)
  }, [])

  useEffect(() => {
    const onQuota = () => { setQuotaTrigger(true); setTab('admin'); setOpen(true) }
    const onManualOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: Tab }>).detail
      setQuotaTrigger(false)
      if (detail?.tab) setTab(detail.tab)
      setOpen(true)
    }
    window.addEventListener(QUOTA_EVENT, onQuota)
    window.addEventListener(BYOK_OPEN_EVENT, onManualOpen)
    return () => {
      window.removeEventListener(QUOTA_EVENT, onQuota)
      window.removeEventListener(BYOK_OPEN_EVENT, onManualOpen)
    }
  }, [])

  // Keep inputs in sync if another tab saved.
  useEffect(() => {
    const onSaved = () => {
      const c = getStoredCreds()
      setAdmin(c.admin); setGroq(c.groq); setEleven(c.elevenlabs)
    }
    window.addEventListener(BYOK_SAVED_EVENT, onSaved)
    return () => window.removeEventListener(BYOK_SAVED_EVENT, onSaved)
  }, [])

  const handleSave = () => {
    if (tab === 'admin') {
      setStoredCreds({ admin: admin.trim() })
    } else {
      setStoredCreds({ groq: groq.trim(), elevenlabs: eleven.trim() })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  const handleClear = () => {
    clearStoredCreds()
    setAdmin(''); setGroq(''); setEleven('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-[22px] shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)] border border-ink-100 overflow-hidden"
          >
            {/* Soft ambient gradient at top */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-28"
              style={{
                background:
                  'radial-gradient(60% 120% at 50% 0%, rgba(37,99,235,0.10) 0%, rgba(103,232,249,0.06) 45%, transparent 75%)',
              }}
            />

            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-pill"
                  style={{
                    background: quotaTrigger ? 'rgba(245,158,11,0.12)' : 'rgba(37,99,235,0.10)',
                    color: quotaTrigger ? '#B45309' : '#2563EB',
                  }}
                >
                  <LockKeyIcon size={15} weight="regular" />
                </span>
                <div className="text-[10px] font-semibold tracking-wider2 uppercase"
                     style={{ color: quotaTrigger ? '#B45309' : '#2563EB' }}>
                  {quotaTrigger ? 'Demo limit reached' : 'Unlock Lofty Atlas'}
                </div>
              </div>
              <h2 className="mt-3 font-headline font-bold italic text-[23px] tracking-tightest text-ink-900 leading-[1.1]">
                {quotaTrigger ? 'Keep the demo running' : 'Skip the demo limit'}
              </h2>
              <p className="mt-2 text-[13px] text-ink-500 leading-relaxed max-w-sm">
                {quotaTrigger
                  ? 'Each browser gets one free AI-powered call. Use the demo password if you have one, or bring your own API keys.'
                  : 'If you have the demo password, paste it below and make as many calls as you want. Judges and teammates only.'}
              </p>

              <div className="mt-4 inline-flex items-center gap-1 p-0.5 rounded-pill bg-ink-100">
                <button
                  onClick={() => setTab('admin')}
                  className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-pill text-[11px] font-semibold transition-all ${
                    tab === 'admin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                  }`}
                >
                  <SparkleIcon size={11} weight="fill" className={tab === 'admin' ? 'text-blue-600' : 'text-ink-400'} />
                  Demo password
                </button>
                <button
                  onClick={() => setTab('byok')}
                  className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-pill text-[11px] font-semibold transition-all ${
                    tab === 'byok' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
                  }`}
                >
                  <KeyIcon size={11} weight="regular" className={tab === 'byok' ? 'text-blue-600' : 'text-ink-400'} />
                  Your own keys
                </button>
              </div>
            </div>

            <div className="px-6 pb-5">
              {tab === 'admin' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-ink-700 tracking-tight mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={admin}
                    onChange={(e) => setAdmin(e.target.value)}
                    placeholder="paste demo password"
                    className="w-full h-10 px-3.5 rounded-[12px] border border-ink-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-[13px] text-ink-900 placeholder:text-ink-300 transition-all"
                  />
                  <p className="mt-2 text-[11px] text-ink-400 leading-relaxed">
                    If a judge or teammate gave you a password, paste it here. We'll route your calls through our keys — no usage cap.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 tracking-tight mb-1.5">
                      Groq API key
                    </label>
                    <input
                      type="password"
                      value={groq}
                      onChange={(e) => setGroq(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full h-10 px-3.5 rounded-[12px] border border-ink-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-[13px] text-ink-900 placeholder:text-ink-300 font-mono transition-all"
                    />
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[11px] text-blue-600 hover:underline"
                    >
                      Get a free Groq key →
                    </a>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 tracking-tight mb-1.5">
                      ElevenLabs API key
                    </label>
                    <input
                      type="password"
                      value={eleven}
                      onChange={(e) => setEleven(e.target.value)}
                      placeholder="sk_..."
                      className="w-full h-10 px-3.5 rounded-[12px] border border-ink-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-[13px] text-ink-900 placeholder:text-ink-300 font-mono transition-all"
                    />
                    <a
                      href="https://elevenlabs.io/app/settings/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[11px] text-blue-600 hover:underline"
                    >
                      Get an ElevenLabs key →
                    </a>
                  </div>
                  <p className="text-[11px] text-ink-400 leading-relaxed">
                    Stored in your browser only (localStorage). Never sent anywhere but the Lofty Atlas API.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-ink-100">
              <button
                onClick={handleClear}
                className="text-[11px] text-ink-400 hover:text-ink-700 tracking-tight"
              >
                Clear saved
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 px-3.5 rounded-pill text-[12px] font-semibold text-ink-600 hover:text-ink-900 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-pill text-[12px] font-semibold text-white transition-all active:scale-[0.97] hover:brightness-110"
                  style={{
                    background: 'linear-gradient(180deg, #2563EB, #1D4ED8)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 20px -8px rgba(37,99,235,0.5)',
                  }}
                >
                  {saved ? 'Saved ✓' : 'Save & retry'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
