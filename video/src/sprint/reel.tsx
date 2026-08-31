/**
 * Sprint Couriers — 30 second reel, 1080x1920 @ 30fps. 900 frames, 8 beats.
 *
 * Built to the approved frame board (claude.ai artifact b5a1fa94): one visual
 * system throughout — bone ground, the brand's diagonal slash behind, kinetic
 * mixed-case Poppins up top, a real cut-out subject bleeding off the bottom.
 * Scenes hand over by blurring through; only beat 4 → 5 cuts hard.
 *
 * Beat map (frames):
 *   1    0– 90  Botswana doesn't wait.        shot-hilux
 *   2   90–180  So neither do we.             shot-courier-box
 *   3  180–330  From Gaborone to 75+ dest.    shot-globe    (counter)
 *   4  330–480  Across town in under 1 hour.  shot-handoff  (clock ring)
 *   5  480–600  Domestic. Freight. Worldwide. shot-courier-boxes
 *   6  600–720  Tracked every step.           shot-office   (route ticks)
 *   7  720–810  One message. 76 999 965       shot-overalls (WhatsApp bubble)
 *   8  810–900  Logo end card                 logo-mark     (6f of silence first)
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
import { Wipe } from "./transitions";
import { Streaks } from "./layers";

export const REEL_DURATION = 900;

const PAD = 84;
const BONE = "#F5F3ED";

// --- shared furniture -------------------------------------------------------

/** The brand's diagonal slash, soft green, tilted as on the frame board. */
export const Slash: React.FC<{ top?: number; height?: number; opacity?: number; delay?: number }> = ({
  top = 1000,
  height = 280,
  opacity = 0.14,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: "-30%",
        width: "170%",
        height,
        top,
        background: C.green,
        opacity: opacity * p,
        transform: `rotate(-27deg) translateX(${at(p, -120, 0)}px)`,
      }}
    />
  );
};

/** Type block pinned to the top third, as on the board. */
export const Type: React.FC<{ children: React.ReactNode; top?: number }> = ({
  children,
  top = 170,
}) => (
  <div style={{ position: "absolute", top, left: PAD, right: PAD }}>{children}</div>
);

/**
 * Corner brand bug — the mark, small and quiet, present from frame 1.
 *
 * (2026-08-31, reel-market-trends sweep) Brand presence established before the
 * skip point reports materially higher view-through than branding buried in an
 * end card. Sprint reels already carry the bone ground and green slash from
 * frame 1, but the mark itself only appeared on the closing card.
 *
 * Placement is safe-zone aware: bottom-left, held clear of the ~320px bottom
 * platform UI band, and left of the ~120px right-hand action rail. It sits
 * BELOW the type block (top 170) so it never competes with the hook, and it
 * carries no unique information — the reel must still read with it cropped
 * away.
 *
 * Opt-in, not automatic: drop <Bug /> into a scene when the reel is built for
 * boost. It has not yet been wired into an existing reel — any reel that
 * adopts it re-renders through the full video-qa gate first, because the bug
 * sits over the cut-out subject and the overlap has to be eyeballed.
 */
export const Bug: React.FC<{ bottom?: number; width?: number; opacity?: number }> = ({
  bottom = 372,
  width = 168,
  opacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 14, EASE.out);
  return (
    <Img
      src={staticFile("logo-mark.png")}
      style={{
        position: "absolute",
        left: PAD,
        bottom,
        width,
        maxWidth: "none",
        opacity: opacity * p,
        filter: "drop-shadow(0 10px 18px rgba(20,24,16,0.18))",
      }}
    />
  );
};

/**
 * The grade: a travelling key light, a cool floor shadow and a soft vignette
 * over every scene. This is what separates "flat fill" from "lit set".
 */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const x = at(prog(frame, 0, 260, (n) => n), -26, 46);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 5 }}>
      <div
        style={{
          position: "absolute",
          width: "170%",
          height: "160%",
          left: `${x - 60}%`,
          top: "-38%",
          background:
            "radial-gradient(ellipse 44% 38% at 50% 44%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 68%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 92% 55% at 76% 108%, rgba(26,32,24,0.09) 0%, rgba(26,32,24,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 76% 62% at 50% 46%, rgba(0,0,0,0) 58%, rgba(22,26,20,0.13) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Editorial scene index, top right — the meticulous touch. */
export const Index: React.FC<{ n: number; total: number }> = ({ n, total }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 6, 10, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        top: 92,
        right: 150,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: p * 0.85,
        zIndex: 4,
      }}
    >
      <div style={{ width: at(p, 0, 44), height: 2, background: "#9B958A" }} />
      <div
        style={{
          fontFamily: TEXT,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.22em",
          color: "#8A8478",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(n).padStart(2, "0")}&thinsp;/&thinsp;{String(total).padStart(2, "0")}
      </div>
    </div>
  );
};

/** A soft light stripe sweeping across a lockup — used on end cards. */
export const LightSweep: React.FC<{ delay?: number; dur?: number }> = ({
  delay = 24,
  dur = 14,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.wipe);
  if (p <= 0.01 || p >= 0.99) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "-20%",
        bottom: "-20%",
        width: "26%",
        left: `${at(p, -30, 110)}%`,
        background:
          "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
        transform: "rotate(8deg)",
        pointerEvents: "none",
        zIndex: 6,
      }}
    />
  );
};

/**
 * Subject cut-out. Positions its anchor point, arrives 8 frames in at
 * 1.08 → 1.00 out of blur, then holds a slow drift.
 *
 * Tailwind's preflight sets img{max-width:100%}; the wrapper is absolutely
 * positioned, so without maxWidth:none every subject caps at its wrapper's
 * shrink-to-fit width. Do not remove it.
 */
export const Subject: React.FC<{
  file: string;
  width?: number;
  height?: number;
  delay?: number;
  from?: number;
  bottom?: number;
  /** Horizontal anchor offset from centre, px. */
  x?: number;
  /** Floor reflection — only for complete objects, never waist-cropped people. */
  reflect?: boolean;
}> = ({ file, width, height, delay = 8, from = 0, bottom = 0, x = 0, reflect = true }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16, EASE.out);
  const drift = at(prog(frame, delay, 80, (n) => n), 0, 14);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom,
        width: "max-content",
        transform: `translateX(calc(-50% + ${x}px)) translate(${at(p, from, 0)}px, ${at(p, 32, 0) + drift * 0.25}px) scale(${at(p, 1.05, 1)})`,
        opacity: p,
        filter: p < 0.96 ? `blur(${at(p, 10, 0)}px)` : undefined,
      }}
    >
      <Img
        src={staticFile(file)}
        style={{
          width: width ?? "auto",
          height: height ?? "auto",
          maxWidth: "none",
          display: "block",
          filter: "drop-shadow(0 34px 46px rgba(20,24,16,0.20))",
        }}
      />
      {/* studio floor reflection — absolutely positioned so the bottom-anchored
          wrapper keeps the height of the subject alone */}
      {reflect && <Img
        src={staticFile(file)}
        style={{
          position: "absolute",
          top: "calc(100% - 4px)",
          left: 0,
          width: width ?? "auto",
          height: height ?? "auto",
          maxWidth: "none",
          display: "block",
          transform: "scaleY(-1)",
          opacity: 0.09,
          filter: "blur(7px)",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 46%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 46%)",
        }}
      />}
    </div>
  );
};

/**
 * Scene shell: bone ground, slow 1.00 → 1.03 push throughout, blur-through
 * in and out. `hardOut` drops the exit blur for the one hard cut (beat 4 → 5);
 * `hardIn` drops the entry blur on the receiving side.
 */
export const Scene: React.FC<{
  children: React.ReactNode;
  dur: number;
  hardIn?: boolean;
  hardOut?: boolean;
}> = ({ children, dur, hardIn = false, hardOut = false }) => {
  const frame = useCurrentFrame();
  const inP = hardIn ? 1 : prog(frame, 0, 14, EASE.out);
  const outP = hardOut ? 0 : prog(frame, dur - 12, 12, EASE.in);
  const push = at(prog(frame, 0, dur, (n) => n), 1.0, 1.015);
  const drift = at(1 - inP, 24, 0) - at(outP, 0, 20);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(178deg, #F8F6F1 0%, #F5F3ED 55%, #EFEDE5 100%)", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${push}) translateY(${drift}px)`,
          opacity: inP * (1 - outP),
        }}
      >
        {children}
      </AbsoluteFill>
      <Grade />
    </AbsoluteFill>
  );
};

// --- beat-specific props ----------------------------------------------------

/** Beat 4's clock ring: sweeps 0 → 360° then the hands land. */
const ClockRing: React.FC<{ delay?: number }> = ({ delay = 26 }) => {
  const frame = useCurrentFrame();
  const sweep = prog(frame, delay, 40, EASE.wipe);
  const hands = prog(frame, delay + 38, 8, EASE.overshoot);
  const R = 88;
  const CIRC = 2 * Math.PI * R;

  return (
    <div style={{ position: "absolute", right: 70, top: 460, width: 220, height: 220 }}>
      <svg width={220} height={220} viewBox="0 0 220 220">
        <circle cx={110} cy={110} r={R} fill="none" stroke={C.orange} strokeWidth={17}
          strokeLinecap="round" strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep)}
          transform="rotate(-90 110 110)" />
        {/* hands land on the last frame of the sweep */}
        <g opacity={hands} transform={`scale(${at(hands, 1.3, 1)})`} style={{ transformOrigin: "110px 110px" }}>
          <line x1={110} y1={110} x2={110} y2={58} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
          <line x1={110} y1={110} x2={148} y2={128} stroke={C.ink} strokeWidth={11} strokeLinecap="round" />
          <circle cx={110} cy={110} r={10} fill={C.ink} />
        </g>
      </svg>
    </div>
  );
};

/** Beat 6's tracking route: a line that ticks through four checkpoints. */
const TrackRoute: React.FC<{ delay?: number }> = ({ delay = 20 }) => {
  const frame = useCurrentFrame();
  const stops = [0, 1, 2, 3];
  const lineP = prog(frame, delay, 30, EASE.wipe);
  const X0 = PAD + 10;
  const X1 = 1080 - PAD - 10;
  const Y = 700;

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0 }}
    >
      <line x1={X0} y1={Y} x2={at(lineP, X0, X1)} y2={Y} stroke={C.green}
        strokeWidth={7} strokeDasharray="2 22" strokeLinecap="round" />
      {stops.map((s) => {
        const x = X0 + ((X1 - X0) / 3) * s;
        const p = prog(frame, delay + 8 + s * 11, 7, EASE.overshoot);
        const last = s === 3;
        return (
          <g key={s} opacity={p} transform={`scale(${at(p, 1.6, 1)})`} style={{ transformOrigin: `${x}px ${Y}px` }}>
            <circle cx={x} cy={Y} r={last ? 17 : 12} fill={last ? C.orange : C.green} />
            {last && <circle cx={x} cy={Y} r={27} fill="none" stroke={C.orange} strokeWidth={4} opacity={0.55} />}
          </g>
        );
      })}
    </svg>
  );
};

/** Beat 7's WhatsApp chip, popping in a beat after the number lands. */
const Bubble: React.FC<{ delay?: number }> = ({ delay = 34 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 7, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        top: 620,
        background: C.green,
        color: C.white,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 38,
        letterSpacing: "0.04em",
        padding: "18px 34px",
        borderRadius: "26px 26px 26px 0",
        opacity: p,
        transform: `scale(${at(p, 1.15, 1)})`,
        transformOrigin: "left bottom",
      }}
    >
      WhatsApp us
    </div>
  );
};

/** Small caption locked to the bottom edge, one per beat. */
export const Kick: React.FC<{ text: string; delay?: number; bottom?: number }> = ({
  text,
  delay = 26,
  bottom = 48,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 10, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: PAD - 16,
        bottom,
        background: "rgba(245,243,237,0.82)",
        padding: "10px 18px",
        borderRadius: 10,
        fontFamily: TEXT,
        fontWeight: 700,
        fontSize: 27,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#6E675D",
        opacity: p,
        transform: `translateX(${at(p, -26, 0)}px)`,
        zIndex: 3,
      }}
    >
      {text}
    </div>
  );
};

// --- beats ------------------------------------------------------------------

const B1: React.FC = () => (
  <Scene dur={90}>
    <Index n={1} total={8} />
    <Slash top={980} />
    {/* speed streaks clipped to the lower half so they never cross the title */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 900, bottom: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -900, bottom: 0 }}>
        <Streaks color={C.green} opacity={0.35} delay={10} />
      </div>
    </div>
    <Type>
      <Sentence
        size={126}
        drift={20}
        step={6}
        tokens={[
          { t: "Botswana", w: 300 },
          { t: "doesn't", w: 300, br: true },
          { t: "wait.", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
    {/* the file carries a wide soft shadow — sized past the frame on purpose */}
    <Subject file="shot-hilux.png" width={1330} from={300} bottom={120} delay={10} />
    <Kick text="Sprint Couriers · Botswana" />
  </Scene>
);

const B2: React.FC = () => (
  <Scene dur={90}>
    <Index n={2} total={8} />
    <Slash top={1050} delay={2} />
    <Type>
      <Sentence
        size={126}
        drift={20}
        step={6}
        tokens={[
          { t: "So", w: 300 },
          { t: "neither", w: 300 },
          { t: "do we.", w: 800, e: "box", accent: C.green, br: true },
        ]}
      />
    </Type>
    <Subject file="shot-courier-box.png" height={1150} bottom={-30} reflect={false} />
    <Kick text="Express courier & logistics" />
  </Scene>
);

const B3: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(at(prog(frame, 20, 18, EASE.out), 0, 75));
  return (
    <Scene dur={150}>
    <Index n={3} total={8} />
      <Slash top={1010} delay={2} />
      <Type>
        <Sentence
          size={104}
          drift={18}
          step={6}
          tokens={[
            { t: "From", w: 300 },
            { t: "Gaborone", w: 300 },
            { t: "to", w: 300 },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          <Sentence
            size={190}
            start={16}
            tokens={[{ t: `${n}+`, w: 800, e: "fill", accent: C.orange }]}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Sentence
            size={100}
            start={30}
            tokens={[{ t: "destinations.", w: 700 }]}
          />
        </div>
      </Type>
      <Subject file="shot-globe.png" width={1250} delay={14} bottom={230} />
      <Kick text="Nationwide, every day" />
    </Scene>
  );
};

const B4: React.FC = () => (
  <Scene dur={150} hardOut>
    <Index n={4} total={8} />
    <Slash top={1060} delay={2} />
    <Type>
      <Sentence
        size={112}
        drift={18}
        step={6}
        tokens={[
          { t: "Across", w: 300 },
          { t: "town", w: 300 },
          { t: "in", w: 300 },
          { t: "under", w: 300, br: true },
          { t: "1 hour.", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
    <ClockRing />
    {/* handoff is cropped tight on both sides — bleed it across the full width */}
    <Subject file="shot-handoff.png" width={1500} delay={12} bottom={-40} reflect={false} />
    <Kick text="Sprint Service · priority local delivery" />
  </Scene>
);

const B5: React.FC = () => (
  <Scene dur={120} hardIn>
    <Index n={5} total={8} />
    <Slash top={1030} />
    <Type top={150}>
      <Sentence
        size={118}
        step={7}
        tokens={[
          { t: "Domestic.", w: 700 },
          { t: "Freight.", w: 700, br: true },
          { t: "Worldwide.", w: 800, e: "underline", accent: C.orange, br: true },
        ]}
      />
    </Type>
    <Subject file="shot-courier-boxes.png" height={1060} delay={14} bottom={-30} reflect={false} />
    <Kick text="International via Aramex" />
  </Scene>
);

const B6: React.FC = () => (
  <Scene dur={120}>
    <Index n={6} total={8} />
    <Slash top={1080} delay={2} />
    <Type>
      <Sentence
        size={112}
        drift={18}
        step={6}
        tokens={[
          { t: "Tracked", w: 800, e: "box", accent: C.green },
          { t: "every", w: 300, br: true },
          { t: "step of", w: 300 },
          { t: "the way.", w: 300 },
        ]}
      />
    </Type>
    <TrackRoute />
    <Subject file="shot-office.png" height={1080} delay={12} bottom={-30} reflect={false} />
    <Kick text="Live updates on every parcel" />
  </Scene>
);

const B7: React.FC = () => (
  <Scene dur={90}>
    <Index n={7} total={8} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={104}
        drift={16}
        step={6}
        tokens={[{ t: "One", w: 300 }, { t: "message.", w: 300 }]}
      />
      <div style={{ marginTop: 18 }}>
        <Sentence
          size={128}
          start={14}
          tokens={[{ t: "76 999 965", w: 800, e: "fill", accent: C.orange }]}
        />
      </div>
    </Type>
    <Bubble />
    <Subject file="shot-overalls.png" height={1380} delay={12} bottom={0} x={250} />
    <Kick text="www.sprintcouriers.co.bw" />
  </Scene>
);

const B8: React.FC = () => {
  const frame = useCurrentFrame();
  // six frames of stillness before the mark lands — the audio drops with it
  const logo = prog(frame, 6, 14, EASE.out);
  const slash = prog(frame, 12, 14, EASE.wipe);
  const tag = prog(frame, 22, 12, EASE.out);

  return (
    <Scene dur={90}>
    <Index n={8} total={8} />
      {/* solid slash beneath the lockup, wiping left to right */}
      <div
        style={{
          position: "absolute",
          left: "-30%",
          width: "170%",
          height: 88,
          top: "88%",
          background: C.green,
          transform: `rotate(-27deg) scaleX(${slash})`,
          transformOrigin: "left center",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(-90px)" }}>
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
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: 41,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.ink,
              marginTop: 44,
              opacity: tag,
              transform: `translateY(${at(tag, 20, 0)}px)`,
            }}
          >
            Your World Delivered
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// --- assembly ---------------------------------------------------------------

const BEATS = [
  { at: 0, dur: 90, C: B1 },
  { at: 90, dur: 90, C: B2 },
  { at: 180, dur: 150, C: B3 },
  { at: 330, dur: 150, C: B4 },
  { at: 480, dur: 120, C: B5 },
  { at: 600, dur: 120, C: B6 },
  { at: 720, dur: 90, C: B7 },
  { at: 810, dur: 90, C: B8 },
];

export const SprintReel: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BONE }}>
      {BEATS.map(({ at: from, dur, C: Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}

      {/* two branded slash wipes; the rest stay soft dissolves */}
      <Wipe cutFrame={180} color={C.green} dir="up-right" coverAt={6} clearIn={10} />
      <Wipe cutFrame={600} color="#FFFFFF" shutter coverAt={6} clearIn={11} />
    </AbsoluteFill>
  );
};
