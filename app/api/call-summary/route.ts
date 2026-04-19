import { resolveKeys } from '@/lib/quota'

interface TranscriptLine {
  speaker: 'agent' | 'user'
  text: string
  time: number
}

function fallback() {
  return {
    summary: 'Call completed. Transcript logged to CRM.',
    sentiment: 'neutral',
    nextStep: 'Follow up via text tomorrow.',
    topics: [] as string[],
  }
}

export async function POST(req: Request) {
  let transcript: TranscriptLine[] = []
  let leadName = 'the lead'
  try {
    const body = await req.json()
    transcript = Array.isArray(body?.transcript) ? body.transcript : []
    leadName = body?.leadName || 'the lead'
  } catch {
    return Response.json(fallback())
  }

  const groqKey = resolveKeys(req).groq.key
  if (transcript.length === 0 || !groqKey) {
    return Response.json(fallback())
  }

  const leadFirst = leadName.split(' ')[0]
  const dialogue = transcript
    .slice(-24)
    .map(t => `${t.speaker === 'agent' ? leadFirst : 'Baylee'}: ${t.text}`)
    .join('\n')

  const prompt = `You are Lofty Copilot. Summarize this live real-estate sales call between Baylee (agent) and ${leadName} (lead). Return ONLY a JSON object with these keys — no prose, no markdown.

{
  "summary": "<2-3 sentence recap of what was discussed>",
  "sentiment": "<one of: hot, warm, neutral, cool>",
  "nextStep": "<1 sentence — the concrete next action Baylee should take>",
  "topics": ["<short topic 1>", "<topic 2>", "<topic 3>"]
}

TRANSCRIPT
${dialogue}

Return the JSON now:`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.4,
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    const raw = String(data?.choices?.[0]?.message?.content ?? '').trim()

    let parsed: unknown = null
    try { parsed = JSON.parse(raw) } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) { try { parsed = JSON.parse(match[0]) } catch {} }
    }
    if (!parsed || typeof parsed !== 'object') return Response.json(fallback())
    const p = parsed as Record<string, unknown>
    return Response.json({
      summary: typeof p.summary === 'string' ? p.summary : fallback().summary,
      sentiment: typeof p.sentiment === 'string' ? p.sentiment : 'neutral',
      nextStep: typeof p.nextStep === 'string' ? p.nextStep : fallback().nextStep,
      topics: Array.isArray(p.topics) ? p.topics.filter((x): x is string => typeof x === 'string').slice(0, 5) : [],
    })
  } catch (e) {
    console.warn('[call-summary] groq error:', e)
    return Response.json(fallback())
  }
}
