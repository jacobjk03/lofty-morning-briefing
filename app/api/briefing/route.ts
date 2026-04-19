import { getHotLeads, getCriticalTransactions, getPausedSmartPlans, getCRMSummary } from '@/lib/queries'
import { Lead, Transaction } from '@/lib/types'

type Plan = { name: string; status: string; issue: string; affectedLeads: string[]; last_run: string }

function buildDbFallback(
  hotLeads: Lead[],
  criticalTxns: Transaction[],
  pausedPlans: Plan[],
  summary: ReturnType<typeof getCRMSummary>
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

  return { briefingText, priorities, generatedAt: new Date().toISOString(), source: 'db-fallback' }
}

export async function GET() {
  const hotLeads = getHotLeads() as Lead[]
  const criticalTxns = getCriticalTransactions() as Transaction[]
  const pausedPlans = getPausedSmartPlans() as Plan[]
  const summary = getCRMSummary()

  if (!process.env.GROQ_API_KEY) {
    return Response.json(buildDbFallback(hotLeads, criticalTxns, pausedPlans, summary))
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
    return Response.json({ ...parsed, generatedAt: new Date().toISOString(), source: 'live-db' })
  } catch {
    return Response.json(buildDbFallback(hotLeads, criticalTxns, pausedPlans, summary))
  }
}
