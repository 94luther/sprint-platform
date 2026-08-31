/**
 * ClientTeaser — the parameterized pitch film.
 *
 * Company name, event name, two accent colors and an optional logo file are
 * INPUT PROPS, so a prospect-branded teaser renders in minutes:
 *   npx remotion render ClientTeaser out/teaser-x.mp4 --props=props.json
 * With no logoFile the lockup falls back to bold typography of the company
 * name — never a redrawn logo (owner rule: real logo art or honest type).
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
import { z } from "zod";
import { at, C, EASE, fontsReady, prog, SANS, SCRIPT } from "./brand";
import { Beat } from "./challenges";
import { Rings, Sentence, Word } from "./kinetic";

export const TEASER_DURATION = 330;

export const teaserSchema = z.object({
  company: z.string().default("Sprint Couriers"),
  eventName: z.string().default("The Sprint Games"),
  accent1: z.string().default("#3AAA35"),
  accent2: z.string().default("#F7941D"),
  /** File in public/ — empty string = typographic fallback, never a redraw. */
  logoFile: z.string().default("logo-mark.png"),
  footerLine: z.string().default("Gaborone · a Sprint Couriers production"),
});
export type TeaserProps = z.infer<typeof teaserSchema>;

const T1: React.FC<{ accent2: string }> = ({ accent2 }) => (
  <Beat dur={95} bg={C.ink} push={0.04}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Sentence
        align="center"
        size={118}
        color={C.white}
        step={6}
        tokens={[
          { t: "Your", w: 300 },
          { t: "people.", w: 300, br: true },
          { t: "Your", w: 300 },
          { t: "work.", w: 800, e: "fill", accent: accent2, c: C.white },
        ]}
      />
    </AbsoluteFill>
  </Beat>
);

const T2: React.FC<{ accent1: string; accent2: string }> = ({ accent1, accent2 }) => (
  <Beat dur={90} bg={accent1} push={0.05}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Sentence
        align="center"
        size={100}
        color={C.white}
        step={6}
        tokens={[
          { t: "One", w: 300, br: true },
          { t: "unforgettable", w: 800, e: "box", accent: accent2, c: C.white, br: true },
          { t: "day.", w: 300 },
        ]}
      />
    </AbsoluteFill>
  </Beat>
);

const T3: React.FC<TeaserProps> = ({ company, eventName, accent1, accent2, logoFile, footerLine }) => {
  const frame = useCurrentFrame();
  const logo = prog(frame, 4, 16, EASE.out);
  const rule = prog(frame, 44, 8, EASE.out);
  const scriptP = prog(frame, 30, 12, EASE.out);

  return (
    <Beat dur={145} bg={C.bone} push={0.03}>
      <Rings x={920} y={1720} color={accent1} count={5} gap={130} delay={4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 880 }}>
          <div
            style={{
              width: "max-content",
              maxWidth: 880,
              margin: "0 auto",
              filter: logo < 0.97 ? `blur(${at(logo, 22, 0)}px)` : undefined,
              transform: `scale(${at(logo, 1.08, 1)})`,
              opacity: logo,
              textAlign: "center",
            }}
          >
            {logoFile ? (
              <Img src={staticFile(logoFile)} style={{ width: 760, maxWidth: "none", display: "block" }} />
            ) : (
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 108,
                  letterSpacing: "0.02em",
                  color: accent1,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              >
                {company}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 18, justifyItems: "center", marginTop: 44 }}>
            {/* long client names must never clip: size follows name length */}
            <Word delay={18} weight={800} size={Math.min(88, Math.floor(1250 / Math.max(1, eventName.length)))} color={accent2}>
              {eventName}
            </Word>
            <div
              style={{
                fontFamily: SCRIPT,
                fontWeight: 700,
                fontSize: 66,
                color: C.ink,
                opacity: scriptP,
                transform: `translateY(${at(scriptP, 22, 0)}px)`,
              }}
            >
              Made for your people
            </div>
            <div style={{ height: 6, width: 620, background: accent2, transform: `scaleX(${rule})`, marginTop: 6 }} />
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 32,
                color: C.ink,
                opacity: prog(frame, 52, 10, EASE.out),
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {footerLine}
              <br />
              WhatsApp 76 999 965
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Beat>
  );
};

export const ClientTeaser: React.FC<TeaserProps> = (props) => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence from={0} durationInFrames={95}><T1 accent2={props.accent2} /></Sequence>
      <Sequence from={95} durationInFrames={90}><T2 accent1={props.accent1} accent2={props.accent2} /></Sequence>
      <Sequence from={185} durationInFrames={145}><T3 {...props} /></Sequence>
    </AbsoluteFill>
  );
};
