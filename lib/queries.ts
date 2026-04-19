import insforge from './insforge'

// InsForge returns JSONB columns as parsed objects, not strings.
// IDs are UUIDs (string). completed is boolean.

// Loose UUID v1–v5 shape (Postgres accepts standard hex hyphenated form)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function mapLeadRow(l: any) {
  return {
    ...l,
    activity: Array.isArray(l.activity) ? l.activity : [],
  }
}

export async function getAllLeads() {
  const { data, error } = await insforge.database
    .from('leads')
    .select()
    .order('score', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapLeadRow)
}

export async function getHotLeads() {
  const { data, error } = await insforge.database
    .from('leads')
    .select()
    .eq('status', 'Hot')
    .order('score', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapLeadRow)
}

/**
 * Resolve a lead by InsForge UUID, or by legacy 1-based index (same order as list: score DESC).
 * Old UI uses /api/leads/1 for "top lead" — that is not a valid UUID in Postgres.
 */
export async function getLeadById(id: string) {
  const trimmed = (id ?? '').trim()
  if (!trimmed) return null

  if (UUID_RE.test(trimmed)) {
    const { data, error } = await insforge.database
      .from('leads')
      .select()
      .eq('id', trimmed)
      .maybeSingle()
    if (error) throw error
    return data ? mapLeadRow(data) : null
  }

  const n = parseInt(trimmed, 10)
  if (!Number.isNaN(n) && n >= 1) {
    const { data, error } = await insforge.database
      .from('leads')
      .select()
      .order('score', { ascending: false })
    if (error) throw error
    const rows = data ?? []
    const row = rows[n - 1]
    return row ? mapLeadRow(row) : null
  }

  return null
}

export async function getCriticalTransactions() {
  const { data, error } = await insforge.database
    .from('transactions')
    .select()
    .in('urgency', ['critical', 'high'])
    .order('hours_until_deadline', { ascending: true })
  if (error) throw error
  return (data ?? []).map((t: any) => ({
    ...t,
    openIssues: Array.isArray(t.open_issues) ? t.open_issues : [],
  }))
}

export async function getAllTransactions() {
  const { data, error } = await insforge.database
    .from('transactions')
    .select()
    .order('hours_until_deadline', { ascending: true })
  if (error) throw error
  return (data ?? []).map((t: any) => ({
    ...t,
    openIssues: Array.isArray(t.open_issues) ? t.open_issues : [],
  }))
}

export async function getTasksByType() {
  const { data, error } = await insforge.database
    .from('tasks')
    .select()
    .eq('completed', false)
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const t of data ?? []) {
    counts[t.type] = (counts[t.type] ?? 0) + 1
  }
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
}

export async function getAllTasks() {
  const { data, error } = await insforge.database
    .from('tasks')
    .select()
    .eq('completed', false)
    .order('priority', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllListings() {
  const { data, error } = await insforge.database.from('listings').select()
  if (error) throw error
  return data ?? []
}

export async function getPausedSmartPlans() {
  const { data, error } = await insforge.database
    .from('smart_plans')
    .select()
    .eq('status', 'Paused')
  if (error) throw error
  return (data ?? []).map((p: any) => ({
    ...p,
    affectedLeads: Array.isArray(p.affected_leads) ? p.affected_leads : [],
  }))
}

export async function getAllAppointments() {
  const { data, error } = await insforge.database
    .from('appointments')
    .select()
    .order('time', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getCRMSummary() {
  const [leadsRes, hotRes, warmRes, critRes, pausedRes, taskRes] = await Promise.all([
    insforge.database.from('leads').select('id', { count: 'exact', head: true }),
    insforge.database.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'Hot'),
    insforge.database.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'Warm'),
    insforge.database.from('transactions').select('id', { count: 'exact', head: true }).eq('urgency', 'critical'),
    insforge.database.from('smart_plans').select('id', { count: 'exact', head: true }).eq('status', 'Paused'),
    insforge.database.from('tasks').select('id', { count: 'exact', head: true }).eq('completed', false),
  ])
  return {
    totalLeads: leadsRes.count ?? 0,
    hotLeads: hotRes.count ?? 0,
    warmLeads: warmRes.count ?? 0,
    highScore: hotRes.count ?? 0,
    criticalTxns: critRes.count ?? 0,
    pausedPlans: pausedRes.count ?? 0,
    taskCount: taskRes.count ?? 0,
  }
}

export async function logCallToInsForge(
  leadName: string,
  leadId: string | null,
  durationSeconds: number,
  notes?: string,
  transcript?: Array<{ speaker: 'agent' | 'user'; text: string; time: number }> | null
): Promise<any | null> {
  const { data, error } = await insforge.database
    .from('call_logs')
    .insert([{
      lead_name: leadName,
      lead_id: leadId,
      duration_seconds: durationSeconds,
      notes: notes ?? null,
      transcript: transcript && transcript.length > 0 ? transcript : null,
    }])
    .select()
    .single()
  if (error) {
    console.error('[InsForge] Failed to log call:', error)
    return null
  }
  return data
}

/**
 * Attach a transcript storage URL to an existing call_logs row.
 * Falls back to stashing the URL in `notes` if the update fails (e.g. column missing).
 * Never throws — call flow must continue even if this fails.
 */
export async function attachTranscriptUrlToCallLog(
  callLogId: string,
  transcriptUrl: string,
  existingNotes: string | null | undefined
): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from('call_logs')
      .update({ transcript_url: transcriptUrl })
      .eq('id', callLogId)
    if (!error) {
      console.log('[storage] attached transcript_url to call_logs row', callLogId)
      return true
    }
    console.warn('[storage] transcript_url column update failed, falling back to notes:', error.message || error)
  } catch (e) {
    console.warn('[storage] transcript_url update threw, falling back to notes:', e)
  }
  try {
    const base = existingNotes ? `${existingNotes}\n` : ''
    const merged = `${base}Transcript: ${transcriptUrl}`
    const { error } = await insforge.database
      .from('call_logs')
      .update({ notes: merged })
      .eq('id', callLogId)
    if (error) {
      console.error('[storage] notes fallback failed:', error.message || error)
      return false
    }
    console.log('[storage] stashed transcript url in notes for row', callLogId)
    return true
  } catch (e) {
    console.error('[storage] notes fallback threw:', e)
    return false
  }
}
