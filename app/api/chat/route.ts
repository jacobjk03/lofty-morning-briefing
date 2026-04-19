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

export async function POST(req: Request) {
  const { messages } = await req.json()
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

  const data = await response.json()
  return Response.json({ message: data.choices[0].message.content })
}
