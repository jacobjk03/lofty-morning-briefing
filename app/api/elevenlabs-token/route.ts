import { NextResponse } from 'next/server'

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

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
