/**
 * Two more Sprint reels built on the SprintReel machinery.
 *
 *   AnnivReel  600f / 20s — "Twenty years. Still sprinting." 2006–2026.
 *   CtaReel    450f / 15s — short WhatsApp conversion cut.
 *
 * Both 1080x1920 @ 30fps, bone ground, blur-through handovers, same motion
 * grammar as the 30s reel so the set reads as one campaign.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { at, C, EASE, fontsReady, prog, SANS, TEXT } from "./brand";
import { Sentence } from "./kinetic";
import { Wipe } from "./transitions";
import { Index, Kick, LightSweep, Scene, Slash, Subject, Type } from "./reel";

export const ANNIV_DURATION = 600;
export const CTA_DURATION = 450;

const PAD = 84;

// --- anniversary props ------------------------------------------------------

/** The giant 20 with the orange 2006→2026 slash, animated. */
const Giant20: React.FC = () => {
  const frame = useCurrentFrame();
  const numP = prog(frame, 4, 16, EASE.out);
  const slashP = prog(frame, 18, 14, EASE.wipe);
  const labels = prog(frame, 30, 8, EASE.out);
  const numY = 1150;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g
        opacity={numP}
        transform={`translate(540 ${numY}) scale(${at(numP, 1.12, 1)}) translate(-540 ${-numY})`}
      >
        <text
          x={540}
          y={numY}
          textAnchor="middle"
          fontFamily={SANS}
          fontWeight={800}
          fontSize={760}
          fill={C.ink}
          letterSpacing={-18}
        >
          20
        </text>
      </g>
      <g transform={`rotate(-27 540 ${numY - 140})`}>
        <rect
          x={-200}
          y={numY - 190}
          width={1480 * slashP}
          height={64}
          fill={C.orange}
        />
        <rect
          x={-200}
          y={numY - 108}
          width={1480 * slashP}
          height={18}
          fill={C.green}
        />
        <g opacity={labels} fontFamily={TEXT} fontWeight={800} fontSize={30} fill={C.white}>
          <text x={200} y={numY - 147}>2006</text>
          <text x={770} y={numY - 147}>2026</text>
        </g>
      </g>
    </svg>
  );
};

/** Circular TWENTY YEARS seal, popping in and slowly turning. */
const SealSpin: React.FC<{ delay?: number; x?: number; y?: number }> = ({
  delay = 10,
  x = 700,
  y = 640,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 10, EASE.overshoot);
  const r = 92;
  const spin = -12 + frame * 0.12;

  return (
    <svg
      width={300}
      height={300}
      viewBox="0 0 260 260"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `rotate(${spin}deg) scale(${at(p, 1.4, 1)})`,
        opacity: p,
        zIndex: 3,
      }}
    >
      <circle cx={130} cy={130} r={124} fill={C.orange} />
      <circle cx={130} cy={130} r={124} fill="none" stroke={C.white} strokeWidth={3} strokeDasharray="3 9" />
      <defs>
        <path id="sealArc2" d={`M ${130 - r} 130 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`} />
      </defs>
      <text fontFamily={TEXT} fontWeight={800} fontSize={21.5} letterSpacing={3.5} fill={C.white}>
        <textPath href="#sealArc2">TWENTY YEARS · SINCE 2006 · TWENTY YEARS ·</textPath>
      </text>
      <text x={130} y={158} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={82} fill={C.white}>
        20
      </text>
    </svg>
  );
};

const Eyebrow: React.FC<{ text: string; delay?: number; center?: boolean }> = ({
  text,
  delay = 2,
  center = false,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 10, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: PAD,
        right: PAD,
        textAlign: center ? "center" : "left",
        fontFamily: TEXT,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
        color: "#6E675D",
        opacity: p,
        transform: `translateY(${at(p, 14, 0)}px)`,
        zIndex: 2,
      }}
    >
      {text}
    </div>
  );
};

// --- AnnivReel beats --------------------------------------------------------

const A1: React.FC = () => (
  <Scene dur={108}>
    <Index n={1} total={6} />
    <Eyebrow text="2006–2026" center />
    <Giant20 />
    <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
      <Sentence
        size={92}
        start={26}
        step={7}
        align="center"
        tokens={[
          { t: "Twenty years.", w: 800 },
          { t: "Still sprinting.", w: 300, br: true },
        ]}
      />
    </div>
    <Kick text="Sprint Couriers · Botswana" delay={40} />
  </Scene>
);

const A2: React.FC = () => (
  <Scene dur={108}>
    <Index n={2} total={6} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={112}
        drift={18}
        step={6}
        tokens={[
          { t: "It started", w: 300 },
          { t: "with", w: 300, br: true },
          { t: "one bakkie.", w: 800, e: "box", accent: C.green },
        ]}
      />
    </Type>
    <Subject file="shot-hilux.png" width={1300} from={-260} bottom={130} delay={12} />
    <Kick text="Gaborone, 2006" />
  </Scene>
);

const A3: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(at(prog(frame, 18, 18, EASE.out), 0, 75));
  return (
    <Scene dur={114}>
    <Index n={3} total={6} />
      <Slash top={1010} delay={2} />
      <Type>
        <Sentence
          size={100}
          drift={16}
          step={6}
          tokens={[{ t: "Today,", w: 300 }, { t: "it's", w: 300 }]}
        />
        <div style={{ marginTop: 14 }}>
          <Sentence size={180} start={14} tokens={[{ t: `${n}+`, w: 800, e: "fill", accent: C.orange }]} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Sentence size={96} start={28} tokens={[{ t: "destinations.", w: 700 }]} />
        </div>
      </Type>
      <Subject file="shot-globe.png" width={1150} delay={14} bottom={230} />
      <Kick text="Nationwide · worldwide via Aramex" />
    </Scene>
  );
};

const A4: React.FC = () => (
  <Scene dur={102}>
    <Index n={4} total={6} />
    <Slash top={1050} delay={2} />
    <Type>
      <Sentence
        size={112}
        drift={18}
        step={6}
        tokens={[
          { t: "Same cheetah.", w: 300, br: true },
          { t: "Same hunger.", w: 800, e: "underline", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="shot-courier-box.png" height={1120} bottom={-30} delay={12} reflect={false} />
    <Kick text="Express courier & logistics" />
  </Scene>
);

const A5: React.FC = () => (
  <Scene dur={90}>
    <Index n={5} total={6} />
    <Slash top={1000} delay={2} />
    <Type>
      <Sentence
        size={122}
        drift={18}
        step={6}
        tokens={[
          { t: "Thank you,", w: 300, br: true },
          { t: "Botswana.", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
    <SealSpin delay={26} x={700} y={620} />
    <Subject file="shot-handoff.png" width={1500} delay={12} bottom={-40} reflect={false} />
    <Kick text="20 years of your trust" />
  </Scene>
);

const A6: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 6, 14, EASE.out);
  const slash = prog(frame, 12, 14, EASE.wipe);
  const tag = prog(frame, 22, 12, EASE.out);
  const years = prog(frame, 34, 10, EASE.out);

  return (
    <Scene dur={78}>
    <Index n={6} total={6} />
      <div
        style={{
          position: "absolute",
          left: "-30%",
          width: "170%",
          height: 88,
          top: "88%",
          background: C.green,
          transform: `rotate(-27deg) scaleX(${slash})`,
          transformOrigin: "left center",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(-90px)" }}>
        <div style={{ width: 860, textAlign: "center", position: "relative" }}>
          <LightSweep delay={26} />
          <Img
            src={staticFile("logo-mark.png")}
            style={{
              width: "100%",
              maxWidth: "none",
              display: "block",
              opacity: logo,
              filter: logo < 0.96 ? `blur(${at(logo, 18, 0)}px)` : "drop-shadow(0 22px 34px rgba(20,24,16,0.16))",
              transform: `scale(${at(logo, 1.07, 1)})`,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 300,
              fontSize: 41,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: C.ink,
              marginTop: 44,
              opacity: tag,
              transform: `translateY(${at(tag, 20, 0)}px)`,
            }}
          >
            Your World Delivered
          </div>
          <div
            style={{
              fontFamily: TEXT,
              fontWeight: 800,
              fontSize: 32,
              letterSpacing: "0.3em",
              color: C.orange,
              marginTop: 30,
              opacity: years,
            }}
          >
            2006–2026 · TWENTY YEARS
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const ANNIV_BEATS = [
  { at: 0, dur: 108, C: A1 },
  { at: 108, dur: 108, C: A2 },
  { at: 216, dur: 114, C: A3 },
  { at: 330, dur: 102, C: A4 },
  { at: 432, dur: 90, C: A5 },
  { at: 522, dur: 78, C: A6 },
];

export const AnnivReel: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F3ED" }}>
      {ANNIV_BEATS.map(({ at: from, dur, C: Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}

      <Wipe cutFrame={216} color={C.green} dir="up-right" coverAt={6} clearIn={10} />
    </AbsoluteFill>
  );
};

// --- CtaReel beats ----------------------------------------------------------

const T1: React.FC = () => (
  <Scene dur={75}>
    <Index n={1} total={5} />
    <Slash top={1000} />
    <Type>
      <Sentence
        size={126}
        drift={20}
        step={6}
        tokens={[
          { t: "Need it", w: 300 },
          { t: "there", w: 300, br: true },
          { t: "today?", w: 800, e: "fill", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="shot-courier-boxes.png" height={1040} bottom={-30} delay={10} reflect={false} />
    <Kick text="Sprint Service · same-day" />
  </Scene>
);

const T2: React.FC = () => (
  <Scene dur={75}>
    <Index n={2} total={5} />
    <Slash top={1050} delay={2} />
    <Type>
      <Sentence
        size={126}
        drift={18}
        step={6}
        tokens={[
          { t: "Send", w: 300 },
          { t: "one", w: 300, br: true },
          { t: "message.", w: 800, e: "box", accent: C.green },
        ]}
      />
    </Type>
    <Subject file="shot-overalls.png" height={1280} bottom={0} x={230} delay={10} />
    <Kick text="Collections across Gaborone" />
  </Scene>
);

const T3: React.FC = () => {
  const frame = useCurrentFrame();
  const bubble = prog(frame, 30, 7, EASE.overshoot);
  return (
    <Scene dur={105}>
    <Index n={3} total={5} />
      <Slash top={1010} delay={2} />
      <Type>
        <Sentence size={100} drift={16} step={6} tokens={[{ t: "WhatsApp", w: 300 }]} />
        <div style={{ marginTop: 18 }}>
          <Sentence size={132} start={10} tokens={[{ t: "76 999 965", w: 800, e: "fill", accent: C.orange }]} />
        </div>
      </Type>
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: 620,
          background: C.green,
          color: C.white,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 38,
          letterSpacing: "0.04em",
          padding: "18px 34px",
          borderRadius: "26px 26px 26px 0",
          opacity: bubble,
          transform: `scale(${at(bubble, 1.15, 1)})`,
          transformOrigin: "left bottom",
          zIndex: 3,
        }}
      >
        Pickup point + parcel size
      </div>
      <Subject file="shot-office.png" height={1060} bottom={-30} x={140} delay={12} reflect={false} />
      <Kick text="Replies during business hours" />
    </Scene>
  );
};

const T4: React.FC = () => (
  <Scene dur={90}>
    <Index n={4} total={5} />
    <Slash top={1010} delay={2} />
    <Type>
      <Sentence
        size={118}
        drift={18}
        step={6}
        tokens={[
          { t: "We collect.", w: 300, br: true },
          { t: "We deliver.", w: 800, e: "underline", accent: C.orange },
        ]}
      />
    </Type>
    <Subject file="shot-handoff.png" width={1200} delay={12} bottom={300} x={-60} />
    <Kick text="Door to door · tracked" />
  </Scene>
);

const T5: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 6, 14, EASE.out);
  const slash = prog(frame, 12, 14, EASE.wipe);
  const cta = prog(frame, 24, 12, EASE.out);

  return (
    <Scene dur={105}>
    <Index n={5} total={5} />
      <div
        style={{
          position: "absolute",
          left: "-30%",
          width: "170%",
          height: 88,
          top: "88%",
          background: C.green,
          transform: `rotate(-27deg) scaleX(${slash})`,
          transformOrigin: "left center",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(-90px)" }}>
        <div style={{ width: 860, textAlign: "center", position: "relative" }}>
          <LightSweep delay={26} />
          <Img
            src={staticFile("logo-mark.png")}
            style={{
              width: "100%",
              maxWidth: "none",
              display: "block",
              opacity: logo,
              filter: logo < 0.96 ? `blur(${at(logo, 18, 0)}px)` : "drop-shadow(0 22px 34px rgba(20,24,16,0.16))",
              transform: `scale(${at(logo, 1.07, 1)})`,
            }}
          />
          <div
            style={{
              marginTop: 48,
              display: "inline-block",
              fontFamily: TEXT,
              fontWeight: 800,
              fontSize: 44,
              color: C.white,
              background: C.green,
              borderRadius: 999,
              padding: "20px 44px",
              opacity: cta,
              transform: `scale(${at(cta, 1.1, 1)})`,
            }}
          >
            WhatsApp 76 999 965
          </div>
          <div
            style={{
              fontFamily: TEXT,
              fontWeight: 700,
              fontSize: 30,
              color: "#6E675D",
              marginTop: 26,
              opacity: cta,
            }}
          >
            www.sprintcouriers.co.bw
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const CTA_BEATS = [
  { at: 0, dur: 75, C: T1 },
  { at: 75, dur: 75, C: T2 },
  { at: 150, dur: 105, C: T3 },
  { at: 255, dur: 90, C: T4 },
  { at: 345, dur: 105, C: T5 },
];

export const CtaReel: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F3ED" }}>
      {CTA_BEATS.map(({ at: from, dur, C: Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}

      <Wipe cutFrame={150} color={C.green} dir="up-right" coverAt={6} clearIn={10} />
    </AbsoluteFill>
  );
};
