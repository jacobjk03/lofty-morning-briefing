import { getLeadById } from '@/lib/queries'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const lead = getLeadById(parseInt(params.id))
  if (!lead) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(lead)
}
