'use client'
import NavBar from './NavBar'

const leads = [
  { name: 'Scott Hayes', score: 92, color: '#2563EB' },
  { name: 'Maria Gonzalez', score: 78, color: '#059669' },
  { name: 'David Kim', score: 61, color: '#d97706' },
  { name: 'Amy Chen', score: 44, color: '#dc2626' },
]

const transactions = [
  { name: 'Johnson — 650 Maple St', stage: 'Closing', deadline: 'Apr 21', amount: '$485K', alert: true },
  { name: 'Williams — 1842 Camelback', stage: 'Inspection', deadline: 'Apr 25', amount: '$520K', alert: false },
  { name: 'Chen — 234 Desert View', stage: 'Pending', deadline: 'May 2', amount: '$389K', alert: false },
  { name: 'Martinez — 88 Sunridge', stage: 'Offer', deadline: 'Apr 22', amount: '$610K', alert: true },
]

const hotSheets = [
  { name: 'Scottsdale 3bd+ Under $800K', updates: 14 },
  { name: 'Phoenix New Construction', updates: 7 },
  { name: 'Tempe Condos Under $400K', updates: 23 },
  { name: 'Paradise Valley Luxury', updates: 3 },
  { name: 'Mesa Investment Properties', updates: 11 },
]

const listings = [
  { address: '650 Maple St, Scottsdale', price: '$749,000', bed: 4, bath: 3, status: 'Active' },
  { address: '1842 Camelback Rd, Phoenix', price: '$520,000', bed: 3, bath: 2, status: 'Showing' },
  { address: '234 Desert View Dr, Tempe', price: '$389,000', bed: 2, bath: 2, status: 'Active' },
]

export default function BeforeScreen() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      <NavBar />

      {/* Yellow warning banner */}
      <div className="bg-amber-400 px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-amber-900 shrink-0">
        <span>⚠️ 47% — You have unfinished setup tasks</span>
        <button className="bg-amber-700 text-white px-3 py-0.5 rounded text-xs hover:bg-amber-800 transition-colors">
          Go
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Greeting row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-800">👋 Good Afternoon, Baylee!</h1>
              <button className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 flex items-center gap-1 hover:bg-gray-50">
                My Dashboard
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 flex items-center gap-1 hover:bg-gray-50">
                Today&apos;s Priorities
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500">Apr 18, 2026</div>
          </div>

          {/* Widget grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* New Updates */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">New Updates</h3>
                <span className="text-xs text-blue-600 font-medium">2</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <div className="w-10 h-10 bg-blue-200 rounded flex-shrink-0 flex items-center justify-center text-lg">🏠</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Q2 Lead Routing Update</p>
                    <p className="text-xs text-gray-500">New smart assignment rules — click to review</p>
                  </div>
                </div>
                <div className="flex gap-2 p-2 bg-purple-50 rounded border border-purple-100">
                  <div className="w-10 h-10 bg-purple-200 rounded flex-shrink-0 flex items-center justify-center text-lg">✨</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">AI Copilot 2.0 Released</p>
                    <p className="text-xs text-gray-500">Enhanced lead scoring and drafts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's New Leads */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Today&apos;s New Leads</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">23 total</span>
              </div>
              <div className="text-xs text-amber-600 mb-2 font-medium">⚠️ 12 untouched</div>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div key={lead.name} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 truncate flex-1">{lead.name}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${lead.score}%`, background: lead.color }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: lead.color }}>{lead.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Today&apos;s Opportunities</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-red-50 rounded border border-red-100">
                  <span className="text-xs text-red-700 font-medium">🔥 High Interest</span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">3</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-medium">🏡 Likely Sellers</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">5</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-blue-50 rounded border border-blue-100">
                  <span className="text-xs text-blue-700 font-medium">↩ Back to Site</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">12</span>
                </div>
              </div>
            </div>

            {/* Need Keep In Touch */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Need Keep In Touch</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-pink-50 rounded border border-pink-100">
                  <span className="text-xs text-pink-700 font-medium">🎂 Birthday</span>
                  <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">8</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-orange-50 rounded border border-orange-100">
                  <span className="text-xs text-orange-700 font-medium">📞 Follow-Up Due</span>
                  <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">3</span>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Transactions</h3>
                <div className="flex gap-1">
                  <span className="text-xs text-red-600 font-medium">3 near deadline</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">2 expired</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <div
                    key={tx.name}
                    className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                      tx.alert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-medium ${tx.alert ? 'text-red-700' : 'text-gray-700'}`}>{tx.name}</span>
                      <span className="text-gray-500">{tx.stage} · {tx.deadline}</span>
                    </div>
                    <span className={`font-bold ${tx.alert ? 'text-red-600' : 'text-gray-600'}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Today&apos;s Tasks</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Call', count: 4, icon: '📞', color: 'blue' },
                  { label: 'Text', count: 2, icon: '💬', color: 'emerald' },
                  { label: 'Email', count: 1, icon: '📧', color: 'purple' },
                  { label: 'Other', count: 3, icon: '📋', color: 'orange' },
                ].map((task) => (
                  <div
                    key={task.label}
                    className={`flex items-center gap-1.5 p-1.5 rounded border bg-${task.color}-50 border-${task.color}-100`}
                  >
                    <span>{task.icon}</span>
                    <span className={`text-xs text-${task.color}-700 font-medium`}>{task.label}</span>
                    <span className={`ml-auto text-xs font-bold text-${task.color}-700`}>{task.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Appointments/Showings</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">23 total</span>
              </div>
              <div className="text-xs text-amber-600 font-medium mb-2">12 Incomplete</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
                  <span className="text-gray-700 font-medium">Martinez — 1842 Camelback</span>
                  <span className="text-blue-600 font-medium">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
                  <span className="text-gray-700 font-medium">Roberts — 650 Maple St</span>
                  <span className="text-blue-600 font-medium">4:30 PM</span>
                </div>
              </div>
            </div>

            {/* My Listings */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">My Listings</h3>
              <div className="space-y-1.5">
                {listings.map((l) => (
                  <div key={l.address} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-sm flex-shrink-0">🏠</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{l.address}</p>
                      <p className="text-xs text-gray-500">{l.price} · {l.bed}bd/{l.bath}ba</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{l.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Sheets */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Hot Sheets</h3>
              <div className="space-y-1.5">
                {hotSheets.map((hs) => (
                  <div key={hs.name} className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-200">
                    <span className="text-xs text-gray-700 truncate flex-1">{hs.name}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-2">{hs.updates}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar — icon only */}
        <div className="w-12 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4 shrink-0">
          {['🔔', '📊', '⚙️', '🔍', '💡', '❓'].map((icon, i) => (
            <button
              key={i}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-base transition-colors"
              title={['Notifications', 'Analytics', 'Settings', 'Search', 'Tips', 'Help'][i]}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Red label overlay */}
      <div className="fixed bottom-16 left-4 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg max-w-xs z-40">
        ⚠️ Agent must prioritize manually — 8–12 clicks before value
      </div>
    </div>
  )
}
