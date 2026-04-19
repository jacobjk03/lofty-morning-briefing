import { getAllListings } from '@/lib/queries'

export async function GET() {
  return Response.json(getAllListings())
}
