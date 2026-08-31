/**
 * Sprint App Demo — 30 second vertical product demo, 1080x1920 @ 30fps.
 *
 * Four beats: logo entrance, a manifesto-style promise line-up, a phone-frame
 * walkthrough of the four core screens, and a close that lands back on the
 * wordmark. The phone screenshots are placeholders (public/appdemo/*.png)
 * until real captures land — same filenames, so this file never changes.
 *
 * Built entirely from brand.ts primitives and the kinetic.tsx word grammar
 * that SprintManifesto established, so this reads as the same film.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  at,
  C,
  displayStyle,
  EASE,
  envelope,
  fontsReady,
  PAD,
  prog,
  SANS,
  SKEW,
  TEXT,
  TYPE,
} from "./brand";
import { Rings, Sentence, type Tok } from "./kinetic";

export const SPRINT_APP_DEMO_DURATION = 900;

// --- shared geometry ---------------------------------------------------------

/** Screenshots are captured at this aspect ratio; the phone screen follows it. */
// Matches capture-shots.ps1 geometry: headless Edge clamps windows under about
// 510 CSS px, so shots are captured at 512x1024 and the frame keeps that exact
// aspect. Any mismatch here makes objectFit cover crop the sides and slice the
// courier card back off, which is the bug these numbers exist to prevent.
const SHOT_W = 512;
const SHOT_H = 1024;

const PHONE_SCREEN_W = 420;
const PHONE_SCREEN_H = Math.round(PHONE_SCREEN_W * (SHOT_H / SHOT_W));
const PHONE_BEZEL = 16;

/** Where the phone sits for every app-demo sub-beat, biased right so the
 * side caption has room to breathe on the left. */
const PHONE_X = 660;
const PHONE_Y = 1060;

// --- PhoneFrame ---------------------------------------------------------------

/**
 * Reusable device chrome: rounded 60px corners, thin ink bezel, a soft notch,
 * a drop shadow, and a slight 3D tilt as it arrives. Fill it with an <Img>
 * (or a stack of them) sized to PHONE_SCREEN_W x PHONE_SCREEN_H.
 */
export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, EASE.out);
  const outerW = PHONE_SCREEN_W + PHONE_BEZEL * 2;
  const outerH = PHONE_SCREEN_H + PHONE_BEZEL * 2;

  return (
    <div style={{ perspective: 1800 }}>
      <div
        style={{
          width: outerW,
          height: outerH,
          borderRadius: 60,
          background: C.ink,
          boxShadow: "0 46px 90px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.35)",
          opacity: p,
          transform: `translateY(${at(p, 70, 0)}px) scale(${at(p, 0.9, 1)}) rotateY(${at(p, 12, 0)}deg) rotateX(${at(p, -7, 0)}deg)`,
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: PHONE_BEZEL + 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 128,
            height: 24,
            borderRadius: 20,
            background: C.ink,
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08)",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: PHONE_BEZEL,
            borderRadius: 44,
            overflow: "hidden",
            background: C.inkSoft,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** A single screenshot, filling the screen area with a slow scale drift. */
const Shot: React.FC<{ file: string; opacity?: number }> = ({ file, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const drift = at(Math.min(frame / 100, 1), 1, 1.06);
  return (
    <Img
      src={staticFile(`appdemo/${file}`)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
        transform: `scale(${drift})`,
        display: "block",
      }}
    />
  );
};

/** A small skewed data chip — the brand diagonal, carrying a UI-style label. */
const Chip: React.FC<{
  text: string;
  delay?: number;
  bg?: string;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, bg = C.orange, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        padding: "10px 22px",
        borderRadius: 999,
        background: bg,
        opacity: p,
        transform: `skewX(${SKEW}deg) scale(${at(p, 0.65, 1)})`,
        boxShadow: "0 14px 28px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `skewX(${-SKEW}deg)`,
          fontFamily: TEXT,
          fontWeight: 700,
          fontSize: 26,
          color: C.white,
          whiteSpace: "pre",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** A soft pulsing ring, looping, for a "this is live" location marker. */
const Pulse: React.FC<{ x: number; y: number; delay?: number }> = ({ x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  const cycle = 46;
  const local = t % cycle;
  const p = local / cycle;
  const on = t > 0 ? 1 : 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: C.greenBright,
          opacity: (1 - p) * 0.55 * on,
          transform: `scale(${at(p, 0.4, 2.4)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 8,
          top: y - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: C.greenBright,
          opacity: on,
          boxShadow: `0 0 0 4px rgba(255,255,255,0.9)`,
        }}
      />
    </>
  );
};

/** The manifesto word grammar, set as a left-aligned caption beside the phone. */
const SideCaption: React.FC<{ tokens: Tok[] }> = ({ tokens }) => {
  const frame = useCurrentFrame();
  const env = envelope(frame, 105, 18, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        top: 640,
        width: 300,
        opacity: env,
      }}
    >
      <Sentence align="left" size={56} color={C.white} step={5} tokens={tokens} />
    </div>
  );
};

const AppBeat: React.FC<{
  captionTokens: Tok[];
  children: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ captionTokens, children, extra }) => (
  <AbsoluteFill>
    <SideCaption tokens={captionTokens} />
    <div
      style={{
        position: "absolute",
        left: PHONE_X,
        top: PHONE_Y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <PhoneFrame>{children}</PhoneFrame>
    </div>
    {extra}
  </AbsoluteFill>
);

// --- beat 1: logo entrance (0-120) -------------------------------------------

const CAP_LOGO_LINE = "Gaborone, meet your delivery network.";

const B1LogoEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const logoP = prog(frame, 4, 20, EASE.out);
  const nameP = prog(frame, 22, 18, EASE.overshoot);
  const taglineP = prog(frame, 46, 16, EASE.out);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Rings x={-190} y={-190} color={C.white} count={5} gap={115} delay={2} />
      <Rings x={1080 - 190} y={1920 - 190} color={C.white} count={4} gap={110} delay={6} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <Img
          src={staticFile("logo-mark.png")}
          style={{
            width: 260,
            opacity: logoP,
            transform: `translateY(${at(logoP, 40, 0)}px) scale(${at(logoP, 0.88, 1)})`,
            filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.4))",
          }}
        />

        <div
          style={{
            ...displayStyle(TYPE.mega, C.white),
            transform: `skewX(${SKEW}deg) scale(${at(nameP, 0.9, 1)})`,
            opacity: nameP,
          }}
        >
          SPRINT
        </div>

        <div
          style={{
            marginTop: 10,
            opacity: taglineP,
            transform: `translateY(${at(taglineP, 22, 0)}px)`,
          }}
        >
          <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: TYPE.body, color: C.white }}>
            {CAP_LOGO_LINE}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- beat 2: manifesto sequence (120-300) ------------------------------------

const ManifestoLine: React.FC<{ tokens: Tok[] }> = ({ tokens }) => {
  const frame = useCurrentFrame();
  const env = envelope(frame, 45, 12, 10);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: env }}>
      <Sentence align="center" size={124} color={C.white} step={6} tokens={tokens} />
    </AbsoluteFill>
  );
};

const MANIFESTO_LINES: Tok[][] = [
  [
    { t: "One", w: 300 },
    { t: "app.", w: 800, e: "fill", accent: C.orange, c: C.white },
  ],
  [
    { t: "Any", w: 300 },
    { t: "store.", w: 800, e: "fill", accent: C.green, c: C.white },
  ],
  [
    { t: "Any", w: 300 },
    { t: "craving.", w: 800, e: "fill", accent: C.orange, c: C.white },
  ],
  [
    { t: "Delivered", w: 300 },
    { t: "in", w: 300 },
    { t: "minutes.", w: 800, e: "fill", accent: C.green, c: C.white },
  ],
];

// The first three lines are two words each, the last is three ("Delivered in
// minutes."), so an equal 45 frame slice cut the final word off mid reveal. The
// last line gets 54 frames and the others 42, which still sums to the 180 frame
// beat.
const MANIFESTO_STARTS = [0, 42, 84, 126];
const MANIFESTO_DURS = [42, 42, 42, 54];

const B2Manifesto: React.FC = () => (
  <AbsoluteFill>
    {MANIFESTO_LINES.map((tokens, i) => (
      <Sequence key={i} from={MANIFESTO_STARTS[i]} durationInFrames={MANIFESTO_DURS[i]}>
        <ManifestoLine tokens={tokens} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// --- beat 3: app demo (300-720) ----------------------------------------------

const CAP_ORDER: Tok[] = [
  { t: "Order", w: 300 },
  { t: "in", w: 300 },
  { t: "seconds", w: 800, e: "fill", accent: C.orange, c: C.white },
];

const CAP_BRAIN: Tok[] = [
  { t: "A", w: 300 },
  { t: "brain", w: 300 },
  { t: "picks", w: 300, br: true },
  { t: "the", w: 300 },
  { t: "rider", w: 800, e: "fill", accent: C.orange, c: C.white },
];

const CAP_TRACK: Tok[] = [
  { t: "Watch", w: 300 },
  { t: "it", w: 300 },
  { t: "move,", w: 300, br: true },
  { t: "live", w: 800, e: "fill", accent: C.green, c: C.white },
];

const CAP_PAY: Tok[] = [
  { t: "Paid", w: 300 },
  { t: "your", w: 300, br: true },
  { t: "way", w: 800, e: "fill", accent: C.green, c: C.white },
];

/** 300-405 (local 0-105): catalog.png crossfades into cart.png. */
const B3aOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const catalogOpacity = 1 - prog(frame, 55, 26, EASE.out);
  const cartOpacity = prog(frame, 55, 26, EASE.out);
  return (
    <AppBeat captionTokens={CAP_ORDER}>
      <Shot file="catalog.png" opacity={catalogOpacity} />
      <Shot file="cart.png" opacity={cartOpacity} />
    </AppBeat>
  );
};

/** 405-510 (local 0-105): ops.png, with a dispatch-scoring chip callout. */
const B3bBrain: React.FC = () => (
  <AppBeat
    captionTokens={CAP_BRAIN}
    extra={
      // The phone sits at x 660 and is 452 wide, so it already reaches the right
      // edge of the 1080 canvas. Anything placed to its right gets cut off, so
      // the callout lives in the clear space on the left instead.
      <Chip text="H3 dispatch scoring" delay={38} style={{ left: 90, top: PHONE_Y - 210 }} />
    }
  >
    <Shot file="ops.png" />
  </AppBeat>
);

/** 510-615 (local 0-105): tracking.png, with a soft green live-pulse. */
const B3cTracking: React.FC = () => (
  <AppBeat captionTokens={CAP_TRACK}>
    <Shot file="tracking.png" />
    <Pulse x={PHONE_SCREEN_W * 0.62} y={PHONE_SCREEN_H * 0.4} delay={20} />
  </AppBeat>
);

/** 615-720 (local 0-105): payment.png, with four payment-method chips. */
const B3dPayment: React.FC = () => {
  const methods = ["Orange Money", "MyZaka", "Smega", "Cash"];
  return (
    <AppBeat
      captionTokens={CAP_PAY}
      extra={
        <>
          {methods.map((m, i) => (
            <Chip
              key={m}
              text={m}
              delay={30 + i * 10}
              bg={i % 2 === 0 ? C.orange : C.green}
              style={{ left: PAD, top: 1500 + i * 76 }}
            />
          ))}
        </>
      }
    >
      <Shot file="payment.png" />
    </AppBeat>
  );
};

const B3AppDemo: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={105}>
      <B3aOrder />
    </Sequence>
    <Sequence from={105} durationInFrames={105}>
      <B3bBrain />
    </Sequence>
    <Sequence from={210} durationInFrames={105}>
      <B3cTracking />
    </Sequence>
    <Sequence from={315} durationInFrames={105}>
      <B3dPayment />
    </Sequence>
  </AbsoluteFill>
);

// --- beat 4: close (720-900) --------------------------------------------------

const CLOSE_LINE_2: Tok[] = [
  { t: "A", w: 300 },
  { t: "delivery", w: 300 },
  { t: "network", w: 300, br: true },
  { t: "with", w: 300 },
  { t: "a", w: 300 },
  { t: "brain.", w: 800, e: "fill", accent: C.green, c: C.white },
];

const B4Lines: React.FC = () => {
  const frame = useCurrentFrame();
  const env = envelope(frame, 76, 14, 18);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: env }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Sentence
          align="center"
          size={104}
          color={C.white}
          step={6}
          tokens={[
            { t: "Not", w: 300 },
            { t: "a", w: 300 },
            { t: "website.", w: 800, e: "box", accent: C.orange, c: C.white },
          ]}
        />
        <Sentence align="center" size={92} color={C.white} start={26} step={6} tokens={CLOSE_LINE_2} />
      </div>
    </AbsoluteFill>
  );
};

const CAP_ALPHA = "Alpha build, running today. Built to the blueprint.";

const B4Close: React.FC = () => {
  const frame = useCurrentFrame();
  const logoP = prog(frame, 0, 18, EASE.out);
  const nameP = prog(frame, 14, 16, EASE.overshoot);
  const lineP = prog(frame, 38, 14, EASE.out);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Img
          src={staticFile("logo-mark.png")}
          style={{
            width: 200,
            opacity: logoP,
            transform: `translateY(${at(logoP, 30, 0)}px) scale(${at(logoP, 0.88, 1)})`,
            filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.4))",
          }}
        />
        <div
          style={{
            ...displayStyle(TYPE.headline, C.white),
            transform: `skewX(${SKEW}deg) scale(${at(nameP, 0.9, 1)})`,
            opacity: nameP,
          }}
        >
          SPRINT
        </div>
        <div style={{ marginTop: 6, opacity: lineP, transform: `translateY(${at(lineP, 18, 0)}px)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: TYPE.kicker, color: C.white }}>
            {CAP_ALPHA}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const B4CloseBeat: React.FC = () => (
  <AbsoluteFill>
    {/* Clean handoff. These two are both full screen centred layouts, so any
        overlap stacks the logo on top of the "website." box. */}
    <Sequence from={0} durationInFrames={76}>
      <B4Lines />
    </Sequence>
    <Sequence from={76} durationInFrames={104}>
      <B4Close />
    </Sequence>
  </AbsoluteFill>
);

// --- assembly -----------------------------------------------------------------

const BEATS = [
  { at: 0, dur: 120, Comp: B1LogoEntrance },
  { at: 120, dur: 180, Comp: B2Manifesto },
  { at: 300, dur: 420, Comp: B3AppDemo },
  { at: 720, dur: 180, Comp: B4CloseBeat },
];

export const SprintAppDemo: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* Original score: band.py piano and strings plus sfx.py whooshes on the
          scene cuts, mixed and peak limited to 94 percent in mix.py. Remotion
          encodes it directly because the only ffmpeg on this machine is
          Remotion's stripped build, which has no audio filters. */}
      <Audio src={staticFile("audio/appdemo-score.wav")} />
      {BEATS.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
