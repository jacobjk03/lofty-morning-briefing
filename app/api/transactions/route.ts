import { getTransactions } from '@/lib/getData'
export async function GET() {
  return Response.json(await getTransactions())
}
