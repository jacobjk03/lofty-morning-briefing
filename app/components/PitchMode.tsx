export default function PitchMode() {
  const rows = [
    { label: 'First action', before: '8–12 clicks', after: '1 AI briefing' },
    { label: 'AI location', before: 'Hidden sidebar', after: 'Front and center' },
    { label: 'Prioritization', before: 'Manual', after: 'Automatic' },
    { label: 'Lead reasoning', before: 'Score only', after: 'Full explanation' },
    { label: 'Cross-surface context', before: 'Siloed', after: 'Unified' },
  ]

  const metrics = [
    { icon: '📬', label: 'Morning Briefing open rate', target: '>80%' },
    { icon: '⚡', label: 'Time-to-first-action', target: '<60 seconds' },
    { icon: '🤝', label: 'AI action acceptance rate', target: '>40%' },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#f3f4f8]">
      <div className="max-w-4xl mx-auto px-8 py-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div
            className="w-8 h-8 rounded-lg font-extrabold text-white flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}
          >
            L
          </div>
          <span className="font-bold text-ink-800 text-sm tracking-tight">lofty</span>
        </div>

        {/* Headline */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-red-200">
            ⚠️ The Problem
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight text-ink-900 mb-4">
            Agents spend{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
            >
              74% of time
            </span>
            <br />on admin, not selling
          </h1>
          <p className="text-ink-600 text-lg max-w-xl">
            Lofty has all the data. The Morning Briefing puts it front and center — one AI summary, immediate action.
          </p>
        </div>

        {/* Comparison table */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">Before vs After</h2>
          <div className="rounded-2xl overflow-hidden border border-ink-200 shadow-card bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50">
                  <th className="px-5 py-3 text-left text-ink-500 font-semibold text-xs uppercase tracking-wide w-1/3">
                    Dimension
                  </th>
                  <th className="px-5 py-3 text-left text-red-500 font-semibold text-xs uppercase tracking-wide w-1/3">
                    ❌ Before
                  </th>
                  <th className="px-5 py-3 text-left text-emerald-600 font-semibold text-xs uppercase tracking-wide w-1/3">
                    ✅ After
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-t border-ink-100 hover:bg-ink-50 transition-colors ${
                      i % 2 === 0 ? 'bg-white' : 'bg-ink-50/50'
                    }`}
                  >
                    <td className="px-5 py-4 text-ink-700 font-medium">{row.label}</td>
                    <td className="px-5 py-4 text-red-500">{row.before}</td>
                    <td className="px-5 py-4 text-emerald-600 font-semibold">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Success metrics */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-widest mb-4">
            Success Metrics We&apos;d Measure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-5 border border-ink-200 bg-white hover:border-blue-300 hover:shadow-card-hover transition-all"
              >
                <div className="text-2xl mb-3">{m.icon}</div>
                <p className="text-ink-600 text-sm leading-snug mb-2">{m.label}</p>
                <div className="text-lg font-black text-blue-600">
                  Target: {m.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="border-t border-ink-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <p className="text-ink-400 text-sm">Built at GlobeHack 2026 · ASU ACM × Global Career Network</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-ink-500 text-xs">Live prototype · Next.js 15 + Lofty AI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
