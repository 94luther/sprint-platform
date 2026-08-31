/**
 * Sprint Couriers — 20 second vertical ad, 1080x1920 @ 30fps.
 *
 * Built to the approved storyboard. Every subject is a real Sprint asset from
 * public/ — no drawn stand-ins. Type is Inter set tight on both axes, with one
 * emphasis device per frame (orange fill, or orange outline box).
 *
 * White-bodied subjects (bakkie, trucks) sit on white grounds because no colour
 * key can separate them from their white studio background; the staff photo is
 * a tilted card for the same reason.
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
import { at, C, EASE, fontsReady, prog, TEXT } from "./brand";
import {
  Blocks,
  GhostWord,
  Grid,
  Radar,
  RimGlow,
  Routes,
  Scrim,
  Slashes,
  Streaks,
  Vignette,
} from "./layers";
import { Wipe } from "./transitions";
import { Grade } from "./reel";

export const AD_DURATION = 600;

const PAD = 82;
const ORANGE = "#F7941D";
const CREAM = "#F2EEE7";

// --- type -------------------------------------------------------------------

const copyStyle = (size: number, color: string) =>
  ({
    fontFamily: TEXT,
    fontSize: size,
    fontWeight: 400,
    lineHeight: 0.86,
    letterSpacing: "-0.055em",
    color,
    margin: 0,
  }) as const;

type Emph = "none" | "fill" | "box";

/** One word: arrives out of motion blur, then its emphasis device lands. */
const W: React.FC<{
  children: React.ReactNode;
  delay: number;
  size: number;
  color: string;
  emph?: Emph;
  scale?: number;
}> = ({ children, delay, size, color, emph = "none", scale = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 9, EASE.out);
  const treat = prog(frame, delay + 7, 8, EASE.out);
  const filled = emph === "fill" && treat > 0.55;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        ...copyStyle(size * scale, filled ? "#FFFFFF" : color),
        fontWeight: emph === "none" ? 400 : 900,
        padding: emph === "none" ? 0 : "0 0.14em",
        opacity: p,
        filter: p < 0.96 ? `blur(${at(p, 20, 0)}px)` : undefined,
        transform: `translateY(${at(p, 30, 0)}px) scale(${at(p, 1.1, 1)})`,
        whiteSpace: "pre",
      }}
    >
      {emph === "fill" && (
        <span
          style={{
            position: "absolute",
            inset: "0.1em 0 0.06em 0",
            background: ORANGE,
            transform: `scaleX(${treat})`,
            transformOrigin: "left center",
            zIndex: -1,
          }}
        />
      )}
      {emph === "box" && (
        <span
          style={{
            position: "absolute",
            inset: "0.08em 0 0.04em 0",
            border: `6px solid ${ORANGE}`,
            clipPath: `inset(0 ${at(treat, 100, 0)}% 0 0)`,
            zIndex: -1,
          }}
        />
      )}
      {children}
    </span>
  );
};

type Line = { t: string; e?: Emph; s?: number };

const Copy: React.FC<{ lines: Line[]; size: number; color: string }> = ({
  lines,
  size,
  color,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    {lines.map((l, i) => (
      <W key={i} delay={6 + i * 6} size={size} color={color} emph={l.e} scale={l.s ?? 1}>
        {l.t}
      </W>
    ))}
  </div>
);

// --- furniture --------------------------------------------------------------

const Mark: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Img
      src={staticFile("logo-mark.png")}
      style={{
        position: "absolute",
        top: 96,
        right: PAD,
        width: 250,
        opacity: prog(frame, 2, 12, EASE.out),
      }}
    />
  );
};

const Kick: React.FC<{ text: string; color: string; delay?: number }> = ({
  text,
  color,
  delay = 30,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 10, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: PAD - 16,
        bottom: 52,
        background: "rgba(245,243,237,0.82)",
        padding: "10px 18px",
        borderRadius: 10,
        fontFamily: TEXT,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#4A463E",
        opacity: p,
        transform: `translateX(${at(p, -30, 0)}px)`,
      }}
    >
      {text}
    </div>
  );
};

/**
 * Subject image, rising out of blur into the lower frame.
 *
 * Sized by height for people (their framing is vertical) and by width for
 * vehicles and product shots, so one control does not distort the other.
 */
const Subject: React.FC<{
  file: string;
  delay?: number;
  width?: number;
  height?: number;
  from?: number;
  bottom?: number;
}> = ({ file, delay = 14, width, height, from = 0, bottom = 130 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16, EASE.out);
  const drift = at(prog(frame, delay, 70, (n) => n), 0, 18);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom,
        width: "max-content",
        transform: `translateX(-50%) translate(${at(p, from, 0)}px, ${at(p, 50, 0) + drift * 0.2}px) scale(${at(p, 1.09, 1)})`,
        opacity: p,
        filter: p < 0.96 ? `blur(${at(p, 24, 0)}px)` : undefined,
      }}
    >
      <Img
        src={staticFile(file)}
        style={{
          width: width ? width : "auto",
          height: height ? height : "auto",
          // Tailwind's preflight sets img{max-width:100%}. This wrapper is
          // absolutely positioned at left:50%, so its shrink-to-fit width is
          // only half the frame — without this every subject silently caps at
          // 540px no matter what size is requested.
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );
};

/**
 * How a scene arrives and leaves.
 *
 * Seven identical blur-throughs read as one long dissolve, so each cut picks a
 * different pair. Every mode still carries some blur — that is the reference's
 * signature — but the direction and scale differ.
 */
export type Move = "blur" | "push" | "pull" | "rise" | "drop" | "punch";

const moveTransform = (mode: Move, t: number) => {
  // t runs 1 -> 0 on entry and 0 -> 1 on exit; 0 is the settled state.
  switch (mode) {
    case "push":
      return { x: t * 160, y: 0, s: 1, b: t * 6 };
    case "pull":
      return { x: t * -160, y: 0, s: 1, b: t * 6 };
    case "rise":
      return { x: 0, y: t * 150, s: 1, b: t * 5 };
    case "drop":
      return { x: 0, y: t * -150, s: 1, b: t * 5 };
    case "punch":
      return { x: 0, y: 0, s: 1 + t * 0.07, b: t * 8 };
    default:
      return { x: 0, y: 0, s: 1 + t * 0.02, b: t * 7 };
  }
};

const Scene: React.FC<{
  children: React.ReactNode;
  dur: number;
  bg: string;
  enter?: Move;
  exit?: Move;
}> = ({ children, dur, bg, enter = "blur", exit = "blur" }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0, 10, EASE.out);
  const outP = prog(frame, dur - 10, 10, EASE.in);

  const a = moveTransform(enter, 1 - inP);
  const b = moveTransform(exit, outP);

  const x = a.x + b.x;
  const y = a.y + b.y;
  const s = a.s * b.s;
  const blur = a.b + b.b;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          opacity: Math.min(1, inP * 1.5) * (1 - outP * 0.8),
        }}
      >
        {children}
      </AbsoluteFill>
      <Grade />
    </AbsoluteFill>
  );
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 300, left: PAD, right: PAD }}>{children}</div>
);

// --- frames -----------------------------------------------------------------

const F1: React.FC = () => (
  <Scene dur={84} bg={CREAM} enter="blur" exit="push">
    {/* radar: coverage, the thing the opening line is actually about */}
    <div style={{ position: "absolute", inset: 0, background: CREAM }} />
    <Radar x={540} y={1320} color={C.green} opacity={0.26} count={6} gap={200} />
    <Slashes color={C.green} opacity={0.14} count={3} thickness={110} />
    <GhostWord font={TEXT} size={320} x={-40} y={1120} delay={8} opacity={0.13}>
      SPRINT
    </GhostWord>
    <RimGlow color={C.green} opacity={0.3} y={1250} size={1000} />
    <Mark />
    <Body>
      <Copy
        size={168}
        color={C.ink}
        lines={[{ t: "Some" }, { t: "things" }, { t: "can't" }, { t: "wait.", e: "fill" }]}
      />
    </Body>
    <Subject file="shot-office.png" height={980} bottom={-20} />
    <Kick text="Sprint Couriers · Gaborone" color="#6E675D" />
  </Scene>
);

const F2: React.FC = () => (
  <Scene dur={84} bg="#FFFFFF" enter="pull" exit="rise">
    {/* speed: streaks and a hard diagonal block driving left to right */}
    <div style={{ position: "absolute", inset: 0, background: "#FBFAF8" }} />
    <Blocks a={C.green} b={ORANGE} opacityA={0.16} opacityB={0.12} />
    <Streaks color={C.green} opacity={0.5} delay={4} />
    <Mark />
    <Body>
      <Copy size={168} color={C.ink} lines={[{ t: "So we" }, { t: "run.", e: "box" }]} />
    </Body>
    {/* sized past the frame: the file carries a wide soft shadow, so the
        vehicle itself is only about 55% of its own canvas */}
    <Subject file="shot-hilux.png" width={1440} from={-260} bottom={170} />
    <Kick text="Express courier & logistics" color="#6E675D" />
  </Scene>
);

const F3: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(at(prog(frame, 12, 20, EASE.out), 0, 75));
  return (
    <Scene dur={90} bg="#0B0B0B" enter="drop" exit="punch">
      {/* network: blueprint grid plus live delivery routes */}
      <div style={{ position: "absolute", inset: 0, background: "#0B0B0B" }} />
      <Grid opacity={0.14} size={96} color="#FFFFFF" />
      <Routes color={C.greenBright} opacity={0.5} count={5} />
      <RimGlow color={C.green} opacity={0.55} y={1300} size={1250} />
      <Vignette strength={0.62} />
      <Mark />
      <Body>
        <Copy size={150} color="#FFFFFF" lines={[{ t: "Every" }, { t: "corner." }]} />
        <div style={{ marginTop: 26 }}>
          <W delay={18} size={168} color="#FFFFFF" emph="fill">
            {`${n}+`}
          </W>
        </div>
        <div style={{ marginTop: 16 }}>
          <W delay={26} size={72} color="#FFFFFF" emph="none">
            destinations
          </W>
        </div>
      </Body>
      <Subject file="shot-globe.png" width={1320} delay={16} bottom={240} />
      <Kick text="Nationwide" color="#8C8C8C" />
    </Scene>
  );
};

const F4: React.FC = () => (
  <Scene dur={78} bg="#FFFFFF" enter="punch" exit="push">
    {/* scale: the boldest graphic frame — full-strength brand blocks */}
    <div style={{ position: "absolute", inset: 0, background: "#FAF9F7" }} />
    <Blocks a={C.green} b={ORANGE} opacityA={0.9} opacityB={0.85} delay={0} />
    <Slashes color="#FFFFFF" opacity={0.16} count={4} thickness={80} />
    <Scrim color="250,249,247" height={620} strength={0.9} />
    <Mark />
    <Body>
      <Copy
        size={158}
        color={C.ink}
        lines={[{ t: "Freight", e: "box" }, { t: "at full" }, { t: "scale." }]}
      />
    </Body>
    <Subject file="cut-trucks.png" width={1260} from={260} bottom={220} />
    <Kick text="Bulk & full-load consignments" color="#6E675D" />
  </Scene>
);

const F5: React.FC = () => (
  <Scene dur={84} bg="#0B0B0B" enter="pull" exit="rise">
    {/* urgency: orange radar closing in, warm rim light on the courier */}
    <div style={{ position: "absolute", inset: 0, background: "#0B0B0B" }} />
    <Radar x={540} y={1240} color={ORANGE} opacity={0.28} count={5} gap={210} thickness={5} />
    <Grid opacity={0.08} size={120} color="#FFFFFF" />
    <GhostWord font={TEXT} size={300} x={30} y={600} delay={10} color="#FFFFFF" opacity={0.14}>
      1 HOUR
    </GhostWord>
    <RimGlow color={ORANGE} opacity={0.5} y={1280} size={1150} />
    <Vignette strength={0.6} />
    <Mark />
    <Body>
      <Copy size={158} color="#FFFFFF" lines={[{ t: "In under" }, { t: "1 hour.", e: "fill" }]} />
    </Body>
    <Subject file="shot-courier-box.png" height={1060} delay={16} bottom={-20} />
    <Kick text="Sprint Service · priority local delivery" color="#8C8C8C" />
  </Scene>
);

const F6: React.FC = () => (
  <Scene dur={72} bg={CREAM} enter="drop" exit="blur">
    {/* reach: routes running out past the frame edge */}
    <div style={{ position: "absolute", inset: 0, background: CREAM }} />
    <Blocks a={C.green} b={ORANGE} opacityA={0.2} opacityB={0.14} />
    <Routes color={C.green} opacity={0.34} count={4} />
    <RimGlow color={C.green} opacity={0.28} y={1260} size={1000} />
    <Mark />
    <Body>
      <Copy
        size={144}
        color={C.ink}
        lines={[{ t: "Domestic." }, { t: "Freight." }, { t: "Worldwide.", e: "fill" }]}
      />
    </Body>
    <Subject file="shot-courier-boxes.png" height={1000} delay={16} bottom={-20} />
    <Kick text="International via Aramex" color="#6E675D" />
  </Scene>
);

const F7: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 4, 16, EASE.out);
  const rule = prog(frame, 34, 10, EASE.out);
  const tag = prog(frame, 22, 12, EASE.out);
  const cts = prog(frame, 44, 12, EASE.out);

  return (
    <Scene dur={108} bg="#FFFFFF" enter="punch">
      {/* end card: the logo's own slash geometry, at full strength */}
      <div style={{ position: "absolute", inset: 0, background: "#FCFBF9" }} />
      <Slashes color={C.green} opacity={0.2} count={4} thickness={120} />
      <Radar x={540} y={860} color={C.green} opacity={0.16} count={5} gap={230} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 950, textAlign: "center" }}>
          <Img
            src={staticFile("logo-mark.png")}
            style={{
              width: "100%",
              display: "block",
              opacity: logo,
              filter: logo < 0.96 ? `blur(${at(logo, 20, 0)}px)` : undefined,
              transform: `scale(${at(logo, 1.08, 1)})`,
            }}
          />
          <div
            style={{
              fontFamily: TEXT,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: C.ink,
              marginTop: 40,
              opacity: tag,
              transform: `translateY(${at(tag, 22, 0)}px)`,
            }}
          >
            Your World Delivered
          </div>
          <div
            style={{
              height: 8,
              width: 560,
              background: ORANGE,
              margin: "44px auto",
              transform: `scaleX(${rule})`,
            }}
          />
          <div
            style={{
              fontFamily: TEXT,
              fontWeight: 700,
              fontSize: 34,
              color: "#3A3A3A",
              lineHeight: 1.8,
              opacity: cts,
            }}
          >
            www.sprintcouriers.co.bw
            <br />
            <span style={{ color: C.green }}>WhatsApp 76 999 965</span>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// --- assembly ---------------------------------------------------------------

const FRAMES = [
  { at: 0, dur: 84, C: F1 },
  { at: 84, dur: 84, C: F2 },
  { at: 168, dur: 90, C: F3 },
  { at: 258, dur: 78, C: F4 },
  { at: 336, dur: 84, C: F5 },
  { at: 420, dur: 72, C: F6 },
  { at: 492, dur: 108, C: F7 },
];

export const SprintAd: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      {FRAMES.map(({ at: from, dur, C: Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}

      {/* Overlay wipes on the cuts. Each is a different colour, direction and
          shape, so no two hand-offs read the same way. */}
      <Wipe cutFrame={84} color={C.green} dir="up-right" coverAt={6} clearIn={10} />
      <Wipe cutFrame={168} color={ORANGE} dir="right" coverAt={5} clearIn={8} />
      <Wipe cutFrame={258} color="#FFFFFF" shutter coverAt={6} clearIn={11} />
      <Wipe cutFrame={336} color={C.ink} dir="left" coverAt={5} clearIn={8} />
      <Wipe cutFrame={420} color={C.green} dir="down-left" coverAt={6} clearIn={9} />
      <Wipe cutFrame={492} color="#FFFFFF" shutter coverAt={6} clearIn={12} />
    </AbsoluteFill>
  );
};
