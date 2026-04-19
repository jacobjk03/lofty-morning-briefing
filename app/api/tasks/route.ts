import { getAllTasks } from '@/lib/queries'

export async function GET() {
  return Response.json(getAllTasks())
}
