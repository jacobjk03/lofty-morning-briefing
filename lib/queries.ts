import db from './db'

export function getAllLeads() {
  const leads = db.prepare('SELECT * FROM leads ORDER BY score DESC').all() as any[]
  return leads.map(l => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
}

export function getHotLeads() {
  const leads = db.prepare("SELECT * FROM leads WHERE status = 'Hot' ORDER BY score DESC").all() as any[]
  return leads.map(l => ({ ...l, activity: JSON.parse(l.activity || '[]') }))
}

export function getLeadById(id: number) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as any
  if (!lead) return null
  return { ...lead, activity: JSON.parse(lead.activity || '[]') }
}

export function getCriticalTransactions() {
  const txns = db.prepare("SELECT * FROM transactions WHERE urgency IN ('critical', 'high') ORDER BY hours_until_deadline ASC").all() as any[]
  return txns.map(t => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
}

export function getAllTransactions() {
  const txns = db.prepare('SELECT * FROM transactions ORDER BY hours_until_deadline ASC').all() as any[]
  return txns.map(t => ({ ...t, openIssues: JSON.parse(t.open_issues || '[]') }))
}

export function getTasksByType() {
  return db.prepare('SELECT type, COUNT(*) as count FROM tasks WHERE completed = 0 GROUP BY type').all()
}

export function getAllTasks() {
  return db.prepare('SELECT * FROM tasks WHERE completed = 0 ORDER BY priority DESC').all()
}

export function getAllListings() {
  return db.prepare('SELECT * FROM listings').all()
}

export function getPausedSmartPlans() {
  const plans = db.prepare("SELECT * FROM smart_plans WHERE status = 'Paused'").all() as any[]
  return plans.map(p => ({ ...p, affectedLeads: JSON.parse(p.affected_leads || '[]') }))
}

export function getAllAppointments() {
  return db.prepare('SELECT * FROM appointments ORDER BY time ASC').all()
}

export function getCRMSummary() {
  const totalLeads = (db.prepare('SELECT COUNT(*) as count FROM leads').get() as any).count
  const hotLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Hot'").get() as any).count
  const warmLeads = (db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'Warm'").get() as any).count
  const highScore = (db.prepare('SELECT COUNT(*) as count FROM leads WHERE score >= 70').get() as any).count
  const criticalTxns = (db.prepare("SELECT COUNT(*) as count FROM transactions WHERE urgency = 'critical'").get() as any).count
  const pausedPlans = (db.prepare("SELECT COUNT(*) as count FROM smart_plans WHERE status = 'Paused'").get() as any).count
  const taskCount = (db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 0').get() as any).count

  return { totalLeads, hotLeads, warmLeads, highScore, criticalTxns, pausedPlans, taskCount }
}
