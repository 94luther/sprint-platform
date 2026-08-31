/**
 * Sprint keynote film, "One Order" — 62 seconds, 1920x1080, 30fps.
 *
 * The whole film is one real order that ran on 2026-08-29: order 1b590e81,
 * P90, Orange Money, placed 19:17:41 through delivered 19:18:29. No feature
 * tour, no diagrams, no rival named. Beat by beat, timing and every on
 * screen line come from docs/keynote-beat-sheet-v2.md; the kill list in
 * docs/keynote-critique-chatgpt.md stays out.
 *
 * Two type voices only: Anton (DISPLAY) for every spoken line, Inter for
 * captions and timestamps. Brand.ts only loads Inter at 400/700/900, so the
 * "Inter Light" the beat sheet asks for is rendered at 400, the lightest
 * weight actually loaded, rather than adding a new weight to the shared
 * font file. Orange appears exactly twice: the P90 total in beat 2 and the
 * close slash in beat 7. Nothing else takes an accent colour we chose; the
 * green in beats 3 and 4 is baked into the real captures, not drawn by us.
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
import { at, C, displayStyle, EASE, fontsReady, prog, SKEW, textStyle, TYPE } from "./brand";

export const SPRINT_KEYNOTE_DURATION = 1860;

const W = 1920;
const H = 1080;

// --- motion grammar -----------------------------------------------------
// "Text enters with a 200ms fade plus a small rise; exits with a 150ms
// plain fade." At 30fps that is 6 frames in, 4.5 frames out.
const IN = 6;
const OUT = 4.5;
const RISE = 18;

/** Fades in, holds, fades out before `total` — the standard text envelope. */
const textOpacity = (frame: number, total: number) =>
  Math.min(prog(frame, 0, IN, EASE.out), 1 - prog(frame, total - OUT, OUT, EASE.in));

/** Same entrance, but holds at full opacity — for the two stillness beats,
 * where the line is meant to sit and not move until the hard cut takes it. */
const textOpacityHold = (frame: number) => prog(frame, 0, IN, EASE.out);

const textRise = (frame: number) => at(prog(frame, 0, IN, EASE.out), RISE, 0);

/** A timed element that has not started yet inside a longer shared Sequence:
 * frames before its own delay render nothing rather than a premature hold. */
const gated = (frame: number, delay: number, total: number, hold: boolean) => {
  const local = frame - delay;
  if (local < 0) return { opacity: 0, rise: RISE };
  return {
    opacity: hold ? textOpacityHold(local) : textOpacity(local, total - delay),
    rise: textRise(local),
  };
};

// --- Headline: the Anton "spoken line" ------------------------------------

const Headline: React.FC<{
  children: string;
  total: number;
  size?: number;
  y: number;
  delay?: number;
  hold?: boolean;
  color?: string;
}> = ({ children, total, size = TYPE.headline, y, delay = 0, hold = false, color = C.bone }) => {
  const frame = useCurrentFrame();
  const { opacity, rise } = gated(frame, delay, total, hold);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <span style={displayStyle(size, color)}>{children}</span>
    </div>
  );
};

// --- Caption: the Inter voice ------------------------------------------

const Caption: React.FC<{
  children: string;
  total: number;
  y: number;
  x?: number;
  size?: number;
  delay?: number;
  align?: "left" | "center";
}> = ({ children, total, y, x, size = TYPE.body, delay = 0, align = "center" }) => {
  const frame = useCurrentFrame();
  const { opacity, rise } = gated(frame, delay, total, false);
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 0 : x,
        right: align === "center" ? 0 : undefined,
        top: y,
        textAlign: align,
        opacity,
        transform: `translateY(${rise}px)`,
        ...textStyle(size, 400, C.bone),
      }}
    >
      {children}
    </div>
  );
};

/** Small mono styled caption for a real event time. Inter, tabular numerals
 * standing in for the JetBrains Mono feel without loading a third font. */
const TimestampChip: React.FC<{
  time: string;
  label?: string;
  total: number;
  x: number;
  y: number;
  delay?: number;
  align?: "left" | "center";
  hold?: boolean;
  size?: number;
}> = ({ time, label, total, x, y, delay = 0, align = "left", hold = false, size = TYPE.fine }) => {
  const frame = useCurrentFrame();
  const { opacity, rise } = gated(frame, delay, total, hold);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        textAlign: align,
        opacity: opacity * 0.92,
        transform: align === "center" ? `translate(-50%, ${rise}px)` : `translateY(${rise}px)`,
        ...textStyle(size, 400, C.bone),
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {time}
      {label ? `  ${label}` : ""}
    </div>
  );
};

// --- Screen: a real capture presented as a floating phone-shaped screen ----

/** Every capture in public/appdemo is 1024x2048, exactly 1:2. Scaling the
 * <Img> from that fixed native size, never from a percentage, is what keeps
 * it from ever stretching regardless of how much of it a beat crops away. */
const NATIVE_W = 1024;
const NATIVE_H = 2048;

const Screen: React.FC<{
  file: string;
  x: number;
  y: number;
  width?: number;
  /** 0..1 fraction of the source image's height that is visible, top to
   * bottom. Lets a beat show only part of a capture (cropping the catalog
   * screen above its vape listing, or the tracking screen down to just the
   * map) without ever distorting the image off its native aspect. */
  cropTop?: number;
  cropBottom?: number;
  settle?: number;
  /** Extra scale added slowly and linearly across the whole beat, for the
   * tracking screen's "slow 4 percent scale creep." */
  creep?: number;
  creepOver?: number;
  children?: React.ReactNode;
}> = ({
  file,
  x,
  y,
  width = 400,
  cropTop = 0,
  cropBottom = 1,
  settle = 1.03,
  creep = 0,
  creepOver = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const visible = cropBottom - cropTop;
  const fullH = (width * NATIVE_H) / NATIVE_W;
  const boxH = fullH * visible;
  // Screens rise and settle rather than simply fade: a heavier, slower move
  // than the text envelope, still the brand's decisive ease-out character.
  const p = prog(frame, 0, 22, EASE.out);
  const rise = at(p, 60, 0);
  const drift = creep ? at(Math.min(frame / creepOver, 1), 0, creep) : 0;
  const scale = at(p, 0.94, settle) + drift;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height: boxH,
        transform: `translate(-50%, -50%) translateY(${rise}px) scale(${scale})`,
        opacity: p,
        borderRadius: 36,
        overflow: "hidden",
        // The shadow spec: offset about 20px down, 40px blur, 25 percent.
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        background: C.ink,
      }}
    >
      <Img
        src={staticFile(`appdemo/${file}`)}
        style={{
          position: "absolute",
          left: 0,
          top: -fullH * cropTop,
          width,
          height: fullH,
          display: "block",
        }}
      />
      {children}
    </div>
  );
};

/** A brief white glow over one row of a real screenshot — used once, for the
 * dispatch table's own already-highlighted winning-courier row. No new
 * colour is introduced; this only brightens what the capture already shows. */
const ScoreGlow: React.FC<{ top: number; left: number; width: number; height: number; total: number }> = ({
  top,
  left,
  width,
  height,
  total,
}) => {
  const frame = useCurrentFrame();
  const p = Math.min(prog(frame, 0, 10, EASE.out), 1 - prog(frame, total - 16, 16, EASE.in));
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: 8,
        boxShadow: `0 0 ${at(p, 0, 30)}px ${at(p, 0, 10)}px rgba(244,244,241,${0.55 * p})`,
        opacity: p,
      }}
    />
  );
};

// --- Beat 1: OPEN (0-180) --------------------------------------------------
// Black. Two short lines, one hard cut between them. No logo yet.

// The split is not itself in the beat sheet (only the 6s total and the hard
// cut are), so it is set to 100/80 rather than an even 90/90 — that keeps
// the line in full view mid-hold at the 3s mark instead of on the cut frame.
const B1Open: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={100}>
      <Headline total={100} size={150} y={470}>
        Gaborone orders.
      </Headline>
    </Sequence>
    <Sequence from={100} durationInFrames={80}>
      <Headline total={80} size={170} y={460}>
        Sprint moves.
      </Headline>
    </Sequence>
  </>
);

// --- Beat 2: THE ORDER (180-450) -------------------------------------------
// Catalog rises and settles, hard cut to cart. The order's real total, P90,
// is the film's first of exactly two orange accents.

/** The order's real total. A bespoke block rather than <Headline>, since it
 * sits inside its own already-positioned wrapper (translate to its point
 * beside the phone) instead of the full-width centred band Headline expects. */
const MoneyTotal: React.FC<{ total: number; delay?: number }> = ({ total, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { opacity, rise } = gated(frame, delay, total, false);
  return (
    <div
      style={{
        position: "absolute",
        left: 1430,
        top: 460,
        transform: `translate(-50%, -50%) translateY(${rise}px)`,
        opacity,
      }}
    >
      <span style={displayStyle(170, C.orange)}>P90</span>
    </div>
  );
};

// Catalog and cart each get their own sub-window inside the beat; 132/138
// rather than an even 120/150 so the catalog screen is still mid-hold, not
// just cutting away, at the beat sheet's own review point.
const B2Order: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={132}>
      <Screen file="catalog.png" x={960} y={540} width={460} cropTop={0} cropBottom={0.63} settle={1.03} />
    </Sequence>
    <Sequence from={132} durationInFrames={138}>
      <>
        <Screen file="cart.png" x={740} y={560} width={400} settle={1.03} />
        <MoneyTotal total={138} delay={8} />
        <Caption total={138} y={560} x={1430} size={40} delay={26} align="center">
          Two plates from Mama T&apos;s Kitchen.
        </Caption>
        <TimestampChip time="19:17:41" total={138} x={140} y={980} delay={20} />
      </>
    </Sequence>
  </>
);

// --- Beat 3: THE CHOICE (450-690) -------------------------------------------
// One score row glows briefly, the winning courier.

// Coordinates are local to the Screen's own untransformed box (it is the
// nearest positioned ancestor), not the canvas — measured off the real
// ops.png capture, where "Thato   2" is already the highlighted match row.
const OPS_ROW = { top: 472, left: 14, width: 402, height: 26 };

const B3Choice: React.FC = () => (
  <Sequence from={0} durationInFrames={240}>
    <>
      <Screen file="ops.png" x={960} y={560} width={430} settle={1.03}>
        <Sequence from={45} durationInFrames={80}>
          <ScoreGlow {...OPS_ROW} total={80} />
        </Sequence>
      </Screen>
      <Headline total={230} size={76} y={30} delay={40}>
        The right rider, chosen in seconds.
      </Headline>
      <TimestampChip time="19:17:58" total={225} x={140} y={1015} delay={15} />
    </>
  </Sequence>
);

// --- Beat 4: THE MOVE (690-1050) --------------------------------------------
// The map, glowing roads, a slow 4 percent creep. Type once, then gone.
// Chips tick quietly, then 2 full seconds of stillness at the end.

const B4Move: React.FC = () => (
  <Sequence from={0} durationInFrames={360}>
    <>
      <Screen
        file="tracking.png"
        x={960}
        y={560}
        width={560}
        cropTop={0.32}
        cropBottom={0.88}
        settle={1.02}
        creep={0.04}
        creepOver={360}
      />
      <Headline total={140} size={90} y={120} delay={15}>
        The customer watches it come.
      </Headline>
      <TimestampChip time="19:18:08" label="accepted" total={210} x={140} y={980} delay={150} />
      <TimestampChip time="19:18:18" label="picked up" total={280} x={140} y={980} delay={215} />
      {/* Frames 300-360 (2s): no further Sequence starts here at all — that
          silence is the stillness, not a flag we set. */}
    </>
  </Sequence>
);

// --- Beat 5: THE MONEY (1050-1380) ------------------------------------------
// P90 sits, then the three real rows, then the line. No orange here: the
// film's two accent uses are already spent, so this stays bone like the
// rest of the type.

const MONEY_ROWS = ["P67.50 to Mama T's Kitchen.", "P16.20 to the rider.", "P6.30 to Sprint."];

const SplitRows: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const starts = [0, 14, 28];
  return (
    <>
      {MONEY_ROWS.map((line, i) => {
        const { opacity, rise } = gated(frame, starts[i], total, false);
        return (
          <div
            key={line}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 430 + i * 100,
              textAlign: "center",
              opacity,
              transform: `translateY(${rise}px)`,
            }}
          >
            <span style={displayStyle(64, C.bone)}>{line}</span>
          </div>
        );
      })}
    </>
  );
};

const B5Money: React.FC = () => (
  <Sequence from={0} durationInFrames={330}>
    <>
      <Sequence from={0} durationInFrames={60}>
        <Headline total={60} size={170} y={460}>
          P90
        </Headline>
      </Sequence>
      <Sequence from={60} durationInFrames={210}>
        <SplitRows total={210} />
      </Sequence>
      <Sequence from={210} durationInFrames={120}>
        <Headline total={120} size={80} y={850}>
          The money knows where to go.
        </Headline>
      </Sequence>
    </>
  </Sequence>
);

// --- Beat 6: THE PROOF (1380-1680) ------------------------------------------
// A thin line draws, six real timestamps rise from it, a tiny honest
// caption, then the line everything builds to, held in stillness.

const PROOF_EVENTS: Array<{ time: string; label: string }> = [
  { time: "19:17:41", label: "placed" },
  { time: "19:17:49", label: "paid" },
  { time: "19:17:58", label: "offered" },
  { time: "19:18:08", label: "accepted" },
  { time: "19:18:18", label: "picked up" },
  { time: "19:18:29", label: "delivered" },
];

const LINE_LEFT = 185;
const LINE_WIDTH = 1550;

const LineDraw: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 24, EASE.wipe);
  return (
    <div
      style={{
        position: "absolute",
        left: LINE_LEFT,
        top: 420,
        width: LINE_WIDTH * p,
        height: 2,
        background: C.bone,
        opacity: 0.6,
      }}
    />
  );
};

const ProofCluster: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  // The whole cluster fades out together at the end of its own window; each
  // chip still has its own staggered entrance underneath this group fade.
  const groupOut = 1 - prog(frame, total - OUT, OUT, EASE.in);
  return (
    <div style={{ opacity: groupOut }}>
      <LineDraw total={total} />
      {/* Six chips over five 310px gaps would collide if they all sat on one
          row (the longer labels like "picked up" run past a single slot's
          width); a two row zigzag keeps every label clear of its neighbours
          while all six still visibly rise from the same line. */}
      {PROOF_EVENTS.map((ev, i) => {
        const cx = LINE_LEFT + (LINE_WIDTH / (PROOF_EVENTS.length - 1)) * i;
        const cy = i % 2 === 0 ? 452 : 498;
        return (
          <TimestampChip
            key={ev.time}
            time={ev.time}
            label={ev.label}
            total={total}
            x={cx}
            y={cy}
            size={24}
            align="center"
            delay={20 + i * 22}
            hold
          />
        );
      })}
      <Caption total={total} y={580} size={30} delay={150}>
        Alpha run. Simulated rider, real system, real ledger.
      </Caption>
    </div>
  );
};

const B6Proof: React.FC = () => (
  <Sequence from={0} durationInFrames={300}>
    <>
      <Sequence from={0} durationInFrames={200}>
        <ProofCluster total={200} />
      </Sequence>
      <Sequence from={205} durationInFrames={95}>
        {/* Held, not faded: this is the second stillness moment, 2.5s
            (75 of these 95 frames) before the beat's hard cut. */}
        <Headline total={95} size={130} y={490} hold>
          This happened today.
        </Headline>
      </Sequence>
    </>
  </Sequence>
);

// --- Beat 7: CLOSE (1680-1860) -----------------------------------------------
// The mark, the lockup with its minus 12 degree skew, the orange slash, the
// close line, then a genuine hard cut to black for the last second.

const CloseLockup: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const logo = gated(frame, 0, total, true);
  const word = gated(frame, 14, total, true);
  const line = gated(frame, 46, total, true);

  return (
    <>
      <Img
        src={staticFile("logo-mark.png")}
        style={{
          position: "absolute",
          left: 960,
          top: 340,
          width: 170,
          transform: `translate(-50%, -50%) translateY(${logo.rise}px)`,
          opacity: logo.opacity,
          filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.4))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 490,
          transform: `translate(-50%, -50%) translateY(${word.rise}px)`,
          opacity: word.opacity,
        }}
      >
        <div style={{ position: "relative", transform: `skewX(${SKEW}deg)` }}>
          {/* The film's second and final orange accent. */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 520,
              height: 42,
              background: C.orange,
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          />
          <span style={{ ...displayStyle(130, C.bone), position: "relative", zIndex: 1 }}>SPRINT</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 660,
          textAlign: "center",
          opacity: line.opacity,
          transform: `translateY(${line.rise}px)`,
        }}
      >
        <span style={displayStyle(76, C.bone)}>It already works. Now we scale it.</span>
      </div>
    </>
  );
};

const B7Close: React.FC = () => (
  // Content lives in the first 150 frames only; the remaining 30 (1s) are
  // plain ink ground, the hard cut to black the beat sheet calls for.
  <Sequence from={0} durationInFrames={150}>
    <CloseLockup total={150} />
  </Sequence>
);

// --- assembly ----------------------------------------------------------

const BEATS: Array<{ at: number; dur: number; Comp: React.FC }> = [
  { at: 0, dur: 180, Comp: B1Open },
  { at: 180, dur: 270, Comp: B2Order },
  { at: 450, dur: 240, Comp: B3Choice },
  { at: 690, dur: 360, Comp: B4Move },
  { at: 1050, dur: 330, Comp: B5Money },
  { at: 1380, dur: 300, Comp: B6Proof },
  { at: 1680, dur: 180, Comp: B7Close },
];

export const SprintKeynote: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, width: W, height: H }}>
      {BEATS.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
