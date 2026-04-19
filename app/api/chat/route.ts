import { getLeads, getTransactions, getTasks, getListings, getSmartPlans, getAppointments } from '@/lib/getData'

async function buildSystemPrompt() {
  const [leads, transactions, tasks, listings, smartPlans, appointments] = await Promise.all([
    getLeads(), getTransactions(), getTasks(), getListings(), getSmartPlans(), getAppointments(),
  ])
  const l = leads as any[], t = transactions as any[], tk = tasks as any[]
  const ls = listings as any[], sp = smartPlans as any[], ap = appointments as any[]

  return `You are Lofty AI, an intelligent real estate assistant for Baylee Rhoades, a real estate agent in Phoenix/Scottsdale AZ. You have full context of her live CRM data:

LEADS (${l.length} total):
${l.map(lead => `- ${lead.name}: Score ${lead.score}, ${lead.type}, ${lead.status}. Activity: ${(lead.activity || []).join('; ')}`).join('\n')}

TRANSACTIONS:
${t.map(tx => `- ${tx.name}: ${tx.stage}, deadline ${tx.deadline} (${tx.hours_until_deadline}hrs), $${tx.value?.toLocaleString()}. Issues: ${(tx.openIssues || tx.open_issues || []).join('; ')}`).join('\n')}

TASKS TODAY (${tk.length} total):
${tk.map(task => `- ${task.type}: ${task.contact} at ${task.due}`).join('\n')}

LISTINGS:
${ls.map(listing => `- ${listing.address}: $${listing.price?.toLocaleString()} (${listing.beds}bd/${listing.baths}ba), ${listing.status}, ${listing.days_on_market} days on market`).join('\n')}

SMART PLANS:
${sp.map(plan => `- ${plan.name}: ${plan.status}${plan.issue ? ' — ' + plan.issue : ''}`).join('\n')}

APPOINTMENTS:
${ap.map(appt => `- ${appt.time}: ${appt.type} at ${appt.address} with ${appt.contact}`).join('\n')}

Be concise, proactive, and actionable. Always suggest the next best action. When asked about leads, explain the score reasoning. When asked about transactions, flag deadlines. Speak like a smart colleague, not a formal assistant. Keep responses under 4 sentences unless asked for detail. Never say you cannot access real-time data — you have full context above.`
}

function fallbackReply(last: string) {
  const t = (last || '').toLowerCase()
  if (/scott|hayes|lead/.test(t))
    return 'Scott Hayes is your top-priority lead — score 92, back on 650 Maple St 4× this morning. I already drafted a follow-up text. Want me to open his lead detail?'
  if (/johnson|closing|inspection/.test(t))
    return "Johnson deal closes in 72 hrs. One inspection note is still open. I can reschedule the walkthrough and notify the client in one move — just say go."
  if (/bloom|smart plan|paused/.test(t))
    return 'Your Bloom outreach auto-paused after two bounces. Clean the contacts and it picks back up where it left off.'
  if (/urgent|today|first|call/.test(t))
    return 'Three things matter today: Scott Hayes (hot), the Johnson 72-hr closing, and the paused Bloom plan. I can handle any of them on approval.'
  return "I'm running in offline mode right now — set GROQ_API_KEY in .env.local for full responses. Meanwhile, try 'Open Scott Hayes' or 'Take me to my morning briefing'."
}

export async function POST(req: Request) {
  const { messages } = await req.json()
  const last = messages?.[messages.length - 1]?.content || ''

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ message: fallbackReply(last), source: 'fallback' })
  }

  try {
    const systemPrompt = await buildSystemPrompt()
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })
    if (!response.ok) throw new Error(`Groq ${response.status}`)
    const data = await response.json()
    const msg = data?.choices?.[0]?.message?.content
    if (!msg) throw new Error('Empty reply')
    return Response.json({ message: msg, source: 'live' })
  } catch {
    return Response.json({ message: fallbackReply(last), source: 'fallback' })
  }
}
