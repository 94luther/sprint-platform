/**
 * "Run Like The Cheetah" — Sprint Couriers brand film, 1080x1920 @ 30fps.
 *
 * 600 frames / 20 seconds. Every cut travels left-to-right so the viewer feels
 * distance being closed, and the film brakes hard into the logo at the end.
 */

import { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Sequence } from "remotion";
import { C, fontsReady } from "./brand";
import {
  CheetahLaunch,
  ColdOpen,
  LogoScene,
  NumberOne,
  OneHour,
  SeventyFive,
  ThreeLanes,
} from "./scenes";
import { Wipe } from "./transitions";

export const PROMO_DURATION = 600;

/** Cut points. Durations shorten through the middle: the film accelerates. */
const CUTS = {
  cheetah: 72,
  oneHour: 138,
  seventyFive: 234,
  lanes: 312,
  numberOne: 402,
  logo: 480,
} as const;

const SCENES = [
  { at: 0, dur: CUTS.cheetah, Comp: ColdOpen },
  { at: CUTS.cheetah, dur: CUTS.oneHour - CUTS.cheetah, Comp: CheetahLaunch },
  { at: CUTS.oneHour, dur: CUTS.seventyFive - CUTS.oneHour, Comp: OneHour },
  { at: CUTS.seventyFive, dur: CUTS.lanes - CUTS.seventyFive, Comp: SeventyFive },
  { at: CUTS.lanes, dur: CUTS.numberOne - CUTS.lanes, Comp: ThreeLanes },
  { at: CUTS.numberOne, dur: CUTS.logo - CUTS.numberOne, Comp: NumberOne },
  { at: CUTS.logo, dur: PROMO_DURATION - CUTS.logo, Comp: LogoScene },
];

export const SprintPromo: React.FC = () => {
  // Hold the render until webfonts are ready, or headless frames flash fallback
  // type and the whole cut jitters.
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {SCENES.map(({ at, dur, Comp }) => (
        <Sequence key={at} from={at} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}

      {/* Transitions ride above everything and cover the frame on each cut. */}
      <Wipe cutFrame={CUTS.cheetah} color={C.green} dir="up-right" />
      <Wipe cutFrame={CUTS.oneHour} color={C.orange} dir="right" clearIn={8} />
      <Wipe cutFrame={CUTS.seventyFive} color={C.ink} dir="right" clearIn={8} />
      <Wipe cutFrame={CUTS.lanes} color={C.white} dir="up-right" clearIn={8} />
      <Wipe cutFrame={CUTS.numberOne} color={C.green} dir="right" clearIn={8} />
      <Wipe cutFrame={CUTS.logo} color={C.white} shutter coverAt={6} clearIn={12} />
    </AbsoluteFill>
  );
};
