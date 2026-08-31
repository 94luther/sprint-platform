/**
 * Scene-to-scene transitions.
 *
 * The film never crossfades. Every hand-off is a hard-edged brand-coloured
 * parallelogram that sweeps in, covers the frame completely on the cut frame,
 * then sweeps off to uncover the next scene. Because the panel is opaque and
 * the cut happens while it covers, the seam is invisible.
 */

import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { at, C, EASE, prog } from "./brand";

export type WipeDir = "right" | "left" | "up-right" | "down-left";

const START: Record<WipeDir, [number, number]> = {
  right: [-150, 0],
  left: [150, 0],
  "up-right": [-150, 130],
  "down-left": [150, -130],
};

const END: Record<WipeDir, [number, number]> = {
  right: [150, 0],
  left: [-150, 0],
  "up-right": [150, -130],
  "down-left": [-150, 130],
};

/**
 * One sweeping panel. Mount inside a Sequence that starts `coverAt` frames
 * before the cut, so the panel is at full coverage exactly on the cut.
 */
export const SlashPanel: React.FC<{
  color?: string;
  dir?: WipeDir;
  /** Frames spent arriving. Coverage is complete at this frame. */
  coverAt?: number;
  /** Frames spent leaving, after coverage. */
  clearIn?: number;
  skew?: number;
}> = ({
  color = C.green,
  dir = "right",
  coverAt = 6,
  clearIn = 10,
  skew = -22,
}) => {
  const frame = useCurrentFrame();
  const [sx, sy] = START[dir];
  const [ex, ey] = END[dir];

  const inP = prog(frame, 0, coverAt, EASE.wipe);
  const outP = prog(frame, coverAt, clearIn, EASE.wipe);

  // Arrive at (0,0), then continue on out the far side.
  const x = frame < coverAt ? at(inP, sx, 0) : at(outP, 0, ex);
  const y = frame < coverAt ? at(inP, sy, 0) : at(outP, 0, ey);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-40%",
          background: color,
          transform: `skewX(${skew}deg) translate(${x}%, ${y}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * The closing-shutter variant used once, before the logo: two panels meet in
 * the middle and then part, so the film stops travelling and opens instead.
 */
export const ShutterPanels: React.FC<{
  color?: string;
  coverAt?: number;
  clearIn?: number;
  skew?: number;
}> = ({ color = C.white, coverAt = 6, clearIn = 12, skew = -22 }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0, coverAt, EASE.wipe);
  const outP = prog(frame, coverAt, clearIn, EASE.wipe);

  const left = frame < coverAt ? at(inP, -150, -50) : at(outP, -50, -150);
  const right = frame < coverAt ? at(inP, 150, 50) : at(outP, 50, 150);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {[left, right].map((tx, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-40%",
            bottom: "-40%",
            left: 0,
            width: "100%",
            background: color,
            transform: `skewX(${skew}deg) translateX(${tx}%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Places a transition so that it covers the frame on `cutFrame`.
 * Keeps the arithmetic in one place instead of scattered across the timeline.
 */
export const Wipe: React.FC<{
  cutFrame: number;
  color?: string;
  dir?: WipeDir;
  coverAt?: number;
  clearIn?: number;
  shutter?: boolean;
}> = ({
  cutFrame,
  color,
  dir = "right",
  coverAt = 6,
  clearIn = 10,
  shutter = false,
}) => (
  <Sequence
    from={cutFrame - coverAt}
    durationInFrames={coverAt + clearIn}
    layout="none"
  >
    {shutter ? (
      <ShutterPanels color={color} coverAt={coverAt} clearIn={clearIn} />
    ) : (
      <SlashPanel color={color} dir={dir} coverAt={coverAt} clearIn={clearIn} />
    )}
  </Sequence>
);
