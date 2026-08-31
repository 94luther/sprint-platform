/**
 * Motion primitives for the Sprint Couriers film.
 *
 * The whole cut is built from these four ideas: type revealed behind a mask,
 * diagonal shapes that wipe the frame, chevrons that imply direction, and
 * parcels. Keeping them here is what makes eight scenes feel like one film.
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import { at, C, EASE, prog, SKEW } from "./brand";

// --- Masked type ------------------------------------------------------------

/**
 * A single line of type sliding up from behind a hard clip edge.
 *
 * This is the signature move of the reference style: the text does not fade,
 * it is *uncovered*. Stack several with staggered `delay` values for the
 * line-by-line cascade.
 */
export const MaskLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  /** Set false to have the line drop down from above instead. */
  fromBelow?: boolean;
}> = ({ children, delay = 0, dur = 16, fromBelow = true }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const offset = at(p, fromBelow ? 108 : -108, 0);

  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em" }}>
      <div style={{ transform: `translateY(${offset}%)` }}>{children}</div>
    </div>
  );
};

/**
 * Type wiped in horizontally behind a clip edge — used where a vertical
 * reveal would fight the layout, e.g. inline stat rows.
 */
export const WipeLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
}> = ({ children, delay = 0, dur = 18 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.wipe);

  return (
    <div style={{ clipPath: `inset(0 ${at(p, 100, 0)}% 0 0)` }}>{children}</div>
  );
};

// --- Shapes -----------------------------------------------------------------

/**
 * The brand's diagonal slash sweeping across the full frame.
 *
 * Oversized well beyond the canvas so the skewed edge never reveals a corner.
 * Drive `enter` to bring it on and `exit` to carry it off — a scene change is
 * just one of these landing as the next begins.
 */
export const DiagonalWipe: React.FC<{
  color?: string;
  delay?: number;
  dur?: number;
  /** Travel direction across the frame. */
  dir?: "left" | "right";
}> = ({ color = C.green, delay = 0, dur = 20, dir = "right" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.wipe);
  const from = dir === "right" ? -160 : 160;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-30%",
          background: color,
          transform: `skewX(${SKEW}deg) translateX(${at(p, from, 0)}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A skewed colour block — the static cousin of the wipe, for layout bands. */
export const SlashBand: React.FC<{
  color?: string;
  top: number;
  height: number;
  delay?: number;
  dur?: number;
  dir?: "left" | "right";
}> = ({ color = C.orange, top, height, delay = 0, dur = 18, dir = "right" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const from = dir === "right" ? -130 : 130;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: "-15%",
        width: "130%",
        height,
        background: color,
        transform: `skewX(${SKEW}deg) translateX(${at(p, from, 0)}%)`,
      }}
    />
  );
};

/**
 * The orange chevron that appears throughout their collateral. Reads as
 * forward motion, which is the entire proposition.
 */
export const Chevron: React.FC<{
  size?: number;
  color?: string;
  thickness?: number;
}> = ({ size = 60, color = C.orange, thickness = 0.28 }) => {
  const inner = 1 - thickness;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path
        d={`M 20 6 L ${20 + 68} 50 L 20 94 L 20 ${94 - 100 * thickness * 0.42} L ${20 + 68 * inner} 50 L 20 ${6 + 100 * thickness * 0.42} Z`}
        fill={color}
      />
    </svg>
  );
};

/** A row of chevrons that fire in sequence — a visual "whoosh". */
export const ChevronRun: React.FC<{
  count?: number;
  size?: number;
  color?: string;
  delay?: number;
  gap?: number;
}> = ({ count = 3, size = 48, color = C.orange, delay = 0, gap = 10 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {new Array(count).fill(0).map((_, i) => {
        const p = prog(frame, delay + i * 4, 14, EASE.overshoot);
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `translateX(${at(p, -30, 0)}px)`,
            }}
          >
            <Chevron size={size} color={color} />
          </div>
        );
      })}
    </div>
  );
};

// --- Parcel -----------------------------------------------------------------

/**
 * A cardboard parcel drawn in code — isometric-ish, with the brand tape
 * across it. Their collateral is full of these; the film would feel abstract
 * without one.
 */
export const Parcel: React.FC<{
  size?: number;
  tape?: string;
  rotate?: number;
}> = ({ size = 240, tape = C.green, rotate = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    {/* box top face */}
    <path d="M100 20 L175 55 L100 90 L25 55 Z" fill="#D9A96B" />
    {/* left face */}
    <path d="M25 55 L100 90 L100 175 L25 140 Z" fill="#B9863F" />
    {/* right face */}
    <path d="M175 55 L175 140 L100 175 L100 90 Z" fill="#C99A53" />
    {/* tape over the seam */}
    <path d="M100 20 L118 28 L43 63 L25 55 Z" fill={tape} opacity={0.95} />
    <path d="M100 90 L118 82 L118 167 L100 175 Z" fill={tape} opacity={0.8} />
    {/* shipping label */}
    <rect x="42" y="92" width="34" height="24" rx="2" fill="#F7F3EA" />
  </svg>
);

// --- Layout helpers ---------------------------------------------------------

/** Flat colour ground. Every scene sits on one of these. */
export const Ground: React.FC<{ color: string; children?: React.ReactNode }> = ({
  color,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: color, overflow: "hidden" }}>
    {children}
  </AbsoluteFill>
);

/**
 * Faint diagonal pinstripes, echoing the line-work in their van and packaging
 * artwork. Keeps large flat areas from going dead.
 */
export const Pinstripes: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.white,
  opacity = 0.07,
}) => (
  <AbsoluteFill
    style={{
      opacity,
      backgroundImage: `repeating-linear-gradient(${SKEW + 90}deg, ${color} 0 3px, transparent 3px 46px)`,
    }}
  />
);
