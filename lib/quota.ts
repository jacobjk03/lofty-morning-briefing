import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

// Hard-cap total AI + ElevenLabs calls per browser (per cookie).
// Override with AI_QUOTA_LIMIT env var. Default = 1.
// Briefing is deliberately NOT gated so the dashboard still paints on first load.
const LIMIT = Number(process.env.AI_QUOTA_LIMIT ?? 1)

// Gate only runs in production (Vercel). Local dev stays unlimited so the
// team can iterate. Force-enable locally by setting AI_QUOTA_FORCE=1.
const GATE_ENABLED =
  process.env.AI_QUOTA_FORCE === '1' || process.env.NODE_ENV === 'production'

// In-memory — resets on server restart. Fine for a hackathon demo.
const usage = new Map<string, number>()

const COOKIE_NAME = 'lofty_uid'
const COOKIE_MAX_AGE_DAYS = 90

async function getOrCreateUid(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(COOKIE_NAME)?.value
  if (existing) return existing
  const uid = randomUUID()
  jar.set(COOKIE_NAME, uid, {
    path: '/',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    sameSite: 'lax',
    // Leave httpOnly false so client JS can read-only-inspect if needed.
    httpOnly: false,
  })
  return uid
}

export interface QuotaResult {
  ok: boolean
  used: number
  limit: number
  uid: string
}

/**
 * Check the visitor's remaining quota WITHOUT incrementing. Use this for
 * sub-calls (e.g. live-pointers during a call) where the parent request
 * already consumed a quota slot.
 */
export async function peekQuota(): Promise<QuotaResult> {
  if (!GATE_ENABLED) return { ok: true, used: 0, limit: LIMIT, uid: 'dev' }
  const uid = await getOrCreateUid()
  const used = usage.get(uid) ?? 0
  return { ok: used < LIMIT, used, limit: LIMIT, uid }
}

/**
 * Atomically check + increment. Returns `{ ok: false }` if already over the
 * limit and should be rejected with 429.
 */
export async function consumeQuota(): Promise<QuotaResult> {
  if (!GATE_ENABLED) return { ok: true, used: 0, limit: LIMIT, uid: 'dev' }
  const uid = await getOrCreateUid()
  const used = usage.get(uid) ?? 0
  if (used >= LIMIT) {
    return { ok: false, used, limit: LIMIT, uid }
  }
  usage.set(uid, used + 1)
  return { ok: true, used: used + 1, limit: LIMIT, uid }
}

/**
 * Standard 429 response body + status. Consistent shape for the client to key
 * off of (`error === 'quota_exceeded'` triggers the BYO-key overlay).
 */
export function quotaExceededResponse(q: QuotaResult): NextResponse {
  return NextResponse.json(
    {
      error: 'quota_exceeded',
      message:
        'You\'ve used the free demo call on this browser. Add your own Groq / ElevenLabs API keys in .env.local to keep testing.',
      used: q.used,
      limit: q.limit,
    },
    { status: 429 },
  )
}
