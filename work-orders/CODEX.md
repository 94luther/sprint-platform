# Work order: Codex (repo-connected coding agent)
Connect this repository, read README.md and AI-REVIEW-BRIEF.md, then take these
as separate pull-request sized tasks. The app is a NestJS api plus React web
demo running on in-memory seeded data; keep it dependency-light and keep both
themes working.

## PR 1: merchant till screen
The demo has customer, courier and ops views but no merchant view, and the
council's top launch priority is the merchant accept loop. Build
app/web/src/pages/MerchantTill.tsx plus the api pieces it needs: incoming order
card (items, landmark address, big Accept button), loud new-order state
(flashing accent plus repeating chime pattern like Uber Eats Orders), and on
delivery an instant settlement line ("Order collected. P42.75 to your account").
Wire a demo login for it. Follow the motion system in
app/web/src/styles/pulse.css.

## PR 2: address capture done right
The council's sharpest finding: Gaborone addressing is plot numbers and
landmarks, not GPS. Replace the checkout's single address field with a
structured capture: plot number, area, landmark line ("blue gate opposite ABC
Hardware"), saved per user for reuse, and surfaced to the courier view as
turn-by-turn friendly text. Persist through the existing in-memory store.

## PR 3: hardening pass
Sweep api/src for the gaps a demo can carry but a pilot cannot: input
validation on every endpoint, rate limits on auth and order creation, and
consistent error shapes the web client already expects. List anything you find
but do not fix in the PR description.

Acceptance for every PR: npx tsc --noEmit clean in the workspace you touched,
no new dependencies without justification, zero em or en dashes in on-screen
strings, money always labelled with whose it is.

Separately from all the above: what is the single biggest thing this codebase
is getting wrong or overlooking that nobody has asked about?
