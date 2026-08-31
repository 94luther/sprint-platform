# Sprint delivery platform

## What this is
Sprint Couriers is Botswana's incumbent courier market leader: 20 years in
operation, 55 branches, and 70,000+ deliveries a month, publicly reported as
carrying the large majority of the country's national courier volume. This
project adds WhatsApp-led, on-demand delivery on top of that real, existing
fleet, rather than building a new courier network from nothing.

The plan is five order surfaces feeding one dispatch engine:
- WhatsApp (the primary, chat-first surface)
- Any shop's own website (an embeddable ordering widget)
- A Sprint-run web shop
- Corporate accounts (scheduled and on-demand B2B)
- A native app (for corporate tracking and heavy users)

All five surfaces share one dispatch engine and one settlement layer: money
auto-splits between the shop, the rider and the platform the moment an order
is confirmed delivered.

## Repo map
- **`app/`** — a working demo of the ordering and dispatch flow: a NestJS API
  and a React web client, running on in-memory seeded data with a built-in
  order-lifecycle simulator so a demo runs end to end without a real fleet
  connected. Demo logins: **Neo** (customer), **Kabelo** (courier), and
  **Amo** (ops, the dispatch board).
- **`video/`** — a Remotion video project containing the five-stop order
  journey cut (source, renders, and the concept boards behind it).
- **`docs/`** — the explainer page, the order-journey graphic, the UI
  improvement punch list, and the sanitized product findings that have shaped
  the plan so far.

## How to run the demo
```
cd app/api
npm install
cp .env.example .env   # then set JWT_SECRET and DEMO_MASTER_KEY per the notes inside
npm run dev
```
In a second terminal:
```
cd app/web
npm install
npm run dev
```
Then open **http://localhost:5173**. The login screen has one-click demo
sign-in buttons for the three roles (customer, courier, ops) — no real
credentials needed. You can browse the catalog as a guest without signing in.

The api's `.env.example` documents the two values you need in a local `.env`
(a JWT signing secret and an AES key for demo data) — any random string works
for a local demo run; generate one with the command noted in that file.

## Status (honest)
This is a **working alpha demo, not a production system**:
- Data lives in memory / a local JSON file, not a real database.
- Payment rails are simulated, not connected to a live payment provider.
- Riders are a simulator, not a live fleet feed.

**Next, in priority order:**
1. WhatsApp intake (the real order surface this is designed around).
2. Landmark-based address capture (see `docs/findings.md` — Gaborone
   addressing is landmark-first, not GPS-first).
3. Merchant till alerting (a loud counter alert / auto-printing, so orders
   are never silently missed).
4. Instant merchant settlement (see `docs/findings.md`).

## For AI reviewers and collaborators
If you are an AI (Kimi, Gemini, ChatGPT) or a colleague reviewing this repo
for the first time, start at **[`AI-REVIEW-BRIEF.md`](./AI-REVIEW-BRIEF.md)**.
It has a suggested read order and a specific set of questions this project
needs answered.
