# Lofty Morning Briefing

> **GlobeHack 2026 · ASU ACM × Global Career Network**  
> Reimagining Lofty CRM's first-login experience — from an overwhelming dashboard to a voice-forward AI morning briefing.

---

## What we built

A live **Next.js 15** prototype: dense “before” CRM → **Lofty AI** morning briefing → lead drill-down, AI chat, and **cloud-backed CRM** (InsForge PostgreSQL) with optional **ElevenLabs** conversational voice on lead call.

| Tab | What it shows |
|-----|----------------|
| **Before** | Dense Lofty-style dashboard (widgets, friction, setup cues) |
| **After** | Full-screen “after” dashboard variant |
| **Lofty AI** | AI orb + morning priorities, action cards, utility rail |
| **Lead detail** | Scott-style lead: score ring, signal breakdown, quick actions, AI draft SMS, **voice call** (ElevenLabs ConvAI) |
| **AI Agents** | Agent tooling / navigation |
| **Conversation** | Live chat with CRM context (Groq) |

---

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill in all keys in .env.local (Groq, ElevenLabs, InsForge — see Environment)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **one** dev server so env vars and port stay consistent (default **:3000**).

If the build acts stale after dependency or env changes:

```bash
rm -rf .next && npm run dev
```

---

## Environment

Create `.env.local` from `.env.local.example`. Typical variables:

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Briefing, chat, draft generation |
| `ELEVENLABS_API_KEY` | ElevenLabs API (TTS / agents) |
| `ELEVENLABS_VOICE_ID` | Voice for `/api/speak` (non–ConvAI paths) |
| `ELEVENLABS_AGENT_ID` | ConvAI agent (server) |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Same agent id for in-browser WebRTC (public agent) |
| `INSFORGE_URL` | InsForge app base URL |
| `INSFORGE_API_KEY` | InsForge project API key |

Groq: [console.groq.com](https://console.groq.com). Without `GROQ_API_KEY`, briefing/chat/draft use sensible fallbacks where implemented.

---

## Data layer

CRM data lives in **InsForge (PostgreSQL)** via `@insforge/sdk` (`lib/insforge.ts`, `lib/queries.ts`). API routes read leads, transactions, tasks, listings, appointments, and smart plans from the cloud.

`lib/getData.ts` uses InsForge first and falls back to **`mockFallback`** only if a query fails, so the UI stays demo-able offline.

Voice calls log to InsForge **`call_logs`** (duration, transcript payload) through **`POST /api/log-call`**.

---

## API routes (selected)

| Route | Method | Returns |
|-------|--------|---------|
| `/api/briefing` | GET | Morning summary (Groq + CRM context) |
| `/api/leads` | GET | All leads |
| `/api/leads/[id]` | GET | Single lead (UUID or legacy index `1` = top by score) |
| `/api/transactions` | GET | Transactions |
| `/api/tasks` | GET | Tasks |
| `/api/listings` | GET | Listings |
| `/api/appointments` | GET | Appointments |
| `/api/chat` | POST | Streaming chat (Groq) |
| `/api/draft` | POST | Draft message for a lead (Groq) |
| `/api/log-call` | POST | Persist call metadata + transcript to InsForge |
| `/api/elevenlabs-token` | GET | Short-lived ConvAI token (optional; agent id path also used) |
| `/api/extract-lead` | POST | Lead extraction helper |
| `/api/smart-plan` | POST | Smart plan actions |

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Phosphor Icons |
| Database | **InsForge** — PostgreSQL + REST-style SDK |
| AI | Groq (`llama-3.3-70b-versatile`) · **ElevenLabs** ConvAI + `@elevenlabs/react` for voice |

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build (run before release)
npm start        # production server (after build)
```

---

## Project layout (abbreviated)

```
app/
  page.tsx              # Tab shell, data fetch, screen routing
  components/           # Before/After/LeadDetail, AIAssistant, modals, CallOverlay, …
  api/                  # briefing, leads, chat, draft, log-call, …
lib/
  insforge.ts           # InsForge SDK client
  queries.ts            # CRM queries (InsForge)
  getData.ts            # Loaders + mock fallback
  mockFallback.ts       # Offline/demo fallback data
  types.ts
docs/                   # Local-only (gitignored): teammate notes, assets — share out of band if needed
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
