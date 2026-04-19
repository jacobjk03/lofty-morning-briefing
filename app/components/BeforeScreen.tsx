'use client'
import {
  BellIcon,
  ChartBarIcon,
  GearIcon,
  MagnifyingGlassIcon,
  LightbulbIcon,
  QuestionIcon,
  CaretDownIcon,
  WarningIcon,
  FlameIcon,
  HouseIcon,
  EnvelopeIcon,
  ChatCircleIcon,
  PhoneIcon,
  ClipboardTextIcon,
  TrendUpIcon,
  GiftIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react'

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
    <div className="flex flex-col h-full overflow-hidden bg-[#f3f4f8]">
      {/* Lofty-style top nav (minimal mimic) */}
      <div className="bg-white border-b border-ink-200 px-4 py-2.5 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
            <span className="text-white font-black text-[11px]">L</span>
          </div>
          <span className="font-bold text-ink-900 text-[13px] tracking-tight">lofty</span>
        </div>
        <div className="flex items-center gap-5 text-[12.5px] font-medium text-ink-700">
          <span>CRM</span>
          <span>Sales</span>
          <span>Marketing</span>
          <span>Content</span>
          <span>Automation</span>
          <span>Reporting</span>
          <span className="flex items-center gap-1">More <CaretDownIcon size={12} weight="bold" /></span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-ink-400 text-xs">
          <MagnifyingGlassIcon size={16} weight="regular" />
          <div className="w-7 h-7 rounded-pill bg-ink-200" />
        </div>
      </div>

      {/* Setup nag banner */}
      <div className="bg-amber-100 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-[11.5px] font-semibold text-amber-900 shrink-0">
        <span className="flex items-center gap-2">
          <WarningIcon size={14} weight="fill" />
          47% — You have unfinished setup tasks
        </span>
        <button className="bg-amber-700 text-white px-3 py-0.5 rounded-md text-[11px] hover:bg-amber-800">Go</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Greeting row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[15px] font-semibold text-ink-800 tracking-tight">Good afternoon, Baylee</h1>
              <button className="text-[11px] text-ink-500 border border-ink-300 rounded-md px-2 h-6 flex items-center gap-1 hover:bg-ink-50">
                My Dashboard
                <CaretDownIcon size={12} weight="regular" />
              </button>
              <button className="text-[11px] text-ink-500 border border-ink-300 rounded-md px-2 h-6 flex items-center gap-1 hover:bg-ink-50">
                Today&apos;s Priorities
                <CaretDownIcon size={12} weight="regular" />
              </button>
            </div>
            <div className="text-[11px] text-ink-400 tabular-nums">Apr 18, 2026</div>
          </div>

          {/* Widget grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* New Updates */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2">New Updates</h3>
                <span className="text-[10px] text-blue-600 font-medium">2</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex-shrink-0 flex items-center justify-center">
                    <HouseIcon size={15} weight="regular" className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-ink-800 leading-tight">Q2 Lead Routing Update</p>
                    <p className="text-[10.5px] text-ink-500 mt-0.5">New smart assignment rules</p>
                  </div>
                </div>
                <div className="flex gap-2 p-2 bg-indigo-50 rounded-md border border-indigo-100">
                  <div className="w-8 h-8 bg-indigo-100 rounded-md flex-shrink-0 flex items-center justify-center">
                    <TrendUpIcon size={15} weight="regular" className="text-indigo-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-ink-800 leading-tight">AI Copilot 2.0 Released</p>
                    <p className="text-[10.5px] text-ink-500 mt-0.5">Enhanced lead scoring and drafts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's New Leads */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2">Today&apos;s New Leads</h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-pill font-semibold">23 total</span>
              </div>
              <div className="text-[10.5px] text-amber-600 mb-1.5 font-semibold">⚠ 12 untouched</div>
              <div className="space-y-1.5">
                {leads.map((lead) => (
                  <div key={lead.name} className="flex items-center justify-between">
                    <span className="text-[11px] text-ink-700 truncate flex-1">{lead.name}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <div className="w-14 h-1 bg-ink-200 rounded-pill overflow-hidden">
                        <div className="h-full rounded-pill" style={{ width: `${lead.score}%`, background: lead.color }} />
                      </div>
                      <span className="text-[10.5px] font-bold tabular-nums" style={{ color: lead.color }}>{lead.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Opportunities */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2 mb-2">Today&apos;s Opportunities</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-red-50 rounded-md border border-red-100">
                  <span className="text-[11px] text-red-700 font-medium inline-flex items-center gap-1.5">
                    <FlameIcon size={11} weight="fill" /> High Interest
                  </span>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-pill">3</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded-md border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1.5">
                    <HouseIcon size={11} weight="regular" /> Likely Sellers
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-pill">5</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-blue-50 rounded-md border border-blue-100">
                  <span className="text-[11px] text-blue-700 font-medium inline-flex items-center gap-1.5">
                    <ArrowsClockwiseIcon size={11} weight="regular" /> Back to Site
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-pill">12</span>
                </div>
              </div>
            </div>

            {/* Keep In Touch */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2 mb-2">Need Keep In Touch</h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-pink-50 rounded-md border border-pink-100">
                  <span className="text-[11px] text-pink-700 font-medium inline-flex items-center gap-1.5">
                    <GiftIcon size={11} weight="regular" /> Birthday
                  </span>
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded-pill">8</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-orange-50 rounded-md border border-orange-100">
                  <span className="text-[11px] text-orange-700 font-medium inline-flex items-center gap-1.5">
                    <PhoneIcon size={11} weight="regular" /> Follow-Up Due
                  </span>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-pill">3</span>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2">Transactions</h3>
                <div className="flex gap-1 text-[10px]">
                  <span className="text-red-600 font-semibold">3 near deadline</span>
                  <span className="text-ink-300">·</span>
                  <span className="text-ink-500">2 expired</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <div key={tx.name} className={`flex items-center justify-between p-1.5 rounded-md border text-[10.5px] ${tx.alert ? 'bg-red-50 border-red-200' : 'bg-ink-50 border-ink-200'}`}>
                    <div className="flex flex-col leading-tight">
                      <span className={`font-medium ${tx.alert ? 'text-red-700' : 'text-ink-700'}`}>{tx.name}</span>
                      <span className="text-ink-400">{tx.stage} · {tx.deadline}</span>
                    </div>
                    <span className={`font-bold tabular-nums ${tx.alert ? 'text-red-600' : 'text-ink-600'}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2 mb-2">Today&apos;s Tasks</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Call', count: 4, Icon: PhoneIcon, color: 'blue' },
                  { label: 'Text', count: 2, Icon: ChatCircleIcon, color: 'emerald' },
                  { label: 'Email', count: 1, Icon: EnvelopeIcon, color: 'indigo' },
                  { label: 'Other', count: 3, Icon: ClipboardTextIcon, color: 'orange' },
                ].map(({ label, count, Icon, color }) => (
                  <div key={label} className={`flex items-center gap-1.5 p-1.5 rounded-md border bg-${color}-50 border-${color}-100`}>
                    <Icon size={11} weight="regular" className={`text-${color}-700`} />
                    <span className={`text-[10.5px] text-${color}-700 font-medium`}>{label}</span>
                    <span className={`ml-auto text-[10.5px] font-bold text-${color}-700 tabular-nums`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2">Appointments</h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-pill font-semibold">23 total</span>
              </div>
              <div className="text-[10.5px] text-amber-600 font-semibold mb-1.5">12 Incomplete</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 bg-ink-50 rounded-md border border-ink-200 text-[10.5px]">
                  <span className="text-ink-700 font-medium">Martinez — 1842 Camelback</span>
                  <span className="text-blue-600 font-semibold tabular-nums">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-ink-50 rounded-md border border-ink-200 text-[10.5px]">
                  <span className="text-ink-700 font-medium">Roberts — 650 Maple St</span>
                  <span className="text-blue-600 font-semibold tabular-nums">4:30 PM</span>
                </div>
              </div>
            </div>

            {/* Listings */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2 mb-2">My Listings</h3>
              <div className="space-y-1.5">
                {listings.map((l) => (
                  <div key={l.address} className="flex items-center gap-2 p-1.5 bg-ink-50 rounded-md border border-ink-200">
                    <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <HouseIcon size={14} weight="regular" className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10.5px] font-medium text-ink-800 truncate">{l.address}</p>
                      <p className="text-[10px] text-ink-500">{l.price} · {l.bed}bd/{l.bath}ba</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold">{l.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Sheets */}
            <div className="bg-white rounded-md border border-ink-200 p-3 shadow-sm">
              <h3 className="text-[10.5px] font-bold text-ink-700 uppercase tracking-wider2 mb-2">Hot Sheets</h3>
              <div className="space-y-1.5">
                {hotSheets.map((hs) => (
                  <div key={hs.name} className="flex items-center justify-between p-1.5 bg-ink-50 rounded-md border border-ink-200">
                    <span className="text-[10.5px] text-ink-700 truncate flex-1">{hs.name}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-pill ml-2 tabular-nums">{hs.updates}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail — unlabeled icons */}
        <div className="w-11 bg-white border-l border-ink-200 flex flex-col items-center py-3 gap-3 shrink-0">
          {[BellIcon, ChartBarIcon, GearIcon, MagnifyingGlassIcon, LightbulbIcon, QuestionIcon].map((Icon, i) => (
            <button
              key={i}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500 transition-colors"
            >
              <Icon size={16} weight="regular" />
            </button>
          ))}
        </div>
      </div>

      {/* Red overlay label */}
      <div className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 bg-ink-900 text-white text-[11px] font-semibold px-3 py-2 rounded-md shadow-card border border-ink-800">
        <WarningIcon size={14} weight="fill" className="text-red-400" />
        8–12 clicks before value
      </div>
    </div>
  )
}
