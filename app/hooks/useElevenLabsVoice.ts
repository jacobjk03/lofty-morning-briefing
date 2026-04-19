'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { byoFetch } from '@/lib/byok-client'

export type SpeechEvent = { charIndex: number }

export interface UseVoiceReturn {
  supported: boolean
  speaking: boolean
  speak: (text: string, opts?: { onBoundary?: (e: SpeechEvent) => void; onEnd?: () => void }) => void
  cancel: () => void
  pause: () => void
  resume: () => void
  voice: null
}

export function useElevenLabsVoice(): UseVoiceReturn {
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const urlRef = useRef<string | null>(null)

  const cancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setSpeaking(false)
  }, [])

  const speak = useCallback(async (
    text: string,
    opts?: { onBoundary?: (e: SpeechEvent) => void; onEnd?: () => void }
  ) => {
    cancel()

    try {
      const res = await byoFetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('TTS failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      urlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onloadedmetadata = () => {
        const duration = audio.duration || 30
        const charsPerSec = text.length / duration

        timerRef.current = setInterval(() => {
          if (!audioRef.current) return
          const charIndex = Math.floor(audioRef.current.currentTime * charsPerSec)
          opts?.onBoundary?.({ charIndex: Math.min(charIndex, text.length) })
        }, 80)
      }

      audio.onplay = () => setSpeaking(true)

      audio.onended = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setSpeaking(false)
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current)
          urlRef.current = null
        }
        opts?.onEnd?.()
      }

      audio.onerror = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setSpeaking(false)
        opts?.onEnd?.()
      }

      await audio.play()
    } catch {
      setSpeaking(false)
      opts?.onEnd?.()
    }
  }, [cancel])

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      setSpeaking(false)
    }
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && urlRef.current) {
      audioRef.current.play().catch(() => {})
      setSpeaking(true)
    }
  }, [])

  useEffect(() => () => cancel(), [cancel])

  return { supported: true, speaking, speak, cancel, pause, resume, voice: null }
}
