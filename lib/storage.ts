import insforge from './insforge'

const BUCKET = 'call-transcripts'

/**
 * Uploads a full call transcript (any JSON-serialisable value) to the InsForge
 * `call-transcripts` bucket and returns the public URL, or null on any failure.
 *
 * Never throws — the call flow must not break if storage is down.
 */
export async function uploadTranscriptToStorage(
  callId: string,
  transcript: unknown
): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const path = `${callId}-${timestamp}.json`

    const body = JSON.stringify(transcript ?? null, null, 2)
    // Server-side (Node runtime). Blob is globally available on Node 18+.
    const blob = new Blob([body], { type: 'application/json' })

    console.log(`[storage] upload bucket=${BUCKET} path=${path} size=${blob.size}`)

    const { data, error } = await insforge.storage.from(BUCKET).upload(path, blob)

    if (error) {
      console.error('[storage] upload error:', error.message || error)
      return null
    }

    const url = data?.url ?? null
    console.log(`[storage] url = ${url}`)
    return url
  } catch (e) {
    console.error('[storage] upload threw:', e)
    return null
  }
}
