# Work order: Kimi (K3, agentic coding + deep research)
Read README.md and AI-REVIEW-BRIEF.md first, then docs/findings.md. You are the
heavy-build seat. Three jobs, in priority order.

## 1. Build the in-chat exception and dispute flow (the biggest open finding)
The council's open finding number one: wrong address, out of stock, customer
unreachable, rider delayed are NORMAL operations, and today they have no flow.
Design and code it for the demo app (app/web + app/api, NestJS + React,
in-memory store): an "Something wrong?" entry on the tracking screen leading to
a structured exception flow (report issue, propose fix, both sides see status),
with the merchant side mirrored. Keep the app's design tokens and THE PULSE
motion system (app/web/src/styles/pulse.css). Deliver as complete files.

## 2. The 30-second journey video package
Full spec in the repo owner's brief: a 1920x1080, 30fps Remotion component
animating the five-stop order journey (Ordered, Matched, Packed, Riding,
Delivered) with a persistent progress rail and a Sprint-branded rider
illustration (green bike, orange helmet, cheetah-logo box; NEVER generic stock
people). Assets via staticFile: appdemo/catalog.png, appdemo/ops.png,
appdemo/tracking.png, logo-mark.png, audio/v3-score.wav. Compare your result
against video/src/sprint/SprintJourneyV5.tsx and beat it.

## 3. Deep research mandate
Which model is best at what (coding, research, long context, agentic work,
cost per useful output) across Kimi, Gemini, ChatGPT, Claude tiers, with
sources, so the owner routes a month of premium subscriptions optimally. Then:
the best real-world reference for a WhatsApp-first delivery experience in a
landmark-addressed city, with concrete UI patterns worth copying.

Separately from all the above: what is the single biggest thing this project
is getting wrong or overlooking that it has not asked you about?
