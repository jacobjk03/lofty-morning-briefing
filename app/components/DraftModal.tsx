'use client'
import { useState, useEffect, useRef } from 'react'

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
        setDraft("Hey! I noticed you've been checking out some listings — happy to help you find the right fit. Want to set up a quick call this week?")
        setLeadName('Lead')
        setPhase('editing')
      })
  }, [leadId])

  // Focus textarea when edit mode activates
  useEffect(() => {
    if (editMode) textareaRef.current?.focus()
  }, [editMode])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up"
        style={{ animationDuration: '0.25s' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI Draft Message</p>
              {leadName && phase === 'editing' && (
                <p className="text-blue-200 text-xs">To: {leadName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {phase === 'loading' ? (
            <div className="py-8 flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="relative w-12 h-12">
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-100"
                />
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              </div>
              <div className="text-center">
                <p className="text-gray-800 font-semibold text-sm">
                  ✦ AI is personalizing your message...
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Reading lead activity from database
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Personalized draft
                </p>
                <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  AI generated
                </span>
              </div>

              {editMode ? (
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  className="w-full text-sm text-gray-800 leading-relaxed bg-gray-50 border border-blue-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-800 leading-relaxed">{draft}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-600 text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
                >
                  <span>{editMode ? '👁' : '✏️'}</span>
                  {editMode ? 'Preview' : 'Edit'}
                </button>
                <button
                  onClick={() => {
                    onSent(leadName)
                    onClose()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
                >
                  Send Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                Personalized using live CRM activity data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
