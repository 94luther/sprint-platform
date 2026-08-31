/**
 * "The Sprint Games — Twenty Years in Motion" — anniversary challenge films, v3.
 *
 * Each challenge is now a four-beat mini-story matching the approved storyboard:
 *   1 line-up (title + tableau)  2 action  3 drama / the Storm  4 payoff.
 * Same manifesto grammar throughout — kinetic type, blur-through scene handovers,
 * stick figures from figures.tsx acting everything out — plus a slow camera
 * push-in per beat, water-balloon sabotage, and a confetti payoff.
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
import { at, C, EASE, envelope, fontsReady, PAD, prog, SANS, SCRIPT } from "./brand";
import { Figure, StickBox } from "./figures";
import { GhostWord, Rings, Sentence, Tok, Word } from "./kinetic";

export const CHALLENGE_DURATION = 400;
export const INTRO_DURATION = 380;

// beat boundaries inside a 400-frame film
const B = [
  { at: 0, dur: 82 },
  { at: 82, dur: 102 },
  { at: 184, dur: 108 },
  { at: 292, dur: 108 },
];

const useFontsReady = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

/** Blur-through scene wrapper with a slow camera push-in. */
export const Beat: React.FC<{ children: React.ReactNode; dur: number; bg: string; push?: number }> = ({
  children,
  dur,
  bg,
  push = 0.05,
}) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0, 8, EASE.out);
  const outP = prog(frame, dur - 9, 9, EASE.in);
  const blur = at(1 - inP, 0, 22) + at(outP, 0, 26);
  const cam = 1 + push * prog(frame, 0, dur, (n) => n);

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
          transform: `scale(${at(1 - inP, 1, 1.05) + at(outP, 0, 0.06)})`,
          opacity: Math.min(1, inP * 1.4) * (1 - outP * 0.85),
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${cam})` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- shared chrome -----------------------------------------------------------

const Pill: React.FC<{ text: string; dark?: boolean; small?: boolean }> = ({ text, dark, small }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, 14, EASE.out);
  const color = dark ? C.white : C.ink;
  return (
    <div style={{ position: "absolute", top: small ? 76 : 96, left: PAD, opacity: p, transform: `translateY(${at(p, -18, 0)}px)` }}>
      <div
        style={{
          display: "inline-flex",
          padding: small ? "10px 20px" : "14px 26px",
          borderRadius: 999,
          border: `2px solid ${color}`,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: small ? 24 : 30,
          letterSpacing: "0.2em",
          color,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Footer: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 30, 14, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        top: 1790,
        left: PAD,
        right: PAD,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 28,
        color: dark ? "rgba(255,255,255,0.55)" : "rgba(17,17,17,0.45)",
        opacity: p,
      }}
    >
      2006–2026 · Twenty Years in Motion
    </div>
  );
};

/** The big beat caption — a panel word like "HEAVE!" */
const Caption: React.FC<{ tokens: Tok[]; dark?: boolean; size?: number; start?: number }> = ({
  tokens,
  dark,
  size = 84,
  start = 8,
}) => (
  // beats render inside Stage (top: 880) — pull the caption back up into the type zone
  <div style={{ position: "absolute", top: -670, left: 0, right: 0 }}>
    <Sentence size={size} color={dark ? C.white : C.ink} start={start} step={6} tokens={tokens} />
  </div>
);

const WinLine: React.FC<{ children: React.ReactNode; dark?: boolean; delay?: number }> = ({
  children,
  dark,
  delay = 40,
}) => (
  <div style={{ position: "absolute", top: 1600, left: PAD, right: PAD, textAlign: "center" }}>
    <Word size={52} weight={800} emphasis="fill" accent={C.orange} color={dark ? C.white : C.ink} fillTextColor={C.white} delay={delay}>
      {children}
    </Word>
  </div>
);

const RingPulse: React.FC<{ x: number; y: number; delay: number; color?: string; size?: number; double?: boolean }> = ({
  x,
  y,
  delay,
  color = C.orange,
  size = 70,
  double = false,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {(double ? [0, 10] : [0]).map((o, i) => {
        const p = prog(frame, delay + o, 26, EASE.out);
        return <circle key={i} cx={x} cy={y} r={at(p, 6, size)} fill="none" stroke={color} strokeWidth={6} opacity={1 - p} />;
      })}
    </>
  );
};

/** Confetti burst for payoff beats — deterministic, brand colors. */
const Confetti: React.FC<{ delay?: number; dark?: boolean }> = ({ delay = 14, dark }) => {
  const frame = useCurrentFrame();
  const cols = [C.green, C.orange, dark ? C.white : C.ink];
  return (
    <svg width={880} height={740} viewBox="0 0 880 740" style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: 26 }, (_, i) => {
        const x0 = 60 + ((i * 137) % 760);
        const drift = ((i * 53) % 90) - 45;
        const d = delay + (i % 7) * 2;
        const p = prog(frame, d, 70, (n) => n);
        if (p <= 0) return null;
        const y = at(p, -30, 700 + ((i * 31) % 90));
        const rot = p * (180 + ((i * 67) % 240)) * (i % 2 === 0 ? 1 : -1);
        return (
          <rect
            key={i}
            x={x0 + drift * p}
            y={y}
            width={i % 3 === 0 ? 20 : 13}
            height={i % 3 === 0 ? 13 : 22}
            rx={3}
            fill={cols[i % 3]}
            opacity={Math.min(1, (1 - p) * 3)}
            transform={`rotate(${rot} ${x0 + drift * p} ${y})`}
          />
        );
      })}
    </svg>
  );
};

/** A water balloon: arcs in, then bursts into rings and droplets. */
const Balloon: React.FC<{
  from: [number, number];
  to: [number, number];
  launch: number;
  dur?: number;
  color?: string;
}> = ({ from, to, launch, dur = 20, color = C.green }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, launch, dur, (n) => n);
  const burst = prog(frame, launch + dur, 18, EASE.out);

  if (p <= 0) return null;
  if (p < 1) {
    const x = at(p, from[0], to[0]);
    const y = at(p, from[1], to[1]) - Math.sin(p * Math.PI) * 190;
    return <ellipse cx={x} cy={y} rx={13} ry={16} fill={color} stroke={C.ink} strokeWidth={2} transform={`rotate(${p * 260} ${x} ${y})`} />;
  }
  if (burst >= 1) return null;
  return (
    <g>
      <circle cx={to[0]} cy={to[1]} r={at(burst, 8, 56)} fill="none" stroke={color} strokeWidth={5} opacity={1 - burst} />
      <circle cx={to[0]} cy={to[1]} r={at(burst, 4, 32)} fill="none" stroke={color} strokeWidth={4} opacity={0.7 * (1 - burst)} />
      {[[-26, -18], [22, -24], [-12, -34], [30, -8]].map(([dx, dy], i) => (
        <circle key={i} cx={to[0] + dx * (0.5 + burst)} cy={to[1] + dy * (0.5 + burst) + burst * burst * 40} r={5} fill={color} opacity={1 - burst} />
      ))}
    </g>
  );
};

/** Speed lines trailing a sprinting figure. */
const SpeedLines: React.FC<{ x: number; y: number; color?: string; flip?: boolean }> = ({ x, y, color = C.green, flip }) => {
  const frame = useCurrentFrame();
  const s = flip ? 1 : -1;
  return (
    <g stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.45 + 0.15 * Math.sin(frame / 3)}>
      <path d={`M${x + s * 44},${y - 34} q${s * 26},-4 ${s * 44},4`} />
      <path d={`M${x + s * 50},${y - 6} q${s * 30},0 ${s * 48},8`} />
      <path d={`M${x + s * 42},${y + 20} q${s * 24},4 ${s * 40},12`} />
    </g>
  );
};

/** The scene grid: caption zone on top, 880x740 stage centred below. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 880, left: PAD, right: PAD, height: 740, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 880, height: 740 }}>{children}</div>
  </div>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={880} height={740} viewBox="0 0 880 740" style={{ position: "absolute", left: 0, top: 0 }}>
    {children}
  </svg>
);

const Ground: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <line x1={30} y1={640} x2={850} y2={640} stroke={dark ? C.white : C.ink} strokeWidth={4} strokeDasharray="12 12" opacity={0.3} />
);

const Cone: React.FC<{ x: number; y?: number; delay?: number }> = ({ x, y = 640, delay = 10 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 12, EASE.out);
  return <polygon points={`${x},${y - 26} ${x - 14},${y} ${x + 14},${y}`} fill={C.orange} opacity={0.95 * p} />;
};

/** Per-challenge film assembly. */
type FilmConfig = {
  num: string;
  bg: string;
  dark?: boolean;
  titleTokens: Tok[];
  titleSize?: number;
  beats: [React.FC, React.FC, React.FC, React.FC];
  winText: string;
  winDelay?: number;
};

const Film: React.FC<FilmConfig> = ({ num, bg, dark, titleTokens, titleSize = 110, beats, winText, winDelay = 40 }) => {
  const [B1, B2, B3, B4] = beats;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <Sequence from={B[0].at} durationInFrames={B[0].dur}>
        <Beat dur={B[0].dur} bg={bg} push={0.04}>
          <Pill text={`THE SPRINT GAMES · CHALLENGE ${num}`} dark={dark} />
          <div style={{ position: "absolute", top: 200, left: PAD, right: PAD }}>
            <Sentence size={titleSize} color={dark ? C.white : C.ink} step={6} tokens={titleTokens} />
          </div>
          <Stage><B1 /></Stage>
        </Beat>
      </Sequence>
      <Sequence from={B[1].at} durationInFrames={B[1].dur}>
        <Beat dur={B[1].dur} bg={bg}>
          <Pill text={`CHALLENGE ${num}`} dark={dark} small />
          <Stage><B2 /></Stage>
        </Beat>
      </Sequence>
      <Sequence from={B[2].at} durationInFrames={B[2].dur}>
        <Beat dur={B[2].dur} bg={bg} push={0.07}>
          <Pill text={`CHALLENGE ${num}`} dark={dark} small />
          <Stage><B3 /></Stage>
        </Beat>
      </Sequence>
      <Sequence from={B[3].at} durationInFrames={B[3].dur}>
        <Beat dur={B[3].dur} bg={bg}>
          <Pill text={`CHALLENGE ${num}`} dark={dark} small />
          <Stage><B4 /><Confetti dark={dark} /></Stage>
          <WinLine dark={dark} delay={winDelay}>{winText}</WinLine>
          <Footer dark={dark} />
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};

// ═══════════════════ 1 · THE PARCEL RELAY ═══════════════════

const R1: React.FC = () => {
  const frame = useCurrentFrame();
  const go = prog(frame, 34, 12, EASE.overshoot);
  return (
    <>
      <Svg>
        <Ground />
        {[210, 390, 570].map((x, i) => <Cone key={i} x={x} delay={12 + i * 4} />)}
        <line x1={80} y1={640} x2={80} y2={540} stroke={C.green} strokeWidth={6} />
        <polygon points="80,540 130,552 80,564" fill={C.green} />
        {[140, 340, 540, 740].map((x, i) => (
          <Figure key={i} x={x} y={574} scale={0.95} pose="stand" phase={frame + i * 7} color={i === 0 ? C.green : C.ink} box={i === 0} boxColor={C.orange} />
        ))}
      </Svg>
      <div style={{ position: "absolute", left: 560, top: 60, fontFamily: SANS, fontWeight: 800, fontSize: 96, color: C.orange, opacity: go, transform: `scale(${at(go, 1.6, 1)}) rotate(-6deg)` }}>
        GO!
      </div>
    </>
  );
};

const R2: React.FC = () => {
  const frame = useCurrentFrame();
  const rx = at(prog(frame, 8, 70, EASE.out), 120, 700);
  return (
    <>
      <Caption tokens={[{ t: "Clean", w: 300 }, { t: "hands", w: 800, e: "fill", accent: C.orange }, { t: "win.", w: 300 }]} />
      <Svg>
        <Ground />
        {[260, 440, 620].map((x, i) => <Cone key={i} x={x} delay={4 + i * 3} />)}
        <SpeedLines x={rx - 60} y={560} />
        <Figure x={rx} y={574} scale={1.05} pose="run" phase={frame} color={C.green} box boxColor={C.orange} />
        <Figure x={790} y={574} scale={1.05} pose="stand" phase={frame} color={C.ink} />
        <RingPulse x={790} y={520} delay={76} />
      </Svg>
    </>
  );
};

const R3: React.FC = () => {
  const frame = useCurrentFrame();
  const rx = at(prog(frame, 8, 84, EASE.out), 140, 720);
  return (
    <>
      <Caption dark={false} size={76} tokens={[{ t: "Then", w: 300 }, { t: "comes", w: 300 }, { t: "the", w: 300, br: true }, { t: "Storm.", w: 800, e: "box", accent: C.orange }]} />
      <div style={{ position: "absolute", top: -400, left: 0, fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.ink, opacity: prog(frame, 30, 12, EASE.out) }}>
        Water balloons fly. A dropped parcel restarts the leg.
      </div>
      <Svg>
        <Ground />
        {[300, 520].map((x, i) => <Cone key={i} x={x} delay={4 + i * 3} />)}
        <SpeedLines x={rx - 60} y={560} />
        <Figure x={rx} y={574} scale={1.05} pose="run" phase={frame} color={C.green} box boxColor={C.orange} />
        <Balloon from={[900, 300]} to={[at(0.35, 140, 720), 620]} launch={18} color={C.green} />
        <Balloon from={[920, 240]} to={[at(0.6, 140, 720), 610]} launch={40} color={C.orange} />
        <Balloon from={[880, 320]} to={[at(0.85, 140, 720), 624]} launch={62} color={C.green} />
      </Svg>
    </>
  );
};

const R4: React.FC = () => {
  const frame = useCurrentFrame();
  const rx = at(prog(frame, 4, 30, EASE.out), 380, 640);
  const done = frame >= 34;
  return (
    <Svg>
      <Ground />
      <line x1={640} y1={640} x2={640} y2={430} stroke={C.ink} strokeWidth={5} />
      <line x1={820} y1={640} x2={820} y2={430} stroke={C.ink} strokeWidth={5} />
      {!done && <line x1={640} y1={480} x2={820} y2={480} stroke={C.orange} strokeWidth={7} />}
      {done && (
        <>
          <path d="M640,480 q-30,26 -18,60" stroke={C.orange} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M820,480 q30,26 18,60" stroke={C.orange} strokeWidth={7} fill="none" strokeLinecap="round" />
        </>
      )}
      <Figure x={rx} y={574} scale={1.05} pose={done ? "hold" : "run"} phase={frame} color={C.green} box boxColor={C.orange} />
      <Figure x={160} y={574} scale={0.95} pose="cheer" phase={frame} color={C.ink} />
      <Figure x={260} y={574} scale={0.95} pose="cheer" phase={frame + 5} color={C.ink} />
      <RingPulse x={700} y={480} delay={36} double size={100} />
    </Svg>
  );
};

export const SGC1Relay: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="01"
      bg={C.bone}
      titleTokens={[{ t: "The", w: 300 }, { t: "Parcel", w: 300 }, { t: "Relay.", w: 800, e: "fill", accent: C.orange }]}
      beats={[R1, R2, R3, R4]}
      winText="Fastest clean run wins."
    />
  );
};

// ═══════════════════ 2 · LOAD THE HILUX ═══════════════════

const HiluxPhoto: React.FC<{ delay?: number; x?: number; w?: number }> = ({ delay = 8, x = 60, w = 780 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 16, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 120,
        width: "max-content",
        filter: p < 0.97 ? `blur(${at(p, 18, 0)}px)` : undefined,
        opacity: p,
        transform: `scale(${at(p, 1.05, 1)})`,
      }}
    >
      <Img src={staticFile("shot-hilux.png")} style={{ width: w, maxWidth: "none", display: "block" }} />
    </div>
  );
};

const L1: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <HiluxPhoto />
      <Svg>
        {[[110, 690], [155, 690], [122, 650]].map(([x, y], i) => (
          <StickBox key={i} x={x} y={y} size={42} color={["#CB9A50", "#E0B378", "#3AAA35"][i]} />
        ))}
        <Figure x={250} y={624} scale={1} pose="stand" phase={frame} color={C.ink} />
      </Svg>
    </>
  );
};

const L2: React.FC = () => {
  const frame = useCurrentFrame();
  const r1 = at(prog(frame, 6, 55, EASE.out), 140, 560);
  const r2 = at(prog(frame, 26, 55, EASE.out), 90, 500);
  return (
    <>
      <Caption tokens={[{ t: "A", w: 300 }, { t: "human", w: 300 }, { t: "conveyor", w: 800, e: "underline", accent: C.orange, br: true }, { t: "belt.", w: 300 }]} size={76} />
      <HiluxPhoto delay={0} x={140} w={720} />
      <Svg>
        <SpeedLines x={r1 - 55} y={620} color={C.green} />
        <Figure x={r1} y={634} scale={1} pose="run" phase={frame} color={C.green} box boxColor="#CB9A50" />
        <Figure x={r2} y={654} scale={0.92} pose="run" phase={frame + 8} color={C.ink} box boxColor="#E0B378" />
      </Svg>
    </>
  );
};

const L3: React.FC = () => {
  const frame = useCurrentFrame();
  const stack = [0, 1, 2, 3, 4].map((i) => prog(frame, 10 + i * 12, 14, EASE.overshoot));
  return (
    <>
      <Caption tokens={[{ t: "Pack", w: 300 }, { t: "it", w: 300 }, { t: "like", w: 300 }, { t: "Tetris.", w: 800, e: "fill", accent: C.orange }]} size={80} />
      <HiluxPhoto delay={0} x={140} w={720} />
      <Svg>
        {stack.map((p, i) => (
          <g key={i} opacity={p} transform={`translate(0, ${at(p, -120, 0)})`}>
            <StickBox x={248 + (i % 3) * 46} y={320 - Math.floor(i / 3) * 44} size={42} color={["#CB9A50", "#E0B378", "#B9863F", "#3AAA35", "#F7941D"][i]} />
          </g>
        ))}
        <Balloon from={[-40, 200]} to={[300, 200]} launch={58} color={C.orange} />
      </Svg>
    </>
  );
};

const L4: React.FC = () => {
  const frame = useCurrentFrame();
  const check = prog(frame, 26, 12, EASE.overshoot);
  return (
    <>
      <HiluxPhoto delay={0} x={140} w={720} />
      <Svg>
        <line x1={300} y1={210} x2={620} y2={210} stroke={C.green} strokeWidth={5} strokeDasharray="10 8" opacity={prog(frame, 10, 10, EASE.out)} />
        <Figure x={160} y={624} scale={1} pose="stand" phase={frame} color={C.orange} />
        <g opacity={check}>
          <path d="M175,520 l18,18 l34,-40" stroke={C.green} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <Figure x={720} y={654} scale={0.95} pose="cheer" phase={frame} color={C.green} />
        <RingPulse x={430} y={300} delay={30} double size={120} color={C.orange} />
      </Svg>
    </>
  );
};

export const SGC2Load: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="02"
      bg={C.bone}
      titleTokens={[{ t: "Load", w: 300 }, { t: "the", w: 300 }, { t: "Hilux.", w: 800, e: "box", accent: C.orange }]}
      beats={[L1, L2, L3, L4]}
      winText="Fastest clean load wins."
    />
  );
};

// ═══════════════════ 3 · THE BLIND ROUTE ═══════════════════

const VoiceArcs: React.FC<{ x: number; y: number; flip?: boolean; color?: string }> = ({ x, y, flip, color = C.green }) => {
  const frame = useCurrentFrame();
  const s = flip ? -1 : 1;
  return (
    <g stroke={color} strokeWidth={5} fill="none" strokeLinecap="round">
      {[0, 1, 2].map((i) => {
        const p = prog((frame + i * 15) % 46, 0, 30, EASE.out);
        const r = at(p, 18, 86);
        return <path key={i} d={`M${x + s * r * 0.5},${y - r * 0.6} a${r},${r} 0 0 ${flip ? 0 : 1} 0,${r * 1.2}`} opacity={0.7 * (1 - p)} />;
      })}
    </g>
  );
};

const BL1: React.FC = () => {
  const frame = useCurrentFrame();
  const band = prog(frame, 24, 14, EASE.out);
  return (
    <Svg>
      <Ground dark />
      <Cone x={620} delay={12} /><Cone x={740} delay={16} />
      <Figure x={330} y={574} scale={1} pose="stand" phase={frame} color={C.white} />
      <rect x={306} y={488} width={48} height={11} rx={4} fill={C.orange} opacity={band} />
      <Figure x={420} y={574} scale={1} pose="stand" phase={frame + 4} color={C.green} flip />
      <StickBox x={375} y={560} size={34} color={C.orange} />
    </Svg>
  );
};

const BL2: React.FC = () => {
  const frame = useCurrentFrame();
  const wx = at(prog(frame, 8, 84, (n) => n), 200, 660);
  return (
    <>
      <Caption dark tokens={[{ t: "Voices", w: 800, e: "underline", accent: C.orange }, { t: "only.", w: 300 }]} />
      <Svg>
        <Ground dark />
        {[290, 430, 570, 710].map((x, i) => <Cone key={i} x={x} delay={4 + i * 3} />)}
        <Figure x={80} y={574} scale={0.95} pose="stand" phase={frame} color={C.green} />
        <VoiceArcs x={120} y={520} />
        <Figure x={wx} y={574} scale={1} pose="blindwalk" phase={frame * 0.6} color={C.white} box boxColor={C.orange} blindfold />
      </Svg>
    </>
  );
};

const BL3: React.FC = () => {
  const frame = useCurrentFrame();
  const lean = Math.sin(frame / 4) * prog(frame, 20, 30, (n) => n) * 5;
  return (
    <>
      <Caption dark size={72} tokens={[{ t: "One", w: 300 }, { t: "step", w: 300 }, { t: "from", w: 300, br: true }, { t: "disaster.", w: 800, e: "fill", accent: C.orange }]} />
      <Svg>
        <Ground dark />
        <Cone x={480} delay={2} />
        <g transform={`rotate(${lean} 430 574)`}>
          <Figure x={430} y={574} scale={1.05} pose="blindwalk" phase={frame * 0.5} color={C.white} box boxColor={C.orange} blindfold />
        </g>
        <text x={520} y={430} fontFamily={SANS} fontWeight={800} fontSize={90} fill={C.orange} opacity={envelope(frame, 108, 20, 20)}>!</text>
        <VoiceArcs x={800} y={520} flip />
        <Figure x={840} y={574} scale={0.95} pose="stand" phase={frame} color={C.green} flip />
      </Svg>
    </>
  );
};

const BL4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Ground dark />
      <rect x={330} y={620} width={220} height={18} rx={6} fill={C.green} />
      <Figure x={440} y={554} scale={1.05} pose="cheer" phase={frame} color={C.white} />
      <StickBox x={440} y={420} size={44} color={C.orange} />
      <path d="M480,450 l12,12 l24,-28" stroke={C.green} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={prog(frame, 24, 10, EASE.out)} />
      <RingPulse x={440} y={430} delay={20} double size={110} color={C.green} />
    </Svg>
  );
};

export const SGC3Blind: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="03"
      bg={C.ink}
      dark
      titleTokens={[{ t: "The", w: 300 }, { t: "Blind", w: 300 }, { t: "Route.", w: 800, e: "underline", accent: C.orange }]}
      beats={[BL1, BL2, BL3, BL4]}
      winText="Eggs intact. Clock stopped."
    />
  );
};

// ═══════════════════ 4 · SORT IT OUT ═══════════════════

const PLATES = [
  { name: "MAUN", y: 120 },
  { name: "KASANE", y: 250 },
  { name: "GHANZI", y: 380 },
  { name: "TSABONG", y: 510 },
];
const PLATE_X = 600;
const PLATE_W = 230;
const PLATE_H = 96;

const Plates: React.FC<{ filled: number[]; flash?: { i: number; at: number; color: string } }> = ({ filled, flash }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {PLATES.map((pl, i) => {
        const p = prog(frame, 4 + i * 4, 12, EASE.overshoot);
        const isF = filled.includes(i);
        const fl = flash && flash.i === i ? envelope(Math.max(0, frame - flash.at), 30, 4, 22) : 0;
        return (
          <g key={pl.name} transform={`translate(${PLATE_X}, ${pl.y}) scale(${p})`}>
            <rect width={PLATE_W} height={PLATE_H} rx={14} fill={C.white} stroke={isF ? C.green : C.ink} strokeWidth={isF ? 6 : 4} />
            {fl > 0 && <rect width={PLATE_W} height={PLATE_H} rx={14} fill="none" stroke={flash!.color} strokeWidth={8} opacity={fl} />}
            <text x={PLATE_W / 2} y={PLATE_H / 2 + 12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} fill={C.ink}>{pl.name}</text>
            {isF && <StickBox x={PLATE_W / 2} y={-24} size={44} color={C.green} />}
          </g>
        );
      })}
    </>
  );
};

const Wall: React.FC<{ remaining: number }> = ({ remaining }) => (
  <>
    {Array.from({ length: remaining }, (_, i) => (
      <StickBox key={i} x={90 + (i % 2) * 48} y={640 - Math.floor(i / 2) * 48} size={44} color={C.green} />
    ))}
    <line x1={40} y1={668} x2={230} y2={668} stroke={C.ink} strokeWidth={4} opacity={0.25} />
  </>
);

const S1B: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Wall remaining={6} />
      <Plates filled={[]} />
      <Figure x={330} y={624} scale={1} pose="stand" phase={frame} color={C.ink} />
    </Svg>
  );
};

const S2B: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 10, 40, EASE.out);
  const rx = at(p, 180, PLATE_X - 60);
  const ry = at(p, 620, PLATES[0].y + PLATE_H + 44);
  return (
    <>
      <Caption size={72} tokens={[{ t: "75+", w: 800, e: "fill", accent: C.orange }, { t: "towns", w: 300 }, { t: "in", w: 300, br: true }, { t: "your", w: 300 }, { t: "head.", w: 300 }]} />
      <Svg>
        <Wall remaining={4} />
        <Plates filled={frame > 54 ? [0] : []} flash={{ i: 0, at: 54, color: C.green }} />
        <SpeedLines x={rx - 50} y={ry - 50} color={C.green} flip={false} />
        <Figure x={rx} y={ry - 66} scale={0.95} pose={p < 1 ? "run" : "stand"} phase={frame} color={C.ink} box={frame < 54} boxColor={C.green} />
      </Svg>
    </>
  );
};

const S3B: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame >= 40 && frame < 52 ? Math.sin((frame - 40) * 3) * 8 : 0;
  const corr = prog(frame, 56, 26, EASE.out);
  const rx = at(corr, PLATE_X - 60, PLATE_X - 60);
  const ry = at(corr, PLATES[3].y + PLATE_H + 40, PLATES[2].y + PLATE_H + 40);
  return (
    <>
      <Caption size={78} tokens={[{ t: "Wrong", w: 800, e: "box", accent: C.orange }, { t: "town!", w: 300 }]} />
      <Svg>
        <Wall remaining={2} />
        <Plates filled={frame > 82 ? [0, 1, 2] : [0, 1]} flash={{ i: 2, at: 82, color: C.orange }} />
        {frame < 56 && (
          <g transform={`translate(${PLATE_X + PLATE_W / 2}, ${PLATES[3].y - 20})`}>
            <StickBox x={0} y={0} size={44} color={C.green} />
            <path d="M-24,-24 l48,48 M24,-24 l-48,48" stroke={C.orange} strokeWidth={7} strokeLinecap="round" opacity={prog(frame, 26, 8, EASE.out)} />
          </g>
        )}
        <g transform={`translate(${shake}, 0)`}>
          <Figure x={rx} y={ry - 66} scale={0.95} pose={corr > 0 && corr < 1 ? "run" : "stand"} phase={frame} color={C.ink} box={frame >= 56 && frame < 82} boxColor={C.green} />
        </g>
        <text x={PLATE_X - 130} y={330} fontFamily={SANS} fontWeight={800} fontSize={84} fill={C.orange} opacity={envelope(frame, 60, 14, 14)}>?</text>
      </Svg>
    </>
  );
};

const S4B: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Plates filled={[0, 1, 2, 3]} />
      <Figure x={300} y={624} scale={1.05} pose="cheer" phase={frame} color={C.green} />
      <RingPulse x={PLATE_X + PLATE_W / 2} y={330} delay={26} double size={130} color={C.green} />
    </Svg>
  );
};

export const SGC4Sort: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="04"
      bg={C.bone}
      titleTokens={[{ t: "Sort", w: 300 }, { t: "It", w: 300 }, { t: "Out.", w: 800, e: "fill", accent: C.orange }]}
      beats={[S1B, S2B, S3B, S4B]}
      winText="Every parcel home wins."
    />
  );
};

// ═══════════════════ 5 · THE ONE-HOUR SPRINT ═══════════════════

const ClockBoard: React.FC<{ time: string; x?: number; y?: number }> = ({ time, x = 310, y = 40 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 6, 12, EASE.out);
  return (
    <g transform={`translate(${x}, ${y}) scale(${p})`}>
      <rect width={260} height={92} rx={12} fill={C.ink} />
      <text x={130} y={64} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={C.orange}>{time}</text>
    </g>
  );
};

const FlagPost: React.FC<{ x: number; served?: boolean; delay?: number }> = ({ x, served, delay = 8 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 12, EASE.out);
  return (
    <g opacity={p}>
      <line x1={x} y1={640} x2={x} y2={500} stroke={C.white} strokeWidth={6} />
      <polygon points={`${x},500 ${x + 52},516 ${x},532`} fill={served ? C.orange : C.white} />
    </g>
  );
};

const H1: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Ground dark />
      <ClockBoard time="60:00" />
      {[130, 750].map((x, i) => <FlagPost key={i} x={x} delay={10 + i * 5} />)}
      <Figure x={330} y={574} scale={1} pose="stand" phase={frame} color={C.white} />
      {[420, 470, 520, 570, 620].map((x, i) => (
        <StickBox key={i} x={x} y={624} size={40} color={C.orange} />
      ))}
    </Svg>
  );
};

const H2: React.FC = () => {
  const frame = useCurrentFrame();
  const rx = at(prog(frame, 8, 70, EASE.out), 140, 700);
  return (
    <>
      <Caption dark size={72} tokens={[{ t: "Five", w: 300 }, { t: "stops.", w: 300 }, { t: "One", w: 300, br: true }, { t: "hour.", w: 800, e: "fill", accent: C.orange }]} />
      <Svg>
        <Ground dark />
        <ClockBoard time="42:10" />
        <FlagPost x={180} served delay={2} />
        <FlagPost x={760} delay={2} />
        <SpeedLines x={rx - 60} y={560} color={C.white} />
        <Figure x={rx} y={574} scale={1.05} pose="run" phase={frame} color={C.orange} box boxColor={C.white} />
      </Svg>
    </>
  );
};

const H3: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Caption dark size={72} tokens={[{ t: "And", w: 300 }, { t: "the", w: 300 }, { t: "Storm", w: 800, e: "box", accent: C.orange }, { t: "rages.", w: 300 }]} />
      <Svg>
        <Ground dark />
        <ClockBoard time="18:30" />
        <rect x={520} y={560} width={180} height={14} rx={4} fill={C.white} opacity={0.9} />
        <rect x={536} y={574} width={10} height={66} fill={C.white} opacity={0.9} />
        <rect x={674} y={574} width={10} height={66} fill={C.white} opacity={0.9} />
        <Figure x={470} y={574} scale={1} pose="stand" phase={frame} color={C.orange} box boxColor={C.white} />
        <Balloon from={[-40, 260]} to={[420, 600]} launch={16} color={C.white} />
        <Balloon from={[-60, 200]} to={[540, 520]} launch={38} color={C.white} />
        <Balloon from={[920, 240]} to={[560, 610]} launch={58} color={C.white} />
        <Figure x={120} y={574} scale={0.9} pose="stand" phase={frame} color={C.white} />
      </Svg>
    </>
  );
};

const H4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Ground dark />
      <ClockBoard time="00:58" />
      <Figure x={440} y={554} scale={1.1} pose="cheer" phase={frame} color={C.white} />
      <RingPulse x={440} y={470} delay={20} double size={130} color={C.orange} />
      <Figure x={180} y={584} scale={0.9} pose="cheer" phase={frame + 4} color={C.white} />
      <Figure x={700} y={584} scale={0.9} pose="cheer" phase={frame + 8} color={C.white} />
    </Svg>
  );
};

export const SGC5Hour: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="05"
      bg={C.green}
      dark
      titleTokens={[{ t: "The", w: 300 }, { t: "One-Hour", w: 800, e: "fill", accent: C.orange }, { t: "Sprint.", w: 400 }]}
      beats={[H1, H2, H3, H4]}
      winText="Beat the clock. Take the title."
    />
  );
};

// ═══════════════════ 6 · TUG OF FREIGHT ═══════════════════

const Rope: React.FC<{ shift: number; children?: React.ReactNode }> = ({ shift, children }) => (
  <g transform={`translate(${shift}, 0)`}>
    <rect x={140} y={514} width={600} height={12} rx={6} fill={C.ink} />
    <g transform="translate(440, 520)">
      <StickBox x={0} y={-24} size={46} color={C.green} />
    </g>
    {children}
  </g>
);

const T1: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Ground />
      <line x1={270} y1={360} x2={270} y2={640} stroke={C.ink} strokeWidth={3} strokeDasharray="10 9" opacity={0.4} />
      <Rope shift={0} />
      {[220, 300].map((x, i) => <Figure key={i} x={x} y={574} scale={1} pose="stand" phase={frame + i * 5} color={C.green} />)}
      {[580, 660].map((x, i) => <Figure key={`r${i}`} x={x} y={574} scale={1} pose="stand" phase={frame + i * 5 + 2} color={C.orange} flip />)}
      <Figure x={440} y={420} scale={0.9} pose="stand" phase={frame} color={C.ink} />
      <path d={`M452,368 l26,-30`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
};

const T2: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = at(prog(frame, 10, 50, EASE.out), 0, 70);
  return (
    <>
      <Caption size={90} tokens={[{ t: "Heave!", w: 800, e: "fill", accent: C.orange }]} />
      <Svg>
        <Ground />
        <line x1={270} y1={360} x2={270} y2={640} stroke={C.ink} strokeWidth={3} strokeDasharray="10 9" opacity={0.4} />
        <g transform={`translate(${shift}, 0)`}>
          <rect x={140} y={514} width={600} height={12} rx={6} fill={C.ink} />
          <StickBox x={440} y={496} size={46} color={C.green} />
          {[200, 280].map((x, i) => <Figure key={i} x={x - 76} y={551} scale={1.05} pose="pull" phase={frame + i * 5} color={C.green} />)}
          {[600, 680].map((x, i) => <Figure key={`r${i}`} x={x + 76} y={551} scale={1.05} pose="pull" phase={frame + i * 5 + 3} color={C.orange} flip />)}
        </g>
      </Svg>
    </>
  );
};

const T3: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = at(prog(frame, 8, 60, EASE.out), 70, -190);
  const crossed = shift <= -150;
  return (
    <>
      <Caption size={72} tokens={[{ t: "Across", w: 300 }, { t: "the", w: 300 }, { t: "line!", w: 800, e: "underline", accent: C.orange }]} />
      <Svg>
        <Ground />
        <line x1={270} y1={360} x2={270} y2={640} stroke={crossed ? C.green : C.ink} strokeWidth={crossed ? 5 : 3} strokeDasharray="10 9" opacity={crossed ? 0.9 : 0.4} />
        <g transform={`translate(${shift}, 0)`}>
          <rect x={140} y={514} width={600} height={12} rx={6} fill={C.ink} />
          <StickBox x={440} y={496} size={46} color={C.green} />
          {[200, 280].map((x, i) => <Figure key={i} x={x - 76} y={551} scale={1.05} pose="pull" phase={frame + i * 5} color={C.green} />)}
          {[600, 680].map((x, i) => <Figure key={`r${i}`} x={x + 76} y={551} scale={1.05} pose="pull" phase={frame + i * 5 + 3} color={C.orange} flip />)}
        </g>
        <RingPulse x={270} y={520} delay={62} size={100} color={C.green} />
      </Svg>
    </>
  );
};

const T4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Svg>
      <Ground />
      <Figure x={220} y={574} scale={1.05} pose="cheer" phase={frame} color={C.green} />
      <Figure x={320} y={574} scale={1.05} pose="cheer" phase={frame + 5} color={C.green} />
      <StickBox x={270} y={400} size={46} color={C.green} />
      <Figure x={520} y={574} scale={0.95} pose="stand" phase={frame} color={C.ink} />
      <path d="M532,506 l34,-28" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <Figure x={680} y={574} scale={0.95} pose="stand" phase={frame + 3} color={C.orange} flip />
      <RingPulse x={270} y={410} delay={24} double size={110} color={C.green} />
    </Svg>
  );
};

export const SGC6Tug: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="06"
      bg={C.bone}
      titleTokens={[{ t: "Tug", w: 300 }, { t: "of", w: 300 }, { t: "Freight.", w: 800, e: "box", accent: C.orange }]}
      beats={[T1, T2, T3, T4]}
      winText="Best of three takes it."
    />
  );
};

// ═══════════════════ 7 · THE LONG HOLD ═══════════════════

const POLES = [200, 440, 680];
const POLE_TOP = 400;
const WATER_Y = 590;

const Water: React.FC = () => {
  const frame = useCurrentFrame();
  const wave = (y: number, amp: number, speed: number) =>
    Array.from({ length: 23 }, (_, i) => `${i * 40},${y + Math.sin((i * 40) / 70 + frame * speed) * amp}`).join(" ");
  return (
    <>
      <path d={`M0,${WATER_Y + 8} L${wave(WATER_Y + 8, 7, 0.09).split(" ").join(" L")} L880,740 L0,740 Z`} fill={C.green} opacity={0.16} />
      <polyline points={wave(WATER_Y, 7, 0.09)} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" opacity={0.35} />
      <polyline points={wave(WATER_Y + 26, 9, 0.07)} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" opacity={0.55} />
      <polyline points={wave(WATER_Y + 52, 11, 0.055)} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
    </>
  );
};

const Pole: React.FC<{ x: number; delay?: number }> = ({ x, delay = 6 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.out);
  return (
    <g opacity={p}>
      <rect x={x - 8} y={at(p, WATER_Y, POLE_TOP)} width={16} height={at(p, 0, WATER_Y - POLE_TOP)} fill={C.ink} />
      <ellipse cx={x} cy={at(p, WATER_Y, POLE_TOP)} rx={44} ry={10} fill={C.ink} />
    </g>
  );
};

const Splash: React.FC<{ x: number; delay: number }> = ({ x, delay }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 24, EASE.out);
  if (p <= 0 || p >= 1) return null;
  return (
    <g>
      <ellipse cx={x} cy={WATER_Y + 6} rx={at(p, 10, 90)} ry={at(p, 3, 20)} fill="none" stroke={C.green} strokeWidth={5} opacity={1 - p} />
      {[-30, -12, 14, 32].map((dx, i) => (
        <circle key={i} cx={x + dx * (0.6 + p)} cy={WATER_Y - 40 * Math.sin(p * Math.PI) + i * 4} r={5} fill={C.green} opacity={1 - p} />
      ))}
    </g>
  );
};

const HD1: React.FC = () => {
  const frame = useCurrentFrame();
  const climb = prog(frame, 18, 40, EASE.out);
  return (
    <Svg>
      {POLES.map((x, i) => <Pole key={i} x={x} delay={4 + i * 4} />)}
      {POLES.map((x, i) => {
        const cp = prog(frame, 20 + i * 8, 36, EASE.out);
        return <Figure key={i} x={x + 4} y={at(cp, WATER_Y - 80, POLE_TOP - 66)} scale={0.95} pose={cp < 1 ? "climb" : "stand"} phase={frame} color={C.ink} />;
      })}
      <Water />
    </Svg>
  );
};

const HD2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Caption size={76} tokens={[{ t: "Arms", w: 300 }, { t: "burning.", w: 800, e: "fill", accent: C.orange }]} />
      <Svg>
        {POLES.map((x, i) => <Pole key={i} x={x} delay={0} />)}
        {POLES.map((x, i) => (
          <g key={i} transform={`rotate(${Math.sin(frame / 8 + i * 2) * 2} ${x} ${POLE_TOP})`}>
            <Figure x={x} y={POLE_TOP - 66} scale={0.95} pose="hold" phase={frame + i * 6} color={C.ink} box boxColor={i === 0 ? C.green : C.orange} />
          </g>
        ))}
        <Water />
      </Svg>
    </>
  );
};

const HD3: React.FC = () => {
  const frame = useCurrentFrame();
  const fall1 = prog(frame, 44, 14, EASE.in);
  const fall2 = prog(frame, 86, 14, EASE.in);
  return (
    <>
      <Caption size={72} tokens={[{ t: "Here", w: 300 }, { t: "comes", w: 300 }, { t: "the", w: 300, br: true }, { t: "Storm.", w: 800, e: "box", accent: C.orange }]} />
      <Svg>
        {POLES.map((x, i) => <Pole key={i} x={x} delay={0} />)}
        {/* champion holds through everything */}
        <g transform={`rotate(${Math.sin(frame / 6) * 3} ${POLES[0]} ${POLE_TOP})`}>
          <Figure x={POLES[0]} y={POLE_TOP - 66} scale={0.95} pose="hold" phase={frame} color={C.ink} box boxColor={C.green} />
        </g>
        {/* middle takes a balloon and drops */}
        {fall1 < 1 ? (
          <g transform={`translate(${fall1 * 26}, ${at(fall1, 0, WATER_Y - POLE_TOP + 40)}) rotate(${fall1 * 70} ${POLES[1]} ${POLE_TOP})`}>
            <Figure x={POLES[1]} y={POLE_TOP - 66} scale={0.95} pose="hold" phase={frame} color={C.ink} box={fall1 === 0} boxColor={C.orange} />
          </g>
        ) : null}
        <Balloon from={[-40, 200]} to={[POLES[1] - 6, POLE_TOP - 110]} launch={22} color={C.orange} />
        <Splash x={POLES[1] + 30} delay={60} />
        {/* right wobbles hard, then goes */}
        {fall2 < 1 ? (
          <g transform={`translate(${fall2 * 26}, ${at(fall2, 0, WATER_Y - POLE_TOP + 40)}) rotate(${Math.sin(frame / 3.5) * prog(frame, 40, 40, (n) => n) * 7 + fall2 * 70} ${POLES[2]} ${POLE_TOP})`}>
            <Figure x={POLES[2]} y={POLE_TOP - 66} scale={0.95} pose="hold" phase={frame} color={C.ink} box={fall2 === 0} boxColor={C.orange} />
          </g>
        ) : null}
        <Balloon from={[920, 180]} to={[POLES[2] + 10, POLE_TOP - 90]} launch={64} color={C.green} />
        <Splash x={POLES[2] + 30} delay={102} />
        <Water />
      </Svg>
    </>
  );
};

const HD4: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = prog(frame, 20, 12, EASE.overshoot);
  return (
    <Svg>
      {POLES.map((x, i) => <Pole key={i} x={x} delay={0} />)}
      <Figure x={POLES[0]} y={POLE_TOP - 66 - at(lift, 0, 14)} scale={1} pose="hold" phase={frame} color={C.ink} box boxColor={C.green} />
      <RingPulse x={POLES[0]} y={POLE_TOP - 200} delay={26} double size={120} color={C.orange} />
      <circle cx={POLES[1] + 20} cy={WATER_Y + 14} r={9} fill={C.ink} />
      <circle cx={POLES[2] + 20} cy={WATER_Y + 14} r={9} fill={C.ink} />
      <Water />
    </Svg>
  );
};

export const SGC7Hold: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="07"
      bg={C.bone}
      titleTokens={[{ t: "The", w: 300 }, { t: "Long", w: 300 }, { t: "Hold.", w: 800, e: "fill", accent: C.orange }]}
      beats={[HD1, HD2, HD3, HD4]}
      winText="Last one holding wins."
    />
  );
};

// ═══════════════════ 8 · THE CHEETAH PUZZLE ═══════════════════

/** Board geometry: the REAL logo (public/logo-mark.png, 523x158) painted on
 * plywood, 720 wide in a 3x2 piece grid. Never the code-traced cheetah — the
 * user rejected it; the genuine mark is the only acceptable art. */
const PZ_W = 720;
const PZ_H = 218;
const PZ_LEFT = 80;
const PZ_TOP = 250;
const PIECE_TANS = ["#E0B378", "#D9A967", "#E6BC85", "#D4A25C", "#E0B378", "#DDB170"];

const LogoArt: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, opacity }}>
    <Img src={staticFile("logo-mark.png")} style={{ width: PZ_W, maxWidth: "none", display: "block" }} />
  </div>
);

/** One clipped piece of the painted cheetah, flying from `from` to its slot. */
const PuzzlePiece: React.FC<{
  col: number;
  row: number;
  from: [number, number, number];
  p: number;
}> = ({ col, row, from, p }) => {
  if (p <= 0) return null;
  const x = at(p, from[0], 0);
  const y = at(p, from[1], 0);
  const r = at(p, from[2], 0);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: PZ_W,
        height: PZ_H,
        clipPath: `inset(${row * 50}% ${(2 - col) * 33.34}% ${(1 - row) * 50}% ${col * 33.34}%)`,
        transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
        transformOrigin: `${(col + 0.5) * 33.33}% ${(row + 0.5) * 50}%`,
        background: PIECE_TANS[row * 3 + col],
      }}
    >
      <LogoArt />
    </div>
  );
};

const PuzzleFrame: React.FC<{ delay?: number; ghost?: boolean }> = ({ delay = 6, ghost }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: PZ_LEFT - 14,
        top: PZ_TOP - 14,
        width: PZ_W + 28,
        height: PZ_H + 28,
        border: `10px solid ${C.ink}`,
        borderRadius: 10,
        opacity: p,
        transform: `scale(${at(p, 0.94, 1)})`,
      }}
    >
      {ghost && (
        <div style={{ position: "absolute", left: 14, top: 14 }}>
          <LogoArt opacity={0.1} />
        </div>
      )}
    </div>
  );
};

/** Scattered wooden pieces waiting on the ground. */
const ScatterPiece: React.FC<{ x: number; y: number; rot: number; i: number; delay?: number }> = ({
  x,
  y,
  rot,
  i,
  delay = 12,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay + i * 3, 10, EASE.out);
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`} opacity={p}>
      <rect x={-52} y={-34} width={104} height={68} rx={6} fill={PIECE_TANS[i % 6]} stroke={C.ink} strokeWidth={3} />
      <path d={`M${-30 + (i % 3) * 16},-6 q26,${i % 2 === 0 ? -18 : 14} 56,0`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
  );
};

const P1B: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <PuzzleFrame ghost />
      <Svg>
        <ScatterPiece x={150} y={620} rot={-14} i={0} />
        <ScatterPiece x={300} y={660} rot={22} i={1} />
        <ScatterPiece x={450} y={615} rot={-6} i={2} />
        <ScatterPiece x={600} y={665} rot={12} i={3} />
        <Figure x={730} y={574} scale={0.95} pose="stand" phase={frame} color={C.ink} />
        <Figure x={800} y={574} scale={0.95} pose="stand" phase={frame + 6} color={C.green} />
      </Svg>
    </>
  );
};

const P2B: React.FC = () => {
  const frame = useCurrentFrame();
  const flights: [number, number, number][] = [
    [-300, 380, -30],
    [200, 420, 40],
    [-150, 460, -60],
  ];
  const rx = at(prog(frame, 12, 60, EASE.out), 130, 690);
  return (
    <>
      <Caption size={76} tokens={[{ t: "Piece", w: 300 }, { t: "by", w: 300 }, { t: "piece.", w: 800, e: "fill", accent: C.orange }]} />
      <PuzzleFrame delay={0} ghost />
      <div style={{ position: "absolute", left: PZ_LEFT, top: PZ_TOP, width: PZ_W, height: PZ_H }}>
        <PuzzlePiece col={0} row={0} from={flights[0]} p={prog(frame, 14, 22, EASE.out)} />
        <PuzzlePiece col={0} row={1} from={flights[1]} p={prog(frame, 40, 22, EASE.out)} />
        <PuzzlePiece col={1} row={1} from={flights[2]} p={prog(frame, 66, 22, EASE.out)} />
      </div>
      <Svg>
        <SpeedLines x={rx - 55} y={600} color={C.green} />
        <Figure x={rx} y={614} scale={0.95} pose="run" phase={frame} color={C.green} box boxColor="#E0B378" />
      </Svg>
    </>
  );
};

const P3B: React.FC = () => {
  const frame = useCurrentFrame();
  // the middle-top piece arrives upside down, shakes, then flips home
  const arriveP = prog(frame, 10, 20, EASE.out);
  const flip = prog(frame, 62, 18, EASE.overshoot);
  const shake = frame >= 40 && frame < 56 ? Math.sin((frame - 40) * 2.6) * 6 : 0;
  const wrongRot = at(flip, 180, 0);
  const wrongY = at(flip, -46, 0);
  return (
    <>
      <Caption size={72} tokens={[{ t: "The", w: 300 }, { t: "last", w: 300 }, { t: "piece", w: 300, br: true }, { t: "lies.", w: 800, e: "box", accent: C.orange }]} />
      <PuzzleFrame delay={0} />
      <div style={{ position: "absolute", left: PZ_LEFT, top: PZ_TOP, width: PZ_W, height: PZ_H }}>
        <PuzzlePiece col={0} row={0} from={[0, 0, 0]} p={1} />
        <PuzzlePiece col={0} row={1} from={[0, 0, 0]} p={1} />
        <PuzzlePiece col={1} row={1} from={[0, 0, 0]} p={1} />
        <PuzzlePiece col={2} row={0} from={[0, 0, 0]} p={1} />
        <PuzzlePiece col={2} row={1} from={[0, 0, 0]} p={1} />
        {/* the liar: top-middle, flies in upside down, hovers, shakes, then flips home */}
        {arriveP > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PZ_W,
              height: PZ_H,
              clipPath: `inset(0% 33.34% 50% 33.34%)`,
              transform: `translate(${at(arriveP, -260, 0) + shake}px, ${at(arriveP, -220, 0) + wrongY}px) rotate(${at(arriveP, 140, 0) + wrongRot}deg)`,
              transformOrigin: "50% 25%",
              background: PIECE_TANS[1],
            }}
          >
            <LogoArt />
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: PZ_LEFT + PZ_W / 2 - 20,
          top: PZ_TOP - 110,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 84,
          color: C.orange,
          opacity: envelope(Math.max(0, frame - 34), 34, 8, 10),
        }}
      >
        ?
      </div>
      <Svg>
        <Balloon from={[920, 300]} to={[700, 620]} launch={70} color={C.green} />
        <Figure x={790} y={614} scale={0.95} pose="stand" phase={frame} color={C.green} />
      </Svg>
    </>
  );
};

const BoardFace: React.FC<{ back?: boolean }> = ({ back }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#E0B378",
      border: `10px solid ${C.ink}`,
      borderRadius: 10,
      overflow: "hidden",
      backfaceVisibility: "hidden",
      transform: back ? "rotateY(180deg)" : undefined,
    }}
  >
    {back ? (
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: "-2%",
            top: "40%",
            width: "104%",
            height: 46,
            background: C.green,
            transform: "skewX(-26deg)",
          }}
        />
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.ink, lineHeight: 1 }}>2006–2026</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: C.ink, marginTop: 10 }}>
            TWENTY YEARS IN MOTION
          </div>
        </div>
      </div>
    ) : (
      <div style={{ position: "absolute", left: 14, top: 14 }}>
        <LogoArt />
      </div>
    )}
  </div>
);

const P4B: React.FC = () => {
  const frame = useCurrentFrame();
  const flip = prog(frame, 30, 30, EASE.wipe);
  return (
    <>
      <Caption size={70} tokens={[{ t: "Right", w: 300 }, { t: "on", w: 300 }, { t: "both", w: 800, e: "underline", accent: C.orange }, { t: "sides.", w: 300 }]} start={2} />
      {/* the finished double-sided board swings around on its A-frame */}
      <div style={{ position: "absolute", left: PZ_LEFT - 14, top: PZ_TOP - 14, width: PZ_W + 28, height: PZ_H + 28, perspective: 1700 }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
          <BoardFace />
          <BoardFace back />
        </div>
      </div>
      <Svg>
        <Figure x={160} y={634} scale={1} pose="cheer" phase={frame} color={C.green} />
        <Figure x={760} y={634} scale={1} pose="cheer" phase={frame + 5} color={C.ink} />
        <RingPulse x={440} y={360} delay={66} double size={140} color={C.orange} />
      </Svg>
    </>
  );
};

export const SGC8Puzzle: React.FC = () => {
  useFontsReady();
  return (
    <Film
      num="08"
      bg={C.bone}
      titleTokens={[{ t: "The", w: 300 }, { t: "Cheetah", w: 300 }, { t: "Puzzle.", w: 800, e: "fill", accent: C.orange }]}
      beats={[P1B, P2B, P3B, P4B]}
      winText="First cheetah wins."
      winDelay={72}
    />
  );
};

// ═══════════════════ intro (unchanged lockup) ═══════════════════

const IntroA: React.FC = () => (
  <Beat dur={170} bg={C.ink} push={0.03}>
    <GhostWord x={-30} y={140} size={190} delay={6} color={C.white}>2006</GhostWord>
    <GhostWord x={600} y={1620} size={190} delay={14} color={C.white}>2026</GhostWord>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Sentence
        align="center"
        size={120}
        color={C.white}
        step={6}
        tokens={[
          { t: "Twenty", w: 300 },
          { t: "years.", w: 300, br: true },
          { t: "One", w: 300 },
          { t: "race.", w: 800, e: "fill", accent: C.orange, c: C.white },
        ]}
      />
    </AbsoluteFill>
  </Beat>
);

const IntroB: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 4, 16, EASE.out);
  const rule = prog(frame, 46, 8, EASE.out);
  const scriptP = prog(frame, 30, 12, EASE.out);

  return (
    <Beat dur={210} bg={C.bone} push={0.03}>
      <Rings x={920} y={1720} color={C.green} count={5} gap={130} delay={4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 880 }}>
          <div
            style={{
              width: "max-content",
              margin: "0 auto",
              filter: logo < 0.97 ? `blur(${at(logo, 22, 0)}px)` : undefined,
              transform: `scale(${at(logo, 1.08, 1)})`,
              opacity: logo,
            }}
          >
            <Img src={staticFile("logo-mark.png")} style={{ width: 860, maxWidth: "none", display: "block" }} />
          </div>
          <div style={{ display: "grid", gap: 18, justifyItems: "center", marginTop: 44 }}>
            <Word delay={18} weight={800} size={86} color={C.orange}>The Sprint Games</Word>
            <div style={{ fontFamily: SCRIPT, fontWeight: 700, fontSize: 72, color: C.ink, opacity: scriptP, transform: `translateY(${at(scriptP, 22, 0)}px)` }}>
              Twenty Years in Motion
            </div>
            <div style={{ height: 6, width: 620, background: C.orange, transform: `scaleX(${rule})`, marginTop: 6 }} />
            <div style={{ display: "flex", gap: 20, alignItems: "center", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: 600, fontSize: 34, opacity: prog(frame, 54, 10, EASE.out) }}>
              <span style={{ color: C.ink }}>Gaborone · September 2026</span>
              <span style={{ width: 11, height: 11, background: C.orange, borderRadius: 99 }} />
              <span style={{ color: C.green }}>WhatsApp 76 999 965</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Beat>
  );
};

export const SGIntro: React.FC = () => {
  useFontsReady();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence from={0} durationInFrames={170}><IntroA /></Sequence>
      <Sequence from={170} durationInFrames={210}><IntroB /></Sequence>
    </AbsoluteFill>
  );
};
