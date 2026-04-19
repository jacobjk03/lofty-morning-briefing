import insforge from '@/lib/insforge'
import { getHotLeads, getCriticalTransactions, getSmartPlans, getCRMSummary } from '@/lib/getData'
import { Lead, Transaction } from '@/lib/types'

type Plan = { name: string; status: string; issue: string; affectedLeads: string[]; last_run: string }
type Summary = { totalLeads: number; hotLeads: number; warmLeads: number; taskCount: number }

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours
const EDGE_FN_SLUG = 'morning-briefing'

function functionsUrl(): string | null {
  const base = process.env.INSFORGE_URL
  if (!base) return null
  // InsForge: https://{appKey}.{region}.insforge.app -> https://{appKey}.functions.insforge.app
  try {
    const u = new URL(base)
    const parts = u.hostname.split('.')
    if (parts.length < 2) return null
    const appKey = parts[0]
    return `https://${appKey}.functions.insforge.app/${EDGE_FN_SLUG}`
  } catch {
    return null
  }
}

function buildDbFallback(
  hotLeads: Lead[],
  criticalTxns: Transaction[],
  pausedPlans: Plan[],
  summary: Summary
) {
  const topLead = hotLeads[0]
  const criticalTxn = criticalTxns[0]
  const pausedPlan = pausedPlans[0]

  const briefingText = [
    `You have ${summary.hotLeads} high-interest lead${summary.hotLeads !== 1 ? 's' : ''} who need${summary.hotLeads === 1 ? 's' : ''} immediate attention.`,
    topLead ? `${topLead.name} (score ${topLead.score}) — ${topLead.activity[0]}.` : '',
    criticalTxn ? `The ${criticalTxn.name} closing is in ${criticalTxn.hours_until_deadline} hours with ${criticalTxn.openIssues[0] || 'open items'}.` : '',
    pausedPlan ? `Your ${pausedPlan.name} is paused due to an email bounce.` : '',
  ].filter(Boolean).join(' ')

  const priorities = [
    topLead && {
      id: '1', type: 'lead' as const, emoji: '🔥', badge: 'HIGH INTEREST', badgeColor: 'green' as const,
      title: `${topLead.name} · Score ${topLead.score}`,
      subtitle: topLead.activity[0] || 'High activity today',
      actions: ['Send Draft Text', 'View Lead →'],
    },
    criticalTxn && {
      id: '2', type: 'transaction' as const, emoji: '⏰', badge: 'DEADLINE ALERT', badgeColor: 'red' as const,
      title: `${criticalTxn.name} · ${criticalTxn.hours_until_deadline} hrs`,
      subtitle: criticalTxn.openIssues[0] || 'Review required',
      actions: ['Open Transaction', 'Resolve Note'],
    },
    pausedPlan && {
      id: '3', type: 'smartplan' as const, emoji: '⚡', badge: 'NEEDS ATTENTION', badgeColor: 'yellow' as const,
      title: `${pausedPlan.name} · Paused`,
      subtitle: pausedPlan.issue,
      actions: ['Fix Now', 'View Plan'],
    },
  ].filter(Boolean)

  return { briefingText, priorities, generatedAt: new Date().toISOString(), source: 'db-fallback' as const }
}

async function inlineGroq(
  hotLeads: Lead[],
  criticalTxns: Transaction[],
  pausedPlans: Plan[],
  summary: Summary
) {
  if (!process.env.GROQ_API_KEY) {
    return buildDbFallback(hotLeads, criticalTxns, pausedPlans, summary)
  }

  const prompt = `You are Lofty AI. Generate a morning briefing for real estate agent Baylee Rhoades.

LIVE CRM DATA FROM DATABASE:
- Total leads: ${summary.totalLeads} (${summary.hotLeads} hot, ${summary.warmLeads} warm)
- Hot leads: ${hotLeads.map(l => `${l.name} score ${l.score}: ${l.activity[0]}`).join(' | ')}
- Critical transactions: ${criticalTxns.map(t => `${t.name} in ${t.hours_until_deadline}hrs — ${t.openIssues[0] || 'on track'}`).join(' | ')}
- Paused smart plans: ${pausedPlans.map(p => `${p.name}: ${p.issue}`).join(' | ')}
- Tasks due today: ${summary.taskCount}

Return ONLY valid JSON (no markdown, no code fences):
{
  "briefingText": "2-3 sentences mentioning specific names and urgency",
  "priorities": [
    {"id":"1","type":"lead","emoji":"🔥","badge":"HIGH INTEREST","badgeColor":"green","title":"[top hot lead name] · Score [score]","subtitle":"[their top activity]","actions":["Send Draft Text","View Lead →"]},
    {"id":"2","type":"transaction","emoji":"⏰","badge":"DEADLINE ALERT","badgeColor":"red","title":"[critical transaction name] · [hours]hrs","subtitle":"[open issue]","actions":["Open Transaction","Resolve Note"]},
    {"id":"3","type":"smartplan","emoji":"⚡","badge":"NEEDS ATTENTION","badgeColor":"yellow","title":"[paused plan name] · Paused","subtitle":"[issue]","actions":["Fix Now","View Plan"]}
  ]
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`Groq ${response.status}`)
    const data = await response.json()
    const raw = data.choices[0].message.content
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    return { ...parsed, generatedAt: new Date().toISOString(), source: 'live-db' as const }
  } catch {
    return buildDbFallback(hotLeads, criticalTxns, pausedPlans, summary)
  }
}

type BriefingRow = {
  id: string
  brief: string | null
  data: any
  hot_leads_count: number
  urgent_tx_count: number
  model: string | null
  source: string | null
  created_at: string
}

async function readLatestBriefing(): Promise<BriefingRow | null> {
  try {
    const { data, error } = await insforge.database
      .from('briefings')
      .select()
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) {
      console.error('[briefing] read failed:', error.message || error)
      return null
    }
    return (data?.[0] as BriefingRow) ?? null
  } catch (e) {
    console.error('[briefing] read threw:', e)
    return null
  }
}

function rowToResponse(row: BriefingRow, cached: boolean) {
  // The edge function stores the full briefing payload (briefingText +
  // priorities + generatedAt) in `data`. Fall back to shaping it from the
  // flat columns if `data` is missing.
  const payload = row.data && typeof row.data === 'object' ? row.data : {}
  const briefingText: string = payload.briefingText ?? row.brief ?? ''
  const priorities = Array.isArray(payload.priorities) ? payload.priorities : []
  return {
    briefingText,
    priorities,
    generatedAt: payload.generatedAt ?? row.created_at,
    source: 'edge-function' as const,
    cached,
    createdAt: row.created_at,
    model: row.model,
  }
}

async function triggerEdgeFunction(): Promise<boolean> {
  const url = functionsUrl()
  const key = process.env.INSFORGE_API_KEY
  if (!url || !key) return false
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[briefing] edge fn invoke failed', res.status, body.slice(0, 300))
      return false
    }
    return true
  } catch (e) {
    console.error('[briefing] edge fn invoke threw:', e)
    return false
  }
}

export async function GET() {
  // 1. Try the pre-baked cache first.
  const cached = await readLatestBriefing()
  const now = Date.now()
  if (cached) {
    const age = now - new Date(cached.created_at).getTime()
    if (age <= MAX_AGE_MS) {
      console.log('[briefing] source=edge-function cached=true')
      return Response.json(rowToResponse(cached, true))
    }
    console.log('[briefing] cached row stale, refreshing via edge function')
  } else {
    console.log('[briefing] no cached row found, invoking edge function')
  }

  // 2. Cache miss or stale -> fire the edge function and re-read.
  const triggered = await triggerEdgeFunction()
  if (triggered) {
    const fresh = await readLatestBriefing()
    if (fresh) {
      const age = now - new Date(fresh.created_at).getTime()
      // Only treat it as a fresh edge-function result if it's newer than the cached row.
      const isNew = !cached || fresh.id !== cached.id || age < MAX_AGE_MS
      if (isNew) {
        console.log('[briefing] source=edge-function cached=false')
        return Response.json(rowToResponse(fresh, false))
      }
    }
  }

  // 3. Last resort: inline Groq call with local DB data.
  console.log('[briefing] source=inline-fallback (edge function unavailable)')
  try {
    const [hotLeads, criticalTxns, pausedPlans, summary] = await Promise.all([
      getHotLeads() as Promise<Lead[]>,
      getCriticalTransactions() as Promise<Transaction[]>,
      getSmartPlans() as Promise<Plan[]>,
      getCRMSummary(),
    ])
    const payload = await inlineGroq(hotLeads, criticalTxns, pausedPlans, summary)
    return Response.json(payload)
  } catch (e) {
    console.error('[briefing] inline fallback failed:', e)
    return Response.json({
      briefingText: 'Briefing temporarily unavailable.',
      priorities: [],
      generatedAt: new Date().toISOString(),
      source: 'error',
    }, { status: 200 })
  }
}
