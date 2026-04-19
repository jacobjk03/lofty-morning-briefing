'use client'
import { useState } from 'react'

interface AIAgentsProps {
  onGoToBriefing: () => void
  onGoToChat: () => void
}

const ACTIVE_AGENTS = [
  { id: 'sales', icon: '💼', color: '#eff6ff', title: 'Sales Agent', subtitle: 'Monitoring 23 leads', status: 'active', stat: 'Last sync: 2m ago' },
  { id: 'social', icon: '📣', color: '#faf5ff', title: 'Social Agent', subtitle: 'Social active', status: 'active', stat: 'Posts ready: 4' },
  { id: 'homeowner', icon: '🏠', color: '#fff7ed', title: 'Homeowner Agent', subtitle: 'Pending updates', status: 'paused', stat: 'Last sync: 1h ago' },
]

const DISCOVER_AGENTS = [
  { id: 'workflow', icon: '⚙️', title: 'AI Workflow', subtitle: 'Intelligent plans with AI-powered precision automation', badge: 'BETA' },
  { id: 'website', icon: '🌐', title: 'Website Building Agent', subtitle: 'Create personalized IDX websites in minutes' },
  { id: 'studio', icon: '🤖', title: 'Agent Studio', subtitle: 'Build custom agents for your niche — no coding required', badge: 'BETA' },
]

type SectionLayout = 'leads' | 'appointments' | 'stats' | 'posts' | 'list'

interface AgentSection {
  heading: string
  layout: SectionLayout
  items: { label: string; value: string; sub?: string; time?: string; tag?: string; tagColor?: string; icon?: string; accent?: string }[]
}

const AGENT_DETAIL: Record<string, { title: string; icon: string; accentColor: string; iconBg: string; sections: AgentSection[] }> = {
  sales: {
    title: 'Sales Agent', icon: '💼', accentColor: '#2563eb', iconBg: '#dbeafe',
    sections: [
      {
        heading: 'Lead Pipeline', layout: 'leads',
        items: [
          { label: 'Scott Hayes', value: 'Score 92 · Buyer', tag: 'HOT', tagColor: '#ef4444' },
          { label: 'Maria Gonzalez', value: 'Score 78 · Buyer', tag: 'WARM', tagColor: '#f59e0b' },
          { label: 'David Kim', value: 'Score 61 · Seller', tag: 'WARM', tagColor: '#f59e0b' },
          { label: 'Amy Chen', value: 'Score 44 · Buyer', tag: 'COLD', tagColor: '#94a3b8' },
        ],
      },
      {
        heading: 'Appointments Set This Week', layout: 'appointments',
        items: [
          { label: 'James Martinez', value: '1842 Camelback Rd', time: '2:00 PM' },
          { label: 'Roberts Family', value: '650 Maple St', time: '4:30 PM' },
        ],
      },
      {
        heading: 'Capture Stats', layout: 'stats',
        items: [
          { label: 'Website visitors qualified', value: '14 this week', accent: '14', icon: '🌐' },
          { label: 'Follow-ups sent', value: '31 this month', accent: '31', icon: '📨' },
          { label: 'Appointments booked', value: '6 this month', accent: '6', icon: '📅' },
        ],
      },
    ],
  },
  social: {
    title: 'Social Agent', icon: '📣', accentColor: '#7c3aed', iconBg: '#ede9fe',
    sections: [
      {
        heading: 'Scheduled Posts', layout: 'posts',
        items: [
          { label: 'Just Listed · 650 Maple St', value: 'Today 10:00 AM', sub: 'Instagram', tag: 'READY', tagColor: '#16a34a' },
          { label: 'Market Update · Scottsdale', value: 'Tomorrow 9:00 AM', sub: 'Facebook', tag: 'DRAFT', tagColor: '#f59e0b' },
          { label: 'Just Closed · 1842 Camelback', value: 'Thu 11:00 AM', sub: 'Instagram', tag: 'DRAFT', tagColor: '#f59e0b' },
          { label: 'Buyer Tips · Spring 2026', value: 'Fri 8:00 AM', sub: 'LinkedIn', tag: 'READY', tagColor: '#16a34a' },
        ],
      },
      {
        heading: 'AI-Generated Captions', layout: 'list',
        items: [
          { label: '650 Maple St', value: '"Desert living redefined — 4bd pool home"' },
          { label: 'Market report teaser', value: '"Scottsdale values up 8% YoY — full report inside"' },
        ],
      },
      {
        heading: 'Engagement This Month', layout: 'stats',
        items: [
          { label: 'Impressions', value: '12,400 total', accent: '12.4K', icon: '👁️' },
          { label: 'Profile visits', value: '847 total', accent: '847', icon: '👤' },
          { label: 'Leads from social', value: '3 this month', accent: '3', icon: '🎯' },
        ],
      },
    ],
  },
  homeowner: {
    title: 'Homeowner Agent', icon: '🏠', accentColor: '#ea580c', iconBg: '#ffedd5',
    sections: [
      {
        heading: 'Seller Intent Signals', layout: 'leads',
        items: [
          { label: 'David Kim · Tempe', value: 'Requested valuation · 4 days ago', tag: 'HIGH INTENT', tagColor: '#ef4444' },
          { label: 'Lisa Park · Scottsdale', value: 'Viewed market report 3×', tag: 'MEDIUM', tagColor: '#f59e0b' },
          { label: 'Tom Reyes · Phoenix', value: 'Opened homeowner email', tag: 'LOW', tagColor: '#94a3b8' },
        ],
      },
      {
        heading: 'Pending Outreach', layout: 'list',
        items: [
          { label: 'Annual home value update', value: '12 contacts due this week', tag: 'PAUSED', tagColor: '#f59e0b' },
          { label: 'Spring market digest', value: 'Scheduled for Monday' },
        ],
      },
      {
        heading: 'Database Health', layout: 'stats',
        items: [
          { label: 'Homeowners tracked', value: '89 contacts', accent: '89', icon: '👥' },
          { label: 'Enriched profiles', value: '74 of 89', accent: '74', icon: '✅' },
          { label: 'Avg equity estimate', value: 'per contact', accent: '$218K', icon: '💰' },
        ],
      },
    ],
  },
  workflow: {
    title: 'AI Workflow', icon: '⚙️', accentColor: '#7c3aed', iconBg: '#ede9fe',
    sections: [
      {
        heading: 'Active Automations', layout: 'leads',
        items: [
          { label: 'New lead → Score & assign', value: 'Triggered 14× this week', tag: 'RUNNING', tagColor: '#16a34a' },
          { label: 'Score ≥ 80 → Notify agent', value: 'Triggered 3× this week', tag: 'RUNNING', tagColor: '#16a34a' },
          { label: 'Closing in 72h → Task list', value: 'Triggered 1× this week', tag: 'RUNNING', tagColor: '#16a34a' },
        ],
      },
      {
        heading: 'Lead Segments', layout: 'list',
        items: [
          { label: 'Hot buyers (score ≥ 80)', value: '3 leads' },
          { label: 'Warm buyers (score 50–79)', value: '8 leads' },
          { label: 'Likely sellers', value: '5 leads' },
          { label: 'Re-engaged (back on site)', value: '12 leads' },
        ],
      },
      {
        heading: 'Automation Stats', layout: 'stats',
        items: [
          { label: 'Tasks auto-created', value: 'this month', accent: '27', icon: '✅' },
          { label: 'Notifications sent', value: 'this month', accent: '41', icon: '🔔' },
          { label: 'Time saved (est.)', value: 'this month', accent: '6.5h', icon: '⏱️' },
        ],
      },
    ],
  },
  website: {
    title: 'Website Building Agent', icon: '🌐', accentColor: '#2563eb', iconBg: '#dbeafe',
    sections: [
      {
        heading: 'Your IDX Sites', layout: 'leads',
        items: [
          { label: 'baylee.lofty.com', value: '1,240 visits this month', tag: 'LIVE', tagColor: '#16a34a' },
          { label: 'scottsdale-homes.baylee.com', value: '380 visits this month', tag: 'LIVE', tagColor: '#16a34a' },
        ],
      },
      {
        heading: 'Traffic & Conversion', layout: 'stats',
        items: [
          { label: 'Total visitors', value: 'this month', accent: '1,620', icon: '🌐' },
          { label: 'Lead captures', value: 'this month', accent: '14', icon: '🎯' },
          { label: 'Most viewed listing', value: '650 Maple St', accent: '47', icon: '👁️' },
        ],
      },
      {
        heading: 'Content Generated', layout: 'stats',
        items: [
          { label: 'Listing pages auto-created', value: 'this month', accent: '6', icon: '📄' },
          { label: 'Neighborhood guides', value: 'published', accent: '2', icon: '📍' },
          { label: 'Avg session duration', value: 'per visitor', accent: '3m12s', icon: '⏱️' },
        ],
      },
    ],
  },
  studio: {
    title: 'Agent Studio', icon: '🤖', accentColor: '#7c3aed', iconBg: '#ede9fe',
    sections: [
      {
        heading: 'Your Custom Agents', layout: 'leads',
        items: [
          { label: 'Luxury Buyer Qualifier', value: 'Filters leads > $800K budget', tag: 'ACTIVE', tagColor: '#16a34a' },
          { label: 'Seller Follow-Up Bot', value: 'Nurtures valuation requests', tag: 'ACTIVE', tagColor: '#16a34a' },
          { label: 'Open House Follow-Up', value: 'Draft — not deployed yet', tag: 'DRAFT', tagColor: '#f59e0b' },
        ],
      },
      {
        heading: 'Agent Performance', layout: 'stats',
        items: [
          { label: 'Luxury Qualifier leads filtered', value: 'this month', accent: '8', icon: '💎' },
          { label: 'Seller Bot responses sent', value: 'this month', accent: '5', icon: '📨' },
          { label: 'Avg response time', value: 'automated', accent: '<2m', icon: '⚡' },
        ],
      },
      {
        heading: 'Studio Activity', layout: 'list',
        items: [
          { label: 'Agents deployed', value: '2 active' },
          { label: 'Agents in draft', value: '1' },
          { label: 'Last edit', value: '2 days ago' },
        ],
      },
    ],
  },
}

function SectionContent({ section }: { section: AgentSection }) {
  if (section.layout === 'leads') {
    return (
      <div className="space-y-2.5">
        {section.items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
            <div>
              <p className="text-[13px] font-bold text-gray-900">{item.label}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.value}</p>
            </div>
            {item.tag && (
              <span className="ml-3 shrink-0 px-2.5 py-1 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase text-white" style={{ background: item.tagColor }}>
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (section.layout === 'appointments') {
    return (
      <div className="space-y-2.5">
        {section.items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-[56px]" style={{ background: i === 0 ? '#dbeafe' : '#f3e8ff' }}>
              <span className="text-[13px] font-bold" style={{ color: i === 0 ? '#1d4ed8' : '#7c3aed' }}>{item.time?.split(' ')[0]}</span>
              <span className="text-[9px] font-bold uppercase" style={{ color: i === 0 ? '#2563eb' : '#7c3aed' }}>{item.time?.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 truncate">{item.label}</p>
              <p className="text-[11px] text-gray-500 truncate">{item.value}</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        ))}
      </div>
    )
  }

  if (section.layout === 'stats') {
    return (
      <div className="space-y-2.5">
        {section.items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: '#f8fafc', borderColor: '#f1f5f9' }}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900">{item.label}</p>
              <p className="text-[11px] text-gray-500">{item.value}</p>
            </div>
            <span className="text-[15px] font-extrabold text-gray-800 shrink-0">{item.accent}</span>
          </div>
        ))}
      </div>
    )
  }

  if (section.layout === 'posts') {
    return (
      <div className="space-y-2.5">
        {section.items.map((item) => (
          <div key={item.label} className="flex items-start justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-[13px] font-bold text-gray-900 truncate">{item.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{item.value} · <span className="font-medium">{item.sub}</span></p>
            </div>
            {item.tag && (
              <span className="shrink-0 px-2.5 py-1 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase text-white" style={{ background: item.tagColor }}>
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // list (default)
  return (
    <div className="space-y-2.5">
      {section.items.map((item) => (
        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900">{item.label}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.value}</p>
          </div>
          {item.tag && (
            <span className="ml-3 shrink-0 px-2.5 py-1 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase text-white" style={{ background: item.tagColor }}>
              {item.tag}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function AgentModal({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const detail = AGENT_DETAIL[agentId]
  if (!detail) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(25,28,30,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[520px] bg-white flex flex-col overflow-hidden shadow-2xl" style={{ borderRadius: '24px 24px 24px 24px', maxHeight: '88vh' }}>

        {/* Sticky header */}
        <div className="bg-white px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ background: detail.iconBg }}>
                {detail.icon}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-[17px] leading-tight">{detail.title}</h2>
                <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Live agent data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-[18px] font-light"
            >
              ✕
            </button>
          </div>
          {/* Accent bar */}
          <div className="h-[3px] w-full rounded-full" style={{ background: detail.accentColor }} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-7" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
          {detail.sections.map((section) => (
            <div key={section.heading}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{section.heading}</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <SectionContent section={section} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-gray-100 text-center" style={{ background: 'rgba(247,249,251,0.85)', backdropFilter: 'blur(8px)' }}>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">Mock data for demo purposes</p>
        </div>

      </div>
    </div>
  )
}

export default function AIAgents({ onGoToBriefing, onGoToChat }: AIAgentsProps) {
  const [openAgent, setOpenAgent] = useState<string | null>(null)

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fb]">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Problem banner */}
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px' }}>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-[13.5px] mb-1">The Problem with AI Copilots Today</p>
              <p className="text-red-700 text-[12.5px] leading-relaxed">
                These 6 powerful agents live on their own page — siloed from your dashboard and morning workflow.
                The AI never proactively tells you which agent to use or when. Agents have to remember to go find them. They exist, but they don't act.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <p className="text-red-600 text-[12px] font-semibold">↓ Morning Briefing fixes this — the AI orchestrates all these agents for you</p>
                <button onClick={onGoToBriefing} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white hover:bg-blue-700 transition-colors" style={{ background: '#2563EB' }}>
                  See Morning Briefing →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero card */}
        <div className="relative overflow-hidden rounded-xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #131b2e 0%, #1e3a8a 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: '#2563eb', filter: 'blur(60px)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ background: 'rgba(180,197,255,0.15)', border: '1px solid rgba(180,197,255,0.25)', color: '#b4c5ff' }}>AI Copilots</span>
            <h2 className="text-[28px] font-bold tracking-tight leading-tight mb-2">Meet AI Copilots</h2>
            <p className="text-blue-200 text-[13.5px] leading-relaxed mb-6 font-light">AI Copilots brings your team to new heights with an advanced conversational assistant and powerful AI agents!</p>
            <button onClick={onGoToChat} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-blue-900 bg-white hover:bg-blue-50 transition-colors shadow-lg">
              + Chat with AI Assistant
            </button>
          </div>
        </div>

        {/* Active agents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-gray-900">Active Agents</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {ACTIVE_AGENTS.map((agent) => (
              <div key={agent.id} className="min-w-[240px] bg-white rounded-xl p-5 flex flex-col gap-4 shrink-0" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.06)', border: '1px solid #f1f5f9' }}>
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl" style={{ background: agent.color }}>{agent.icon}</div>
                  {agent.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#f0fdf4', color: '#15803d' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: '#eff6ff', color: '#1d4ed8' }}>PAUSED</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">{agent.title}</h4>
                  <p className="text-gray-500 text-[12px] mt-0.5">{agent.subtitle}</p>
                </div>
                <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider">{agent.stat}</span>
                  <button onClick={() => setOpenAgent(agent.id)} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    Launch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expand your team */}
        <div>
          <div className="mb-4">
            <h3 className="text-[18px] font-bold text-gray-900">Expand Your Team</h3>
            <p className="text-gray-500 text-[12.5px] mt-0.5">Deploy new intelligence to automate your workflow</p>
          </div>
          <div className="space-y-2.5">
            {DISCOVER_AGENTS.map((agent) => (
              <div key={agent.id} className="group flex items-center justify-between p-4 rounded-xl bg-white hover:bg-gray-50 transition-all" style={{ border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm">{agent.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-gray-900 text-[13.5px]">{agent.title}</h5>
                      {agent.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#fef9c3', color: '#92400e' }}>{agent.badge}</span>}
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">{agent.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setOpenAgent(agent.id)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-gray-500 border border-gray-200 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                  Launch →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Solution banner */}
        <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #131b2e 100%)' }}>
          <p className="text-[13.5px] leading-relaxed mb-4">
            <span style={{ color: '#93c5fd' }}>✦</span>{' '}
            <strong>Morning Briefing orchestrates ALL of these agents automatically</strong> — surfacing the right agent output at the right moment, without you having to find them.
          </p>
          <button onClick={onGoToBriefing} className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg text-[12.5px] font-semibold bg-white text-blue-800 hover:bg-blue-50 transition-colors">
            See it in action →
          </button>
        </div>

      </div>

      {openAgent && <AgentModal agentId={openAgent} onClose={() => setOpenAgent(null)} />}
    </div>
  )
}
