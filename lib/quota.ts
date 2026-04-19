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
    httpOnly: false,
  })
  return uid
}

export type Provider = 'groq' | 'elevenlabs'

export interface ResolvedKey {
  key: string | undefined
  source: 'byo' | 'admin' | 'server' | 'none'
}

export interface ResolvedKeys {
  groq: ResolvedKey
  elevenlabs: ResolvedKey
  adminUnlocked: boolean
}

function isAdmin(req?: Request): boolean {
  if (!req) return false
  const expected = (process.env.ADMIN_PASSWORD || '').trim()
  if (!expected) return false
  const supplied = (req.headers.get('x-admin-password') || '').trim()
  return supplied.length > 0 && supplied === expected
}

/**
 * Pick which key to use for each provider, in priority order:
 *   1. Valid admin password → use server key (judges / demo team)
 *   2. Visitor-supplied BYO key (x-groq-key / x-elevenlabs-key)
 *   3. Server env var fallback
 */
export function resolveKeys(req?: Request): ResolvedKeys {
  const admin = isAdmin(req)
  const hGroq = (req?.headers.get('x-groq-key') || '').trim()
  const hEl = (req?.headers.get('x-elevenlabs-key') || '').trim()
  const envGroq = process.env.GROQ_API_KEY
  const envEl = process.env.ELEVENLABS_API_KEY

  const groq: ResolvedKey = admin && envGroq
    ? { key: envGroq, source: 'admin' }
    : hGroq
      ? { key: hGroq, source: 'byo' }
      : envGroq
        ? { key: envGroq, source: 'server' }
        : { key: undefined, source: 'none' }

  const elevenlabs: ResolvedKey = admin && envEl
    ? { key: envEl, source: 'admin' }
    : hEl
      ? { key: hEl, source: 'byo' }
      : envEl
        ? { key: envEl, source: 'server' }
        : { key: undefined, source: 'none' }

  return { groq, elevenlabs, adminUnlocked: admin }
}

export interface QuotaResult {
  ok: boolean
  used: number
  limit: number
  uid: string
  keys: ResolvedKeys
}

/**
 * Atomic check + increment. Bypasses the quota entirely if the request
 * carries a valid admin password OR a visitor-supplied key for the
 * provider this route needs (they're paying their own tokens).
 *
 * Pass the `Request` plus the provider the route will use so we know
 * which BYO key matters for this call.
 */
export async function consumeQuota(
  req?: Request,
  provider: Provider = 'groq',
): Promise<QuotaResult> {
  const keys = resolveKeys(req)
  const byoOrAdmin =
    keys.adminUnlocked ||
    (provider === 'groq' ? keys.groq.source === 'byo' : keys.elevenlabs.source === 'byo')
  if (byoOrAdmin) {
    return { ok: true, used: 0, limit: LIMIT, uid: keys.adminUnlocked ? 'admin' : 'byo', keys }
  }
  if (!GATE_ENABLED) return { ok: true, used: 0, limit: LIMIT, uid: 'dev', keys }
  const uid = await getOrCreateUid()
  const used = usage.get(uid) ?? 0
  if (used >= LIMIT) return { ok: false, used, limit: LIMIT, uid, keys }
  usage.set(uid, used + 1)
  return { ok: true, used: used + 1, limit: LIMIT, uid, keys }
}

/**
 * Check remaining quota WITHOUT incrementing (for sub-calls like
 * live-pointers during a call the parent already paid for).
 */
export async function peekQuota(req?: Request, provider: Provider = 'groq'): Promise<QuotaResult> {
  const keys = resolveKeys(req)
  const byoOrAdmin =
    keys.adminUnlocked ||
    (provider === 'groq' ? keys.groq.source === 'byo' : keys.elevenlabs.source === 'byo')
  if (byoOrAdmin) {
    return { ok: true, used: 0, limit: LIMIT, uid: keys.adminUnlocked ? 'admin' : 'byo', keys }
  }
  if (!GATE_ENABLED) return { ok: true, used: 0, limit: LIMIT, uid: 'dev', keys }
  const uid = await getOrCreateUid()
  const used = usage.get(uid) ?? 0
  return { ok: used < LIMIT, used, limit: LIMIT, uid, keys }
}

/**
 * Standard 429 shape. The client keys off `error === 'quota_exceeded'`
 * to open the BYO-key / admin-password modal.
 */
export function quotaExceededResponse(q: QuotaResult): NextResponse {
  return NextResponse.json(
    {
      error: 'quota_exceeded',
      message:
        'You\'ve used the free demo call on this browser. Enter the demo password OR bring your own Groq + ElevenLabs keys to keep going.',
      used: q.used,
      limit: q.limit,
    },
    { status: 429 },
  )
}
