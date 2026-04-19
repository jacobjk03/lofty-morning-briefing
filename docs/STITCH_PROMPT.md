# Google Stitch Prompt — Lofty AI Redesign

Paste the entire block below into Google Stitch as a single prompt.

---

```
PROJECT: Lofty AI — Reimagining the First Experience for a Real Estate CRM

GOAL: Redesign the first-experience surface of Lofty (a real estate CRM). Today users land on an overwhelming dashboard with 9 widgets, a 47% setup nag banner, and 6 unlabeled sidebar icons. We want to replace the cluttered dashboard with a single voice-driven AI briefing screen. Same features, new front door. The brand on screen stays "Lofty AI" — we are redesigning their existing AI, not creating a new product.

BRAND:
- Primary blue: #2563EB
- Dark navy hero background: #1e2a4a
- Accent cyan: #06b6d4
- Soft white: #F8FAFC
- Emerald success: #10B981
- Amber warning: #F59E0B
- Red deadline: #EF4444
- Typography: Inter (body), Inter Tight or similar condensed sans (headlines). Generous weights — 700 bold for headlines, 500 medium for body.
- Aesthetic: premium B2B SaaS, Apple Intelligence meets Linear meets ChatGPT Advanced Voice. Calm, confident, lots of negative space, soft glows. Never cartoonish. Never Clippy.

DESIGN ONE FLOW WITH 6 SCREENS:

====================
SCREEN 1: THE BEFORE (problem statement)
====================
A deliberately cluttered dashboard to represent Lofty today. This is the problem.
Layout:
- Top: horizontal nav bar with logo (left) and 7 menu items (CRM, Sales, Marketing, Content, Automation, Reporting, More) + search bar on right.
- Under nav: a yellow warning banner, 32px tall, with text "⚠️ 47% — You have unfinished setup tasks" and a small "Go" button on the right.
- Below that: greeting "👋 Good afternoon, Baylee" with two small pill dropdowns next to it: "My Dashboard ▾" and "Today's Priorities ▾".
- Main area: a 3-column × 3-row grid of 9 small widget cards (each ~280×200px):
  1) "New Updates" — 2 blog-like announcements with tiny thumbnails
  2) "Today's New Leads" — 4 rows with tiny progress bars and scores (92, 78, 61, 44)
  3) "Today's Opportunities" — 3 colored chips: High Interest (red, 3), Likely Sellers (emerald, 5), Back to Site (blue, 12)
  4) "Need Keep In Touch" — Birthday (pink, 8) / Follow-Up (orange, 3) chips
  5) "Transactions" — 4 rows with amounts and deadlines, 2 highlighted red (near deadline)
  6) "Today's Tasks" — 2×2 grid of Call/Text/Email/Other with counts (4/2/1/3)
  7) "Appointments/Showings" — 2 upcoming rows with times (2:00 PM, 4:30 PM)
  8) "My Listings" — 3 house rows with addresses and prices
  9) "Hot Sheets" — 5 saved searches with update counts (14, 7, 23, 3, 11)
- Right sidebar (44px wide): column of 6 small unlabeled icons (🔔 📊 ⚙️ 🔍 💡 ❓).
- Overlay badge floating bottom-left: red pill, white text, "⚠️ 8–12 clicks before value."
- Overall feeling: overwhelming, visually loud, nothing stands out.

====================
SCREEN 2: THE QUESTION (transition)
====================
Black full-screen.
Center: two lines of white text (Inter 48pt regular), fading in sequentially:
Line 1: "Lofty has every feature a real estate agent could want."
Line 2 (appears after 3 seconds): "So why does every morning still feel like that?"
Minimal. No other elements. Confident negative space.

====================
SCREEN 3: THE ORB EMERGENCE (transition)
====================
Background: dark navy #1e2a4a.
Center: one line of white text (Inter 32pt regular, soft opacity 80%):
"What if the most powerful CRM in real estate was simpler than a conversation?"
Below the text (128px down): a glowing orb emerges — 160px diameter, radial gradient from #2563EB center to #06b6d4 edge, with a soft outer glow of cyan light extending ~60px beyond the orb. The orb has a subtle internal animation like breathing or liquid swirl. This is "Lofty AI" taking form.

====================
SCREEN 4: THE MORNING BRIEFING (the hero screen)
====================
Background: dark navy #1e2a4a with subtle radial gradient from center (slightly lighter cyan tint).
Composition (top to bottom, centered, vertical flow):
1) Tiny uppercase tracked label at top center: "LOFTY AI" (10pt, #06b6d4, letter-spacing 2px)
2) Centered orb (180px) with pulsing animation, same gradient as Screen 3
3) Centered under orb: greeting "Good morning, Baylee" (32pt, white, bold) and below it in smaller muted text: "Friday, April 18 · 8:42 AM" (14pt, #94A3B8)
4) Caption strip — max-width 640px, centered, 18pt white medium: a spoken-briefing sentence displayed as closed captions with a blinking caret indicating active typing. Example text shown:
   "Three things matter today. Scott Hayes is hot, your Johnson closing is 72 hours out, and your Bloom plan is paused."
5) Three action cards in a horizontal row (24px gap between them), below the caption strip, appearing to float slightly above the background:
   - Card dimensions: ~280×200px, 16px border-radius, white background, subtle cyan inner glow / 1px cyan border, soft shadow.
   - Top-left pill on each card: category tag with emoji
     - Card 1 pill: "🔥 HOT LEAD" (red bg, white text)
     - Card 2 pill: "⏰ DEADLINE" (amber bg, dark text)
     - Card 3 pill: "⚡ PAUSED" (cyan bg, dark text)
   - Card headline (16pt bold, dark navy):
     - Card 1: "Scott Hayes · Score 92"
     - Card 2: "Johnson Closing · 72 hrs"
     - Card 3: "Bloom Outreach · Paused"
   - Card one-line reasoning (13pt, #64748B):
     - Card 1: "Viewed 650 Maple × 4 today"
     - Card 2: "Inspection still open, 2 tasks overdue"
     - Card 3: "2 leads bounced — auto-paused"
   - Card bottom: two buttons side by side: "Approve" (filled blue #2563EB, white text, 14pt semibold) and "Why?" (ghost with 1px light gray border, dark gray text)
   - Bottom of card, very small: a faint chip "Powered by Lofty Lead Analysis" / "Powered by Transaction Checklists" / "Powered by Smart Plans" — 10pt, #64748B, low opacity.
6) Below cards, centered: a pill-shaped input field, 480px wide, 48px tall, subtle white border on dark bg, placeholder "Ask Lofty AI anything…" with a tiny sparkle icon left and a blue mic button right.
7) Bottom-right corner (very small, de-emphasized): link text "Explore the full Lofty dashboard →" (12pt, white 40% opacity).

Overall feeling: calm, premium, AI-forward. Empty space is a feature. Orb is the focal point. Everything else supports it. Should feel like Apple Intelligence or ChatGPT Advanced Voice, not a typical SaaS dashboard.

====================
SCREEN 5: THE EXECUTION (confirmation state)
====================
Same layout as Screen 4, but the three cards have collapsed into three compact confirmation rows:
- Each row shows a green checkmark (#10B981), the action name, and a timestamp.
  - Row 1: ✓ "Text sent to Scott Hayes" · 8:44 AM
  - Row 2: ✓ "Inspection rescheduled to Friday · client notified" · 8:44 AM
  - Row 3: ✓ "Bloom plan resumed · 2 contacts cleaned" · 8:45 AM
- Orb is slightly larger and glowing brighter cyan, with inward-drawing ripples.
- Caption above rows (18pt white): "Done. I'll check back in an hour."
- Input field below reads: "Anything else?"
The whole screen feels like a satisfying "ding" — like inbox zero for your morning.

====================
SCREEN 6: THE WHY (deep-dive, lead detail)
====================
User tapped "Why?" on the Scott Hayes card.
Background: dark navy #1e2a4a.
Layout:
- Top: thin back nav "← Back to briefing" (left, 14pt white) and "LOFTY AI" small label (right, 10pt cyan, tracked).
- Hero card, max-width 640px, centered, white bg, 24px border-radius, generous 40px padding:
  - Top row: avatar circle (56px, cyan-to-blue gradient, initials "SH"), name "Scott Hayes" (20pt bold), tags pills below name ("Buyer", "Phoenix AZ · Active today"), and on the right a huge "92" (48pt cyan bold) with "Lead Score" label below.
  - Score progress bar (8px tall, full-width, gradient fill at 92%, rounded).
  - "Score Breakdown" section header (14pt semibold), then 4 rows, each row:
    - Icon (🏠 📧 🔄 📞) 20pt
    - Label column (Listing Activity / Email Engagement / Return Visit / Contact Quality) 14pt semibold
    - Points column (+35 / +28 / +20 / +9) 14pt bold with colored accent matching its icon
    - One-sentence reasoning (11pt gray)
    - Mini progress bar showing that factor's weight contribution
- Below the score card: an "AI Draft Message" card with a cyan sparkle icon, the drafted text in a gray inner box ("Hey Scott! I noticed you've been looking at 650 Maple — it's a great match for what you described. Want to schedule a quick showing this week?"), and two buttons "Edit" (ghost) and "Send Now" (filled blue).
- Small callout below both cards, amber-tinted background (#FEF3C7):
  "Previously, Lofty showed a number. Now you see why — and act."
- At the very bottom: a "🔊 Play reasoning aloud" button that triggers Lofty AI to read the breakdown through voice.

====================
INTERACTION & STATE NOTES
====================
- All screen transitions: smooth fade + slight scale-in. 400–600ms. No hard cuts except Screen 2 which is stark.
- Orb states (use this exact grammar across every screen):
  - IDLE: slow breathe (2s loop), soft glow
  - THINKING: faster pulse, rainbow edge shimmer
  - SPEAKING: concentric ripples emanating outward every 1s
  - EXECUTING: bright cyan flash + inward-drawing rings
  - DONE: steady soft glow
- Typography rhythm: generous line-height (1.5x on body), loose letter-spacing on tiny labels, tight on headlines.
- Never use stock-photo-looking illustrations. Never use emoji mascots. The orb is the only "character."
- Every screen should feel like Lofty's brand — blue/navy/cyan — but with vastly more negative space than their current dashboard.
- Empty space is a feature, not a bug. The contrast between Screen 1's density and Screen 4's calm IS the pitch.

DELIVERABLE:
6 high-fidelity screens as a connected flow. Include hover states for the Approve / Why? / Send Now buttons and card lift micro-interactions. Target aspect ratio: 16:10 desktop web (1440×900). Also provide a 9:16 mobile web variant of Screen 4 only (we want to show the same briefing works on phone web — we are NOT building a native iOS app). Keep the design system consistent across all screens — same type scale, same colors, same orb, same card style.
```
