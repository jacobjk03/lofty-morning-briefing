import { getAllTransactions } from '@/lib/queries'

export async function GET() {
  return Response.json(getAllTransactions())
}
