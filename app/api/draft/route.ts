import { getLeadById } from '@/lib/queries'

export async function POST(req: Request) {
  const { leadId } = await req.json()

  const lead = getLeadById(parseInt(leadId))

  if (!lead) {
    return Response.json({ error: 'Lead not found' }, { status: 404 })
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

  const data = await response.json()
  return Response.json({
    draft: data.choices[0].message.content,
    lead: lead.name,
  })
}
