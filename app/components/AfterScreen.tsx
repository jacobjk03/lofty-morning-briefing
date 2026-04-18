'use client'
import { useState, useEffect, useCallback } from 'react'
import NavBar from './NavBar'
import Toast from './Toast'

const BRIEFING_TEXT =
  "You have 3 high-interest leads who need immediate attention. Scott Hayes viewed the Maple Street listing 4 times — I drafted a follow-up text. The Johnson closing is in 72 hours with an open inspection note. Your Lofty Bloom Smart Plan paused due to an email bounce."

interface AfterScreenProps {
  onViewLead: () => void
  onOpenChat: () => void
}

export default function AfterScreen({ onViewLead, onOpenChat }: AfterScreenProps) {
  const [phase, setPhase] = useState<'thinking' | 'typing' | 'done'>('thinking')
  const [displayedText, setDisplayedText] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    const thinkTimer = setTimeout(() => setPhase('typing'), 2000)
    return () => clearTimeout(thinkTimer)
  }, [])

  useEffect(() => {
    if (phase !== 'typing') return
    let i = 0
    const interval = setInterval(() => {
      if (i < BRIEFING_TEXT.length) {
        setDisplayedText(BRIEFING_TEXT.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setPhase('done')
        setTimeout(() => setCardsVisible(true), 200)
      }
    }, 22)
    return () => clearInterval(interval)
  }, [phase])

  const showToast = useCallback((msg: string) => setToast(msg), [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <NavBar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Greeting */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Good morning, Baylee ☀️</h1>
            <p className="text-gray-500 mt-1 text-sm">{today}</p>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              I reviewed your leads, tasks, transactions, and notifications. Here&apos;s what matters today.
            </p>
          </div>

          {/* AI Briefing Card */}
          <div
            className="rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0891b2 100%)',
            }}
          >
            {/* subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs">✦</span>
                </div>
                <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  {phase === 'thinking' ? 'AI Thinking...' : 'Lofty AI Briefing'}
                </span>
              </div>

              {phase === 'thinking' ? (
                <div className="space-y-2">
                  {[100, 80, 60].map((w, i) => (
                    <div
                      key={i}
                      className="h-4 bg-white/20 rounded-full thinking-bar"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                  <p className="text-blue-200 text-sm mt-3 animate-pulse">
                    Analyzing leads, tasks, transactions...
                  </p>
                </div>
              ) : (
                <p className="text-white text-lg leading-relaxed font-medium min-h-[5rem]">
                  {displayedText}
                  {phase === 'typing' && (
                    <span className="inline-block w-0.5 h-5 bg-white ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Priority Action Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 transition-all duration-500 ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Card 1 — Hot Lead */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">🔥</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  HIGH INTEREST
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Scott Hayes · Score 92</h3>
              <p className="text-gray-500 text-xs mt-1 mb-4">Viewed 650 Maple St × 4 today</p>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Draft text sent to Scott Hayes!')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Send Draft Text
                </button>
                <button
                  onClick={onViewLead}
                  className="flex-1 border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  View Lead →
                </button>
              </div>
            </div>

            {/* Card 2 — Urgent Transaction */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">⏰</span>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  DEADLINE ALERT
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Johnson Closing · 72 hrs</h3>
              <p className="text-gray-500 text-xs mt-1 mb-4">Inspection note still open</p>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Opening Johnson transaction...')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Open Transaction
                </button>
                <button
                  onClick={() => showToast('Inspection note marked resolved!')}
                  className="flex-1 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Resolve Note
                </button>
              </div>
            </div>

            {/* Card 3 — Smart Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">⚡</span>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  NEEDS ATTENTION
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Lofty Bloom Plan · Paused</h3>
              <p className="text-gray-500 text-xs mt-1 mb-4">Email bounce on 3 leads</p>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Opening email bounce fixer...')}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Fix Now
                </button>
                <button
                  onClick={() => showToast('Opening Lofty Bloom plan...')}
                  className="flex-1 border border-gray-300 hover:border-amber-400 hover:text-amber-600 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  View Plan
                </button>
              </div>
            </div>
          </div>

          {/* Chat input */}
          <div
            className={`transition-all duration-700 delay-300 ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm cursor-text hover:border-blue-400 transition-colors"
              onClick={onOpenChat}
            >
              <span className="text-blue-500">✦</span>
              <span className="text-gray-400 text-sm flex-1">Ask AI anything about your day...</span>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              ✦ Powered by Lofty AI · Cross-references leads, tasks, transactions &amp; notifications
            </p>
          </div>
        </div>
      </div>

      {/* GlobeHack badge */}
      <div className="fixed bottom-4 right-4 bg-gray-900/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-30">
        Built for GlobeHack 2026 · ASU ACM
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
