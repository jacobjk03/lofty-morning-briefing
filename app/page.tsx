'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const BeforeScreen = dynamic(() => import('./components/BeforeScreen'), { ssr: false })
const AfterScreen = dynamic(() => import('./components/AfterScreen'), { ssr: false })
const LeadDetail = dynamic(() => import('./components/LeadDetail'), { ssr: false })
const PitchMode = dynamic(() => import('./components/PitchMode'), { ssr: false })
const AIAssistant = dynamic(() => import('./components/AIAssistant'), { ssr: false })

type Screen = 'before' | 'after' | 'lead' | 'pitch' | 'chat'

const TABS: { id: Screen; label: string }[] = [
  { id: 'before', label: 'Before' },
  { id: 'after', label: 'After' },
  { id: 'lead', label: 'Lead Detail' },
  { id: 'pitch', label: 'Pitch Mode' },
  { id: 'chat', label: 'AI Assistant' },
]

export default function Home() {
  const [screen, setScreen] = useState<Screen>('after')
  const [afterKey, setAfterKey] = useState(0)

  const goTo = (s: Screen) => {
    if (s === 'after') setAfterKey((k) => k + 1)
    setScreen(s)
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Top toggle bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 mr-4">
          <div
            className="w-5 h-5 rounded flex items-center justify-center font-extrabold text-white text-xs"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}
          >
            K
          </div>
          <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Lofty Morning Briefing</span>
        </div>

        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => goTo(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                screen === tab.id
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              {tab.id === 'before' && screen === 'before' && '🔴 '}
              {tab.id === 'after' && screen === 'after' && '🟢 '}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 pl-2">
          <span className="hidden md:inline text-xs text-gray-400 whitespace-nowrap">
            GlobeHack 2026 · ASU ACM
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Screen area */}
      <div className="flex-1 min-h-0 relative">
        {/* Before */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            screen === 'before' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <BeforeScreen />
        </div>

        {/* After */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            screen === 'after' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <AfterScreen
            key={afterKey}
            onViewLead={() => goTo('lead')}
            onOpenChat={() => goTo('chat')}
          />
        </div>

        {/* Lead Detail */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            screen === 'lead' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <LeadDetail onBack={() => goTo('after')} />
        </div>

        {/* Pitch Mode */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            screen === 'pitch' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <PitchMode />
        </div>

        {/* AI Assistant */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            screen === 'chat' ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <AIAssistant />
        </div>
      </div>
    </div>
  )
}
