/**
 * Sprint Explainer V4, 30 seconds, 1920x1080 landscape, 30fps.
 *
 * The five-part story that passed comprehension review, told mostly in bold
 * Anton type on the brand ink ground, with a few real assets dropped in.
 * Reuses SprintConceptV3.tsx's component grammar wholesale: same brand.ts
 * tokens, same prog/at/EASE motion, the same Chip, BottomLine, SmallCaption,
 * SideLine, WhatsApp mock and EndCard, the same staticFile media, no new
 * invented visual system.
 *
 * Beats (900 frames total):
 *  1. THE GRAVEYARD        0-180   dead apps struck through, hard cut to headline
 *  2. PEOPLE TEXT          180-390 WhatsApp order mock beside the headline
 *  3. ONE ENGINE            390-600 five order channels appear in sequence
 *  4. THE FLEET EXISTS      600-780 real rider footage, two facts land on it
 *  5. THE CLOSE (sentence)  780-840 the one balanced sentence
 *  6. END CARD              840-900 EndCard, carried over verbatim from V3
 *
 * Score: audio/v3-score.wav via the same <Audio> tag pattern as V3, already
 * 30s and mastered, not recomposed here.
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
import { at, C, displayStyle, EASE, fontsReady, PAD, prog, SANS, SKEW, TEXT } from "./brand";

export const SPRINT_EXPLAINER_V4_DURATION = 900;

const FILM_W = 1920;
const FILM_H = 1080;

// --- shared chip, verbatim from V3 -------------------------------------------

const Chip: React.FC<{
  text: string;
  delay?: number;
  bg?: string;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, bg = C.green, color = C.white, fontSize = 24, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        padding: "12px 26px",
        borderRadius: 999,
        background: bg,
        opacity: p,
        transform: `skewX(${SKEW}deg) scale(${at(p, 0.7, 1)})`,
        boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `skewX(${-SKEW}deg)`,
          fontFamily: TEXT,
          fontWeight: 700,
          fontSize,
          color,
          whiteSpace: "pre",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// --- shared type treatment, verbatim from V3 ----------------------------------

const BottomLine: React.FC<{
  text: string;
  start: number;
  holdDur?: number;
  size?: number;
  color?: string;
  paddingBottom?: number;
}> = ({ text, start, holdDur = 150, size = 100, color = C.bone, paddingBottom = 130 }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const rise = at(fadeIn, 24, 0);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom,
        paddingLeft: PAD,
        paddingRight: PAD,
      }}
    >
      <div style={{ opacity, transform: `translateY(${rise}px)`, textAlign: "center", maxWidth: 1700 }}>
        <span style={{ ...displayStyle(size, color), whiteSpace: "normal" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

const SmallCaption: React.FC<{ text: string; start: number; holdDur?: number; bottom?: number }> = ({
  text,
  start,
  holdDur = 130,
  bottom = 70,
}) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut) * 0.85;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: bottom }}>
      <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 28, color: C.bone, opacity }}>{text}</span>
    </AbsoluteFill>
  );
};

/** The Anton narrative line placed beside a card rather than bottom centre, verbatim from V3. */
const SideLine: React.FC<{ text: string; start: number; size?: number }> = ({ text, start, size = 84 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 6, EASE.out);
  const rise = at(p, 24, 0);
  return (
    <div style={{ opacity: p, transform: `translateY(${rise}px)` }}>
      <span style={{ ...displayStyle(size, C.bone), whiteSpace: "normal", textAlign: "left" }}>{text}</span>
    </div>
  );
};

// --- beat 1: the graveyard (0-180) --------------------------------------------
// Ink ground, two lines with a hard cut, no crossfade: line one mounts, three
// dimmed app names fade in below it and strike through, then at the cut
// frame line one unmounts and line two mounts in its place.

const DEAD_APPS = ["Jumia Food", "Bolt Food", "Glovo"];
const CUT_FRAME = 86;

const StruckName: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const fadeP = prog(frame, delay, 10, EASE.out);
  const strikeP = prog(frame, delay + 16, 14, EASE.out);
  return (
    <div style={{ position: "relative", display: "inline-block", opacity: fadeP * 0.55 }}>
      <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 36, color: C.bone }}>{text}</span>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          height: 3,
          width: `${strikeP * 100}%`,
          background: C.orange,
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

const Beat1Graveyard: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < CUT_FRAME) {
    const p = prog(frame, 0, 8, EASE.out);
    const rise = at(p, 24, 0);
    return (
      <AbsoluteFill style={{ backgroundColor: C.ink }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 380,
            textAlign: "center",
            opacity: p,
            transform: `translateY(${rise}px)`,
          }}
        >
          <span style={{ ...displayStyle(92, C.bone), whiteSpace: "normal" }}>THE DELIVERY APPS ARE DYING.</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 56 }}>
            {DEAD_APPS.map((name, i) => (
              <StruckName key={name} text={name} delay={22 + i * 16} />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const p2 = prog(frame, CUT_FRAME, 7, EASE.out);
  const rise2 = at(p2, 24, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: p2, transform: `translateY(${rise2}px)`, textAlign: "center" }}>
        <span style={{ ...displayStyle(150, C.bone), whiteSpace: "normal" }}>SPRINT IS NOT ONE.</span>
      </div>
    </AbsoluteFill>
  );
};

// --- beat 2: people text (180-390) --------------------------------------------
// Headline left, the WhatsApp order mock right, carried over from V3's
// Beat3WhatsApp verbatim: the customer bubble, the order card with the
// Orange Money chip, and the paid/track reply.

const WA_WALLPAPER = "#0B141A";
const WA_OUT = "#005C4B";
const WA_LINK = "#25D366";

const CHAT_W = 460;
const CHAT_H = 620;
const CHAT_LEFT = 1230;
const CHAT_TOP = 230;

const ChatBubble: React.FC<{
  children: React.ReactNode;
  align: "left" | "right";
  delay: number;
  top: number;
  bg: string;
  width?: number;
}> = ({ children, align, delay, top, bg, width = 320 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        top,
        [align]: 22,
        width,
        opacity: p,
        transform: `scale(${at(p, 0.7, 1)}) translateY(${at(p, 18, 0)}px)`,
        transformOrigin: align === "right" ? "right center" : "left center",
        background: bg,
        borderRadius: 16,
        padding: "14px 18px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

const OrderChatCard: React.FC = () => {
  const frame = useCurrentFrame();
  const tapP = prog(frame, 64, 10, EASE.overshoot);

  return (
    <div
      style={{
        position: "absolute",
        left: CHAT_LEFT,
        top: CHAT_TOP,
        width: CHAT_W,
        height: CHAT_H,
        borderRadius: 28,
        background: WA_WALLPAPER,
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      <ChatBubble align="right" delay={10} top={36} bg={WA_OUT}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 22, color: C.white }}>
          2 loaves and milk to Block 8
        </span>
      </ChatBubble>

      <ChatBubble align="left" delay={34} top={126} bg={C.bone} width={380}>
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 22, color: C.ink }}>Thato&apos;s Bakery</span>
        <div style={{ marginTop: 4, marginBottom: 14 }}>
          <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 20, color: C.ink, opacity: 0.7 }}>
            P57 total, deliver 25 min
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              background: C.inkSoft,
              boxShadow: tapP > 0.05 ? `0 0 0 3px ${C.green}` : "none",
              transform: `scale(${at(tapP, 1, 1.08)})`,
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 18, color: C.bone }}>Orange Money</span>
          </div>
          <div style={{ padding: "9px 16px", borderRadius: 999, background: C.inkSoft }}>
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 18, color: C.bone }}>Cash</span>
          </div>
        </div>
      </ChatBubble>

      <ChatBubble align="left" delay={82} top={370} bg={C.bone} width={340}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 22, color: C.ink }}>Paid. Track your rider:</span>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 999, background: WA_LINK }}>
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 16, color: C.ink }}>Track order</span>
          </div>
        </div>
      </ChatBubble>
    </div>
  );
};

const Beat2PeopleText: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <div style={{ position: "absolute", left: 120, top: 400, width: 1020 }}>
      <SideLine text="PEOPLE DON'T DOWNLOAD. THEY TEXT." start={10} size={82} />
    </div>
    <OrderChatCard />
  </AbsoluteFill>
);

// --- beat 3: one engine (390-600) ---------------------------------------------
// The headline lands top centre, five order-channel chips appear in
// sequence beneath it (WhatsApp first, highlighted), then the caption.

const ENGINE_CHANNELS = ["WhatsApp", "Any shop's website", "Web shop", "Corporate accounts", "The Sprint app"];

const EngineHeadline: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 8, EASE.out);
  const rise = at(p, 24, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 150,
        textAlign: "center",
        opacity: p,
        transform: `translateY(${rise}px)`,
      }}
    >
      <span style={{ ...displayStyle(88, C.bone), whiteSpace: "normal" }}>ONE ENGINE. EVERY WAY TO ORDER.</span>
    </div>
  );
};

const Beat3OneEngine: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <EngineHeadline />
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center" }}>
      <div style={{ display: "inline-flex", gap: 24, alignItems: "center" }}>
        {ENGINE_CHANNELS.map((label, i) => (
          <Chip
            key={label}
            text={label}
            delay={40 + i * 16}
            bg={i === 0 ? C.green : C.inkSoft}
            fontSize={28}
            style={{ position: "relative" }}
          />
        ))}
      </div>
    </div>
    <SmallCaption text="However they order, one real rider brings it." start={148} holdDur={56} />
  </AbsoluteFill>
);

// --- beat 4: the fleet exists (600-780) ---------------------------------------
// The real Veo rider footage (concept/shot3.mp4, the same clip V3's
// Beat4Rider plays full frame) plays bright behind two sequential Anton
// facts, then a small caption.

const Beat4Fleet: React.FC = () => {
  const frame = useCurrentFrame();
  const scrimP = prog(frame, 0, 16, EASE.out);
  const factCut = 84;

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <OffthreadVideo
        src={staticFile("concept/shot3.mp4")}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scale(1.05)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 420,
          opacity: scrimP,
          background: "linear-gradient(to top, rgba(17,17,17,0.78), rgba(17,17,17,0))",
        }}
      />

      {frame < factCut ? (
        <BottomLine text="THE FLEET ALREADY EXISTS." start={8} holdDur={68} size={90} />
      ) : (
        <>
          <BottomLine text="70,000 DELIVERIES A MONTH." start={factCut + 2} holdDur={86} size={90} />
          <SmallCaption text="Botswana's licensed courier, since 2018." start={factCut + 16} holdDur={78} />
        </>
      )}
    </AbsoluteFill>
  );
};

// --- beat 5: the close, one sentence (780-840) ---------------------------------

const CloseSentence: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 0, 8, EASE.out);
  const rise = at(p, 24, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: p, transform: `translateY(${rise}px)`, textAlign: "center", maxWidth: 1560 }}>
        <span style={{ ...displayStyle(66, C.bone), whiteSpace: "normal" }}>
          ORDER IN WHATSAPP. A REAL RIDER BRINGS IT. THE MONEY SPLITS ITSELF.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// --- beat 6: end card (840-900), carried over verbatim from V3 -----------------

const ENDCARD_LOCKUP_SIZE = 140;

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const logoP = prog(frame, 0, 7, EASE.out);
  const nameP = prog(frame, 5, 8, EASE.overshoot);
  const slashP = prog(frame, 9, 8, EASE.overshoot);
  const lineP = prog(frame, 15, 8, EASE.out);
  const tagP = prog(frame, 21, 8, EASE.out);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Img
          src={staticFile("logo-mark.png")}
          style={{
            width: 140,
            opacity: logoP,
            transform: `translateY(${at(logoP, 24, 0)}px) scale(${at(logoP, 0.88, 1)})`,
            filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.4))",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              ...displayStyle(ENDCARD_LOCKUP_SIZE, C.bone),
              transform: `skewX(${SKEW}deg) scale(${at(nameP, 0.9, 1)})`,
              opacity: nameP,
            }}
          >
            SPRINT
          </div>
          <div
            style={{
              width: 11,
              height: 86,
              background: C.orange,
              opacity: slashP,
              transform: `skewX(${SKEW}deg) scaleY(${at(slashP, 0.4, 1)})`,
            }}
          />
        </div>
        <div style={{ opacity: lineP, transform: `translateY(${at(lineP, 16, 0)}px)`, textAlign: "center" }}>
          <span style={{ ...displayStyle(44, C.bone), whiteSpace: "normal" }}>
            Built for Gaborone. Moving with you.
          </span>
        </div>
        <div style={{ opacity: tagP, transform: `translateY(${at(tagP, 14, 0)}px)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: 30, color: C.bone }}>
            Gaborone, delivered.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- assembly ------------------------------------------------------------------

const BEATS = [
  { at: 0, dur: 180, Comp: Beat1Graveyard },
  { at: 180, dur: 210, Comp: Beat2PeopleText },
  { at: 390, dur: 210, Comp: Beat3OneEngine },
  { at: 600, dur: 180, Comp: Beat4Fleet },
  { at: 780, dur: 60, Comp: CloseSentence },
  { at: 840, dur: 60, Comp: EndCard },
];

export const SprintExplainerV4: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, width: FILM_W, height: FILM_H }}>
      <Audio src={staticFile("audio/v3-score.wav")} />
      {BEATS.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
