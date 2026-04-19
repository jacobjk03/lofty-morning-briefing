import { getLeadById } from '@/lib/queries'
import { consumeQuota, quotaExceededResponse } from '@/lib/quota'

interface LeadRow {
  name: string
  type?: string | null
  score?: number | null
  budget?: string | null
  neighborhood?: string | null
  last_contact?: string | null
  activity?: string[]
  notes?: string | null
}

function fallbackPointer(lead: LeadRow) {
  const first = lead.name.split(' ')[0]
  const area = lead.neighborhood || 'the area'
  return `Open warm with ${first}, reference ${lead.activity?.[0] || 'their recent search'}, and confirm the ${lead.budget || 'budget'} is still right for ${area}.`
}

type Mode = 'live' | 'ai-agent'

export async function POST(req: Request) {
  const q = await consumeQuota()
  if (!q.ok) return quotaExceededResponse(q)

  let leadId: string | number | undefined
  let mode: Mode = 'live'
  try {
    const body = await req.json()
    leadId = body?.leadId
    if (body?.mode === 'ai-agent') mode = 'ai-agent'
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const lead = (await getLeadById(String(leadId ?? ''))) as LeadRow | null
  if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 })

  let pointer = ''
  if (process.env.GROQ_API_KEY) {
    const promptPerspective = mode === 'ai-agent'
      ? `You are Lofty Copilot, showing Baylee exactly what her AI agent is about to say when it opens this call on her behalf. In ONE short sentence (max 22 words), summarize the opening move.`
      : `You are Lofty Copilot, briefing agent Baylee before she opens a live call. In ONE short sentence (max 22 words), tell Baylee what to reference and what to ask first.`
    const prompt = `${promptPerspective} Be specific. No platitudes.

Lead:
- Name: ${lead.name}
- Type: ${lead.type || 'buyer'}
- Score: ${lead.score ?? 'n/a'}
- Activity: ${(lead.activity ?? []).slice(0, 4).join(', ') || 'none on file'}
- Budget: ${lead.budget || 'unknown'}
- Neighborhood: ${lead.neighborhood || 'unspecified'}
- Last contact: ${lead.last_contact || 'unknown'}
- Notes: ${lead.notes || 'none'}

Return ONLY the sentence.`
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
          max_tokens: 80,
          temperature: 0.7,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        pointer = String(data?.choices?.[0]?.message?.content ?? '').trim()
      }
    } catch {
      /* fall through */
    }
  }

  if (!pointer) pointer = fallbackPointer(lead)

  const firstName = lead.name.split(' ')[0]
  const activityLine = (lead.activity ?? []).slice(0, 3).join('; ') || 'no recent activity on file'

  let systemPrompt: string
  let firstMessage: string

  if (mode === 'ai-agent') {
    // AI plays Baylee, the real-estate agent, calling the lead on her behalf.
    systemPrompt = `CRITICAL ROLE OVERRIDE — IGNORE any previous persona (including "Alex" or any other name from your base prompt). You are now exclusively BAYLEE RHOADES, a warm, professional real-estate agent at Lofty CRM. You just dialed ${lead.name} to follow up on recent activity. Stay fully in character — never break character, never reveal you're an AI, never call yourself anything but Baylee.

THE PERSON YOU'RE CALLING
- Name: ${lead.name} — address them as "${firstName}"
- Type: ${lead.type || 'buyer'}
- Budget: ${lead.budget || 'not yet shared'}
- Neighborhood: ${lead.neighborhood || 'unspecified'}
- What Lofty flagged (why you're calling): ${activityLine}
- Last contact: ${lead.last_contact || 'unknown'}
- Notes: ${lead.notes || 'none'}

HOW TO RUN THIS CALL
- Open warmly using ${firstName}'s name, introduce yourself as "Baylee from Lofty", and reference ONE specific thing from their activity.
- Keep turns short — 1-2 sentences. Sound human, conversational, not scripted.
- Ask one question at a time. Listen before moving on.
- Goal: understand timeline, confirm what they're looking for, close on a concrete next step — showing, call-back time, or text follow-up.
- If asked something you don't know, be honest and offer to follow up.
- NEVER use the name "Alex" — the caller's name is Baylee Rhoades.`
    firstMessage = `Hey ${firstName}, it's Baylee from Lofty — hope I'm not catching you at a bad time. Saw you were back looking at ${(lead.activity ?? [])[0] || 'a few listings'} earlier today, so I wanted to reach out real quick. Got a minute?`
  } else {
    // Live coaching: AI plays the lead, Baylee (user) speaks to them.
    systemPrompt = `CRITICAL ROLE OVERRIDE — IGNORE any previous persona (including "Alex" or any other name from your base prompt). You are now exclusively ${lead.name}, a ${lead.type || 'buyer'} who just picked up a phone call from your real-estate agent BAYLEE RHOADES. Stay fully in character as ${firstName} for the entire call — never break character, never reveal you're an AI, never refer to the caller as "Alex" or any name other than "Baylee".

WHO YOU ARE (${firstName}'s profile)
- Name: ${lead.name}
- Type: ${lead.type || 'buyer'}
- Budget: ${lead.budget || 'around your typical range — improvise realistically if asked'}
- Neighborhood focus: ${lead.neighborhood || 'the Phoenix area'}
- Recent activity in the app: ${activityLine}
- Last time you spoke with Baylee: ${lead.last_contact || 'a little while ago'}
- Notes: ${lead.notes || 'none'}

WHO IS CALLING YOU
- Baylee Rhoades — your real-estate agent at Lofty. Address her ONLY as "Baylee". She is NOT named Alex.

HOW TO BEHAVE
- Open with a warm, natural "Hello?" or "Hey Baylee" — you picked up, she called you.
- Respond in 1-2 sentences per turn. Casual, human, not scripted.
- Stay consistent with your profile — react to ${(lead.activity ?? [])[0] || 'your recent activity'} authentically when she mentions it.
- Ask follow-up questions. Share your actual considerations (timeline, family, commute, price — whatever a real lead would care about).
- If Baylee proposes a showing or next step, engage like a real lead would — express real interest, hesitation, or questions.
- If she asks something you don't have info on, improvise plausibly.`
    firstMessage = `Hello?`
  }

  return Response.json({
    pointer,
    firstMessage,
    systemPrompt,
    dynamicVariables: {
      // Lead info (what the agent knows about the person they're talking to)
      lead_name: lead.name,
      lead_first_name: firstName,
      lead_type: lead.type || 'buyer',
      lead_score: String(lead.score ?? ''),
      lead_budget: lead.budget || '',
      lead_neighborhood: lead.neighborhood || '',
      lead_activity: activityLine,
      lead_last_contact: lead.last_contact || '',
      lofty_pointer: pointer,
      // Flood common dashboard variable names so whichever the agent's
      // configured prompt references ends up with "Baylee" — not "Alex".
      user_name: 'Baylee Rhoades',
      user_first_name: 'Baylee',
      agent_name: 'Baylee Rhoades',
      agent_first_name: 'Baylee',
      caller_name: 'Baylee Rhoades',
      caller_first_name: 'Baylee',
      realtor_name: 'Baylee Rhoades',
      client_name: lead.name,
      customer_name: lead.name,
      prospect_name: lead.name,
    },
    mode,
    source: process.env.GROQ_API_KEY ? 'live' : 'fallback',
  })
}

// Unused, kept for reference of variable name shapes the dashboard may use.
