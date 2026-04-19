import { consumeQuota, quotaExceededResponse } from '@/lib/quota'

function heuristicExtract(text: string) {
  const nameMatch = text.match(/met\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)|([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is|has|was|will|moved)/)
  const phone = text.match(/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/)?.[0]
  const email = text.match(/\b[\w.-]+@[\w.-]+\.\w+\b/)?.[0]
  const budget = text.match(/\$[\d.,]+\s*[KMkm]?(?:\s*[-–to]+\s*\$?[\d.,]+\s*[KMkm]?)?/)?.[0]
  const neighborhood = text.match(/(?:in|to)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)(?:\s+in|,|\.|$)/)?.[1]
  const type = /buy|buying|buyer|looking for|relocat/i.test(text) ? 'Buyer' : /sell|listing/i.test(text) ? 'Seller' : 'Buyer'
  return {
    name: nameMatch?.[1] || nameMatch?.[2] || null,
    phone: phone || null,
    email: email || null,
    budget: budget || null,
    neighborhood: neighborhood || null,
    type,
    notes: text.length > 220 ? text.slice(0, 220) + '…' : text,
  }
}

export async function POST(req: Request) {
  const q = await consumeQuota()
  if (!q.ok) return quotaExceededResponse(q)

  const { text } = await req.json()
  if (!text || typeof text !== 'string') {
    return Response.json({ lead: {} })
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ lead: heuristicExtract(text), source: 'fallback' })
  }

  const prompt = `You are Lofty AI. Extract a real estate lead from this free-form text and return ONLY valid JSON — no prose, no code fences.

Text:
"""${text.slice(0, 2000)}"""

Return exactly this shape with null for unknowns:
{"name": string|null, "type": "Buyer"|"Seller"|"Renter", "phone": string|null, "email": string|null, "budget": string|null, "neighborhood": string|null, "notes": string|null}

Notes should be a 1-2 sentence summary of the buyer/seller's motivation, family situation, must-haves — not a transcript of the full text.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.2,
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) throw new Error('Empty')
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    return Response.json({ lead: parsed, source: 'live' })
  } catch {
    return Response.json({ lead: heuristicExtract(text), source: 'fallback' })
  }
}
