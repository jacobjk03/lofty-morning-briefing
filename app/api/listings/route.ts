import { getListings } from '@/lib/getData'
export async function GET() {
  return Response.json(await getListings())
}
