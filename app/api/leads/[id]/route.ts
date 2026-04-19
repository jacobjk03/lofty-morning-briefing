import { getLeadById } from '@/lib/getData'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // IDs are UUIDs in InsForge — pass as string directly
  const lead = await getLeadById(id)
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(lead)
}
