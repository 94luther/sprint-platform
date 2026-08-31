/**
 * Kinetic typography primitives — the manifesto style.
 *
 * The grammar, taken from the reference: a sentence builds one word at a time;
 * each word arrives heavily motion-blurred and resolves sharp; connector words
 * sit in a light weight while emphasis words are heavy and carry one of three
 * treatments — an outline box, a highlighter fill that wipes in, or an
 * underline swash. Nothing ever simply fades.
 */

import { useCurrentFrame } from "remotion";
import { at, C, EASE, prog, SANS } from "./brand";

export type Emphasis = "none" | "box" | "fill" | "underline";

/** How long a single word takes to resolve from blurred to sharp. */
const RESOLVE = 9;

/**
 * One word of the sentence.
 *
 * The blur is the whole trick: entering at ~18px of blur and resolving to 0
 * reads as real motion blur, which is what stops this looking like a fade.
 */
export const Word: React.FC<{
  children: React.ReactNode;
  delay?: number;
  weight?: number;
  size?: number;
  color?: string;
  emphasis?: Emphasis;
  accent?: string;
  /** Text colour once a fill has passed underneath it. */
  fillTextColor?: string;
}> = ({
  children,
  delay = 0,
  weight = 400,
  size = 96,
  color = C.ink,
  emphasis = "none",
  accent = C.orange,
  fillTextColor = C.white,
}) => {
  const frame = useCurrentFrame();

  const p = prog(frame, delay, RESOLVE, EASE.out);
  const blur = at(p, 9, 0);
  const lift = at(p, 20, 0);
  const scale = at(p, 1.06, 1);

  // Treatments land just after the word itself has resolved.
  const treat = prog(frame, delay + RESOLVE - 2, 8, EASE.out);
  const filled = emphasis === "fill" && treat > 0.55;

  // Hero words get a per-letter cascade — crisp, no blur, each glyph settling
  // with its own timing. Lead words keep the signature blur resolve.
  const cascade = emphasis !== "none" && typeof children === "string";

  // The glint: a soft light stripe sweeping the fill after it lands.
  const glint = emphasis === "fill" ? prog(frame, delay + RESOLVE + 9, 10, EASE.wipe) : 0;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.16,
        color: filled ? fillTextColor : color,
        opacity: cascade ? 1 : p,
        filter: !cascade && blur > 0.4 ? `blur(${blur}px)` : undefined,
        transform: cascade ? undefined : `translateY(${lift}px) scale(${scale})`,
        padding: emphasis === "none" ? 0 : "0 0.16em",
        margin: emphasis === "none" ? 0 : "0 -0.04em",
        whiteSpace: "pre",
      }}
    >
      {/* highlighter fill, wiping left to right behind the glyphs, with the
          brand skew and a light glint sweeping across once it has landed */}
      {emphasis === "fill" && (
        <span
          style={{
            position: "absolute",
            inset: "0.06em 0 0.02em 0",
            background: accent,
            transform: `scaleX(${treat}) skewX(-8deg)`,
            transformOrigin: "left center",
            zIndex: -1,
            overflow: "hidden",
          }}
        >
          {glint > 0.01 && glint < 0.99 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "30%",
                left: `${at(glint, -35, 120)}%`,
                background:
                  "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
              }}
            />
          )}
        </span>
      )}

      {/* thin outline box, drawn on with a faint chromatic fringe */}
      {emphasis === "box" && (
        <>
          <span
            style={{
              position: "absolute",
              inset: "0.04em 0 0.02em 0",
              border: `3px solid ${accent}`,
              opacity: treat * 0.55,
              transform: `translate(${at(treat, 7, 3)}px, ${at(treat, -4, -2)}px)`,
              zIndex: -1,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: "0.04em 0 0.02em 0",
              border: `3px solid ${C.ink}`,
              clipPath: `inset(0 ${at(treat, 100, 0)}% 0 0)`,
              zIndex: -1,
            }}
          />
        </>
      )}

      {/* underline swash */}
      {emphasis === "underline" && (
        <span
          style={{
            position: "absolute",
            left: "0.1em",
            right: "0.1em",
            bottom: "0.08em",
            height: 10,
            borderRadius: 6,
            background: accent,
            transform: `scaleX(${treat})`,
            transformOrigin: "left center",
            zIndex: -1,
          }}
        />
      )}

      {cascade
        ? [...(children as string)].map((ch, i) => {
            const lp = prog(frame, delay + i * 1.3, 8, EASE.out);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: lp,
                  transform: `translateY(${at(lp, 0.42, 0)}em) rotate(${at(lp, 5, 0)}deg)`,
                  transformOrigin: "left bottom",
                  whiteSpace: "pre",
                }}
              >
                {ch}
              </span>
            );
          })
        : children}
    </span>
  );
};

export type Tok = {
  t: string;
  w?: number;
  e?: Emphasis;
  c?: string;
  accent?: string;
  /** Force a line break before this token. */
  br?: boolean;
};

/**
 * A sentence that builds word by word.
 *
 * `start` offsets the whole line; `step` is the gap between words. Tokens
 * carry their own weight and emphasis so the copy and its treatment live
 * together and stay readable in the scene files.
 */
export const Sentence: React.FC<{
  tokens: Tok[];
  start?: number;
  step?: number;
  size?: number;
  color?: string;
  align?: "left" | "center";
  /** Slow parallax drift applied to the whole block, as in the reference. */
  drift?: number;
}> = ({
  tokens,
  start = 0,
  step = 5,
  size = 96,
  color = C.ink,
  align = "left",
  drift = 0,
}) => {
  const frame = useCurrentFrame();
  const d = at(prog(frame, start, 90, (n) => n), 0, drift);

  // Split into lines so each renders as its own flex row.
  const lines: Tok[][] = [[]];
  tokens.forEach((tok) => {
    if (tok.br) lines.push([]);
    lines[lines.length - 1].push(tok);
  });

  let i = -1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: size * 0.1,
        transform: `translate(${d}px, ${d * 0.5}px)`,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: `0 ${size * 0.22}px`,
            justifyContent: align === "center" ? "center" : "flex-start",
          }}
        >
          {line.map((tok, ti) => {
            i += 1;
            return (
              <Word
                key={`${li}-${ti}`}
                delay={start + i * step}
                weight={tok.w ?? 400}
                size={size}
                color={tok.c ?? color}
                emphasis={tok.e ?? "none"}
                accent={tok.accent ?? C.orange}
              >
                {tok.t}
              </Word>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- background furniture ---------------------------------------------------

/** The big soft brand circle the subject sits on. */
export const SoftCircle: React.FC<{
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  delay?: number;
  opacity?: number;
}> = ({ size = 900, color = C.green, x = 0, y = 0, delay = 0, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 18, EASE.out);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        opacity: opacity * p,
        transform: `scale(${at(p, 0.86, 1)})`,
      }}
    />
  );
};

/** Faint concentric rings, the reference's quiet corner texture. */
export const Rings: React.FC<{
  x?: number;
  y?: number;
  color?: string;
  count?: number;
  gap?: number;
  delay?: number;
}> = ({ x = -160, y = -160, color = C.ink, count = 5, gap = 90, delay = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {new Array(count).fill(0).map((_, i) => {
        const p = prog(frame, delay + i * 3, 20, EASE.out);
        const r = (i + 1) * gap;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `3px solid ${color}`,
              opacity: 0.1 * p,
              transform: `scale(${at(p, 0.9, 1)})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Oversized ghosted outline word sitting behind the subject. */
export const GhostWord: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  delay?: number;
  vertical?: boolean;
}> = ({
  children,
  size = 300,
  color = C.ink,
  x = 0,
  y = 0,
  delay = 0,
  vertical = false,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 24, EASE.out);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: vertical ? "0.3em" : "0.02em",
        color: "transparent",
        WebkitTextStroke: `2px ${color}`,
        opacity: 0.12 * p,
        whiteSpace: "pre",
        writingMode: vertical ? "vertical-rl" : undefined,
        transform: `translateY(${at(p, 30, 0)}px)`,
      }}
    >
      {children}
    </div>
  );
};
