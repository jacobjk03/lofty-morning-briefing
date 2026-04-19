import { getLeadById } from '@/lib/queries'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = getLeadById(parseInt(id))
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(lead)
}
