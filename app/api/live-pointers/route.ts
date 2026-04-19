import { getLeadById } from '@/lib/queries'
import { resolveKeys } from '@/lib/quota'

interface TranscriptLine {
  speaker: 'agent' | 'user'
  text: string
  time: number
}

function fallback(leadName: string) {
  const first = (leadName || 'the lead').split(' ')[0]
  return [
    `Ask ${first} what stood out about the listing they just saved.`,
    `Confirm the budget is still accurate for the neighborhood.`,
    `Offer a next step — showing slot or a matching listing.`,
  ]
}

export async function POST(req: Request) {
  let leadId: string | undefined
  let transcript: TranscriptLine[] = []
  try {
    const body = await req.json()
    leadId = body?.leadId
    transcript = Array.isArray(body?.transcript) ? body.transcript : []
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const lead = leadId ? await getLeadById(String(leadId)) : null
  const leadName = lead?.name || 'Lead'

  const groqKey = resolveKeys(req).groq.key
  if (!groqKey) {
    return Response.json({ talkingPoints: fallback(leadName) })
  }

  const leadFirst = (leadName.split(' ')[0] || 'the lead')
  const transcriptText = transcript
    .slice(-8)
    .map(t => `${t.speaker === 'agent' ? leadFirst : 'Baylee'}: ${t.text}`)
    .join('\n')

  const prompt = `You are Lofty Copilot whispering into real-estate agent Baylee's ear while she's on a LIVE call with ${leadName}. Return exactly 3 SHORT talking points (max 16 words each) Baylee can READ OUT LOUD verbatim.

ANTI-HALLUCINATION RULES (VERY IMPORTANT)
- NEVER invent property facts (bedrooms, bathrooms, square footage, addresses, HOA fees, school ratings, listing prices) unless those EXACT facts appear in the LEAD PROFILE or earlier in the transcript.
- If the lead asks something you cannot answer from the profile or transcript, the correct talking point is an honest deflection like "Let me pull that up and text it to you in 30 seconds." — NEVER make up a number.
- Only use numbers/addresses/neighborhood details that are EXPLICITLY listed below. If none are listed, keep answers generic.

STRUCTURE OF THE 3 POINTS
- Point 1: If ${leadFirst} just asked a question, this must be an answer Baylee can say — grounded ONLY in the lead's profile or real info. If the profile lacks that fact, this point should be Baylee's honest deflection.
- Point 2: An acknowledgement + natural pivot to keep the call moving.
- Point 3: A next-step question Baylee can pitch (showing, timeline, follow-up).
- Phrase every point as dialogue Baylee would say, not instructions.

Return ONLY a JSON array of 3 strings. No keys, no prose, no markdown.

Example (lead asked about HOA and the profile doesn't list it):
["Great question — let me pull the exact HOA and text it to you right after this call.", "Most homes in ${lead?.neighborhood || 'the area'} are in the 250 to 400 a month range for HOAs.", "Does the monthly budget you shared give us room for an HOA on top of the mortgage?"]

LEAD PROFILE (the ONLY facts you can cite as certain)
- Name: ${leadName}
- Type: ${lead?.type || 'buyer'}
- Score: ${lead?.score ?? 'n/a'}
- Budget: ${lead?.budget || 'unknown'}
- Neighborhood: ${lead?.neighborhood || 'unspecified'}
- Activity: ${(lead?.activity ?? []).slice(0, 3).join('; ') || 'none'}
- Notes: ${lead?.notes || 'none'}

CALL TRANSCRIPT (latest 8 turns — Baylee is the agent, ${leadFirst} is the lead)
${transcriptText || '(call just started, no turns yet)'}

Return JSON array of 3 strings now:`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Small + fast — suggestions need to land in ~500ms.
        // No response_format: llama-3.1-8b-instant doesn't support json_object.
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.5,
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    const raw = String(data?.choices?.[0]?.message?.content ?? '').trim()

    // Try raw JSON first, then extract the first [...] block from the text.
    let parsed: unknown = null
    try { parsed = JSON.parse(raw) } catch {
      const arrMatch = raw.match(/\[[\s\S]*?\]/)
      if (arrMatch) {
        try { parsed = JSON.parse(arrMatch[0]) } catch { /* fall through */ }
      }
    }
    let points: string[] = []
    if (Array.isArray(parsed)) {
      points = parsed.filter((x): x is string => typeof x === 'string')
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      const arr = Object.values(obj).find(v => Array.isArray(v))
      if (Array.isArray(arr)) points = arr.filter((x): x is string => typeof x === 'string')
    }

    // Last-ditch: pull up to 3 bullet or numbered lines out of plain prose.
    if (points.length === 0 && raw) {
      const lines = raw
        .split(/\n+/)
        .map(l => l.replace(/^[\s•\-\d\.\)*"']+/, '').replace(/["']+$/, '').trim())
        .filter(l => l.length > 4 && l.length < 140)
      points = lines.slice(0, 3)
    }

    if (points.length === 0) points = fallback(leadName)
    return Response.json({ talkingPoints: points.slice(0, 3) })
  } catch (e) {
    console.warn('[live-pointers] groq error, using fallback:', e)
    return Response.json({ talkingPoints: fallback(leadName) })
  }
}
