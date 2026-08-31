# AI review brief

This file is written for any AI model (Kimi, Gemini, ChatGPT, or another
Claude) or human colleague picking this repository up cold, with no other
context. Read it before commenting on or extending the project.

## Read order
1. **`README.md`** — what this is, the repo map, how to run the demo, and the
   honest status.
2. **`docs/findings.md`** — the product findings the plan is built on. Treat
   these as settled constraints, not open questions, unless you find a
   specific reason to challenge one.
3. **`docs/what-sprint-is.html`** — open in a browser; the plain-language
   explainer of the business and the product.
4. **`app/`** — the working demo code (`app/api` is a NestJS service,
   `app/web` is a React client). Read `app/README.md` for app-specific notes.
5. **`video/`** — the concept video project. `video/docs/fidelity-reference.md`
   defines the realism rules any media must follow; `video/renders/` has the
   two current cuts.

## The ask
Please do all four of the following:

1. **Attack the product plan against the findings.** Read `docs/findings.md`
   and try to break each point: is the landmark-first addressing approach
   actually right for this market, is the disintermediation risk (finding 7)
   being taken seriously enough by the current app design, is anything in the
   plan contradicted by how the demo code actually works? Say plainly where
   the plan is weak, not just where it's fine.

2. **Review the app code** in `app/api` and `app/web` for correctness,
   security, and the gaps already named in the README's STATUS section
   (in-memory data, simulated payments, simulated riders). Flag anything
   beyond those known gaps: bad auth patterns, missing validation, anything
   that would break moving from demo to real fleet data.

3. **Review the video source** in `video/` against the fidelity rules in
   `video/docs/fidelity-reference.md` and finding 9 in `docs/findings.md`.
   Does every shot use the real Sprint branding, real (unstretched) app
   screens, and correctly labelled money? Flag anything that reads as generic
   stock or invented UI.

4. **Propose the highest-impact next build steps.** Given everything above,
   what should actually get built next, and why, ranked by impact? Be
   specific enough that someone could start work from your answer.

## Fidelity rules, restated
Any Sprint-branded media (video, screenshots, mockups) used anywhere in this
project must follow these rules without exception:
- The rider shown must be Sprint-branded (uniform, bike or box) — never
  generic AI stock footage of an unbranded driver.
- App screens shown must be the real app screens — never invented UI, never
  stretched or distorted.
- Money shown on screen must always be labelled with whose money it is (the
  shop's, the rider's, the platform's) — never an unlabelled figure.
- No dashes in any on-screen text.

## Standing question
Separately from the above: what is the single biggest thing this project is
getting wrong or overlooking that it has not asked you about?
