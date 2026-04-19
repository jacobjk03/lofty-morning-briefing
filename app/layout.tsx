import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lofty Morning Briefing',
  description: 'AI-native CRM reimagined — GlobeHack 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
