# Lofty Morning Briefing (GlobeHack demo)

A **GlobeHack 2026 / ASU ACM** prototype that reimagines Lofty’s first experience: a **voice-forward morning briefing** and **Lofty AI** conversation, contrasted with a dense **CRM dashboard** view.

This is a **standalone Next.js app** with **mock CRM data** (not connected to real Lofty APIs).

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Add your Groq API key for the Conversation tab
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable         | Required | Purpose                                      |
|-----------------|----------|----------------------------------------------|
| `GROQ_API_KEY`  | Yes*     | Powers `/api/chat` (Llama via Groq) for **Conversation** |

\*The rest of the UI works without it; the chat UI shows a helpful error if the key is missing.

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm start` — run production server after `build`

## What’s in the UI

- **Today** — “Before” state: busy dashboard with widgets and friction callout.  
- **Lofty AI** — Morning briefing (orb, narration, action cards) plus a **right-hand utility rail** (hover for labels). Use **My Dashboard** next to the greeting or **Explore the full Lofty dashboard** at the bottom to open the full widget view.  
- **My Dashboard** (from Lofty AI) — Same mock as **Today**, with a **Back to Morning Briefing** bar.  
- **Lead detail** — Scott Hayes score breakdown and draft message (from briefing flow).  
- **Conversation** — Chat with Lofty AI via Groq.  
- **Pitch** — Problem / metrics slide for judges.

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS  
- Framer Motion, Phosphor icons  
- Groq OpenAI-compatible API for chat

## Project layout

- `app/page.tsx` — Tab shell and screen routing  
- `app/components/` — Screens and UI pieces (`AfterScreen`, `BeforeScreen`, `AIAssistant`, etc.)  
- `app/api/chat/route.ts` — Chat API route  

## License

Private / hackathon — confirm with your team before redistributing.
