import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lofty Morning Briefing',
  description: 'AI-native CRM reimagined — GlobeHack 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
