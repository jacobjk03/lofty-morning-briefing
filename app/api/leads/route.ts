import { getAllLeads } from '@/lib/queries'

export async function GET() {
  return Response.json(getAllLeads())
}
