export interface Lead {
  id: number
  name: string
  type: string
  score: number
  status: string
  phone: string
  email: string
  budget: string | null
  neighborhood: string
  last_contact: string
  activity: string[]
}

export interface Transaction {
  id: number
  name: string
  stage: string
  deadline: string
  hours_until_deadline: number
  value: number
  openIssues: string[]
  urgency: string
}

export interface Task {
  id: number
  type: string
  contact: string
  due: string
  priority: string
  completed: number
}

export interface Listing {
  id: number
  address: string
  price: number
  beds: number
  baths: number
  status: string
  days_on_market: number
  views: number
}

export interface SmartPlan {
  id: number
  name: string
  status: string
  issue: string
  affectedLeads: string[]
  last_run: string
}

export interface Appointment {
  id: number
  time: string
  address: string
  contact: string
  type: string
}

export interface BriefingPriority {
  id: string
  type: 'lead' | 'transaction' | 'smartplan'
  emoji: string
  badge: string
  badgeColor: 'green' | 'red' | 'yellow'
  title: string
  subtitle: string
  actions: string[]
}

export interface Briefing {
  briefingText: string
  priorities: BriefingPriority[]
  generatedAt: string
  source: string
}

export interface AppData {
  leads: Lead[]
  transactions: Transaction[]
  tasks: Task[]
  listings: Listing[]
  appointments: Appointment[]
  briefing: Briefing | null
  loading: boolean
}
