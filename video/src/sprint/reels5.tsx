/**
 * Five marketable reels, built to the reel-market-trends checklist:
 * hook readable inside 1 second, all critical text in the platform safe zone
 * (top ≥108px, bottom ≥320px clear, right ≥120px clear), beats ≤ 3.5s, one CTA,
 * a progress cue in every format, loop-friendly where possible.
 *
 *   UrgencyReel  600f/20s  POV countdown — Sprint Service conversion
 *   ListReel     600f/20s  "5 things we move before lunch" — retention listicle
 *   BizReel      600f/20s  B2B direct address — contract pipeline
 *   ProofReel    600f/20s  stat-stack receipts — trust/consideration
 *   LoopReel     360f/12s  seamless brand loop — replays/awareness
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { at, C, EASE, fontsReady, prog, SANS, TEXT } from "./brand";
import { Sentence } from "./kinetic";

import { Grade, Index, Kick, LightSweep, Scene, Slash, Subject, Type } from "./reel";

// Duration targets (30fps). Evidence 2026-08-25: retention beats length, but the
// documented sweet spot for a cold-audience reel is 9-15s (270-450f). Author NEW
// reels at REEL_TARGET_MAX or below; only go to 600f when the beat structure
// genuinely earns the extra 5s (proof stacks, listicles with a progress cue).
export const REEL_TARGET_MIN = 270; //  9s
export const REEL_TARGET_MAX = 450; // 15s

export const URGENCY_DURATION = 600;
export const LIST_DURATION = 600;
export const BIZ_DURATION = 600;
export const PROOF_DURATION = 600;
export const LOOP_DURATION = 360;

const PAD = 84;
const SAFE_KICK = 356; // decorative captions above the platform UI band

// --- new marketable furniture ----------------------------------------------

/** Digital clock ticking toward five — the urgency engine of R1. */
const Countdown: React.FC<{ fromMin: number; toMin: number; over: number; y?: number }> = ({
  fromMin,
  toMin,
  over,
  y = 640,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, over, (n) => n);
  const mins = Math.min(toMin, fromMin + Math.floor(at(p, 0, toMin - fromMin + 0.99)));
  const pop = prog(frame, 4, 8, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: "50%",
        transform: `translateX(-50%) scale(${at(pop, 1.2, 1)})`,
        opacity: pop,
        background: "#101210",
        color: C.white,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 150,
        letterSpacing: "0.04em",
        padding: "10px 46px 18px",
        borderRadius: 22,
        fontVariantNumeric: "tabular-nums",
        zIndex: 3,
      }}
    >
      16:{String(mins).padStart(2, "0")}
      <span
        style={{
          position: "absolute",
          top: -16,
          right: -14,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: C.orange,
        }}
      />
    </div>
  );
};

/** Numbered list progress — the retention engine of R2. */
const ListProgress: React.FC<{ n: number; total?: number }> = ({ n, total = 5 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, 8, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        top: 128,
        left: PAD,
        display: "flex",
        gap: 12,
        alignItems: "center",
        opacity: p,
        zIndex: 4,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === n ? 46 : 16,
            height: 16,
            borderRadius: 9,
            background: i + 1 <= n ? C.orange : "rgba(20,24,16,0.18)",
          }}
        />
      ))}
      <div style={{ fontFamily: TEXT, fontWeight: 800, fontSize: 26, color: "#6E675D", marginLeft: 8 }}>
        {n}/{total}
      </div>
    </div>
  );
};

/** Big animated stat — the proof engine of R4. */
const BigStat: React.FC<{ value: number; suffix: string; label: string; countOver?: number }> = ({
  value,
  suffix,
  label,
  countOver = 24,
}) => {
  const frame = useCurrentFrame();
  const n = Math.round(at(prog(frame, 8, countOver, EASE.out), 0, value));
  const labelP = prog(frame, 26, 10, EASE.out);
  return (
    <div style={{ position: "absolute", top: 560, left: PAD, right: PAD, textAlign: "center", zIndex: 2 }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 330,
          lineHeight: 1,
          color: C.ink,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {n}
        <span style={{ color: C.orange }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: 64,
          color: C.ink,
          marginTop: 18,
          opacity: labelP,
          transform: `translateY(${at(labelP, 18, 0)}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** End card with the CTA pill inside the safe zone. */
const EndCard: React.FC<{ cta?: string; line?: string }> = ({
  cta = "WhatsApp 76 999 965",
  line = "www.sprintcouriers.co.bw",
}) => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 6, 14, EASE.out);
  const slash = prog(frame, 12, 14, EASE.wipe);
  const ctaP = prog(frame, 24, 12, EASE.overshoot);
  return (
    <Scene dur={150} hardOut>
      <div
        style={{
          position: "absolute",
          left: "-30%",
          width: "170%",
          height: 88,
          top: "84%",
          background: C.green,
          transform: `rotate(-27deg) scaleX(${slash})`,
          transformOrigin: "left center",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(-120px)" }}>
        <div style={{ width: 860, textAlign: "center", position: "relative" }}>
          <LightSweep delay={26} />
          <Img
            src={staticFile("logo-mark.png")}
            style={{
              width: "100%",
              maxWidth: "none",
              display: "block",
              opacity: logo,
              filter: logo < 0.96 ? `blur(${at(logo, 18, 0)}px)` : "drop-shadow(0 22px 34px rgba(20,24,16,0.16))",
              transform: `scale(${at(logo, 1.07, 1)})`,
            }}
          />
          <div
            style={{
              marginTop: 52,
              display: "inline-block",
              fontFamily: TEXT,
              fontWeight: 800,
              fontSize: 46,
              color: C.white,
              background: C.green,
              borderRadius: 999,
              padding: "22px 48px",
              opacity: ctaP,
              transform: `scale(${at(ctaP, 1.12, 1)})`,
            }}
          >
            {cta}
          </div>
          <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 30, color: "#6E675D", marginTop: 26, opacity: ctaP }}>
            {line}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const shell = (beats: { at: number; dur: number; C: React.FC }[]) => {
  const Comp: React.FC = () => {
    const [handle] = useState(() => delayRender("Loading brand fonts"));
    useEffect(() => {
      fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
    }, [handle]);
    return (
      <AbsoluteFill style={{ backgroundColor: "#F5F3ED" }}>
        {beats.map(({ at: from, dur, C: B }) => (
          <Sequence key={from} from={from} durationInFrames={dur}>
            <B />
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  };
  return Comp;
};

// --- R1 · UrgencyReel -------------------------------------------------------

const U1: React.FC = () => (
  <Scene dur={90} hardIn>
    <Index n={1} total={6} />
    <Slash top={1010} delay={-16} />
    <Type>
      <Sentence
        size={124}
        start={0}
        step={3}
        tokens={[
          { t: "16:47.", w: 800, e: "fill", accent: C.orange },
          { t: "It must be", w: 300, br: true },
          { t: "there", w: 300 },
          { t: "by five.", w: 700 },
        ]}
      />
    </Type>
    <Subject file="shot-handoff.png" width={1500} delay={8} bottom={-40} reflect={false} />
    <Kick text="Sprint Service" bottom={SAFE_KICK} />
  </Scene>
);

const U2: React.FC = () => (
  <Scene dur={90}>
    <Index n={2} total={6} />
    <Slash top={1050} delay={2} />
    <Type>
      <Sentence
        size={118}
        step={5}
        tokens={[
          { t: "One", w: 300 },
          { t: "message.", w: 300, br: true },
          { t: "We're moving.", w: 800, e: "box", accent: C.green },
        ]}
      />
    </Type>
    <Subject file="real-hand-app.png" width={800} bottom={210} delay={10} reflect={false} />
    <Kick text="76 999 965" bottom={SAFE_KICK} />
  </Scene>
);

const U3: React.FC = () => (
  <Scene dur={90}>
    <Index n={3} total={6} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={110}
        step={5}
        tokens={[
          { t: "Across", w: 300 },
          { t: "town,", w: 300, br: true },
          { t: "against", w: 300 },
          { t: "the clock.", w: 800, e: "underline", accent: C.orange },
        ]}
      />
    </Type>
    <Countdown fromMin={49} toMin={55} over={70} y={700} />
    <Subject file="shot-hilux.png" width={1330} from={300} bottom={90} delay={8} />
  </Scene>
);

const U4: React.FC = () => (
  <Scene dur={120}>
    <Index n={4} total={6} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={118}
        step={5}
        tokens={[
          { t: "Delivered.", w: 800, e: "fill", accent: C.orange },
          { t: "16:58.", w: 700, br: true },
        ]}
      />
    </Type>
    <Subject file="shot-handoff.png" width={1500} delay={10} bottom={-40} reflect={false} />
    <Kick text="Two minutes to spare" bottom={SAFE_KICK} />
  </Scene>
);

const U5: React.FC = () => (
  <Scene dur={90} hardOut>
    <Index n={5} total={6} />
    <Slash top={1000} delay={2} />
    <Type top={520}>
      <Sentence
        size={126}
        step={5}
        align="center"
        tokens={[
          { t: "Sprint Service.", w: 300, br: true },
          { t: "Under 1 hour.", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
  </Scene>
);

export const UrgencyReel = shell([
  { at: 0, dur: 90, C: U1 },
  { at: 90, dur: 90, C: U2 },
  { at: 180, dur: 90, C: U3 },
  { at: 270, dur: 120, C: U4 },
  { at: 390, dur: 90, C: U5 },
  { at: 480, dur: 120, C: EndCard },
]);

// --- R2 · ListReel ----------------------------------------------------------

const listItem = (
  n: number,
  head: string,
  emph: string,
  subject: React.ReactNode,
): React.FC => {
  const B: React.FC = () => (
    <Scene dur={n === 1 ? 90 : 75} hardIn={n === 1}>
      <ListProgress n={n} />
      <Slash top={1030} delay={n === 1 ? -16 : 2} />
      <Type top={210}>
        <Sentence
          size={112}
          start={n === 1 ? 0 : 2}
          step={4}
          tokens={[
            { t: head, w: 300, br: true },
            { t: emph, w: 800, e: "fill", accent: C.orange },
          ]}
        />
      </Type>
      {subject}
    </Scene>
  );
  return B;
};

const L0: React.FC = () => (
  <Scene dur={90} hardIn>
    <Slash top={1010} delay={-16} />
    <Type>
      <Sentence
        size={122}
        start={0}
        step={3}
        tokens={[
          { t: "5 things", w: 800, e: "fill", accent: C.orange },
          { t: "we move", w: 300, br: true },
          { t: "before lunch.", w: 300 },
        ]}
      />
    </Type>
    <Subject file="shot-courier-boxes.png" height={1040} bottom={-30} delay={8} reflect={false} />
  </Scene>
);

const L1 = listItem(1, "Your", "documents.", <Subject file="shot-office.png" height={1060} bottom={-30} delay={8} reflect={false} />);
const L2 = listItem(2, "Spare", "parts.", <Subject file="real-satchel-boxes.png" width={880} bottom={330} delay={8} />);
const L3 = listItem(3, "Online", "orders.", <Subject file="real-laptops.png" width={980} bottom={430} delay={8} />);
const L4 = listItem(4, "Serious", "freight.", <Subject file="shot-hilux.png" width={1330} bottom={90} delay={8} />);
const L5 = listItem(5, "Your", "promises.", <Subject file="shot-handoff.png" width={1500} bottom={-40} delay={8} reflect={false} />);

export const ListReel = shell([
  { at: 0, dur: 90, C: L0 },
  { at: 90, dur: 90, C: L1 },
  { at: 180, dur: 75, C: L2 },
  { at: 255, dur: 75, C: L3 },
  { at: 330, dur: 75, C: L4 },
  { at: 405, dur: 75, C: L5 },
  { at: 480, dur: 120, C: EndCard },
]);

// --- R3 · BizReel -----------------------------------------------------------

const Z1: React.FC = () => (
  <Scene dur={90} hardIn>
    <Index n={1} total={5} />
    <Slash top={1010} delay={-16} />
    <Type>
      <Sentence
        size={118}
        start={0}
        step={3}
        tokens={[
          { t: "Running a", w: 300 },
          { t: "business", w: 800, e: "fill", accent: C.orange, br: true },
          { t: "in Botswana?", w: 300 },
        ]}
      />
    </Type>
    <Subject file="real-laptops.png" width={980} bottom={430} delay={8} />
  </Scene>
);

const Z2: React.FC = () => (
  <Scene dur={105}>
    <Index n={2} total={5} />
    <Slash top={1050} delay={2} />
    <Type>
      <Sentence
        size={118}
        step={5}
        tokens={[
          { t: "Your customers", w: 300, br: true },
          { t: "want it", w: 300 },
          { t: "today.", w: 800, e: "underline", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="shot-handoff.png" width={1500} delay={10} bottom={-40} reflect={false} />
  </Scene>
);

const Z3: React.FC = () => (
  <Scene dur={105}>
    <Index n={3} total={5} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={118}
        step={5}
        tokens={[
          { t: "We become", w: 300, br: true },
          { t: "your", w: 300 },
          { t: "delivery team.", w: 800, e: "box", accent: C.green, br: true },
        ]}
      />
    </Type>
    <Subject file="shot-overalls.png" height={1280} bottom={0} x={230} delay={10} />
    <Kick text="Collections on your schedule" bottom={SAFE_KICK} />
  </Scene>
);

const Z4: React.FC = () => (
  <Scene dur={105} hardOut>
    <Index n={4} total={5} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={112}
        step={5}
        tokens={[
          { t: "Documents.", w: 700, br: true },
          { t: "Stock.", w: 700, br: true },
          { t: "Worldwide.", w: 800, e: "underline", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="shot-globe.png" width={1150} delay={10} bottom={210} />
    <Kick text="Via Aramex international" bottom={SAFE_KICK} />
  </Scene>
);

const BizEnd: React.FC = () => <EndCard cta="Let's talk · 76 999 965" line="Business accounts · www.sprintcouriers.co.bw" />;

export const BizReel = shell([
  { at: 0, dur: 90, C: Z1 },
  { at: 90, dur: 105, C: Z2 },
  { at: 195, dur: 105, C: Z3 },
  { at: 300, dur: 105, C: Z4 },
  { at: 405, dur: 195, C: BizEnd },
]);

// --- R4 · ProofReel ---------------------------------------------------------

const P1: React.FC = () => (
  <Scene dur={90} hardIn>
    <Index n={1} total={6} />
    <Slash top={1010} delay={-16} />
    <Type>
      <Sentence
        size={122}
        start={0}
        step={3}
        tokens={[
          { t: "Don't take", w: 300, br: true },
          { t: "our word", w: 300 },
          { t: "for it.", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="real-award.png" width={900} bottom={380} delay={8} reflect={false} />
  </Scene>
);

const statBeat = (n: number, value: number, suffix: string, label: string, kick: string): React.FC => {
  const B: React.FC = () => (
    <Scene dur={90}>
      <Index n={n} total={6} />
      <Slash top={1040} delay={2} />
      <BigStat value={value} suffix={suffix} label={label} />
      <Kick text={kick} bottom={SAFE_KICK} />
    </Scene>
  );
  return B;
};

const P2 = statBeat(2, 20, "", "years on the road.", "Since 2006");
const P3 = statBeat(3, 75, "+", "destinations.", "Nationwide, every day");
const P4 = statBeat(4, 1, "hr", "across town.", "Sprint Service");
const P5 = statBeat(5, 1, "msg", "and it's moving.", "WhatsApp 76 999 965");

export const ProofReel = shell([
  { at: 0, dur: 90, C: P1 },
  { at: 90, dur: 90, C: P2 },
  { at: 180, dur: 90, C: P3 },
  { at: 270, dur: 90, C: P4 },
  { at: 360, dur: 90, C: P5 },
  { at: 450, dur: 150, C: EndCard },
]);

// --- R5 · LoopReel ----------------------------------------------------------
// Frame 0 and frame 359 are the same composition (bone + settled slash), so
// the reel loops seamlessly and replays read as retention.

const LoopStage: React.FC = () => {
  const frame = useCurrentFrame();
  const world = Math.min(prog(frame, 20, 10, EASE.out), 1 - prog(frame, 150, 12, EASE.in));
  const delivered = Math.min(prog(frame, 165, 10, EASE.out), 1 - prog(frame, 320, 14, EASE.in));
  const logo = Math.min(prog(frame, 210, 12, EASE.out), 1 - prog(frame, 322, 14, EASE.in));

  return (
    <AbsoluteFill style={{ background: "linear-gradient(178deg, #F8F6F1 0%, #F5F3ED 55%, #EFEDE5 100%)" }}>
      <Slash top={1010} delay={-16} />
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 150,
            color: C.ink,
            opacity: world,
            transform: `translateY(${at(world, 26, 0)}px)`,
          }}
        >
          Your world.
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 150,
            color: C.white,
            background: C.orange,
            display: "inline-block",
            padding: "0 0.2em 0.08em",
            transform: `skewX(-8deg) scale(${at(delivered, 0.9, 1)})`,
            opacity: delivered,
            marginTop: 10,
          }}
        >
          Delivered.
        </div>
      </div>
      <div style={{ position: "absolute", top: 1150, left: 0, right: 0, textAlign: "center", opacity: logo }}>
        <Img
          src={staticFile("logo-mark.png")}
          style={{ width: 560, maxWidth: "none", display: "inline-block", filter: "drop-shadow(0 18px 28px rgba(20,24,16,0.15))" }}
        />
      </div>
      <Grade />
    </AbsoluteFill>
  );
};

export const LoopReel: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
  return <LoopStage />;
};
