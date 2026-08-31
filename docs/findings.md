# Product findings: what the review council confirmed

Sanitized, product-level summary of the conclusions that have survived scrutiny
so far. These are design and operating findings, not internal figures or
commercial specifics. Anyone continuing this project should treat these as the
starting constraints, not as things still up for casual debate.

## 1. Addressing is landmark-first, not GPS-first
Gaborone addressing runs on plot numbers and landmarks, not reliable GPS grids.
A map pin alone is not enough to find a customer. Tracking and handoff should
lead with an arrival window plus a landmark confirmation step (a short chat
prompt like "look out for a Sprint rider near [landmark] in the next 5
minutes"), with the live map shown as a secondary, supporting view rather than
the primary way the customer locates the rider. This is a hybrid ruling: keep
the map, but do not depend on it doing the whole job.

## 2. Merchants need a loud, hard-to-miss order alert
A busy shop misses orders when the notification sits on a buried personal
phone. The fix is a dedicated, loud alert at the counter, ideally a cloud
receipt printer that auto-prints the order the moment it lands, with SMS as a
fallback channel if push or wifi fails. Without this, orders get missed and
the platform eats the blame for what is really a notification problem.

## 3. Merchant settlement must be instant
Day-to-day shops (food, grocery, small retail) run on tight cash cycles and
will not tolerate delayed payouts. Settlement needs to land as close to
"order delivered" as technically possible, with a visible confirmation in the
same thread the shop already uses. Anything that reads as "we'll pay you
later" is a churn risk for this merchant segment specifically.

## 4. Payment should stay inside the WhatsApp thread
Checkout, address capture and payment should all happen inside the WhatsApp
conversation via WhatsApp Flows, not by sending the customer to an external
link or a separate app. Every hop outside the thread is a point where
customers drop off.

## 5. Photo proof of delivery, posted into the same thread
The rider photographs the delivered order and it lands directly in the same
WhatsApp thread the customer has been following. This replaces "trust me" with
visible proof, and is especially important in a market where cash and low
trust intersect.

## 6. An in-chat exception and dispute workflow is missing and needed
There is currently no defined way to handle "this didn't arrive," "wrong
item," or "customer isn't answering" inside the chat flow itself. This is a
confirmed gap: the happy path (order, dispatch, deliver) is well covered, but
the unhappy path is not, and it needs a first-class in-thread flow rather than
being handled ad hoc by a human every time.

## 7. Disintermediation is the year-one risk
The single biggest strategic risk in year one is merchants and customers
learning each other's numbers from the delivery interaction and cutting the
platform out for the next order. The platform has to keep earning its fee on
every single order through the things that are genuinely hard for a merchant
or customer to replicate on their own: payment handling, dispatch, live
tracking, delivery proof and support. If any one of those becomes weak or
optional, the disintermediation risk rises immediately.

## 8. The operational culture shift is bigger than the software
Moving a courier fleet that is used to scheduled, contracted B2B runs into
on-demand, evening and weekend, point-to-point delivery work is not just a
dispatch problem, it is a people problem. Shift patterns, pay structure and
rider training all need to be redesigned for this new work pattern, not
retrofitted onto the existing B2B roster and assumptions.

## 9. Fidelity rules for all media (video, screenshots, mockups)
Any Sprint-branded media used to pitch or explain this project must follow
fixed realism rules:
- The rider shown must be Sprint-branded (uniform, bike or box). Never generic
  AI stock footage of an unbranded driver standing in for a Sprint rider.
- App screens shown must be the real app screens, never invented UI, never
  stretched or distorted to fit a frame.
- Money shown on screen must always be labelled with whose money it is (the
  shop's, the rider's, the platform's), never an unlabelled figure.
- No dashes in any on-screen text.

These rules exist because generic or unlabelled media undermines the "this is
real and it works" case the whole project is making.
