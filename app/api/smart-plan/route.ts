import { consumeQuota, quotaExceededResponse } from '@/lib/quota'

interface PlanStep {
  day: number
  channel: 'sms' | 'email' | 'call' | 'task'
  title: string
  body: string
}

interface GeneratedPlan {
  name: string
  audience: string
  steps: PlanStep[]
}

function fallbackPlan(goal: string): GeneratedPlan {
  const g = goal.toLowerCase()
  if (/scott|hayes|650 maple/.test(g)) {
    return {
      name: 'Scott Hayes · 28-day buyer nurture',
      audience: 'Scott Hayes',
      steps: [
        { day: 0,  channel: 'sms',   title: 'Initial follow-up', body: 'Saw you were back on 650 Maple — want me to hold a showing?' },
        { day: 2,  channel: 'email', title: 'Neighborhood snapshot', body: 'Scottsdale comps + 650 Maple positioning deep-dive.' },
        { day: 5,  channel: 'call',  title: 'Check-in call', body: 'Confirm tour availability, flag price-adjustment on adjacent comp.' },
        { day: 10, channel: 'email', title: 'Financing intro', body: 'Warm intro to preferred lender for pre-approval refresh.' },
        { day: 18, channel: 'sms',   title: 'Open house round-up', body: 'Upcoming weekend tours in Scottsdale buyer likes.' },
        { day: 28, channel: 'call',  title: 'Decision check-in', body: 'Ask about timeline, surface next-tier listings if paused.' },
      ],
    }
  }
  if (/dormant|lost|re-?engage|re-?activate/.test(g)) {
    return {
      name: 'Dormant buyers · 21-day re-engagement',
      audience: 'Buyers with no activity in 90+ days',
      steps: [
        { day: 0,  channel: 'email', title: 'Market-change nudge', body: "Rates moved — here's what that means for your price band." },
        { day: 3,  channel: 'sms',   title: 'Personal check-in', body: 'Quick pulse: still looking? Different price, area, timing?' },
        { day: 7,  channel: 'email', title: 'Curated 3-pack', body: 'Three listings tuned to last search criteria.' },
        { day: 14, channel: 'call',  title: 'Human touch', body: 'Voice conversation to re-qualify or archive with warm intent tag.' },
        { day: 21, channel: 'task',  title: 'Final triage', body: 'Move to nurture archive if no response — set 90-day re-check.' },
      ],
    }
  }
  if (/open house|welcome|new lead|qualif/.test(g)) {
    return {
      name: 'Open house → qualified lead · 14-day plan',
      audience: 'New open-house visitors',
      steps: [
        { day: 0, channel: 'sms',   title: 'Same-day thank-you', body: 'Thanks for stopping by — quick follow-up on the listing.' },
        { day: 1, channel: 'email', title: 'Property deep-dive', body: 'Floor plan, HOA, taxes, comparable sales within 1 mile.' },
        { day: 3, channel: 'email', title: 'Neighborhood primer', body: 'Schools, walkability, upcoming developments.' },
        { day: 5, channel: 'call',  title: 'Qualify call', body: 'Budget, timeline, competing properties — 10-min discovery.' },
        { day: 10, channel: 'task', title: 'Tier + route', body: 'Hot → showings; warm → nurture; cold → archive with note.' },
        { day: 14, channel: 'email', title: '14-day check-in', body: 'Market-match digest + showing availability next weekend.' },
      ],
    }
  }
  if (/past|referral|anniversary|client/.test(g)) {
    return {
      name: 'Past-client anniversary · referral ask',
      audience: 'Clients who closed in the last 12 months',
      steps: [
        { day: 0, channel: 'email', title: 'Anniversary note', body: 'Warm personal note reflecting on their home purchase year.' },
        { day: 5, channel: 'sms',   title: 'Soft referral ask', body: 'Know anyone thinking of buying or selling? Happy to help.' },
        { day: 14, channel: 'task', title: 'Home-value CMA', body: 'Send updated comparative market analysis as a gift.' },
        { day: 30, channel: 'call', title: 'Annual check-in', body: '10-min catch-up call, no agenda — just relationship maintenance.' },
      ],
    }
  }
  return {
    name: 'Custom plan',
    audience: goal.slice(0, 60),
    steps: [
      { day: 0,  channel: 'email', title: 'Opening touch',      body: 'Warm introduction and context-setting.' },
      { day: 3,  channel: 'sms',   title: 'Short check-in',     body: 'Personal pulse to invite a reply.' },
      { day: 7,  channel: 'email', title: 'Value-add content',  body: 'Tailored resource matching audience needs.' },
      { day: 14, channel: 'call',  title: 'Live conversation',  body: 'Qualify timing and decision criteria.' },
      { day: 21, channel: 'email', title: 'Recap + next step',  body: 'Summarize exchange and propose one concrete next action.' },
    ],
  }
}

export async function POST(req: Request) {
  const q = await consumeQuota()
  if (!q.ok) return quotaExceededResponse(q)

  const { goal } = await req.json()
  if (!goal || typeof goal !== 'string') {
    return Response.json({ plan: null })
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ plan: fallbackPlan(goal), source: 'fallback' })
  }

  const prompt = `You are Lofty Copilot drafting a real estate Smart Plan for agent Baylee Rhoades in Phoenix/Scottsdale AZ. Given the goal below, design a 5-7 step cadence.

Goal: """${goal.slice(0, 500)}"""

Return ONLY valid JSON (no prose, no markdown fences):
{
  "name": "<short plan name — e.g., 'Dormant buyers · 21-day re-engagement'>",
  "audience": "<who this targets, one line>",
  "steps": [
    {
      "day": <number 0..28>,
      "channel": "sms" | "email" | "call" | "task",
      "title": "<4-6 word step title>",
      "body": "<1 sentence describing what happens in this step, action-oriented>"
    }
  ]
}

Rules:
- 5-7 steps total, spaced sensibly (not all on day 0)
- Mix channels — vary sms/email/call/task; don't send 5 emails
- Titles TitleCase but concise; bodies punchy, not fluffy; never "I hope this finds you well"
- Step 1 can be day 0 (same-day action)`

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
        max_tokens: 900,
        temperature: 0.5,
      }),
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) throw new Error('Empty')
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed?.steps?.length) throw new Error('No steps')
    return Response.json({ plan: parsed, source: 'live' })
  } catch {
    return Response.json({ plan: fallbackPlan(goal), source: 'fallback' })
  }
}
