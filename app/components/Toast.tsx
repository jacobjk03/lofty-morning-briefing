'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true)
      setTimeout(onClose, 300)
    }, 2700)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 ${
        leaving ? 'opacity-0 translate-x-16' : 'opacity-100 translate-x-0'
      }`}
      style={{ animation: leaving ? '' : 'toastIn 0.3s ease forwards' }}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  )
}
