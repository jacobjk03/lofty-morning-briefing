import { NextResponse } from 'next/server'
import { resolveKeys } from '@/lib/quota'

export async function GET(req: Request) {
  const agentId = process.env.ELEVENLABS_AGENT_ID
  const apiKey = resolveKeys(req).elevenlabs.key

  if (!agentId || !apiKey) {
    return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 })
  }

  // Fetch a short-lived WebRTC conversation token from ElevenLabs
  // This keeps the API key server-side only
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
    { headers: { 'xi-api-key': apiKey } }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error('[elevenlabs-token] ElevenLabs error:', text)
    return NextResponse.json({ error: 'Failed to get conversation token' }, { status: 502 })
  }

  const { token } = await res.json()
  return NextResponse.json({ token })
}
