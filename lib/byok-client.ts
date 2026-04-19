'use client'

/**
 * Client-side BYOK store + fetch wrapper.
 *
 * Two ways for a visitor to bypass the 1-call demo quota:
 *   1. Admin password — us + the judges. Validated server-side against
 *      `ADMIN_PASSWORD` env. When valid, server uses its own keys.
 *   2. Bring-your-own Groq + ElevenLabs keys. Visitor pays their own tokens.
 *
 * Keys live in localStorage so the user only enters them once per browser.
 */

const LS_ADMIN = 'lofty_admin'
const LS_GROQ = 'lofty_byok_groq'
const LS_EL = 'lofty_byok_elevenlabs'

export const QUOTA_EVENT = 'lofty:quota-exceeded'
export const BYOK_SAVED_EVENT = 'lofty:byok-saved'
export const BYOK_OPEN_EVENT = 'lofty:open-byok'

/**
 * Programmatically open the BYOK / admin modal (e.g. from a nav button).
 * Optional detail picks which tab to surface first.
 */
export function openByokModal(tab?: 'admin' | 'byok'): void {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(BYOK_OPEN_EVENT, { detail: { tab } }))
  } catch {
    /* ignore */
  }
}

/**
 * Which credentials, if any, are currently saved in this browser.
 * Used by the nav to show a "Unlocked" chip instead of "Unlock".
 */
export function getCredsStatus(): 'admin' | 'byok' | 'none' {
  if (typeof window === 'undefined') return 'none'
  const { admin, groq, elevenlabs } = getStoredCreds()
  if (admin) return 'admin'
  if (groq || elevenlabs) return 'byok'
  return 'none'
}

export interface StoredCreds {
  admin: string
  groq: string
  elevenlabs: string
}

function readLS(key: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

export function getStoredCreds(): StoredCreds {
  return {
    admin: readLS(LS_ADMIN),
    groq: readLS(LS_GROQ),
    elevenlabs: readLS(LS_EL),
  }
}

export function setStoredCreds(next: Partial<StoredCreds>): void {
  if (typeof window === 'undefined') return
  try {
    if (next.admin !== undefined) window.localStorage.setItem(LS_ADMIN, next.admin)
    if (next.groq !== undefined) window.localStorage.setItem(LS_GROQ, next.groq)
    if (next.elevenlabs !== undefined) window.localStorage.setItem(LS_EL, next.elevenlabs)
    window.dispatchEvent(new Event(BYOK_SAVED_EVENT))
  } catch {
    /* ignore */
  }
}

export function clearStoredCreds(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LS_ADMIN)
    window.localStorage.removeItem(LS_GROQ)
    window.localStorage.removeItem(LS_EL)
    window.dispatchEvent(new Event(BYOK_SAVED_EVENT))
  } catch {
    /* ignore */
  }
}

/**
 * Build the headers we attach to every gated request.
 */
function byokHeaders(): Record<string, string> {
  const creds = getStoredCreds()
  const h: Record<string, string> = {}
  if (creds.admin) h['x-admin-password'] = creds.admin
  if (creds.groq) h['x-groq-key'] = creds.groq
  if (creds.elevenlabs) h['x-elevenlabs-key'] = creds.elevenlabs
  return h
}

/**
 * Drop-in replacement for `fetch` that:
 *   - injects admin password / BYOK headers from localStorage
 *   - dispatches a `lofty:quota-exceeded` window event on 429 so a
 *     global modal can pop open
 */
export async function byoFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {})
  const extras = byokHeaders()
  for (const [k, v] of Object.entries(extras)) headers.set(k, v)
  const res = await fetch(url, { ...init, headers })
  if (res.status === 429) {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(QUOTA_EVENT))
      }
    } catch {
      /* ignore */
    }
  }
  return res
}
