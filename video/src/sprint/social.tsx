/**
 * Sprint Couriers — static social graphics, rendered as single-frame stills.
 *
 * Two canvases:
 *   SocialFeed   1080x1350 (4:5, Instagram/Facebook feed)
 *   SocialStory  1080x1920 (9:16, stories / WhatsApp status)
 *
 * Everything is driven by input props so one composition serves the whole
 * content calendar:
 *   npx remotion still SocialFeed out/post.png --props='{"variant":"poster",...}'
 *
 * The design language is the approved reel/frame-board system: bone ground,
 * soft green diagonal slash, mixed-case Poppins (300 lead / 800 emphasis),
 * one orange or green emphasis device per graphic, real cut-out subject.
 * These are STATIC components — no animation, safe to render at frame 0.
 */

import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { C, SANS, TEXT } from "./brand";
import { Grain } from "./layers";

const PAD = 84;
const BONE = "#F5F3ED";

// --- props ------------------------------------------------------------------

export const socialSchema = z.object({
  /** Layout recipe. v2 adds hero (full-colour ground), anniv20, annivseal. */
  variant: z.enum(["poster", "stat", "list", "endcard", "hero", "anniv20", "annivseal"]).default("poster"),
  /** Ground for hero/anniv variants: green | ink | bone. */
  ground: z.enum(["bone", "green", "ink"]).default("bone"),
  /** Small eyebrow line above the headline (e.g. "2006–2026 · TWENTY YEARS"). */
  eyebrow: z.string().optional(),
  /** Badge chips row under the headline, e.g. ["UNDER 1 HOUR","TRACKED"]. */
  chips: z.array(z.string()).default([]),
  /** Dark footer contact strip. */
  footer: z.boolean().default(false),
  /** Sub-line under the headline (hero/anniv variants). */
  subline: z.string().optional(),
  /** Headline tokens. `e` marks the emphasis word: fill | box | underline. */
  tokens: z
    .array(
      z.object({
        t: z.string(),
        w: z.number().optional(),
        e: z.enum(["none", "fill", "box", "underline"]).optional(),
        br: z.boolean().optional(),
      }),
    )
    .default([
      { t: "Botswana", w: 300 },
      { t: "doesn't", w: 300, br: true },
      { t: "wait.", w: 800, e: "fill" },
    ]),
  /** Big number for the "stat" variant (rendered above the headline). */
  stat: z.string().optional(),
  /** Cut-out from public/, e.g. "shot-hilux.png". Empty string = none. */
  subject: z.string().default("shot-hilux.png"),
  /** Sized by width or height depending on the asset's own framing. */
  subjectWidth: z.number().optional(),
  subjectHeight: z.number().optional(),
  /** Horizontal offset of the subject from centre, px. */
  subjectX: z.number().default(0),
  subjectBottom: z.number().default(0),
  /** Caption locked to the bottom edge. */
  kicker: z.string().default("Sprint Couriers · Botswana"),
  /** Emphasis accent. */
  accent: z.string().default(C.orange),
  /** Headline size. */
  size: z.number().default(112),
  /** Vertical position of the type block. */
  typeTop: z.number().default(150),
  /** Show the small logo top-right. */
  mark: z.boolean().default(true),
});

export type SocialProps = z.infer<typeof socialSchema>;

// --- static type ------------------------------------------------------------

type Tok = SocialProps["tokens"][number];

const StaticWord: React.FC<{ tok: Tok; size: number; accent: string; ink?: string }> = ({
  tok,
  size,
  accent,
  ink = C.ink,
}) => {
  const e = tok.e ?? "none";
  const filled = e === "fill";
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: SANS,
        fontWeight: tok.w ?? 400,
        fontSize: size,
        lineHeight: 1.14,
        color: filled ? C.white : ink,
        padding: e === "none" ? 0 : "0 0.16em",
        margin: e === "none" ? 0 : "0 -0.04em",
        whiteSpace: "pre",
      }}
    >
      {e === "fill" && (
        <span style={{ position: "absolute", inset: "0.06em 0 0.02em 0", background: accent, zIndex: -1 }} />
      )}
      {e === "box" && (
        <>
          <span
            style={{
              position: "absolute",
              inset: "0.04em 0 0.02em 0",
              border: `3px solid ${accent}`,
              opacity: 0.55,
              transform: "translate(3px, -2px)",
              zIndex: -1,
            }}
          />
          <span style={{ position: "absolute", inset: "0.04em 0 0.02em 0", border: `3px solid ${C.ink}`, zIndex: -1 }} />
        </>
      )}
      {e === "underline" && (
        <span
          style={{
            position: "absolute",
            left: "0.1em",
            right: "0.1em",
            bottom: "0.08em",
            height: 10,
            borderRadius: 6,
            background: accent,
            zIndex: -1,
          }}
        />
      )}
      {tok.t}
    </span>
  );
};

const Headline: React.FC<{
  tokens: Tok[];
  size: number;
  accent: string;
  inkOverride?: string;
  center?: boolean;
}> = ({ tokens, size, accent, inkOverride, center = false }) => {
  const lines: Tok[][] = [[]];
  tokens.forEach((tok) => {
    if (tok.br) lines.push([]);
    lines[lines.length - 1].push(tok);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: size * 0.1, alignItems: center ? "center" : "flex-start" }}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: `0 ${size * 0.22}px`,
            justifyContent: center ? "center" : "flex-start",
          }}
        >
          {line.map((tok, ti) => (
            <StaticWord key={ti} tok={tok} size={size} accent={accent} ink={inkOverride} />
          ))}
        </div>
      ))}
    </div>
  );
};

// --- furniture --------------------------------------------------------------

const Slash: React.FC<{ top: number; solid?: boolean }> = ({ top, solid = false }) => (
  <div
    style={{
      position: "absolute",
      left: "-30%",
      width: "170%",
      height: solid ? 88 : 280,
      top,
      background: C.green,
      opacity: solid ? 1 : 0.14,
      transform: "rotate(-27deg)",
    }}
  />
);

const Mark: React.FC = () => (
  <Img
    src={staticFile("logo-mark.png")}
    style={{ position: "absolute", top: 64, right: PAD, width: 230, maxWidth: "none" }}
  />
);

const Kicker: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: PAD,
      bottom: 52,
      fontFamily: TEXT,
      fontWeight: 700,
      fontSize: 27,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#6E675D",
      zIndex: 3,
    }}
  >
    {text}
  </div>
);

const Subject: React.FC<{ p: SocialProps }> = ({ p }) =>
  p.subject ? (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: p.subjectBottom,
        width: "max-content",
        transform: `translateX(calc(-50% + ${p.subjectX}px))`,
      }}
    >
      <Img
        src={staticFile(p.subject)}
        style={{
          width: p.subjectWidth ?? "auto",
          height: p.subjectHeight ?? "auto",
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  ) : null;

// --- v2 furniture -----------------------------------------------------------

/** Ground palette per option. */
const GROUNDS = {
  bone: { bg: BONE, ink: C.ink, soft: "#6E675D", line: C.green },
  green: { bg: C.green, ink: C.white, soft: "rgba(255,255,255,0.75)", line: "#2A7D27" },
  ink: { bg: "#101210", ink: C.white, soft: "rgba(255,255,255,0.62)", line: C.green },
} as const;

/** Low-opacity route linework: skyline, dashed routes, pins. Ref: TimeFly/Pathao grounds. */
const RouteLines: React.FC<{ color: string; h: number; opacity?: number }> = ({ color, h, opacity = 0.35 }) => (
  <svg width={1080} height={h} viewBox={`0 0 1080 ${h}`} style={{ position: "absolute", inset: 0, opacity }}>
    {/* skyline along the lower third */}
    <path
      d={`M0 ${h - 330} h90 v-70 h60 v70 h50 v-130 h70 v130 h40 v-50 h80 v50 h60 v-100 h90 v100 h50 v-60 h70 v60 h60 v-140 h80 v140 h50 v-80 h70 v80 h60 v-40 h90 v40 h60`}
      fill="none" stroke={color} strokeWidth={5}
    />
    {/* dashed delivery route swooping over it */}
    <path
      d={`M-40 ${h - 560} C 260 ${h - 760}, 560 ${h - 420}, 820 ${h - 620} S 1120 ${h - 700}, 1140 ${h - 660}`}
      fill="none" stroke={color} strokeWidth={6} strokeDasharray="4 26" strokeLinecap="round"
    />
    {/* location pins on the route */}
    {[[250, h - 690], [700, h - 520]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <path d="M0 0 C -22 -34 -22 -62 0 -62 C 22 -62 22 -34 0 0 Z" fill={color} />
        <circle cx={0} cy={-42} r={9} fill={GROUNDS.bone.bg} />
      </g>
    ))}
  </svg>
);

/** Circle burst behind a subject: solid disc + offset ring. */
const Burst: React.FC<{ cx: number; cy: number; r: number; disc: string; ring: string }> = ({
  cx, cy, r, disc, ring,
}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <circle cx={cx} cy={cy} r={r} fill={disc} />
    <circle cx={cx} cy={cy} r={r + 46} fill="none" stroke={ring} strokeWidth={4} opacity={0.65} />
    <circle cx={cx + r * 0.9} cy={cy - r * 0.85} r={16} fill={ring} opacity={0.8} />
    <circle cx={cx - r * 1.02} cy={cy + r * 0.4} r={9} fill={ring} opacity={0.6} />
  </svg>
);

/** Badge chip row. */
const Chips: React.FC<{ items: string[]; ground: keyof typeof GROUNDS }> = ({ items, ground }) => {
  if (!items.length) return null;
  const dark = ground !== "bone";
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
      {items.map((t, i) => (
        <div
          key={t}
          style={{
            fontFamily: TEXT,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.08em",
            padding: "12px 22px",
            borderRadius: 10,
            background: i === 0 ? C.orange : dark ? "rgba(0,0,0,0.28)" : C.ink,
            color: C.white,
            transform: "rotate(-1deg)",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

/** Dark footer contact strip with the slash motif. */
const Footer: React.FC<{ h: number }> = ({ h }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: h - 110,
      height: 110,
      background: "#101210",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `0 ${PAD}px`,
      zIndex: 4,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", right: 250, top: -30, width: 90, height: 170, background: C.green, transform: "rotate(-27deg)", opacity: 0.9 }} />
    <div style={{ position: "absolute", right: 320, top: -30, width: 26, height: 170, background: C.orange, transform: "rotate(-27deg)", opacity: 0.9 }} />
    <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 28, letterSpacing: "0.06em", color: C.white, zIndex: 1 }}>
      www.sprintcouriers.co.bw
    </div>
    <div
      style={{
        fontFamily: TEXT,
        fontWeight: 800,
        fontSize: 28,
        color: "#101210",
        background: C.white,
        borderRadius: 999,
        padding: "10px 24px",
        zIndex: 1,
      }}
    >
      WhatsApp 76 999 965
    </div>
  </div>
);

/** Circular anniversary seal with text on a path. */
const Seal: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 300 }) => {
  const r = 92;
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" style={{ position: "absolute", left: x, top: y, transform: "rotate(-12deg)", zIndex: 3 }}>
      <circle cx={130} cy={130} r={124} fill={C.orange} />
      <circle cx={130} cy={130} r={124} fill="none" stroke={C.white} strokeWidth={3} strokeDasharray="3 9" />
      <defs>
        <path id="sealArc" d={`M ${130 - r} 130 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`} />
      </defs>
      <text fontFamily={TEXT} fontWeight={800} fontSize={21.5} letterSpacing={3.5} fill={C.white}>
        <textPath href="#sealArc">TWENTY YEARS · SINCE 2006 · TWENTY YEARS ·</textPath>
      </text>
      <text x={130} y={158} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={82} fill={C.white}>
        20
      </text>
    </svg>
  );
};

/** Paper texture over everything but the footer. */
const Paper: React.FC<{ opacity?: number; dark?: boolean }> = ({ opacity = 0.16, dark = false }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${staticFile("tex-paper.png")})`,
      backgroundRepeat: "repeat",
      opacity,
      mixBlendMode: dark ? "screen" : "multiply",
      pointerEvents: "none",
      zIndex: 3,
    }}
  />
);

// --- v2 variants ------------------------------------------------------------

/** Full-colour ground, circle burst behind the subject, chips + footer. */
const Hero: React.FC<{ p: SocialProps; h: number }> = ({ p, h }) => {
  const g = GROUNDS[p.ground];
  const dark = p.ground !== "bone";
  return (
    <AbsoluteFill style={{ backgroundColor: g.bg }}>
      <RouteLines color={g.line} h={h} opacity={p.ground === "green" ? 0.4 : 0.3} />
      <Burst
        cx={540 + p.subjectX}
        cy={h - 460}
        r={330}
        disc={p.ground === "green" ? "#2F8F2B" : p.ground === "ink" ? "#1B241A" : "#E9E5DA"}
        ring={C.orange}
      />
      {p.mark && <Mark />}
      <div style={{ position: "absolute", top: p.typeTop, left: PAD, right: PAD, zIndex: 2 }}>
        {p.eyebrow && (
          <div style={{ fontFamily: TEXT, fontWeight: 800, fontSize: 27, letterSpacing: "0.24em", textTransform: "uppercase", color: dark ? C.orange : "#6E675D", marginBottom: 22 }}>
            {p.eyebrow}
          </div>
        )}
        <div style={{ color: g.ink }}>
          <Headline tokens={p.tokens.map((t) => ({ ...t }))} size={p.size} accent={p.accent} inkOverride={g.ink} />
        </div>
        {p.subline && (
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 40, lineHeight: 1.3, color: g.soft, marginTop: 22, maxWidth: 760 }}>
            {p.subline}
          </div>
        )}
        <Chips items={p.chips} ground={p.ground} />
      </div>
      <Subject p={p} />
      <Paper dark={dark} opacity={dark ? 0.12 : 0.16} />
      {p.footer ? <Footer h={h} /> : <Kicker text={p.kicker} />}
    </AbsoluteFill>
  );
};

/** Giant "20" numeral composition (ref: Kitchen Sink 20th). */
const Anniv20: React.FC<{ p: SocialProps; h: number }> = ({ p, h }) => {
  const g = GROUNDS[p.ground];
  const dark = p.ground !== "bone";
  const numY = h * 0.56;
  return (
    <AbsoluteFill style={{ backgroundColor: g.bg }}>
      <RouteLines color={g.line} h={h} opacity={0.28} />
      {p.mark && <Mark />}
      <svg width={1080} height={h} viewBox={`0 0 1080 ${h}`} style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {/* the numeral, huge, white, with the brand slash cutting through it */}
        <text x={540} y={numY} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={760} fill={dark ? C.white : C.ink} letterSpacing={-18}>
          20
        </text>
        <g transform={`rotate(-27 540 ${numY - 140})`}>
          <rect x={-200} y={numY - 190} width={1480} height={64} fill={C.orange} />
          <rect x={-200} y={numY - 108} width={1480} height={18} fill={dark ? "rgba(255,255,255,0.85)" : C.green} />
        </g>
        {/* micro icons riding the slash */}
        <g transform={`rotate(-27 540 ${numY - 140})`} fontFamily={TEXT} fontWeight={800} fontSize={30} fill={C.white}>
          <text x={200} y={numY - 147}>2006</text>
          <text x={770} y={numY - 147}>2026</text>
        </g>
      </svg>
      <div style={{ position: "absolute", top: p.typeTop, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
        <div style={{ fontFamily: TEXT, fontWeight: 800, fontSize: 28, letterSpacing: "0.26em", textTransform: "uppercase", color: dark ? C.orange : "#6E675D" }}>
          {p.eyebrow ?? "2006–2026 · TWENTY YEARS"}
        </div>
      </div>
      <div style={{ position: "absolute", top: numY + 90, left: 0, right: 0, textAlign: "center", zIndex: 2, padding: `0 ${PAD}px` }}>
        <div style={{ color: g.ink, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Headline tokens={p.tokens} size={p.size} accent={p.accent} inkOverride={g.ink} center />
        </div>
        {p.subline && (
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 38, lineHeight: 1.35, color: g.soft, marginTop: 20 }}>
            {p.subline}
          </div>
        )}
      </div>
      <Paper dark={dark} opacity={dark ? 0.12 : 0.15} />
      {p.footer ? <Footer h={h} /> : <Kicker text={p.kicker} />}
    </AbsoluteFill>
  );
};

/** Subject + anniversary seal + copy. */
const AnnivSeal: React.FC<{ p: SocialProps; h: number }> = ({ p, h }) => {
  const g = GROUNDS[p.ground];
  const dark = p.ground !== "bone";
  return (
    <AbsoluteFill style={{ backgroundColor: g.bg }}>
      <RouteLines color={g.line} h={h} opacity={0.3} />
      <Burst cx={540 + p.subjectX} cy={h - 430} r={320} disc={dark ? "#2F8F2B" : "#E9E5DA"} ring={C.orange} />
      {p.mark && <Mark />}
      <div style={{ position: "absolute", top: p.typeTop, left: PAD, right: PAD, zIndex: 2 }}>
        {p.eyebrow && (
          <div style={{ fontFamily: TEXT, fontWeight: 800, fontSize: 27, letterSpacing: "0.24em", textTransform: "uppercase", color: dark ? C.orange : "#6E675D", marginBottom: 22 }}>
            {p.eyebrow}
          </div>
        )}
        <Headline tokens={p.tokens} size={p.size} accent={p.accent} inkOverride={g.ink} />
        {p.subline && (
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 38, lineHeight: 1.3, color: g.soft, marginTop: 20, maxWidth: 560 }}>
            {p.subline}
          </div>
        )}
        <Chips items={p.chips} ground={p.ground} />
      </div>
      <Subject p={p} />
      <Seal x={716} y={Math.round(h * 0.47)} />
      <Paper dark={dark} opacity={dark ? 0.12 : 0.16} />
      {p.footer ? <Footer h={h} /> : <Kicker text={p.kicker} />}
    </AbsoluteFill>
  );
};

// --- the graphic ------------------------------------------------------------

const Canvas: React.FC<{ p: SocialProps; h: number }> = ({ p, h }) => {
  const slashTop = Math.round(h * 0.55);

  if (p.variant === "hero") return <Hero p={p} h={h} />;
  if (p.variant === "anniv20") return <Anniv20 p={p} h={h} />;
  if (p.variant === "annivseal") return <AnnivSeal p={p} h={h} />;

  if (p.variant === "endcard") {
    return (
      <AbsoluteFill style={{ backgroundColor: BONE }}>
        <Slash top={Math.round(h * 0.86)} solid />
        <Grain opacity={0.1} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(-60px)" }}>
          <div style={{ width: 840, textAlign: "center" }}>
            <Img src={staticFile("logo-mark.png")} style={{ width: "100%", maxWidth: "none", display: "block" }} />
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 300,
                fontSize: 40,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: C.ink,
                marginTop: 42,
              }}
            >
              Your World Delivered
            </div>
            <div
              style={{
                fontFamily: TEXT,
                fontWeight: 700,
                fontSize: 33,
                color: "#3A3A3A",
                lineHeight: 1.8,
                marginTop: 38,
              }}
            >
              www.sprintcouriers.co.bw
              <br />
              <span style={{ color: C.green }}>WhatsApp 76 999 965</span>
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: BONE }}>
      <Slash top={slashTop} />
      <Grain opacity={0.11} />
      {p.mark && <Mark />}
      <div style={{ position: "absolute", top: p.typeTop, left: PAD, right: PAD, zIndex: 2 }}>
        {p.variant === "stat" && p.stat && (
          <div
            style={{
              display: "inline-block",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: p.size * 1.7,
              lineHeight: 1.1,
              color: C.white,
              background: p.accent,
              padding: "0 0.16em",
              marginBottom: 18,
            }}
          >
            {p.stat}
          </div>
        )}
        <Headline tokens={p.tokens} size={p.size} accent={p.accent} />
      </div>
      <Subject p={p} />
      <Kicker text={p.kicker} />
    </AbsoluteFill>
  );
};

export const SocialFeed: React.FC<SocialProps> = (p) => <Canvas p={p} h={1350} />;
export const SocialStory: React.FC<SocialProps> = (p) => <Canvas p={p} h={1920} />;
