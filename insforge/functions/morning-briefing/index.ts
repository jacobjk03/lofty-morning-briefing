// InsForge Edge Function: morning-briefing
// Runtime: Deno Subhosting. No npm imports — use fetch only.
//
// Responsibilities:
//   1. Read leads / transactions / smart_plans / tasks via the InsForge REST
//      records API using the function's INSFORGE_INTERNAL_URL + API_KEY (both
//      are reserved secrets injected by the platform).
//   2. Build the exact same prompt /api/briefing/route.ts uses.
//   3. Call Groq with GROQ_API_KEY (user secret).
//   4. Insert one row into `briefings` and return { ok, brief, row }.
//
// Triggered by: pg_cron schedule (0 6 * * *) AND manual POST to
// https://{appKey}.functions.insforge.app/morning-briefing
// (or /api/functions/morning-briefing via proxy).

type Lead = {
  id: string
  name: string
  score: number
  status: string
  activity: unknown
}

type Transaction = {
  id: string
  name: string
  hours_until_deadline: number
  urgency: string
  open_issues: unknown
}

type SmartPlan = {
  id: string
  name: string
  status: string
  issue: string
  affected_leads: unknown
}

function env(key: string): string {
  // Deno is injected at runtime inside InsForge Subhosting.
  // @ts-ignore - Deno is available in the edge runtime
  const v = (globalThis as any).Deno?.env?.get?.(key)
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}

function envOptional(key: string): string | undefined {
  // @ts-ignore
  return (globalThis as any).Deno?.env?.get?.(key)
}

function resolveInsforgeBase(): string {
  return (
    envOptional('INSFORGE_INTERNAL_URL') ||
    envOptional('INSFORGE_BASE_URL') ||
    'http://localhost:7130'
  )
}

function resolveInsforgeKey(): string {
  return envOptional('API_KEY') || envOptional('INSFORGE_API_KEY') || env('ANON_KEY')
}

async function ifGet<T>(path: string): Promise<T> {
  const base = resolveInsforgeBase()
  const key = resolveInsforgeKey()
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`InsForge GET ${path} failed ${res.status}: ${body}`)
  }
  return (await res.json()) as T
}

async function ifInsert<T>(table: string, payload: unknown): Promise<T> {
  const base = resolveInsforgeBase()
  const key = resolveInsforgeKey()
  const res = await fetch(`${base}/api/database/records/${table}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`InsForge INSERT ${table} failed ${res.status}: ${body}`)
  }
  return (await res.json()) as T
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function buildDbFallback(
  hotLeads: Lead[],
  criticalTxns: Transaction[],
  pausedPlans: SmartPlan[],
  summary: { totalLeads: number; hotLeads: number; warmLeads: number; taskCount: number }
) {
  const topLead = hotLeads[0]
  const criticalTxn = criticalTxns[0]
  const pausedPlan = pausedPlans[0]

  const topLeadActivity = asArray<string>(topLead?.activity)[0]
  const criticalOpenIssue = asArray<string>(criticalTxn?.open_issues)[0]

  const briefingText = [
    `You have ${summary.hotLeads} high-interest lead${summary.hotLeads !== 1 ? 's' : ''} who need${summary.hotLeads === 1 ? 's' : ''} immediate attention.`,
    topLead ? `${topLead.name} (score ${topLead.score}) — ${topLeadActivity}.` : '',
    criticalTxn ? `The ${criticalTxn.name} closing is in ${criticalTxn.hours_until_deadline} hours with ${criticalOpenIssue || 'open items'}.` : '',
    pausedPlan ? `Your ${pausedPlan.name} is paused due to an email bounce.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const priorities = [
    topLead && {
      id: '1',
      type: 'lead' as const,
      emoji: '🔥',
      badge: 'HIGH INTEREST',
      badgeColor: 'green' as const,
      title: `${topLead.name} · Score ${topLead.score}`,
      subtitle: topLeadActivity || 'High activity today',
      actions: ['Send Draft Text', 'View Lead →'],
    },
    criticalTxn && {
      id: '2',
      type: 'transaction' as const,
      emoji: '⏰',
      badge: 'DEADLINE ALERT',
      badgeColor: 'red' as const,
      title: `${criticalTxn.name} · ${criticalTxn.hours_until_deadline} hrs`,
      subtitle: criticalOpenIssue || 'Review required',
      actions: ['Open Transaction', 'Resolve Note'],
    },
    pausedPlan && {
      id: '3',
      type: 'smartplan' as const,
      emoji: '⚡',
      badge: 'NEEDS ATTENTION',
      badgeColor: 'yellow' as const,
      title: `${pausedPlan.name} · Paused`,
      subtitle: pausedPlan.issue,
      actions: ['Fix Now', 'View Plan'],
    },
  ].filter(Boolean)

  return {
    briefingText,
    priorities,
    generatedAt: new Date().toISOString(),
    source: 'db-fallback',
  }
}

export default async function handler(_request: Request): Promise<Response> {
  try {
    // 1. Load live CRM data in parallel.
    const [leadsAll, txnsAll, plansAll, tasksAll] = await Promise.all([
      ifGet<Lead[]>('/api/database/records/leads?order=score.desc'),
      ifGet<Transaction[]>('/api/database/records/transactions?order=hours_until_deadline.asc'),
      ifGet<SmartPlan[]>('/api/database/records/smart_plans'),
      ifGet<{ completed: boolean; type?: string }[]>('/api/database/records/tasks'),
    ])

    const hotLeads = leadsAll.filter((l) => l.status === 'Hot')
    const warmLeadsCount = leadsAll.filter((l) => l.status === 'Warm').length
    const criticalTxns = txnsAll.filter((t) => t.urgency === 'critical' || t.urgency === 'high')
    const pausedPlans = plansAll.filter((p) => p.status === 'Paused')
    const openTasks = tasksAll.filter((t) => !t.completed)

    const summary = {
      totalLeads: leadsAll.length,
      hotLeads: hotLeads.length,
      warmLeads: warmLeadsCount,
      taskCount: openTasks.length,
    }

    // 2. Build the same prompt as app/api/briefing/route.ts.
    const prompt = `You are Lofty AI. Generate a morning briefing for real estate agent Baylee Rhoades.

LIVE CRM DATA FROM DATABASE:
- Total leads: ${summary.totalLeads} (${summary.hotLeads} hot, ${summary.warmLeads} warm)
- Hot leads: ${hotLeads.map((l) => `${l.name} score ${l.score}: ${asArray<string>(l.activity)[0]}`).join(' | ')}
- Critical transactions: ${criticalTxns.map((t) => `${t.name} in ${t.hours_until_deadline}hrs — ${asArray<string>(t.open_issues)[0] || 'on track'}`).join(' | ')}
- Paused smart plans: ${pausedPlans.map((p) => `${p.name}: ${p.issue}`).join(' | ')}
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

    // 3. Call Groq.
    const groqKey = envOptional('GROQ_API_KEY')
    const model = 'llama-3.3-70b-versatile'

    let parsed: { briefingText: string; priorities: unknown[] } | null = null

    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 600,
            temperature: 0.7,
          }),
        })
        if (!groqRes.ok) throw new Error(`Groq ${groqRes.status}`)
        const data = await groqRes.json()
        const raw: string = data.choices?.[0]?.message?.content ?? ''
        const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
        parsed = JSON.parse(cleaned)
      } catch (err) {
        console.error('[morning-briefing] groq failed, falling back to db shape:', err)
      }
    }

    const finalPayload =
      parsed ?? buildDbFallback(hotLeads, criticalTxns, pausedPlans, summary)
    const finalSource = parsed ? 'edge-function' : 'edge-function-fallback'
    const briefText: string =
      (parsed as any)?.briefingText ??
      (finalPayload as any).briefingText ??
      ''

    // 4. Insert into briefings.
    const inserted = await ifInsert<any[]>('briefings', {
      brief: briefText,
      data: { ...finalPayload, generatedAt: new Date().toISOString(), source: finalSource },
      hot_leads_count: summary.hotLeads,
      urgent_tx_count: criticalTxns.length,
      model,
      source: finalSource,
    })

    const row = Array.isArray(inserted) ? inserted[0] : inserted

    return new Response(
      JSON.stringify({ ok: true, brief: briefText, row }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[morning-briefing] fatal:', err?.message || err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
