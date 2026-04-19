const isVercel = process.env.VERCEL === '1'

export async function getLeads() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.leads.map((l: any) => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
  }
  try {
    const { getAllLeads } = await import('./queries')
    return getAllLeads()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.leads.map((l: any) => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
  }
}

export async function getTransactions() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.transactions.map((t: any) => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
  }
  try {
    const { getAllTransactions } = await import('./queries')
    return getAllTransactions()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.transactions.map((t: any) => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
  }
}

export async function getTasks() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.tasks
  }
  try {
    const { getAllTasks } = await import('./queries')
    return getAllTasks()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.tasks
  }
}

export async function getListings() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.listings
  }
  try {
    const { getAllListings } = await import('./queries')
    return getAllListings()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.listings
  }
}

export async function getSmartPlans() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.smartPlans.map((p: any) => ({ ...p, affectedLeads: JSON.parse(p.affected_leads || '[]') }))
  }
  try {
    const { getPausedSmartPlans } = await import('./queries')
    return getPausedSmartPlans()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.smartPlans.map((p: any) => ({ ...p, affectedLeads: JSON.parse(p.affected_leads || '[]') }))
  }
}

export async function getAppointments() {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.appointments
  }
  try {
    const { getAllAppointments } = await import('./queries')
    return getAllAppointments()
  } catch {
    const { mockFallback } = await import('./mockFallback')
    return mockFallback.appointments
  }
}

export async function getLeadById(id: number) {
  if (isVercel) {
    const { mockFallback } = await import('./mockFallback')
    const lead = mockFallback.leads.find((l: any) => l.id === id)
    if (!lead) return null
    return { ...lead, activity: JSON.parse(lead.activity || '[]') }
  }
  try {
    const { getLeadById: getById } = await import('./queries')
    return getById(id)
  } catch {
    const { mockFallback } = await import('./mockFallback')
    const lead = mockFallback.leads.find((l: any) => l.id === id)
    if (!lead) return null
    return { ...lead, activity: JSON.parse(lead.activity || '[]') }
  }
}

export async function getHotLeads() {
  const leads = await getLeads()
  return (leads as any[]).filter((l) => l.score >= 80 || l.status === 'Hot')
}

export async function getCriticalTransactions() {
  const txns = await getTransactions()
  return (txns as any[]).filter((t) => t.urgency === 'critical' || t.hours_until_deadline <= 96)
}

export async function getCRMSummary() {
  const [leads, tasks] = await Promise.all([getLeads(), getTasks()])
  const leadsArr = leads as any[]
  const tasksArr = tasks as any[]
  return {
    totalLeads: leadsArr.length,
    hotLeads: leadsArr.filter((l) => l.score >= 80 || l.status === 'Hot').length,
    warmLeads: leadsArr.filter((l) => l.status === 'Warm').length,
    taskCount: tasksArr.length,
  }
}
