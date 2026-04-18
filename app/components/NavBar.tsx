'use client'
import LoftyLogo from './LoftyLogo'

const NAV_ITEMS = ['CRM', 'Sales', 'Marketing', 'Content', 'Automation', 'Reporting']

interface NavBarProps {
  minimal?: boolean
}

export default function NavBar({ minimal }: NavBarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <LoftyLogo size={30} />
          <span className="font-bold text-gray-800 text-sm tracking-tight">lofty</span>
        </div>
        {!minimal && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                {item}
              </button>
            ))}
            <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1">
              More
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity">
          <span>✦</span> AI Copilots
        </button>
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
          BR
        </div>
      </div>
    </nav>
  )
}
