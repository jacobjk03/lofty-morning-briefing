// All data now comes from InsForge PostgreSQL.
// mockFallback is kept only as an emergency last-resort if InsForge is unreachable.

import {
  getAllLeads,
  getHotLeads as getHotLeadsQuery,
  getLeadById as getLeadByIdQuery,
  getAllTransactions,
  getCriticalTransactions as getCriticalTxnsQuery,
  getAllTasks,
  getAllListings,
  getPausedSmartPlans,
  getAllAppointments,
  getCRMSummary as getCRMSummaryQuery,
} from './queries'

async function withFallback<T>(fn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    console.warn('[getData] InsForge query failed, using mock fallback:', e)
    return fallbackFn()
  }
}

export async function getLeads() {
  return withFallback(getAllLeads, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.leads.map((l: any) => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
  })
}

export async function getHotLeads() {
  return withFallback(getHotLeadsQuery, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.leads
      .filter((l: any) => l.status === 'Hot')
      .map((l: any) => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
  })
}

export async function getLeadById(id: string) {
  return withFallback(
    () => getLeadByIdQuery(id),
    () => {
      const { mockFallback } = require('./mockFallback')
      const lead = mockFallback.leads.find((l: any) => String(l.id) === String(id))
      if (!lead) return null
      return { ...lead, activity: JSON.parse(lead.activity || '[]') }
    }
  )
}

export async function getTransactions() {
  return withFallback(getAllTransactions, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.transactions.map((t: any) => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
  })
}

export async function getCriticalTransactions() {
  return withFallback(getCriticalTxnsQuery, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.transactions
      .filter((t: any) => t.urgency === 'critical' || t.hours_until_deadline <= 96)
      .map((t: any) => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
  })
}

export async function getTasks() {
  return withFallback(getAllTasks, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.tasks
  })
}

export async function getListings() {
  return withFallback(getAllListings, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.listings
  })
}

export async function getSmartPlans() {
  return withFallback(getPausedSmartPlans, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.smartPlans.map((p: any) => ({
      ...p,
      affectedLeads: JSON.parse(p.affected_leads || '[]'),
    }))
  })
}

export async function getAppointments() {
  return withFallback(getAllAppointments, () => {
    const { mockFallback } = require('./mockFallback')
    return mockFallback.appointments
  })
}

export async function getCRMSummary() {
  return withFallback(getCRMSummaryQuery, () => {
    const { mockFallback } = require('./mockFallback')
    const leads = mockFallback.leads
    return {
      totalLeads: leads.length,
      hotLeads: leads.filter((l: any) => l.status === 'Hot').length,
      warmLeads: leads.filter((l: any) => l.status === 'Warm').length,
      taskCount: mockFallback.tasks.length,
    }
  })
}
