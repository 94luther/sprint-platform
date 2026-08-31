/**
 * Sprint Couriers brand system.
 *
 * Single source of truth for colour, type and motion feel. Every scene pulls
 * from here so the film reads as one system rather than eight separate builds.
 */

import { Easing, interpolate } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

// --- Type -------------------------------------------------------------------
// Anton is a single-weight ultra-condensed display face: the poster-motion
// workhorse. Inter carries everything that has to stay readable at small sizes.

// Pin the subset to latin: without it Inter fires ~28 requests per render,
// which slows every single frame.
const anton = loadAnton("normal", {
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const inter = loadInter("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// Playfair Display 900 italic stands in for the brand's orange script-serif
// wordmark. Closest available match until the real logotype is supplied.
const playfair = loadPlayfair("italic", {
  weights: ["900"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// Poppins carries the manifesto cut: a geometric sans set mixed-case, where
// light weights hold the connectors and heavy weights carry the emphasis.
const poppins = loadPoppins("normal", {
  weights: ["300", "400", "600", "700", "800"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

// Handwritten accent, used sparingly — one line per film at most.
const caveat = loadCaveat("normal", {
  weights: ["700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const DISPLAY = anton.fontFamily;
export const TEXT = inter.fontFamily;
export const WORDMARK = playfair.fontFamily;
export const SANS = poppins.fontFamily;
export const SCRIPT = caveat.fontFamily;

/** Await in a delayRender() gate so headless renders never flash fallback type. */
export const fontsReady = Promise.all([
  anton.waitUntilDone(),
  inter.waitUntilDone(),
  playfair.waitUntilDone(),
  poppins.waitUntilDone(),
  caveat.waitUntilDone(),
]);

// --- Colour -----------------------------------------------------------------

export const C = {
  green: "#3AAA35",
  greenBright: "#4CC63E",
  greenDeep: "#2A7D27",
  orange: "#F7941D",
  orangeDeep: "#E0781A",
  ink: "#111111",
  inkSoft: "#1C1C1C",
  white: "#FFFFFF",
  bone: "#F4F4F1",
} as const;

// --- Canvas -----------------------------------------------------------------

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Horizontal safe margin. Vertical social crops hard at the edges. */
export const PAD = 96;

// --- Motion -----------------------------------------------------------------
// Poster motion lives or dies on easing. Everything here is fast-out/settle,
// never linear and never a slow symmetric fade.

export const EASE = {
  /** Decisive arrival. The default for type and shapes entering frame. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Slight overshoot for accents that should feel spring-loaded. */
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Leaving frame: accelerate away, no lingering. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Wipes crossing the whole frame. */
  wipe: Easing.bezier(0.83, 0, 0.17, 1),
} as const;

type Ease = (n: number) => number;

/**
 * Normalised 0..1 progress over a frame window, clamped at both ends.
 * The building block for every animation in the film.
 */
export const prog = (
  frame: number,
  start: number,
  duration: number,
  easing: Ease = EASE.out,
): number =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Map a 0..1 progress onto a value range. */
export const at = (p: number, from: number, to: number): number =>
  from + (to - from) * p;

/**
 * Enter-then-exit envelope: rises over `inDur`, holds, falls before `total`.
 * Saves every scene from hand-rolling its own out-transition.
 */
export const envelope = (
  frame: number,
  total: number,
  inDur = 12,
  outDur = 10,
): number =>
  Math.min(
    prog(frame, 0, inDur),
    1 - prog(frame, total - outDur, outDur, EASE.in),
  );

// --- Type scale -------------------------------------------------------------
// Deliberately few sizes. Poster layouts get their punch from big jumps in
// scale, not from a dozen near-identical steps.

export const TYPE = {
  mega: 190,
  headline: 140,
  sub: 96,
  body: 44,
  kicker: 34,
  fine: 30,
} as const;

/** Anton needs negative tracking at display sizes or it looks gappy. */
export const displayStyle = (size: number, color: string = C.white) =>
  ({
    fontFamily: DISPLAY,
    fontSize: size,
    lineHeight: 0.92,
    letterSpacing: size > 100 ? "-0.02em" : "-0.01em",
    color,
    textTransform: "uppercase",
    margin: 0,
    whiteSpace: "pre",
  }) as const;

export const textStyle = (size: number, weight = 600, color: string = C.white) =>
  ({
    fontFamily: TEXT,
    fontSize: size,
    fontWeight: weight,
    lineHeight: 1.25,
    color,
    margin: 0,
  }) as const;

/** The brand's signature diagonal. Used for slashes, wipes and lockups. */
export const SKEW = -12;
