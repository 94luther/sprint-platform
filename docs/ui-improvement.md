# Sprint experience: the improvement punch list
Concrete, real-world-benchmarked improvements to the Sprint ordering and
delivery experience. Written 2026-08-30 from three research angles (UI
teardowns, merchant till UX, improvement moves). Every item names the real app
it is borrowed from. Craft seat verifies this list at the deep round; status
per item is tracked in the findings ledger.

## The frame these serve
Sprint leads with WhatsApp ordering on top of a real licensed fleet. So the
"app" to perfect is the WhatsApp thread, not a downloaded consumer app. Almost
every improvement below lives inside the chat.

## Ranked punch list

### 1. Live map plus three hard checkpoints in the WhatsApp thread
The single most valuable change. The customer should see three unmistakable
moments arrive as chat messages, not hunt for a status:
- "Accepted and leaving" with a timestamp.
- "Arriving in 5 minutes" with a small map thumbnail.
- "Here now" with a big map, the rider's photo, and the vehicle plate.
Show the map the moment the rider accepts, not only when close. Borrowed from
Amazon (accurate ETA plus visible progress cuts call-ins) and Chowdeck
(geotagging and smart dispatch). Uber Eats waits until the driver is near and
loses 1 to 2 minutes of trust; Sprint should beat that by showing it early.
Payoff cited: large drop in "where is my rider" queries.

### 2. Payment inside the chat, never an external link
WhatsApp Flows keeps checkout, address and payment in the thread. Sending the
customer to an outside gateway loses 70 to 80 percent of them; keeping it in
chat lifts conversion 30 to 50 percent (WhatsApp Flows data, verified). Collect
the address once with a geo pin plus text fallback, never ask twice. Confirm
with order number, rider name, vehicle and ETA in one message.

### 3. Photo proof of delivery, posted into the same thread
The rider photographs the delivered order at the door and it lands in the chat.
Replaces "trust me" with "see it." Standard in low trust cash markets (verified).
Then a "Delivered" badge in the same thread triggers the merchant payout.

### 4. Rider identity trust pack
At accept, show the rider's photo, name, phone and vehicle plate in the chat.
Require a live selfie from the rider before each shift, matched to the profile
photo (Uber Eats pattern, verified). One tap in chat reaches a Sprint safety
line. This is the highest trust signal for a cash market.

### 5. Merchant one tap accept and instant settlement proof
The shop accepts in WhatsApp, no dashboard, no email, no separate app to learn.
On delivery the shop sees "Order collected. BWP X to your account, settled
08:34" in the same thread, with an SMS copy for shops that are not on WhatsApp
Business. Chowdeck and Zesta both prove one tap accept works.

### 6. The till alert (the gap our own panel flagged)
A busy shop misses orders when the ping is on a buried personal phone. The fix,
from how Deliveroo and Uber Eats actually equip merchants:
- A dedicated loud device at the counter, ideally a cloud receipt printer that
  auto prints the order the second it lands (Sunmi cloud printer, roughly USD
  82 to 200; Epson TM-m30 alternative). Auto retrieves orders after a wifi
  outage.
- A loud audible alert (Uber Eats Orders flashes green and plays a sound;
  Lightspeed and the Algo 8180 speaker do the same in restaurants).
- SMS fallback fires if push or wifi fails, so an order is never silent.
This is a cheap piece of hardware plus a fallback, not a software project.

### Cash and SLA safeguards (fold into the above)
- Cash on delivery cap per order (auto flag if a customer will pay above the
  shop's limit), to kill rider theft exposure.
- A delivery time guarantee with an automatic small credit if the rider is
  late, which also imposes discipline on the fleet (Chowdeck lean model).

## What NOT to build, and why
- A dedicated consumer app. WhatsApp is already on every phone and checked
  constantly; a download is friction that loses customers. Verified against the
  app graveyard (Jumia, Bolt, Glovo) and WhatsApp abandonment data. The only
  case for an app is corporate B2B courier tracking, a separate product.
- Merchant ratings and reviews, at this stage. Clutter, moderation cost, and
  bad early reviews tank new merchants before they build volume. A stage-three
  feature, not now.
- Tipping and loyalty points in chat. Adds payment friction; Sprint riders are
  salaried fleet, not tip-chasing gig workers, so tipping poisons morale for
  about a 2 percent uplift. Spend that effort on speed and proof instead.

## Sources
Amazon delivery tracking; Uber Eats Orders and courier identity docs; Chowdeck
(Semafor, vendor hub); Sukhiba Connect (Accion, TechPoint); WhatsApp Flows
(Meta, 8x8 cpaas); Deliveroo Sunmi setup; Sunmi and Epson printer docs;
Lightspeed and Algo 8180 alert hardware. Full links in the research dump at
scratchpad\ui-research.txt for session 956c443d.
