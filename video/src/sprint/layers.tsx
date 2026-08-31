/**
 * Background systems, texture and shading.
 *
 * Each scene gets its OWN background construction rather than one shared wash,
 * because a single treatment repeated seven times is what made the earlier cut
 * feel flat. Opacities here are deliberately high enough to read on a phone —
 * an earlier pass sat at 5-9% and was effectively invisible.
 *
 * Textures are pre-generated PNG tiles, and the grain offset is held for
 * several frames: re-randomising every frame gives H.264 no temporal
 * redundancy and pushed a 20s cut to 190MB.
 */

import { staticFile, useCurrentFrame } from "remotion";
import { at, C, EASE, prog } from "./brand";

const ORANGE = "#F7941D";

/* ------------------------------------------------------------------ texture */

export const Grain: React.FC<{ opacity?: number; dark?: boolean }> = ({
  opacity = 0.14,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 6);
  const x = (step * 137) % 512;
  const y = (step * 89) % 512;

  return (
    <div
      style={{
        position: "absolute",
        inset: -512,
        backgroundImage: `url(${staticFile("tex-grain.png")})`,
        backgroundRepeat: "repeat",
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: dark ? "screen" : "multiply",
        pointerEvents: "none",
      }}
    />
  );
};

/** Horizontal scanlines — reads as broadcast/technical on the dark frames. */
export const Scanlines: React.FC<{ opacity?: number; gap?: number }> = ({
  opacity = 0.18,
  gap = 5,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,.6) 0px, rgba(0,0,0,.6) 1px, transparent 1px, transparent ${gap}px)`,
      opacity,
      pointerEvents: "none",
    }}
  />
);

export const Halftone: React.FC<{
  opacity?: number;
  scale?: number;
  color?: string;
  fade?: boolean;
}> = ({ opacity = 0.16, scale = 20, color = "#000", fade = true }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(${color} 2px, transparent 2.2px)`,
      backgroundSize: `${scale}px ${scale}px`,
      opacity,
      pointerEvents: "none",
      // fading the screen out keeps it from flattening the whole frame
      maskImage: fade
        ? "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 70%)"
        : undefined,
      WebkitMaskImage: fade
        ? "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 70%)"
        : undefined,
    }}
  />
);

/* --------------------------------------------------------------- structures */

/**
 * Large solid brand parallelograms. This is the loudest background device and
 * the one that actually builds composition rather than tinting it.
 */
export const Blocks: React.FC<{
  a?: string;
  b?: string;
  opacityA?: number;
  opacityB?: number;
  delay?: number;
}> = ({ a = C.green, b = ORANGE, opacityA = 1, opacityB = 1, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p1 = prog(frame, delay, 20, EASE.wipe);
  const p2 = prog(frame, delay + 5, 20, EASE.wipe);
  const drift = at(prog(frame, delay, 90, (n) => n), 0, 42);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -280,
          left: -520,
          width: 1500,
          height: 1500,
          background: a,
          opacity: opacityA,
          transform: `rotate(-26deg) translateX(${at(p1, -1700, 0) + drift * 0.5}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -700,
          right: -640,
          width: 1250,
          height: 1250,
          background: b,
          opacity: opacityB,
          transform: `rotate(-26deg) translateX(${at(p2, 1700, 0) - drift * 0.4}px)`,
        }}
      />
    </div>
  );
};

/** Bold diagonal stripes echoing the logo slash. */
export const Slashes: React.FC<{
  color?: string;
  opacity?: number;
  count?: number;
  thickness?: number;
  delay?: number;
}> = ({ color = C.green, opacity = 0.2, count = 4, thickness = 96, delay = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {new Array(count).fill(0).map((_, i) => {
        const p = prog(frame, delay + i * 4, 24, EASE.wipe);
        const drift = at(prog(frame, delay, 90, (n) => n), 0, 50 + i * 16);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -260 + i * 470,
              left: -700,
              width: 2600,
              height: thickness,
              background: color,
              opacity,
              transform: `rotate(-26deg) translateX(${at(p, -1700, 0) + drift}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Concentric rings that pulse outward — the tracking/coverage motif, and the
 * one background element that is literally about what the company does.
 */
export const Radar: React.FC<{
  x?: number;
  y?: number;
  color?: string;
  count?: number;
  gap?: number;
  opacity?: number;
  thickness?: number;
}> = ({
  x = 540,
  y = 1250,
  color = C.green,
  count = 6,
  gap = 190,
  opacity = 0.3,
  thickness = 4,
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {new Array(count).fill(0).map((_, i) => {
        // each ring swells on its own phase so the set never pulses in unison
        const phase = (frame / 34 + i / count) % 1;
        const r = gap * (i + 1) * (0.9 + phase * 0.16);
        const fade = 1 - phase * 0.45;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${thickness}px solid ${color}`,
              opacity: opacity * fade * prog(frame, i * 3, 20, EASE.out),
            }}
          />
        );
      })}
    </div>
  );
};

/** Blueprint grid — technical, logistics-adjacent, good under dark frames. */
export const Grid: React.FC<{
  opacity?: number;
  size?: number;
  color?: string;
}> = ({ opacity = 0.16, size = 92, color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.6) % size;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${shift}px ${shift}px`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * Dashed route lines travelling across frame — a delivery path, and the most
 * on-brand motion texture available for a courier.
 */
export const Routes: React.FC<{
  color?: string;
  opacity?: number;
  count?: number;
}> = ({ color = ORANGE, opacity = 0.55, count = 5 }) => {
  const frame = useCurrentFrame();
  const rows = [340, 760, 1120, 1520, 1780];

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {new Array(count).fill(0).map((_, i) => {
        const y = rows[i % rows.length];
        const dash = 26 + i * 6;
        const speed = 3 + i * 0.8;
        return (
          <path
            key={i}
            d={`M -200 ${y} Q 320 ${y - 90 - i * 20}, 620 ${y} T 1320 ${y}`}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={`${dash} ${dash}`}
            strokeDashoffset={-frame * speed}
            opacity={opacity * prog(frame, i * 4, 22, EASE.out)}
          />
        );
      })}
    </svg>
  );
};

/** Hard-edged motion streaks. */
export const Streaks: React.FC<{
  color?: string;
  opacity?: number;
  delay?: number;
}> = ({ color = C.green, opacity = 0.5, delay = 0 }) => {
  const frame = useCurrentFrame();
  const bars = [
    { y: 300, h: 16, w: 900, d: 0 },
    { y: 380, h: 8, w: 560, d: 3 },
    { y: 1440, h: 22, w: 1050, d: 6 },
    { y: 1510, h: 10, w: 700, d: 9 },
    { y: 1580, h: 6, w: 430, d: 12 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {bars.map((b, i) => {
        const p = prog(frame, delay + b.d, 18, EASE.wipe);
        const drift = at(prog(frame, delay, 90, (n) => n), 0, 120 + i * 40);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: b.y,
              left: 0,
              width: b.w,
              height: b.h,
              background: i % 2 ? ORANGE : color,
              opacity,
              transform: `skewX(-26deg) translateX(${at(p, -900, 0) + drift}px) scaleX(${p})`,
              transformOrigin: "left center",
            }}
          />
        );
      })}
    </div>
  );
};

/* ----------------------------------------------------------------- shading */

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse 76% 62% at 50% 44%, transparent 38%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/**
 * Gradient scrim rising from the base of the frame. Does the real work of
 * separating a subject from a busy background and keeping the kicker legible.
 */
export const Scrim: React.FC<{
  color?: string;
  height?: number;
  strength?: number;
  from?: "bottom" | "top";
}> = ({ color = "0,0,0", height = 900, strength = 0.75, from = "bottom" }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      [from]: 0,
      height,
      background: `linear-gradient(to ${from === "bottom" ? "top" : "bottom"}, rgba(${color},${strength}) 0%, transparent 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Coloured glow behind a subject, so cut-outs pick up light from the scene. */
export const RimGlow: React.FC<{
  color?: string;
  size?: number;
  x?: number;
  y?: number;
  opacity?: number;
  delay?: number;
}> = ({ color = C.green, size = 1100, x = 540, y = 1180, opacity = 0.5, delay = 4 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 66%)`,
        opacity: opacity * p,
        transform: `scale(${at(p, 0.8, 1)})`,
        pointerEvents: "none",
      }}
    />
  );
};

export const ContactShadow: React.FC<{
  width?: number;
  bottom?: number;
  delay?: number;
  strength?: number;
}> = ({ width = 700, bottom = 120, delay = 14, strength = 0.42 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay + 4, 16, EASE.out);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom,
        width,
        height: width * 0.16,
        marginLeft: -width / 2,
        borderRadius: "50%",
        background: `radial-gradient(ellipse at center, rgba(0,0,0,${strength}) 0%, transparent 70%)`,
        opacity: p,
        transform: `scaleX(${at(p, 0.7, 1)})`,
        pointerEvents: "none",
      }}
    />
  );
};

export const GhostWord: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  delay?: number;
  font: string;
  opacity?: number;
}> = ({
  children,
  size = 300,
  color = "#000",
  x = 0,
  y = 0,
  delay = 0,
  font,
  opacity = 0.16,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 26, EASE.out);
  const drift = at(prog(frame, delay, 90, (n) => n), 0, -40);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: font,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "-0.045em",
        color: "transparent",
        WebkitTextStroke: `3px ${color}`,
        opacity: opacity * p,
        whiteSpace: "pre",
        transform: `translateX(${drift}px)`,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};
