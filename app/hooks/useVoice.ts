'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useVoice — thin wrapper around browser SpeechSynthesis with boundary events
 * so we can highlight/reveal caption words in sync with the voice.
 */
export type SpeechEvent = { word: string; charIndex: number }

export interface UseVoiceReturn {
  supported: boolean
  speaking: boolean
  speak: (text: string, opts?: { onBoundary?: (e: SpeechEvent) => void; onEnd?: () => void }) => void
  cancel: () => void
  voice: SpeechSynthesisVoice | null
}

const PREFERRED_VOICES = [
  // macOS / iOS premium female voices
  'Samantha', 'Allison', 'Ava', 'Serena', 'Zoe',
  // Google Chrome
  'Google UK English Female', 'Google US English',
  // Windows
  'Microsoft Zira', 'Microsoft Aria',
]

export function useVoice(): UseVoiceReturn {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setSupported(true)

    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const match = PREFERRED_VOICES
        .map((name) => voices.find((v) => v.name.includes(name)))
        .find(Boolean)
      setVoice(match || voices.find((v) => /en[-_]/i.test(v.lang)) || voices[0])
    }
    pick()
    window.speechSynthesis.onvoiceschanged = pick
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string, opts?: { onBoundary?: (e: SpeechEvent) => void; onEnd?: () => void }) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1.02
      utter.pitch = 1.0
      utter.volume = 1.0
      if (voice) utter.voice = voice
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => {
        setSpeaking(false)
        opts?.onEnd?.()
      }
      utter.onerror = () => setSpeaking(false)
      utter.onboundary = (ev: SpeechSynthesisEvent) => {
        if (ev.name !== 'word') return
        const start = ev.charIndex
        const raw = text.slice(start).split(/\s/)[0] || ''
        opts?.onBoundary?.({ word: raw, charIndex: start })
      }
      utterRef.current = utter
      window.speechSynthesis.speak(utter)
    },
    [voice]
  )

  // Cancel on unmount
  useEffect(() => () => cancel(), [cancel])

  return { supported, speaking, speak, cancel, voice }
}
