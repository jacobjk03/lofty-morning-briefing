import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'crm.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY,
    name TEXT,
    type TEXT,
    score INTEGER,
    status TEXT,
    phone TEXT,
    email TEXT,
    budget TEXT,
    neighborhood TEXT,
    last_contact TEXT,
    activity TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    name TEXT,
    stage TEXT,
    deadline TEXT,
    hours_until_deadline INTEGER,
    value INTEGER,
    open_issues TEXT,
    urgency TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    type TEXT,
    contact TEXT,
    due TEXT,
    priority TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY,
    address TEXT,
    price INTEGER,
    beds INTEGER,
    baths INTEGER,
    status TEXT,
    days_on_market INTEGER,
    views INTEGER
  );

  CREATE TABLE IF NOT EXISTS smart_plans (
    id INTEGER PRIMARY KEY,
    name TEXT,
    status TEXT,
    issue TEXT,
    affected_leads TEXT,
    last_run TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY,
    time TEXT,
    address TEXT,
    contact TEXT,
    type TEXT
  );
`)

const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number }

if (leadCount.count === 0) {
  const insertLead = db.prepare(`
    INSERT INTO leads (name, type, score, status, phone, email, budget, neighborhood, last_contact, activity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  db.transaction(() => {
    insertLead.run('Scott Hayes', 'Buyer', 92, 'Hot', '+1 (602) 555-0142', 'scott.hayes@email.com', '$700K-$800K', 'Scottsdale', '6 days ago', JSON.stringify(['Viewed 650 Maple St 4 times today', 'Saved 650 Maple St', 'Opened last 2 emails within 10 minutes', 'Returned to site after 6-day absence']))
    insertLead.run('Maria Gonzalez', 'Buyer', 78, 'Warm', '+1 (480) 555-0198', 'maria.g@email.com', '$450K-$550K', 'Phoenix', '2 days ago', JSON.stringify(['Viewed 3 listings', 'Requested info on 1842 Camelback']))
    insertLead.run('David Kim', 'Seller', 61, 'Warm', '+1 (602) 555-0167', 'david.kim@email.com', null, 'Tempe', '4 days ago', JSON.stringify(['Requested home valuation', 'Viewed market report']))
  })()

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (name, stage, deadline, hours_until_deadline, value, open_issues, urgency)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  db.transaction(() => {
    insertTransaction.run('Johnson — 650 Maple St', 'Closing', 'Apr 21, 2026', 72, 485000, JSON.stringify(['Inspection note still open', 'Final walkthrough not scheduled']), 'critical')
    insertTransaction.run('Williams — 1842 Camelback', 'Inspection', 'Apr 25, 2026', 168, 520000, JSON.stringify(['Inspection report pending']), 'high')
  })()

  const insertTask = db.prepare(`
    INSERT INTO tasks (type, contact, due, priority)
    VALUES (?, ?, ?, ?)
  `)
  db.transaction(() => {
    insertTask.run('Call', 'Scott Hayes', '9:00 AM', 'high')
    insertTask.run('Text', 'James Martinez', '9:30 AM', 'high')
    insertTask.run('Email', 'Williams File', '1:00 PM', 'medium')
    insertTask.run('Call', 'Maria Gonzalez', '10:00 AM', 'high')
  })()

  const insertListing = db.prepare(`
    INSERT INTO listings (address, price, beds, baths, status, days_on_market, views)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  db.transaction(() => {
    insertListing.run('650 Maple St, Scottsdale', 749000, 4, 3, 'Active', 12, 47)
    insertListing.run('1842 Camelback Rd, Phoenix', 520000, 3, 2, 'Showing', 8, 31)
  })()

  db.prepare(`
    INSERT INTO smart_plans (name, status, issue, affected_leads, last_run)
    VALUES (?, ?, ?, ?, ?)
  `).run('Lofty Bloom Companion', 'Paused', 'Email bounce on 3 leads', JSON.stringify(['Amy Chen', 'David Kim', 'Maria Gonzalez']), 'Yesterday')

  db.prepare(`
    INSERT INTO appointments (time, address, contact, type)
    VALUES (?, ?, ?, ?)
  `).run('2:00 PM', '1842 Camelback Rd, Phoenix', 'James Martinez', 'Showing')
}

export default db
