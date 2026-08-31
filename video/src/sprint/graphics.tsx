/**
 * Lower-frame anchor graphics.
 *
 * The reference fills the bottom two-thirds with a cut-out photo subject.
 * There are no photographs available here, so each scene instead gets a
 * code-drawn brand object of similar visual weight. Without these the type
 * floats at the top of a 9:16 frame and the composition falls apart.
 */

import { useCurrentFrame } from "remotion";
import { at, C, EASE, prog } from "./brand";

/** Shared arrival: rises out of blur exactly as the type does. */
const useArrive = (delay: number) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16, EASE.out);
  return {
    opacity: p,
    filter: p < 0.97 ? `blur(${at(p, 24, 0)}px)` : undefined,
    transform: `translateY(${at(p, 60, 0)}px) scale(${at(p, 1.1, 1)})`,
  };
};

/** A parcel, drawn isometric with brand tape. */
export const BigParcel: React.FC<{ size?: number; delay?: number }> = ({
  size = 620,
  delay = 0,
}) => {
  const s = useArrive(delay);
  return (
    <div style={s}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <path d="M100 18 L178 54 L100 90 L22 54 Z" fill="#E0B378" />
        <path d="M22 54 L100 90 L100 178 L22 142 Z" fill="#B9863F" />
        <path d="M178 54 L178 142 L100 178 L100 90 Z" fill="#CB9A50" />
        <path d="M100 18 L120 27 L42 63 L22 54 Z" fill={C.green} />
        <path d="M100 90 L120 81 L120 169 L100 178 Z" fill={C.green} opacity={0.85} />
        <rect x="40" y="92" width="38" height="26" rx="2" fill="#F7F3EA" />
        <rect x="45" y="99" width="28" height="3" fill="#B9863F" />
        <rect x="45" y="106" width="20" height="3" fill="#B9863F" />
      </svg>
    </div>
  );
};

/**
 * A countdown ring — the visual for the one-hour promise. The arc sweeps
 * as the scene runs, so the claim has something ticking behind it.
 */
export const ClockRing: React.FC<{
  size?: number;
  delay?: number;
  color?: string;
  track?: string;
}> = ({ size = 560, delay = 0, color = C.orange, track = "#2A2A2A" }) => {
  const frame = useCurrentFrame();
  const s = useArrive(delay);
  const sweep = prog(frame, delay + 10, 52, EASE.out);
  const r = 88;
  const circ = 2 * Math.PI * r;

  return (
    <div style={s}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke={track} strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - sweep)}
          transform="rotate(-90 100 100)"
        />
        {/* hands, locked at the top like a fresh hour */}
        <rect x="97" y="52" width="6" height="52" rx="3" fill={color} />
        <rect
          x="97"
          y="72"
          width="6"
          height="32"
          rx="3"
          fill={color}
          transform="rotate(96 100 100)"
        />
        <circle cx="100" cy="100" r="9" fill={color} />
      </svg>
    </div>
  );
};

/**
 * A scattered node field standing in for national coverage. Deterministic
 * positions — no Math.random(), which would break Remotion's frame caching.
 */
const NODES: [number, number][] = [
  [12, 22], [28, 10], [44, 26], [62, 14], [78, 30], [90, 18],
  [8, 46], [24, 38], [40, 54], [56, 42], [72, 58], [88, 46],
  [16, 70], [32, 62], [48, 78], [64, 66], [80, 82], [92, 70],
  [20, 92], [38, 86], [54, 96], [70, 90], [84, 98], [6, 84],
];

export const DotField: React.FC<{
  width?: number;
  height?: number;
  delay?: number;
  hub?: number;
}> = ({ width = 880, height = 700, delay = 0, hub = 10 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {NODES.map(([x, y], i) => {
          if (i === hub) return null;
          const p = prog(frame, delay + 8 + i * 0.8, 10, EASE.out);
          const [hx, hy] = NODES[hub];
          return (
            <line
              key={`l${i}`}
              x1={hx}
              y1={hy}
              x2={at(p, hx, x)}
              y2={at(p, hy, y)}
              stroke={C.green}
              strokeWidth="0.35"
              opacity={0.5 * p}
            />
          );
        })}
      </svg>

      {NODES.map(([x, y], i) => {
        const p = prog(frame, delay + i * 0.9, 8, EASE.overshoot);
        const isHub = i === hub;
        const d = isHub ? 30 : 14;
        return (
          <div
            key={`d${i}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: d,
              height: d,
              marginLeft: -d / 2,
              marginTop: -d / 2,
              borderRadius: "50%",
              background: isHub ? C.orange : C.green,
              transform: `scale(${p})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** A wireframe globe for the international beat. */
export const Globe: React.FC<{ size?: number; delay?: number }> = ({
  size = 560,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const s = useArrive(delay);
  const spin = at(prog(frame, delay, 70, (n) => n), 0, 40);

  return (
    <div style={s}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill={C.green} />
        <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke={C.white} strokeWidth="3" opacity={0.85} />
        <ellipse cx="100" cy="100" rx="92" ry="68" fill="none" stroke={C.white} strokeWidth="3" opacity={0.7} />
        <ellipse
          cx="100"
          cy="100"
          rx={Math.max(6, Math.abs(Math.cos((spin * Math.PI) / 180)) * 92)}
          ry="92"
          fill="none"
          stroke={C.white}
          strokeWidth="3"
          opacity={0.85}
        />
        <ellipse cx="100" cy="100" rx="30" ry="92" fill="none" stroke={C.white} strokeWidth="3" opacity={0.5} />
      </svg>
    </div>
  );
};

/**
 * Stacked speed bars — the anchor for the opening beat, where the idea is
 * urgency rather than any particular object.
 */
export const SpeedBars: React.FC<{ delay?: number; color?: string }> = ({
  delay = 0,
  color = C.green,
}) => {
  const frame = useCurrentFrame();
  const rows = [
    { w: 620, h: 34, d: 0 },
    { w: 460, h: 34, d: 3 },
    { w: 720, h: 34, d: 6 },
    { w: 380, h: 34, d: 9 },
    { w: 560, h: 34, d: 12 },
  ];

  return (
    <div style={{ display: "grid", gap: 26 }}>
      {rows.map((r, i) => {
        const p = prog(frame, delay + r.d, 14, EASE.wipe);
        return (
          <div
            key={i}
            style={{
              width: r.w,
              height: r.h,
              borderRadius: 99,
              background: i % 2 === 0 ? color : C.orange,
              transform: `skewX(-18deg) scaleX(${p})`,
              transformOrigin: "left center",
              opacity: 0.9,
            }}
          />
        );
      })}
    </div>
  );
};
