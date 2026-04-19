import { getLeadById } from '@/lib/queries'
import { consumeQuota, quotaExceededResponse } from '@/lib/quota'

function fallbackDraft(lead: { name: string; activity: string[]; neighborhood?: string }) {
  const firstName = lead.name.split(' ')[0]
  const top = lead.activity?.[0] || 'the homes you saved'
  return `Hey ${firstName} — saw you were back looking at ${top.toLowerCase()}. Worth a quick call today to talk through ${lead.neighborhood || 'the area'}? I can hold a showing slot for you.`
}

export async function POST(req: Request) {
  const q = await consumeQuota()
  if (!q.ok) return quotaExceededResponse(q)

  let leadId: string | number | undefined
  try {
    const body = await req.json()
    leadId = body?.leadId
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const lead = await getLeadById(String(leadId ?? ''))

  if (!lead) {
    return Response.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ draft: fallbackDraft(lead), lead: lead.name, source: 'fallback' })
  }

  const prompt = `You are Lofty AI helping real estate agent Baylee Rhoades draft a personalized outreach message.

Lead profile from database:
- Name: ${lead.name}
- Type: ${lead.type}
- Score: ${lead.score}
- Recent activity: ${lead.activity.join(', ')}
- Budget: ${lead.budget || 'unknown'}
- Neighborhood: ${lead.neighborhood}
- Last contact: ${lead.last_contact}

Write a short, warm, personalized text message (2-3 sentences).
Sound like a real agent, not a robot.
Be specific to their actual activity above.
Never use "I hope this finds you well".
Return ONLY the message text, nothing else.`

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
        max_tokens: 150,
        temperature: 0.8,
      }),
    })

    if (!response.ok) throw new Error(`Groq ${response.status}`)
    const data = await response.json()
    const draft = data?.choices?.[0]?.message?.content
    if (!draft) throw new Error('Empty draft')
    return Response.json({ draft, lead: lead.name, source: 'live' })
  } catch {
    return Response.json({ draft: fallbackDraft(lead), lead: lead.name, source: 'fallback' })
  }
}
