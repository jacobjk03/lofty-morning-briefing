import { NextRequest, NextResponse } from 'next/server'
import { attachTranscriptUrlToCallLog, logCallToInsForge } from '@/lib/queries'
import { uploadTranscriptToStorage } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const { leadName, leadId, durationSeconds, notes, transcript } = await req.json()
    const transcriptLen = Array.isArray(transcript) ? transcript.length : 0
    console.log('[log-call] in:', { leadName, leadId, durationSeconds, transcriptLen })
    if (transcriptLen > 0) {
      const first = transcript[0]
      const last = transcript[transcriptLen - 1]
      console.log('[log-call] first turn:', first?.speaker, JSON.stringify(first?.text || '').slice(0, 80))
      console.log('[log-call] last turn:', last?.speaker, JSON.stringify(last?.text || '').slice(0, 80))
    } else {
      console.log('[log-call] transcript EMPTY — onMessage never fired in the client')
    }
    if (!leadName || durationSeconds == null) {
      return NextResponse.json({ error: 'leadName and durationSeconds are required' }, { status: 400 })
    }

    const row = await logCallToInsForge(leadName, leadId ?? null, durationSeconds, notes, transcript ?? null)

    let transcriptUrl: string | null = null
    if (row?.id && transcriptLen > 0) {
      try {
        transcriptUrl = await uploadTranscriptToStorage(row.id, {
          callId: row.id,
          leadName,
          leadId: leadId ?? null,
          durationSeconds,
          notes: notes ?? null,
          transcript,
          createdAt: new Date().toISOString(),
        })
        if (transcriptUrl) {
          await attachTranscriptUrlToCallLog(row.id, transcriptUrl, notes ?? null)
        }
      } catch (storageErr) {
        console.error('[log-call] storage step failed (non-fatal):', storageErr)
      }
    } else if (!row?.id) {
      console.warn('[log-call] skipping storage upload — insert returned no id')
    } else {
      console.log('[log-call] skipping storage upload — empty transcript')
    }

    return NextResponse.json({ ok: true, transcriptLen, callId: row?.id ?? null, transcriptUrl })
  } catch (e) {
    console.error('[log-call]', e)
    return NextResponse.json({ error: 'Failed to log call' }, { status: 500 })
  }
}
