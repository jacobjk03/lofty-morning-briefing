import { createClient } from '@insforge/sdk'

if (!process.env.INSFORGE_URL || !process.env.INSFORGE_API_KEY) {
  throw new Error('INSFORGE_URL and INSFORGE_API_KEY must be set in .env.local')
}

const insforge = createClient({
  baseUrl: process.env.INSFORGE_URL,
  anonKey: process.env.INSFORGE_API_KEY,
})

export default insforge
