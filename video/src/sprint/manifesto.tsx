/**
 * "Your World Delivered" — Sprint Couriers manifesto cut, 1080x1920 @ 30fps.
 *
 * Built in the reference's language: a sentence builds word by word out of
 * motion blur, emphasis words carry a box / highlighter / underline, and
 * scenes hand over by blurring through rather than wiping.
 *
 * Composition follows the reference too — type owns the top third, and a
 * subject fills the lower two-thirds. The reference uses cut-out photography;
 * with none available, each scene is anchored by a code-drawn brand object.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { at, C, EASE, fontsReady, PAD, prog, SANS, SCRIPT } from "./brand";
import { Cheetah } from "./Cheetah";
import { Grade } from "./reel";
import { BigParcel, ClockRing, DotField, Globe, SpeedBars } from "./graphics";
import { GhostWord, Rings, Sentence, SoftCircle, Word } from "./kinetic";

export const MANIFESTO_DURATION = 630;

/**
 * Blurs a scene in on arrival and back out before the cut, so consecutive
 * scenes dissolve through motion rather than being sliced apart.
 */
const Blurred: React.FC<{
  children: React.ReactNode;
  dur: number;
  bg: string;
}> = ({ children, dur, bg }) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0, 8, EASE.out);
  const outP = prog(frame, dur - 9, 9, EASE.in);
  const blur = at(1 - inP, 0, 7) + at(outP, 0, 8);
  const scale = at(1 - inP, 1, 1.015) + at(outP, 0, 0.02);

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
          transform: `scale(${scale})`,
          opacity: Math.min(1, inP * 1.4) * (1 - outP * 0.85),
        }}
      >
        {children}
      </AbsoluteFill>
      <Grade />
    </AbsoluteFill>
  );
};

/**
 * The scene grid: type block pinned to the top third, anchor graphic centred
 * in the lower two-thirds with its backdrop circle behind it.
 */
const Layout: React.FC<{
  text: React.ReactNode;
  anchor?: React.ReactNode;
  anchorAlign?: "center" | "flex-start";
  circle?: { size: number; color: string; opacity?: number; delay?: number };
}> = ({ text, anchor, anchorAlign = "center", circle }) => (
  <>
    {circle && (
      <SoftCircle
        size={circle.size}
        color={circle.color}
        opacity={circle.opacity ?? 1}
        delay={circle.delay ?? 2}
        x={540 - circle.size / 2}
        y={1290 - circle.size / 2}
      />
    )}

    <div style={{ position: "absolute", top: 190, left: PAD, right: PAD }}>
      {text}
    </div>

    {anchor && (
      <div
        style={{
          position: "absolute",
          top: 880,
          left: PAD,
          right: PAD,
          height: 820,
          display: "flex",
          alignItems: "center",
          justifyContent: anchorAlign,
        }}
      >
        {anchor}
      </div>
    )}
  </>
);

// --- 1 ----------------------------------------------------------------------

const S1: React.FC = () => (
  <Blurred dur={84} bg={C.bone}>
    <Rings x={150} y={260} color={C.ink} count={5} gap={110} delay={4} />
    <Layout
      circle={{ size: 780, color: C.green, opacity: 0.16 }}
      anchorAlign="flex-start"
      anchor={<SpeedBars delay={18} />}
      text={
        <Sentence
          size={116}
          drift={22}
          step={6}
          tokens={[
            { t: "Some", w: 300 },
            { t: "things", w: 300 },
            { t: "can't", w: 300, br: true },
            { t: "wait.", w: 800, e: "fill", accent: C.orange },
          ]}
        />
      }
    />
  </Blurred>
);

// --- 2 ----------------------------------------------------------------------

const S2: React.FC = () => (
  <Blurred dur={84} bg={C.bone}>
    <GhostWord x={-40} y={1560} size={220} delay={10}>
      BOTSWANA
    </GhostWord>
    <Layout
      circle={{ size: 860, color: C.green, opacity: 0.9 }}
      anchor={<BigParcel size={640} delay={16} />}
      text={
        <Sentence
          size={104}
          drift={-18}
          step={5}
          tokens={[
            { t: "A", w: 300 },
            { t: "parcel", w: 700 },
            { t: "is", w: 300 },
            { t: "never", w: 300, br: true },
            { t: "just", w: 300 },
            { t: "a", w: 300 },
            { t: "parcel.", w: 800, e: "box", accent: C.orange },
          ]}
        />
      }
    />
  </Blurred>
);

// --- 3 ----------------------------------------------------------------------

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 12, 16, EASE.out);

  return (
    <Blurred dur={90} bg={C.green}>
      <Rings x={880} y={480} color={C.white} count={6} gap={125} delay={2} />

      <Layout
        anchor={
          <div
            style={{
              filter: p < 0.97 ? `blur(${at(p, 26, 0)}px)` : undefined,
              transform: `translateX(${at(p, -340, 0)}px) scale(${at(p, 1.12, 1)})`,
              opacity: p,
            }}
          >
            <Cheetah width={940} color={C.ink} />
          </div>
        }
        text={
          <Sentence
            size={132}
            color={C.white}
            drift={20}
            step={7}
            tokens={[
              { t: "So", w: 300 },
              { t: "we", w: 300 },
              { t: "run.", w: 800, e: "box", accent: C.orange, c: C.white },
            ]}
          />
        }
      />

      <AbsoluteFill style={{ padding: PAD, justifyContent: "flex-end" }}>
        <div style={{ marginBottom: 130 }}>
          <Word delay={38} weight={600} size={40} color={C.white}>
            Express courier &amp; logistics
          </Word>
        </div>
      </AbsoluteFill>
    </Blurred>
  );
};

// --- 4 ----------------------------------------------------------------------

const S4: React.FC = () => (
  <Blurred dur={90} bg={C.bone}>
    <Layout
      circle={{ size: 900, color: C.green, opacity: 0.12 }}
      anchor={<DotField width={860} height={640} delay={18} />}
      text={
        <>
          <Sentence
            size={100}
            drift={20}
            step={5}
            tokens={[
              { t: "To", w: 300 },
              { t: "every", w: 300 },
              { t: "corner", w: 300, br: true },
              { t: "of", w: 300 },
              { t: "the", w: 300 },
              { t: "country.", w: 700 },
            ]}
          />
          <div style={{ marginTop: 46 }}>
            <Sentence
              size={124}
              start={26}
              step={6}
              tokens={[
                { t: "75+", w: 800, e: "fill", accent: C.orange },
                { t: "destinations.", w: 700 },
              ]}
            />
          </div>
        </>
      }
    />
  </Blurred>
);

// --- 5 ----------------------------------------------------------------------

const S5: React.FC = () => (
  <Blurred dur={90} bg={C.ink}>
    <GhostWord x={80} y={300} size={200} delay={6} color={C.white}>
      SPRINT
    </GhostWord>
    <Layout
      anchor={<ClockRing size={620} delay={16} />}
      text={
        <>
          <Sentence
            size={100}
            color={C.white}
            drift={-16}
            step={5}
            tokens={[
              { t: "And", w: 300 },
              { t: "locally,", w: 300 },
              { t: "in", w: 300, br: true },
              { t: "under", w: 300 },
            ]}
          />
          <div style={{ marginTop: 40 }}>
            <Sentence
              size={158}
              color={C.white}
              start={22}
              step={7}
              tokens={[{ t: "1 hour.", w: 800, e: "fill", accent: C.orange }]}
            />
          </div>
        </>
      }
    />
    <AbsoluteFill style={{ padding: PAD, justifyContent: "flex-end" }}>
      <div style={{ marginBottom: 110 }}>
        <Word delay={46} weight={600} size={36} color={C.white}>
          Sprint Service · priority local delivery
        </Word>
      </div>
    </AbsoluteFill>
  </Blurred>
);

// --- 6 ----------------------------------------------------------------------

const S6: React.FC = () => (
  <Blurred dur={72} bg={C.bone}>
    <Layout
      circle={{ size: 820, color: C.green, opacity: 0.14 }}
      anchor={<Globe size={600} delay={16} />}
      text={
        <Sentence
          size={112}
          drift={16}
          step={9}
          tokens={[
            { t: "Domestic.", w: 700, br: true },
            { t: "Freight.", w: 700, br: true },
            { t: "Worldwide.", w: 800, e: "underline", accent: C.orange },
          ]}
        />
      }
    />
    <AbsoluteFill style={{ padding: PAD, justifyContent: "flex-end" }}>
      <div style={{ marginBottom: 110 }}>
        <Word delay={36} weight={600} size={36} color={C.ink}>
          International via Aramex
        </Word>
      </div>
    </AbsoluteFill>
  </Blurred>
);

// --- 7 ----------------------------------------------------------------------

const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const cat = prog(frame, 6, 14, EASE.out);
  const slash = prog(frame, 2, 12, EASE.overshoot);
  const rule = prog(frame, 46, 8, EASE.out);

  return (
    <Blurred dur={120} bg={C.white}>
      <Rings x={920} y={1720} color={C.green} count={5} gap={130} delay={4} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 880 }}>
          <div style={{ position: "relative", height: 300 }}>
            <div
              style={{
                position: "absolute",
                left: -20,
                top: 158,
                width: 920,
                height: 92,
                background: C.green,
                transform: `skewX(-26deg) scaleX(${slash})`,
                transformOrigin: "left center",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 30,
                top: 52,
                filter: cat < 0.97 ? `blur(${at(cat, 22, 0)}px)` : undefined,
                transform: `scale(${at(cat, 1.1, 1)})`,
                opacity: cat,
              }}
            >
              <Cheetah width={800} color={C.ink} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 18, justifyItems: "center", marginTop: 20 }}>
            <Word delay={18} weight={800} size={106} color={C.orange}>
              Sprint Couriers
            </Word>

            {/* the one handwritten line in the film */}
            <div
              style={{
                fontFamily: SCRIPT,
                fontWeight: 700,
                fontSize: 76,
                color: C.ink,
                opacity: prog(frame, 30, 12, EASE.out),
                transform: `translateY(${at(prog(frame, 30, 12, EASE.out), 22, 0)}px)`,
              }}
            >
              Your World Delivered
            </div>

            <div
              style={{
                height: 6,
                width: 620,
                background: C.orange,
                transform: `scaleX(${rule})`,
                marginTop: 6,
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                whiteSpace: "nowrap",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 34,
                opacity: prog(frame, 54, 10, EASE.out),
              }}
            >
              <span style={{ color: C.ink }}>www.sprintcouriers.co.bw</span>
              <span style={{ width: 11, height: 11, background: C.orange, borderRadius: 99 }} />
              <span style={{ color: C.green }}>WhatsApp 76 999 965</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Blurred>
  );
};

// --- assembly ---------------------------------------------------------------

const SCENES = [
  { at: 0, dur: 84, Comp: S1 },
  { at: 84, dur: 84, Comp: S2 },
  { at: 168, dur: 90, Comp: S3 },
  { at: 258, dur: 90, Comp: S4 },
  { at: 348, dur: 90, Comp: S5 },
  { at: 438, dur: 72, Comp: S6 },
  { at: 510, dur: 120, Comp: S7 },
];

export const SprintManifesto: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bone }}>
      {SCENES.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
