/**
 * Sprint Concept Film, 30 seconds, 1920x1080 landscape, 30fps.
 *
 * Four shots, one journey: shop owner hands off one last order before closing,
 * the rider crosses Gaborone traffic, arrives and the customer watches it on
 * the real app tracking screen, then the payout lands at sunset. Locked board:
 * docs/concept-film-FINAL-board.md, section D (referee final lock).
 *
 * Hard cuts only between shots, no crossfades. No Audio tag yet, the score
 * comes later. Built entirely from brand.ts primitives so this reads as the
 * same visual system as the rest of the Sprint library.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { at, C, displayStyle, EASE, fontsReady, PAD, prog, SANS, SKEW, TYPE } from "./brand";

export const SPRINT_CONCEPT_DURATION = 900;

// This composition is landscape, unlike the vertical reels elsewhere in this
// library, so it keeps its own canvas constants instead of brand.ts W and H.
const FILM_W = 1920;
const FILM_H = 1080;

// --- media contract -----------------------------------------------------------
// Remotion cannot check the filesystem reliably during a render, so this
// manifest is the single honest record of what has actually landed in
// public/concept. UPDATE THIS the moment a file arrives: flip a shot to
// "image" once its still lands, then to "video" once the real clip replaces
// it. Until then every shot renders as a plain ink panel, so the comp always
// builds and renders clean with nothing on disk.
type ShotId = "shot1" | "shot2" | "shot3" | "shot4";
type MediaState = "video" | "image" | "none";

const COMPLETED_MEDIA: Record<ShotId, MediaState> = {
  shot1: "video",
  shot2: "video",
  shot3: "video",
  shot4: "image",
};

// Veo stamps a small "Made with Veo" watermark in a corner of every clip.
// Assumption, unverified against real footage: bottom right corner. Scaling
// to 105 percent crops a uniform sliver off all four edges already, which
// should catch most of a corner mark on its own. The per shot offsetY below
// is extra insurance: a positive value nudges the frame down, which pushes
// more of the bottom edge, and that corner, out of the visible crop, while
// the top edge simply reveals a little more headroom in exchange. Trivial to
// retune per shot once the real clips are in hand.
interface FrameSpec {
  scale: number;
  offsetY: number;
}

const FRAME: Record<ShotId, FrameSpec> = {
  shot1: { scale: 1.05, offsetY: 24 },
  shot2: { scale: 1.05, offsetY: 24 },
  shot3: { scale: 1.05, offsetY: 24 },
  shot4: { scale: 1.05, offsetY: 24 },
};

/**
 * Renders the real clip once it exists, falls back to the still with a slow
 * push in while only the png has landed, and holds a plain ink panel when
 * neither file exists yet.
 */
const Shot: React.FC<{ id: ShotId; durationInFrames: number }> = ({ id, durationInFrames }) => {
  const frame = useCurrentFrame();
  const state = COMPLETED_MEDIA[id];
  const { scale, offsetY } = FRAME[id];

  if (state === "video") {
    return (
      <OffthreadVideo
        src={staticFile(`concept/${id}.mp4`)}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${offsetY}px)`,
        }}
      />
    );
  }

  if (state === "image") {
    // No camera move in a still, so a slow 4 percent push in over the whole
    // shot stands in for one.
    const push = 1 + 0.04 * prog(frame, 0, durationInFrames, EASE.out);
    return (
      <Img
        src={staticFile(`concept/${id}.png`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale * push}) translateY(${offsetY}px)`,
        }}
      />
    );
  }

  // Neither file exists yet. Hold the slot honestly rather than a broken
  // image icon or a crash.
  return <AbsoluteFill style={{ backgroundColor: C.ink }} />;
};

// --- type treatment -------------------------------------------------------
// Anton via displayStyle, entering with a 200ms fade and small rise (6
// frames at 30fps), exiting with a 150ms fade (5 frames), holding 2 to 3
// seconds. Never more than one line on screen. Lower third placement keeps
// clear of the composed subject in the frame above and of the shot 3 phone
// overlay on the right.

const SHOT_TYPE_SIZE = 116;

const TypeLine: React.FC<{
  text: string;
  start: number;
  holdDur?: number;
  color?: string;
}> = ({ text, start, holdDur = 75, color = C.bone }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const rise = at(fadeIn, 26, 0);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 150,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${rise}px)`,
          textAlign: "center",
          maxWidth: 1600,
        }}
      >
        <span style={{ ...displayStyle(SHOT_TYPE_SIZE, color), whiteSpace: "normal" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * The closing line, same treatment as the shot lines, but "Moving with you."
 * carries the film's first use of orange. The only other orange in the film
 * is the skew slash in the end card, so nothing else may use it.
 */
const ClosingLine: React.FC<{ start: number; holdDur?: number }> = ({ start, holdDur = 60 }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const rise = at(fadeIn, 26, 0);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 150,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}
    >
      <div style={{ opacity, transform: `translateY(${rise}px)`, textAlign: "center", maxWidth: 1600 }}>
        <span style={{ ...displayStyle(SHOT_TYPE_SIZE, C.bone), whiteSpace: "normal" }}>Built for Gaborone. </span>
        <span style={{ ...displayStyle(SHOT_TYPE_SIZE, C.orange), whiteSpace: "normal" }}>Moving with you.</span>
      </div>
    </AbsoluteFill>
  );
};

/** Ramps an ink scrim over the tail of shot 4 so the closing line and end
 * card stay legible over the payout macro without cutting away from it. */
const Scrim: React.FC<{ start: number; durationIn: number }> = ({ start, durationIn }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, durationIn, EASE.out);
  return <AbsoluteFill style={{ backgroundColor: C.ink, opacity: p * 0.72 }} />;
};

const ENDCARD_LOCKUP_SIZE = 150;

/** Cheetah mark, never redrawn, plus the SPRINT lockup at the brand's minus
 * 12 degree skew, the orange slash accent, and the small closing tagline. */
const EndCard: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < -1) return null;

  const logoP = prog(frame, start, 8, EASE.out);
  const nameP = prog(frame, start + 8, 10, EASE.overshoot);
  const slashP = prog(frame, start + 14, 10, EASE.overshoot);
  const lineP = prog(frame, start + 26, 10, EASE.out);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Img
          src={staticFile("logo-mark.png")}
          style={{
            width: 150,
            opacity: logoP,
            transform: `translateY(${at(logoP, 26, 0)}px) scale(${at(logoP, 0.88, 1)})`,
            filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.4))",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              ...displayStyle(ENDCARD_LOCKUP_SIZE, C.bone),
              transform: `skewX(${SKEW}deg) scale(${at(nameP, 0.9, 1)})`,
              opacity: nameP,
            }}
          >
            SPRINT
          </div>
          {/* The second and last use of orange in the film: a short skewed
              slash carrying the brand diagonal. */}
          <div
            style={{
              width: 12,
              height: 92,
              background: C.orange,
              opacity: slashP,
              transform: `skewX(${SKEW}deg) scaleY(${at(slashP, 0.4, 1)})`,
            }}
          />
        </div>
        <div style={{ opacity: lineP, transform: `translateY(${at(lineP, 16, 0)}px)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: TYPE.kicker, color: C.bone }}>
            Gaborone, delivered.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- shot 3 phone overlay --------------------------------------------------
// The real app tracking screen inside a small floating phone frame, sliding
// in from the right at 60 percent shot height. This is an overlay panel, not
// a screen replacement: it floats over the footage rather than covering it.

const PHONE_PANEL_W = 200;
const PHONE_PANEL_H = Math.round(PHONE_PANEL_W * (1024 / 512));

const TrackingPhone: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < -1) return null;

  const p = prog(frame, start, 24, EASE.out);
  const restX = FILM_W - PAD - PHONE_PANEL_W / 2;
  const startX = FILM_W + PHONE_PANEL_W / 2 + 60;
  const x = at(p, startX, restX);
  const y = FILM_H * 0.6;

  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity: p }}>
      <div
        style={{
          width: PHONE_PANEL_W + 16,
          height: PHONE_PANEL_H + 16,
          borderRadius: 34,
          background: C.ink,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)",
          padding: 8,
        }}
      >
        <div style={{ width: PHONE_PANEL_W, height: PHONE_PANEL_H, borderRadius: 26, overflow: "hidden" }}>
          <Img
            src={staticFile("appdemo/tracking.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
};

// --- shot scenes -------------------------------------------------------------

const Shot1Scene: React.FC = () => (
  <AbsoluteFill>
    <Shot id="shot1" durationInFrames={210} />
    <TypeLine text="One order. Before closing." start={14} />
  </AbsoluteFill>
);

const Shot2Scene: React.FC = () => (
  <AbsoluteFill>
    <Shot id="shot2" durationInFrames={240} />
    <TypeLine text="Gaborone does not stand still." start={14} />
  </AbsoluteFill>
);

const Shot3Scene: React.FC = () => (
  <AbsoluteFill>
    <Shot id="shot3" durationInFrames={210} />
    <TypeLine text="You can watch it coming." start={14} />
    <TrackingPhone start={110} />
  </AbsoluteFill>
);

/**
 * Shot 4 carries the whole close inside its own tail, per the locked board:
 * the shot's own type line, then the closing line, then the end card, all
 * over the one continuing macro portrait clip, no further hard cuts.
 */
const Shot4Scene: React.FC = () => (
  <AbsoluteFill>
    <Shot id="shot4" durationInFrames={240} />
    <TypeLine text="More earned in the same hour." start={10} holdDur={60} />
    <Scrim start={80} durationIn={35} />
    <ClosingLine start={85} holdDur={60} />
    <EndCard start={164} />
  </AbsoluteFill>
);

// --- assembly -----------------------------------------------------------------

export const SprintConcept: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* Original score: restrained band.py piano and strings, whooshes on the
          three hard cuts, mixed and peak limited in Python because Remotion's
          bundled ffmpeg has no audio filters. */}
      <Audio src={staticFile("audio/concept-score.wav")} />
      <Sequence from={0} durationInFrames={210}>
        <Shot1Scene />
      </Sequence>
      <Sequence from={210} durationInFrames={240}>
        <Shot2Scene />
      </Sequence>
      <Sequence from={450} durationInFrames={210}>
        <Shot3Scene />
      </Sequence>
      <Sequence from={660} durationInFrames={240}>
        <Shot4Scene />
      </Sequence>
    </AbsoluteFill>
  );
};
