import { consumeQuota, quotaExceededResponse } from '@/lib/quota'

export async function POST(req: Request) {
  const q = await consumeQuota(req, 'elevenlabs')
  if (!q.ok) return quotaExceededResponse(q)

  const { text } = await req.json()

  const elKey = q.keys.elevenlabs.key
  if (!elKey) {
    return new Response('ELEVENLABS_API_KEY not set', { status: 500 })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Rachel

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': elKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) return new Response('ElevenLabs TTS failed', { status: 502 })

  const audio = await res.arrayBuffer()
  return new Response(audio, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
