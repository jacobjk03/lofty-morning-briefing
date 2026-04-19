import { NextRequest, NextResponse } from 'next/server'
import { logCallToInsForge } from '@/lib/queries'

export async function POST(req: NextRequest) {
  try {
    const { leadName, leadId, durationSeconds, notes, transcript } = await req.json()
    if (!leadName || durationSeconds == null) {
      return NextResponse.json({ error: 'leadName and durationSeconds are required' }, { status: 400 })
    }
    await logCallToInsForge(leadName, leadId ?? null, durationSeconds, notes, transcript ?? null)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[log-call]', e)
    return NextResponse.json({ error: 'Failed to log call' }, { status: 500 })
  }
}
