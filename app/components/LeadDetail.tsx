'use client'
import { useState, useEffect } from 'react'
import Toast from './Toast'

interface LeadDetailProps {
  onBack: () => void
}

const SCORE_CATEGORIES = [
  { icon: '🏠', label: 'Listing Activity', color: '#2563EB', keywords: /view|saved|listing|maple|camelback|desert|property/i, weight: 38 },
  { icon: '📧', label: 'Email Engagement', color: '#7c3aed', keywords: /email|opened|click|respond/i, weight: 30 },
  { icon: '🔄', label: 'Return Visit', color: '#059669', keywords: /return|back|site|absence|revisit/i, weight: 22 },
  { icon: '📞', label: 'Contact Quality', color: '#d97706', keywords: /phone|verif|contact|call|valid|schedule|showing|request/i, weight: 10 },
]

function buildBreakdown(score: number, activity: string[]) {
  const matched = SCORE_CATEGORIES
    .map(cat => ({ ...cat, desc: activity.find(a => cat.keywords.test(a)) || '' }))
    .filter(m => m.desc)
  if (matched.length === 0) return [{ icon: '📊', label: 'Overall Activity', pts: score, color: '#2563EB', description: activity[0] || 'Lead activity' }]
  const totalWeight = matched.reduce((s, m) => s + m.weight, 0)
  let remaining = score
  return matched.map((m, i) => {
    const pts = i === matched.length - 1 ? remaining : Math.round((m.weight / totalWeight) * score)
    remaining -= pts
    return { icon: m.icon, label: m.label, pts, color: m.color, description: m.desc }
  })
}

const SCORE_BREAKDOWN_DEFAULT = [
  { icon: '🏠', label: 'Listing Activity', pts: 35, color: '#2563EB', description: 'Viewed 650 Maple St 4 times today, saved it' },
  { icon: '📧', label: 'Email Engagement', pts: 28, color: '#7c3aed', description: 'Opened last 2 emails within 10 minutes' },
  { icon: '🔄', label: 'Return Visit', pts: 20, color: '#059669', description: 'Back on site today after 6-day absence' },
  { icon: '📞', label: 'Contact Quality', pts: 9, color: '#d97706', description: 'Valid phone, verified email' },
]

export default function LeadDetail({ onBack }: LeadDetailProps) {
  const [leadName, setLeadName] = useState('Scott Hayes')
  const [leadScore, setLeadScore] = useState(92)
  const [scoreBreakdown, setScoreBreakdown] = useState(SCORE_BREAKDOWN_DEFAULT)
  const [editMode, setEditMode] = useState(false)
  const [draftText, setDraftText] = useState(
    "Hey Scott! I noticed you've been looking at 650 Maple — it's a great match for what you described. Want to schedule a quick showing this week?"
  )
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/leads/1')
      .then(r => r.json())
      .then((data: any) => {
        setLeadName(data.name)
        setLeadScore(data.score)
        setScoreBreakdown(buildBreakdown(data.score, data.activity || []))
        setDraftText(`Hey ${data.name.split(' ')[0]}! I noticed you've been looking at 650 Maple — it's a great match for what you described. Want to schedule a quick showing this week?`)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Briefing
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-600">Lead Detail</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Lead Profile */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {leadName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{leadName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Buyer</span>
                    <span className="text-xs text-gray-500">Phoenix, AZ · Active today</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-600">{leadScore}</div>
                <div className="text-xs text-gray-500 font-medium">Lead Score</div>
              </div>
            </div>

            {/* Score Arc */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Score Breakdown</span>
                <span className="text-xs text-gray-500">{leadScore} / 100 points</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${leadScore}%`,
                    background: 'linear-gradient(90deg, #2563EB, #06b6d4)',
                  }}
                />
              </div>

              <div className="space-y-3">
                {scoreBreakdown.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-lg mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                        <span className="text-sm font-bold" style={{ color: item.color }}>+{item.pts} pts</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.pts / 35) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Draft Message */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✦</span>
                <h3 className="text-sm font-bold text-gray-900">AI Draft Message</h3>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Ready to send</span>
            </div>
            {editMode ? (
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full text-sm text-gray-700 border border-blue-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed border border-gray-100">
                &ldquo;{draftText}&rdquo;
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className="border border-gray-300 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {editMode ? 'Preview' : 'Edit'}
              </button>
              <button
                onClick={() => {
                  setToast(`Text sent to ${leadName}!`)
                  setEditMode(false)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Send Now
              </button>
            </div>
          </div>

          {/* Context note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <strong>Previously:</strong> AI just showed &ldquo;92&rdquo; with no explanation. Now you know why — and can act.
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
