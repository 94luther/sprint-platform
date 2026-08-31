/**
 * Animated stick people for the Sprint Games challenge films.
 *
 * One side-view figure, posed parametrically: a run cycle, a braced tug pull,
 * an overhead hold, a careful blindfolded walk. All motion is a pure function
 * of the frame so renders stay deterministic. Local units: the figure stands
 * ~112 tall with the hip at the origin; scale it at the call site.
 */

import React from "react";
import { C } from "./brand";

const rad = (d: number) => (d * Math.PI) / 180;

/** End point of a limb segment: angle measured from straight-down, +forward. */
const seg = (x: number, y: number, angleDeg: number, len: number): [number, number] => [
  x + Math.sin(rad(angleDeg)) * len,
  y + Math.cos(rad(angleDeg)) * len,
];

export type Pose = "run" | "stand" | "pull" | "hold" | "blindwalk" | "climb" | "cheer";

/** A carried parcel, drawn relative to whatever joint it rides on. */
export const StickBox: React.FC<{ x: number; y: number; size?: number; color?: string }> = ({
  x,
  y,
  size = 30,
  color = C.orange,
}) => (
  <g transform={`translate(${x - size / 2}, ${y - size / 2})`}>
    <rect width={size} height={size} rx={3} fill={color} stroke={C.ink} strokeWidth={1.5} />
    <rect y={size * 0.42} width={size} height={size * 0.16} fill={C.white} opacity={0.85} />
  </g>
);

export const Figure: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  pose: Pose;
  /** Animation phase — pass the frame (or a scaled frame). */
  phase?: number;
  flip?: boolean;
  /** Draw a parcel in/above the hands for hold / blindwalk. */
  box?: boolean;
  boxColor?: string;
  /** Blindfold band (used with blindwalk). */
  blindfold?: boolean;
  opacity?: number;
}> = ({
  x,
  y,
  scale = 1,
  color = C.ink,
  pose,
  phase = 0,
  flip = false,
  box = false,
  boxColor = C.orange,
  blindfold = false,
  opacity = 1,
}) => {
  const s = Math.sin(phase / 4);
  const slow = Math.sin(phase / 9);

  // pose parameters: torso lean, per-limb angles (from straight-down, +forward)
  let lean = 0;
  let legA = 0, legAK = 0, legB = 0, legBK = 0;
  let armA = 8, armAE = 10, armB = -8, armBE = -6;
  let bob = 0;

  if (pose === "run") {
    lean = 14;
    legA = 38 * s; legAK = legA + 34 * Math.max(0, -s);
    legB = -38 * s; legBK = legB + 34 * Math.max(0, s);
    armA = -34 * s; armAE = armA - 26;
    armB = 34 * s; armBE = armB + 26;
    bob = Math.abs(s) * -3;
  } else if (pose === "stand") {
    lean = 2 * slow;
    armA = 8; armAE = 12; armB = -8; armBE = -10;
  } else if (pose === "pull") {
    lean = -30 + 3 * s;
    legA = 42; legAK = 30;
    legB = 10; legBK = -14;
    armA = 78; armAE = 96;
    armB = 66; armBE = 92;
    bob = Math.abs(s) * 1.5;
  } else if (pose === "hold") {
    lean = 3 * slow;
    armA = 148 + 3 * slow; armAE = 166 + 3 * slow;
    armB = -148 + 3 * slow; armBE = -166 + 3 * slow;
    legA = 6; legB = -6;
  } else if (pose === "blindwalk") {
    lean = 4;
    legA = 15 * slow; legAK = legA + 12 * Math.max(0, -slow);
    legB = -15 * slow; legBK = legB + 12 * Math.max(0, slow);
    armA = 74; armAE = 100;
    armB = 64; armBE = 96;
  } else if (pose === "cheer") {
    lean = 2 * slow;
    armA = 138 + 6 * s; armAE = 150 + 6 * s;
    armB = -138 - 6 * s; armBE = -150 - 6 * s;
    legA = 8; legB = -8;
    bob = Math.abs(s) * -4;
  } else if (pose === "climb") {
    lean = 6;
    legA = 40 + 20 * s; legAK = legA + 30;
    legB = 40 - 20 * s; legBK = legB + 30;
    armA = 150 + 14 * s; armAE = 150 + 14 * s;
    armB = 150 - 14 * s; armBE = 150 - 14 * s;
  }

  const HIP: [number, number] = [0, 0];
  const [shx, shy] = seg(HIP[0], HIP[1], 180 + lean, 46); // shoulder, up from hip
  const headC = seg(shx, shy, 180 + lean, 17);
  const stroke = 6;

  const limb = (
    sx: number,
    sy: number,
    a1: number,
    l1: number,
    a2: number,
    l2: number,
  ): { pts: string; end: [number, number] } => {
    const [mx, my] = seg(sx, sy, a1, l1);
    const end = seg(mx, my, a2, l2);
    return { pts: `${sx},${sy} ${mx},${my} ${end[0]},${end[1]}`, end };
  };

  const lgA = limb(HIP[0], HIP[1], legA, 32, legAK, 34);
  const lgB = limb(HIP[0], HIP[1], legB, 32, legBK, 34);
  const arA = limb(shx, shy, armA, 27, armAE, 27);
  const arB = limb(shx, shy, armB, 27, armBE, 27);
  const handMid: [number, number] = [
    (arA.end[0] + arB.end[0]) / 2,
    (arA.end[1] + arB.end[1]) / 2,
  ];

  return (
    <g
      transform={`translate(${x}, ${y + bob}) scale(${flip ? -scale : scale}, ${scale})`}
      opacity={opacity}
    >
      {/* far limbs, ghosted for depth */}
      <polyline points={lgB.pts} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <polyline points={arB.pts} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />

      {/* torso + head */}
      <line x1={HIP[0]} y1={HIP[1]} x2={shx} y2={shy} stroke={color} strokeWidth={stroke + 1} strokeLinecap="round" />
      <circle cx={headC[0]} cy={headC[1]} r={12.5} fill={color} />
      {blindfold && (
        <rect
          x={headC[0] - 15}
          y={headC[1] - 5}
          width={30}
          height={9}
          rx={4}
          fill={C.orange}
          transform={`rotate(${lean} ${headC[0]} ${headC[1]})`}
        />
      )}

      {/* near limbs */}
      <polyline points={lgA.pts} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={arA.pts} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* carried parcel: overhead for hold, in front of the hands otherwise */}
      {box && pose === "hold" && <StickBox x={handMid[0]} y={handMid[1] - 18} size={34} color={boxColor} />}
      {box && pose !== "hold" && <StickBox x={handMid[0] + 6} y={handMid[1] - 4} size={28} color={boxColor} />}
    </g>
  );
};
