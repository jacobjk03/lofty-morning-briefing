# Lofty Morning Briefing

> **GlobeHack 2026 · ASU ACM × Global Career Network**  
> Reimagining Lofty CRM's first-login experience — from an overwhelming dashboard to a voice-forward AI morning briefing.

---

## What we built

A live Next.js prototype that shows the **before / after** of Lofty's agent experience:

| Tab | What it shows |
|-----|--------------|
| **Today** | The "before" — real Lofty-style dense dashboard (widgets, setup nag, friction callout) |
| **Lofty AI** | The "after" — AI orb narrates your morning, surfaces 3 priority action cards, right-hand utility rail |
| **My Dashboard** | Full CRM widget view, accessible from the Lofty AI greeting for agents who want it |
| **Lead detail** | Scott Hayes profile: score ring meter, breakdown by signal, quick actions, AI draft SMS |
| **Conversation** | Live chat powered by Groq (llama-3.3-70b) with full CRM context injected |
| **Pitch** | Problem statement, before/after comparison table, success metrics — for judges |

---

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill in your Groq API key (see Environment section below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you get stale build errors after a dependency change, run:

```bash
rm -rf .next && npm run dev
```

---

## Environment

```bash
# .env.local
GROQ_API_KEY=your_groq_key_here
```

| Variable | Required | Used by |
|----------|----------|---------|
| `GROQ_API_KEY` | Yes* | `/api/chat` (Conversation tab) · `/api/briefing` (AI morning summary) · `/api/draft` (DraftModal personalized messages) |

\* The UI loads and all tabs work without it. The Conversation tab and AI Draft feature show an inline error message if the key is missing or invalid.

Get a free key at [console.groq.com](https://console.groq.com).

---

## Scripts

```bash
npm run dev      # development server (hot reload)
npm run build    # production build
npm start        # run production server (requires build first)
```

---

## Data layer

The app seeds a local **SQLite database** (`crm.db`) on first run via `lib/db.ts`. All CRM data — leads, transactions, tasks, listings, appointments — is read from this DB through the API routes. Hardcoded fallbacks exist in every component so the UI still works if the DB or an API call fails.

`crm.db` is gitignored; it is re-created automatically on every fresh `npm run dev`.

---

## API routes

| Route | Method | Returns |
|-------|--------|---------|
| `/api/briefing` | GET | AI-generated morning summary (Groq) |
| `/api/leads` | GET | All leads with scores and activity |
| `/api/leads/[id]` | GET | Single lead by ID |
| `/api/transactions` | GET | Active transactions |
| `/api/tasks` | GET | Today's tasks |
| `/api/listings` | GET | Agent's listings |
| `/api/appointments` | GET | Upcoming appointments/showings |
| `/api/chat` | POST | Streaming chat with CRM context (Groq) |
| `/api/draft` | POST | AI-personalized draft message for a lead (Groq) |

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS (custom `ink` color scale, `pill` radius) |
| Animation | Framer Motion |
| Icons | Phosphor Icons |
| Database | better-sqlite3 (local SQLite, seeded on startup) |
| AI | Groq API — `llama-3.3-70b-versatile` |

---

## Project layout

```
app/
  page.tsx                  # Tab shell, screen routing, DB data fetching
  globals.css               # Base styles, canvas-dark class, animations
  components/
    AfterScreen.tsx         # Lofty AI morning briefing (orb + cards + rail)
    BeforeScreen.tsx        # Dense CRM dashboard ("Today" / "My Dashboard")
    LeadDetail.tsx          # Lead profile, score ring, quick actions, draft SMS
    AIAssistant.tsx         # Conversation chat UI
    PitchMode.tsx           # Judge-facing pitch slide
    ActionCard.tsx          # Priority action card (used in AfterScreen)
    CaptionStrip.tsx        # Typewriter caption for briefing narration
    LoftyUtilityRail.tsx    # Right-side icon rail (AI, Dialer, Messages, etc.)
    Orb.tsx                 # Animated SVG orb (thinking / speaking / done states)
    DraftModal.tsx          # AI-personalized draft message modal
    NavBar.tsx              # Top nav bar (Lofty-style, used in BeforeScreen)
    Toast.tsx               # Ephemeral action confirmation toast
  api/
    briefing/route.ts       # AI morning summary
    leads/route.ts          # Lead list
    leads/[id]/route.ts     # Single lead
    transactions/route.ts   # Transactions
    tasks/route.ts          # Tasks
    listings/route.ts       # Listings
    appointments/route.ts   # Appointments
    chat/route.ts           # Groq chat
    draft/route.ts          # Groq draft
  hooks/
    useVoice.ts             # Web Speech API hook for voice narration
lib/
  db.ts                     # SQLite seed + connection
  queries.ts                # All DB query functions
  types.ts                  # Shared TypeScript types
```

---

## Team

Built at GlobeHack 2026 · ASU ACM × Global Career Network

- Taljinder Singh
- Sankritya Thakur
- Jacob Kuriakose
- Mohan Kummarigunta

---

## License

Private / hackathon — confirm with your team before redistributing.
