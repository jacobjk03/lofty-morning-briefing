import { getLeads } from '@/lib/getData'
export async function GET() {
  return Response.json(await getLeads())
}
