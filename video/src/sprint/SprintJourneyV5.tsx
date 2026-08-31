/**
 * Sprint Journey V5, 30 seconds, 1920x1080, 30fps.
 *
 * An ANIMATED version of public/order-journey.html, the static graphic the
 * owner already understood: one order travelling through five stops. Same
 * five stops, same copy, same colours, same rider illustration approach
 * (plain CSS divs, no stock footage). The new device is a persistent
 * progress rail along the bottom of every frame so the viewer always knows
 * where the order is, with a small branded token that slides dot to dot.
 *
 * Reused verbatim in spirit from SprintConceptV3.tsx: PhoneFrame, ScreenImg,
 * the fade+rise caption grammar, the EndCard. Same brand.ts tokens
 * (C, EASE, TYPE via displayStyle, SKEW, prog/at), same staticFile media,
 * no new invented hex, no new motion grammar beyond what V3 already uses.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { at, C, displayStyle, EASE, fontsReady, prog, SANS, SKEW, TEXT } from "./brand";

export const SPRINT_JOURNEY_V5_DURATION = 900;

const FILM_W = 1920;

// --- layout zones, kept clear of one another per the fidelity rules ---------
const TITLE_TOP = 58;
const CAPTION_PAD_BOTTOM = 178;
const RAIL_Y = 985;
const RAIL_LABEL_Y = RAIL_Y + 38;

// --- shared phone geometry, carried over verbatim from V3 --------------------
const PHONE_SCREEN_W = 300;
const PHONE_SCREEN_H = PHONE_SCREEN_W * 2;
const PHONE_BEZEL = 14;

const PhoneFrame: React.FC<{ children: React.ReactNode; delay?: number; x: number; y: number }> = ({
  children,
  delay = 0,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, EASE.out);
  const outerW = PHONE_SCREEN_W + PHONE_BEZEL * 2;
  const outerH = PHONE_SCREEN_H + PHONE_BEZEL * 2;

  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
      <div style={{ perspective: 1800 }}>
        <div
          style={{
            width: outerW,
            height: outerH,
            borderRadius: 46,
            background: C.ink,
            boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 10px 26px rgba(0,0,0,0.3)",
            opacity: p,
            transform: `translateY(${at(p, 60, 0)}px) scale(${at(p, 0.9, 1)}) rotateY(${at(p, 10, 0)}deg)`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: PHONE_BEZEL + 6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 96,
              height: 18,
              borderRadius: 16,
              background: C.ink,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08)",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: PHONE_BEZEL,
              borderRadius: 34,
              overflow: "hidden",
              background: C.inkSoft,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/** A real capture, filling the phone screen exactly, no crop-to-stretch. */
const ScreenImg: React.FC<{ file: string }> = ({ file }) => (
  <Img
    src={staticFile(`appdemo/${file}`)}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    }}
  />
);

// --- shared title / caption grammar, same fade+rise as V3's BottomLine ------

const TopTitle: React.FC<{ text: string; start?: number; size?: number; maxWidth?: number }> = ({
  text,
  start = 0,
  size = 88,
  maxWidth = 1700,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 7, EASE.out);
  const rise = at(p, 26, 0);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: TITLE_TOP }}>
      <div style={{ opacity: p, transform: `translateY(${rise}px)`, maxWidth, textAlign: "center" }}>
        <span style={{ ...displayStyle(size, C.bone), whiteSpace: "normal" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; start: number; holdDur?: number }> = ({ text, start, holdDur = 116 }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut) * 0.92;
  const rise = at(fadeIn, 16, 0);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: CAPTION_PAD_BOTTOM }}>
      <div style={{ opacity, transform: `translateY(${rise}px)`, maxWidth: 1400, textAlign: "center" }}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 32, color: C.bone }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

// --- the progress rail, mounted once for the whole 900 frames ---------------

const RAIL_DOTS = [
  { label: "Ordered", x: 240 },
  { label: "Matched", x: 600 },
  { label: "Packed", x: 960 },
  { label: "Riding", x: 1320 },
  { label: "Delivered", x: 1680 },
];

/** Continuous 0..4 progress across the whole film's global frame. */
const railProgress = (frame: number): number =>
  prog(frame, 150, 60, EASE.out) +
  prog(frame, 330, 60, EASE.out) +
  prog(frame, 510, 60, EASE.out) +
  prog(frame, 690, 60, EASE.out);

const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const p = railProgress(frame);
  const lineLeft = RAIL_DOTS[0].x;
  const lineWidth = RAIL_DOTS[4].x - RAIL_DOTS[0].x;

  const idx = Math.min(4, Math.floor(p + 1e-6));
  const nextIdx = Math.min(4, idx + 1);
  const frac = idx === 4 ? 0 : p - idx;
  const tokenX = RAIL_DOTS[idx].x + (RAIL_DOTS[nextIdx].x - RAIL_DOTS[idx].x) * frac;

  return (
    <AbsoluteFill>
      {/* base line */}
      <div
        style={{
          position: "absolute",
          left: lineLeft,
          top: RAIL_Y - 2,
          width: lineWidth,
          height: 4,
          borderRadius: 2,
          background: "rgba(244,244,241,0.14)",
        }}
      />
      {/* filled line */}
      <div
        style={{
          position: "absolute",
          left: lineLeft,
          top: RAIL_Y - 2,
          width: (p / 4) * lineWidth,
          height: 4,
          borderRadius: 2,
          background: C.green,
        }}
      />

      {RAIL_DOTS.map((d, i) => {
        const reached = p >= i - 1e-6;
        return (
          <div key={d.label}>
            <div
              style={{
                position: "absolute",
                left: d.x,
                top: RAIL_Y,
                width: 24,
                height: 24,
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                background: reached ? C.green : C.inkSoft,
                border: reached ? "none" : "1.5px solid rgba(244,244,241,0.28)",
                boxShadow: reached ? "0 0 14px rgba(58,170,53,0.55)" : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: d.x,
                top: RAIL_LABEL_Y,
                width: 200,
                transform: "translate(-50%, 0)",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: TEXT,
                  fontWeight: 700,
                  fontSize: 21,
                  color: reached ? C.bone : "rgba(244,244,241,0.42)",
                }}
              >
                {d.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* the sprint-branded rider token, advancing dot to dot */}
      <div
        style={{
          position: "absolute",
          left: tokenX,
          top: RAIL_Y,
          width: 42,
          height: 42,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: C.green,
          border: `3px solid ${C.bone}`,
          boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile("logo-mark.png")}
          style={{ width: 26, height: "auto", objectFit: "contain" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- beat 1: where it starts (0-180) -----------------------------------------

const ENTRY_ITEMS: { text: string; highlight?: boolean }[] = [
  { text: "WhatsApp message", highlight: true },
  { text: "The shop's website" },
  { text: "Web shop" },
  { text: "Company account" },
  { text: "The Sprint app" },
];

const EntryChip: React.FC<{ text: string; highlight?: boolean; delay: number; y: number }> = ({
  text,
  highlight,
  delay,
  y,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.overshoot);
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: y,
        width: 620,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "17px 24px",
        borderRadius: 14,
        opacity: p,
        transform: `translateX(${at(p, -40, 0)}px)`,
        background: highlight ? "rgba(58,170,53,0.16)" : C.inkSoft,
        border: `1.5px solid ${highlight ? C.green : "rgba(244,244,241,0.14)"}`,
      }}
    >
      <div
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          flex: "none",
          background: highlight ? C.green : "rgba(244,244,241,0.35)",
        }}
      />
      <span
        style={{
          fontFamily: TEXT,
          fontWeight: 700,
          fontSize: 27,
          color: highlight ? C.bone : "rgba(244,244,241,0.78)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Beat1Start: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <TopTitle text="WHERE IT STARTS" size={90} />
    {ENTRY_ITEMS.map((item, i) => (
      <EntryChip key={item.text} text={item.text} highlight={item.highlight} delay={22 + i * 17} y={250 + i * 92} />
    ))}
    <PhoneFrame x={1460} y={510} delay={104}>
      <ScreenImg file="catalog.png" />
    </PhoneFrame>
    <Caption text="One order can start in any of five places." start={36} holdDur={132} />
  </AbsoluteFill>
);

// --- beat 2: sprint picks the rider (180-360) --------------------------------

const GlowRow: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 44, 16, EASE.out);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.25);
  return (
    <div
      style={{
        position: "absolute",
        left: "8%",
        top: 236,
        width: "84%",
        height: 58,
        borderRadius: 12,
        opacity: p,
        border: `2px solid ${C.green}`,
        boxShadow: `0 0 ${16 + pulse * 16}px rgba(58,170,53,0.7)`,
        background: "rgba(58,170,53,0.14)",
      }}
    />
  );
};

const Beat2Ops: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <TopTitle text="SPRINT PICKS THE RIDER" size={78} />
    <PhoneFrame x={960} y={510} delay={16}>
      <ScreenImg file="ops.png" />
      <GlowRow />
    </PhoneFrame>
    <Caption text="The engine sends the nearest rider in seconds." start={44} holdDur={124} />
  </AbsoluteFill>
);

// --- beat 3: the shop packs it (360-540) -------------------------------------

const OrderCard: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = prog(frame, 18, 16, EASE.overshoot);
  const tapP = prog(frame, 74, 10, EASE.overshoot);
  const flipP = prog(frame, 86, 14, EASE.out);
  const payoutP = prog(frame, 104, 16, EASE.overshoot);

  return (
    <div
      style={{
        position: "absolute",
        left: 960,
        top: 510,
        transform: `translate(-50%, -50%) scale(${at(cardP, 0.9, 1)})`,
        opacity: cardP,
        width: 660,
        background: C.inkSoft,
        borderRadius: 24,
        padding: "36px 40px 42px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 38, color: C.bone }}>2 loaves and milk</span>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 24, color: C.bone, opacity: 0.65 }}>
          Block 8 {"•"} P57
        </span>
      </div>

      <div style={{ marginTop: 26, position: "relative", height: 74 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1 - flipP,
            borderRadius: 14,
            background: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: tapP > 0.05 && flipP < 0.5 ? `0 0 0 5px ${C.greenBright}` : "none",
            transform: `scale(${at(tapP, 1, 1.05)})`,
          }}
        >
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 26, color: C.white }}>Accept</span>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: flipP,
            borderRadius: 14,
            background: C.inkSoft,
            border: `1.5px solid ${C.green}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 26, color: C.green }}>Rider on the way</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 26,
          opacity: payoutP,
          transform: `translateY(${at(payoutP, -16, 0)}px) scale(${at(payoutP, 0.85, 1)})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "14px 24px",
            borderRadius: 999,
            background: C.green,
            boxShadow: "0 14px 26px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 22, color: C.white }}>P42.75 to you</span>
        </div>
      </div>
    </div>
  );
};

const Beat3Pack: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <TopTitle text="THE SHOP PACKS IT" size={86} />
    <OrderCard />
    <Caption text="One tap to accept. Payout already promised." start={112} holdDur={56} />
  </AbsoluteFill>
);

// --- beat 4: a sprint rider carries it (540-720) ------------------------------
// CSS-only illustration, copied structurally from public/order-journey.html's
// .rider/.bike/.wheel/.body-bar/.box/.helmet/.torso, same brand colours.
// No stock footage, no generic human: green bike, orange helmet, green box
// carrying the logo mark.

const RIDER_SCALE = 1.5;
const RIDER_W = 190 * RIDER_SCALE;
const RIDER_H = 150 * RIDER_SCALE;

const RiderIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const travel = prog(frame, 6, 168, EASE.wipe);
  const x = at(travel, -RIDER_W - 40, FILM_W + 40);
  const bob = Math.sin(frame * 0.35) * 5;

  const s = RIDER_SCALE;

  return (
    <div style={{ position: "absolute", left: x, top: 560 + bob, width: RIDER_W, height: RIDER_H }}>
      {/* ground shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: 8 * s,
          width: 170 * s,
          height: 16,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          filter: "blur(4px)",
        }}
      />
      <div style={{ position: "absolute", bottom: 6 * s, left: 0, width: RIDER_W, height: 78 * s }}>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 6 * s,
            width: 52 * s,
            height: 52 * s,
            borderRadius: "50%",
            border: `${7 * s}px solid #d8d8d3`,
            background: "#1a1a17",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 6 * s,
            width: 52 * s,
            height: 52 * s,
            borderRadius: "50%",
            border: `${7 * s}px solid #d8d8d3`,
            background: "#1a1a17",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24 * s,
            left: 40 * s,
            width: 110 * s,
            height: 9 * s,
            background: C.green,
            borderRadius: 5 * s,
            transform: `skewX(${SKEW}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30 * s,
            left: 8 * s,
            width: 56 * s,
            height: 52 * s,
            background: C.green,
            borderRadius: 8 * s,
            border: `${2 * s}px solid ${C.greenDeep}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img src={staticFile("logo-mark.png")} style={{ width: 40 * s, height: "auto", objectFit: "contain" }} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30 * s,
            right: 40 * s,
            width: 30 * s,
            height: 40 * s,
            background: C.green,
            borderRadius: `${8 * s}px ${8 * s}px ${4 * s}px ${4 * s}px`,
            transform: "skewX(-8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 58 * s,
            right: 52 * s,
            width: 34 * s,
            height: 34 * s,
            borderRadius: "50%",
            background: C.orange,
          }}
        />
      </div>
    </div>
  );
};

const Beat4Rider: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
    <TopTitle text="A REAL SPRINT RIDER CARRIES IT" size={62} />
    <RiderIllustration />
    <Caption text="Tracked the whole way." start={40} holdDur={128} />
  </AbsoluteFill>
);

// --- beat 5: delivered, the money splits itself (720-840) --------------------

const MONEY_ROWS: { text: string; y: number; highlight?: boolean }[] = [
  { text: "P67.50 to the shop", y: 420 },
  { text: "P16.20 to the rider", y: 552 },
  { text: "P6.30 to Sprint", y: 684, highlight: true },
];

const MoneyRow: React.FC<{ text: string; y: number; delay: number; highlight?: boolean }> = ({
  text,
  y,
  delay,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 18, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        opacity: p,
        transform: `translateY(${at(p, 22, 0)}px)`,
        textAlign: "center",
      }}
    >
      <span style={{ ...displayStyle(58, highlight ? C.orange : C.bone), whiteSpace: "normal" }}>{text}</span>
    </div>
  );
};

const Beat5Delivered: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <TopTitle text="DELIVERED. THE MONEY SPLITS ITSELF" size={58} maxWidth={1600} />
    {MONEY_ROWS.map((row, i) => (
      <MoneyRow key={row.text} text={row.text} y={row.y} delay={26 + i * 16} highlight={row.highlight} />
    ))}
  </AbsoluteFill>
);

// --- close: end card (840-900), carried over verbatim from V3 ----------------

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
  { at: 0, dur: 180, Comp: Beat1Start },
  { at: 180, dur: 180, Comp: Beat2Ops },
  { at: 360, dur: 180, Comp: Beat3Pack },
  { at: 540, dur: 180, Comp: Beat4Rider },
  { at: 720, dur: 120, Comp: Beat5Delivered },
  { at: 840, dur: 60, Comp: EndCard },
];

export const SprintJourneyV5: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Audio src={staticFile("audio/v3-score.wav")} />
      {BEATS.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
      <ProgressRail />
    </AbsoluteFill>
  );
};
