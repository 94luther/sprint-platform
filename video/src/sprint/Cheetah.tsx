/**
 * The Sprint Couriers cheetah mark, traced from the real logo.
 *
 * Proportions matter here: the actual mark is long and low (~3.5:1), with a
 * near-straight back, a blocky head and a tail that streams almost
 * horizontally. Earlier attempts at 2:1 read as a fox, not a cheetah.
 *
 * Built as layered anatomy rather than one giant outline — a filled body and
 * head, plus stroked limbs with round caps. Strokes give natural, controllable
 * limb thickness that a single bezier outline makes needlessly fiddly.
 */

import { C } from "./brand";

/** Long and low. The aspect ratio is doing most of the work. */
export const CHEETAH_VIEWBOX = "0 0 600 180";

export const Cheetah: React.FC<{
  width?: number;
  color?: string;
  /** 0..1 — draws the mark on via a left-to-right clip. */
  reveal?: number;
  style?: React.CSSProperties;
}> = ({ width = 400, color = C.ink, reveal = 1, style }) => (
  <svg
    width={width}
    height={width * 0.3}
    viewBox={CHEETAH_VIEWBOX}
    fill="none"
    style={{
      overflow: "visible",
      clipPath: reveal < 1 ? `inset(0 ${(1 - reveal) * 100}% 0 0)` : undefined,
      ...style,
    }}
  >
    <g fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {/* hind legs driving back — drawn first so they sit behind the body */}
      <path
        d="M 232 70 C 196 92, 138 108, 84 114"
        strokeWidth={19}
        fill="none"
      />
      <path
        d="M 258 76 C 222 104, 160 126, 100 134"
        strokeWidth={17}
        fill="none"
      />

      {/* tail: a tapered wedge streaming back, thick at the base */}
      <path d="M 214 50 C 150 44, 78 50, 14 60 C 3 62, 2 73, 13 72 C 80 66, 152 66, 216 68 Z" />

      {/* body — long, slightly arched, deep through the chest */}
      <path d="M 196 56 C 232 38, 302 27, 372 27 C 432 27, 472 35, 498 48 C 508 53, 508 66, 496 71 C 452 86, 372 92, 302 88 C 246 85, 206 71, 196 56 Z" />

      {/* neck and head: blunt muzzle, defined brow, jaw tucked under */}
      <path
        d={
          "M 482 36 " +
          "C 504 25, 530 20, 551 25 " + // skull and brow
          "C 566 28, 579 35, 587 44 " + // muzzle driving forward
          "C 590 51, 584 58, 574 58 " + // blunt nose
          "C 559 59, 544 56, 531 53 " + // under the muzzle
          "C 512 59, 494 54, 482 45 Z" // jaw back into the neck
        }
      />
      {/* ear — base pushed well inside the skull so it never reads as detached */}
      <path d="M 513 34 L 523 6 L 545 28 Z" />

      {/* forelegs reaching ahead — drawn last so they overlap the chest */}
      <path
        d="M 452 70 C 480 98, 520 128, 550 143"
        strokeWidth={17}
        fill="none"
      />
      <path
        d="M 478 68 C 510 98, 552 132, 582 148"
        strokeWidth={19}
        fill="none"
      />
    </g>
  </svg>
);

/**
 * The full logo lockup: the cheetah bounding over the brand's green slash.
 *
 * `reveal` draws the cat on left-to-right; `slashReveal` scales the green
 * band out from its left edge, so the two can be staggered.
 */
export const LogoLockup: React.FC<{
  width?: number;
  reveal?: number;
  slashReveal?: number;
  catColor?: string;
}> = ({ width = 720, reveal = 1, slashReveal = 1, catColor = C.ink }) => (
  <div style={{ width, position: "relative", height: width * 0.34 }}>
    {/* the green diagonal the cat leaps over */}
    <div
      style={{
        position: "absolute",
        left: "1%",
        top: "44%",
        width: "98%",
        height: width * 0.085,
        background: C.green,
        transform: `skewX(-26deg) scaleX(${slashReveal})`,
        transformOrigin: "left center",
      }}
    />
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%" }}>
      <Cheetah width={width} color={catColor} reveal={reveal} />
    </div>
  </div>
);
