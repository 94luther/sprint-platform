/**
 * Sprint Concept Film V3, 30 seconds, 1920x1080 landscape, 30fps.
 *
 * The merchant-first cut, built from the council's rulings against V2:
 *  - No cold ink title. Frame one is the fictional shop's own website, the
 *    checkout demo plays first, the headline lands after the click.
 *  - The merchant payout chip lands in the SAME beat as the Accept tap, not
 *    a beat later ("the payout must land with the accept, not later").
 *  - The physical machine must be SEEN: the real Veo rider footage
 *    (concept/shot3.mp4, the same file V2 dims for its tracking beat) plays
 *    full frame and bright here, not as a dimmed backdrop. Only a small
 *    tracking card sits in a corner.
 *  - The money split is capped at two seconds flat, no lingering.
 *  - The five-node network diagram before the close is cut entirely
 *    ("PowerPoint fluff"). The close is the end card alone.
 *
 * Six beats in 900 frames: THE WEBSITE (0-180), THE TILL (180-360),
 * WHATSAPP (360-510), THE RIDER (510-690), THE MONEY (690-750), CLOSE
 * (750-900).
 *
 * Every component below is carried over from SprintConceptV2.tsx verbatim
 * where the geometry is unchanged (PhoneFrame, ScreenImg, Chip, BottomLine,
 * SmallCaption, SideLine, the browser mock, the WhatsApp mock, the money
 * rows, the end card), only retimed, recopied, or recut per the rulings
 * above. Same brand.ts tokens, same prog/at/EASE motion grammar, same
 * staticFile media, no new invented hex, no new component grammar.
 *
 * Score: audio/v3-score.wav via the same <Audio> tag pattern as
 * SprintConcept.tsx and SprintAppDemo.tsx.
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

export const SPRINT_CONCEPT_V3_DURATION = 900;

const FILM_W = 1920;
const FILM_H = 1080;

// --- shared phone geometry, carried over verbatim from V2 --------------------
const PHONE_SCREEN_W = 300;
const PHONE_SCREEN_H = PHONE_SCREEN_W * 2; // 600, preserves the 1024:2048 capture ratio
const PHONE_BEZEL = 14;

/** Device chrome: rounded bezel, notch, drop shadow, small 3D settle on entry. */
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

/** A real capture, filling the phone screen exactly, no crop. */
const ScreenImg: React.FC<{ file: string; opacity?: number; scale?: number }> = ({
  file,
  opacity = 1,
  scale = 1,
}) => (
  <Img
    src={staticFile(`appdemo/${file}`)}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity,
      transform: `scale(${scale})`,
      display: "block",
    }}
  />
);

// --- shared chip, verbatim from V2 -------------------------------------------

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
        padding: "10px 20px",
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

// --- shared type treatment, verbatim from V2 ----------------------------------
// Anton, entering on a 200ms fade with rise (6 frames), exiting on 150ms (5
// frames).

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
      <div style={{ opacity, transform: `translateY(${rise}px)`, textAlign: "center", maxWidth: 1600 }}>
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

/** The Anton narrative line placed beside a phone rather than bottom centre. */
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

// --- beat 1: the website (0-180) ----------------------------------------------
// Frame one is the browser mock, no separate title card. Cursor clicks the
// CTA around frame 60, the checkout panel slides over the shop's own page,
// then the headline lands. The headline is left-aligned and size-capped so
// it never sits on top of the checkout panel or the browser window, per the
// council's "type never overlaps UI" ruling: that panel now runs the full
// height of frame, something the old cold-open title never had to share
// space with.

const WIN_W = 1400;
const WIN_H = 740;
const WIN_LEFT = (FILM_W - WIN_W) / 2;
const WIN_TOP = 80;
const CHROME_H = 56;

const BTN_LEFT = WIN_LEFT + 90;
const BTN_TOP = WIN_TOP + CHROME_H + 300;
const BTN_W = 420;
const BTN_H = 84;
const BTN_CX = BTN_LEFT + BTN_W / 2;
const BTN_CY = BTN_TOP + BTN_H / 2;

const CURSOR_START_X = WIN_LEFT + WIN_W - 220;
const CURSOR_START_Y = WIN_TOP + CHROME_H + 90;

const BrowserChrome: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: WIN_W,
      height: CHROME_H,
      background: C.inkSoft,
      borderRadius: "20px 20px 0 0",
      display: "flex",
      alignItems: "center",
      padding: "0 22px",
      gap: 20,
    }}
  >
    <div style={{ display: "flex", gap: 9 }}>
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "rgba(244,244,241,0.28)" }} />
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "rgba(244,244,241,0.45)" }} />
      <div style={{ width: 13, height: 13, borderRadius: "50%", background: "rgba(244,244,241,0.65)" }} />
    </div>
    <div
      style={{
        flex: 1,
        height: 30,
        borderRadius: 999,
        background: "rgba(244,244,241,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 18, color: C.bone, opacity: 0.75 }}>
        thatosbakery.co.bw
      </span>
    </div>
  </div>
);

const BakeryPage: React.FC<{ clickP: number }> = ({ clickP }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: CHROME_H,
      width: WIN_W,
      height: WIN_H - CHROME_H,
      background: C.bone,
      borderRadius: "0 0 20px 20px",
      overflow: "hidden",
    }}
  >
    {/* decorative colour blocks, brand tokens only */}
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 60,
        width: 420,
        height: 420,
        borderRadius: 32,
        background: "rgba(58,170,53,0.10)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 170,
        top: 220,
        width: 220,
        height: 220,
        borderRadius: 24,
        background: "rgba(17,17,17,0.06)",
      }}
    />

    <div style={{ position: "absolute", left: 90, top: 60 }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", color: C.ink, opacity: 0.55 }}>
        GABORONE {"•"} FRESH DAILY BAKES
      </span>
    </div>

    <div style={{ position: "absolute", left: 90, top: 108 }}>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: C.ink, letterSpacing: "-0.01em" }}>
        Thato&apos;s Bakery
      </span>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 30, color: C.ink, opacity: 0.6 }}>
          Gaborone
        </span>
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        left: BTN_LEFT - WIN_LEFT,
        top: BTN_TOP - WIN_TOP - CHROME_H,
        width: BTN_W,
        height: BTN_H,
        borderRadius: 999,
        background: C.green,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${at(clickP, 1, 0.96)})`,
        boxShadow: "0 18px 30px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.white }}>
        Order. Sprint delivers.
      </span>
    </div>
  </div>
);

/** A simple cursor arrow that walks to the CTA button and clicks it around frame 60. */
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const moveP = prog(frame, 8, 40, EASE.out);
  const x = at(moveP, CURSOR_START_X, BTN_CX - 12);
  const y = at(moveP, CURSOR_START_Y, BTN_CY - 10);
  const clickP = prog(frame, 58, 6, EASE.overshoot);
  const ringP = prog(frame, 60, 16, EASE.out);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: BTN_CX,
          top: BTN_CY,
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: `3px solid ${C.green}`,
          opacity: (1 - ringP) * 0.7,
          transform: `translate(-50%, -50%) scale(${at(ringP, 0.3, 1.8)})`,
        }}
      />
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: prog(frame, 6, 8, EASE.out),
          transform: `scale(${at(clickP, 1, 0.85)})`,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
        }}
      >
        <path d="M2 2 L2 21 L7.5 16.5 L10.5 23 L13.5 21.5 L10.5 15 L18 15 Z" fill={C.bone} stroke={C.ink} strokeWidth="1.2" />
      </svg>
    </>
  );
};

const RAIL_METHODS = ["Orange Money", "MyZaka", "Smega", "Cash"];
const PANEL_W = 480;

const CheckoutPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const slideP = prog(frame, 62, 26, EASE.out);
  const x = at(slideP, FILM_W, FILM_W - PANEL_W);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: PANEL_W,
        height: FILM_H,
        background: C.ink,
        boxShadow: "-30px 0 60px rgba(0,0,0,0.45)",
        padding: `120px ${PAD}px`,
      }}
    >
      <span style={{ ...displayStyle(52, C.bone), whiteSpace: "normal" }}>Sprint Checkout</span>
      <div style={{ marginTop: 14, marginBottom: 40 }}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 24, color: C.bone, opacity: 0.65 }}>
          Pay any way you like.
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {RAIL_METHODS.map((m, i) => {
          const p = prog(frame, 96 + i * 10, 14, EASE.overshoot);
          return (
            <div
              key={m}
              style={{
                opacity: p,
                transform: `translateX(${at(p, 40, 0)}px)`,
                padding: "18px 26px",
                borderRadius: 16,
                background: C.inkSoft,
                border: `1px solid rgba(244,244,241,0.14)`,
              }}
            >
              <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 26, color: C.bone }}>{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WEBSITE_HEADLINE = "Give your shop a delivery button.";

/**
 * The former cold-open line, now landing after the click. Left-aligned and
 * width-capped (unlike the shared centred BottomLine) so it stays clear of
 * the full-height checkout panel on the right and the browser window above,
 * satisfying the "type never overlaps UI" rule now that this line shares a
 * frame with real UI instead of a blank ink screen.
 */
const WebsiteHeadline: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const holdDur = 62;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const rise = at(fadeIn, 24, 0);

  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        bottom: 130,
        maxWidth: 1300,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <span style={{ ...displayStyle(70, C.bone), whiteSpace: "normal", textAlign: "left" }}>
        {WEBSITE_HEADLINE}
      </span>
    </div>
  );
};

const Beat1Website: React.FC = () => {
  const frame = useCurrentFrame();
  const winP = prog(frame, 0, 12, EASE.out);
  const clickP = prog(frame, 54, 5, EASE.out) * (1 - prog(frame, 66, 5, EASE.out));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <div
        style={{
          position: "absolute",
          left: WIN_LEFT,
          top: WIN_TOP,
          width: WIN_W,
          height: WIN_H,
          opacity: winP,
          transform: `translateY(${at(winP, 40, 0)}px) scale(${at(winP, 0.97, 1)})`,
          borderRadius: 20,
          boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <BrowserChrome />
        <BakeryPage clickP={clickP} />
      </div>

      <Cursor />
      <CheckoutPanel />

      <WebsiteHeadline start={104} />
      <SmallCaption text="The shop keeps its customer. Sprint does the delivery." start={112} holdDur={58} />
    </AbsoluteFill>
  );
};

// --- beat 2: the till (180-360) -----------------------------------------------
// The order card lands, the owner taps Accept around frame 250 (relative
// frame 70), and the payout chip lands right behind it in the same beat,
// per the council: the payout must land with the accept, not later.

const SHOP_PHONE_X = 540;
const SHOP_PHONE_Y = 560;

const MerchantScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const headerP = prog(frame, 6, 14, EASE.out);
  const cardP = prog(frame, 20, 16, EASE.overshoot);
  const tapP = prog(frame, 70, 10, EASE.overshoot);
  const flipP = prog(frame, 82, 14, EASE.out);
  const payoutP = prog(frame, 98, 16, EASE.overshoot);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, padding: "28px 20px" }}>
      <div style={{ opacity: headerP, transform: `translateY(${at(headerP, 14, 0)}px)` }}>
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 20, color: C.bone }}>
          Thato&apos;s Bakery, orders
        </span>
      </div>

      <div
        style={{
          marginTop: 28,
          opacity: cardP,
          transform: `translateY(${at(cardP, 26, 0)}px) scale(${at(cardP, 0.9, 1)})`,
          background: C.inkSoft,
          borderRadius: 18,
          padding: "18px 18px 20px",
          boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 18, color: C.bone }}>
          2 loaves and milk
        </span>
        <div style={{ marginTop: 6 }}>
          <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 14, color: C.bone, opacity: 0.65 }}>
            Block 8 {"•"} P57
          </span>
        </div>

        <div style={{ marginTop: 16, position: "relative", height: 42 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - flipP,
              borderRadius: 12,
              background: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tapP > 0.05 && flipP < 0.5 ? `0 0 0 4px ${C.greenBright}` : "none",
              transform: `scale(${at(tapP, 1, 1.06)})`,
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 16, color: C.white }}>Accept</span>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: flipP,
              borderRadius: 12,
              background: C.inkSoft,
              border: `1px solid ${C.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 16, color: C.green }}>Rider on the way</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          opacity: payoutP,
          transform: `translateY(${at(payoutP, -18, 0)}px) scale(${at(payoutP, 0.85, 1)})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 999,
            background: C.green,
            boxShadow: "0 12px 22px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 14, color: C.white }}>
            P42.75 to you on delivery
          </span>
        </div>
      </div>
    </div>
  );
};

const Beat2Till: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <PhoneFrame x={SHOP_PHONE_X} y={SHOP_PHONE_Y}>
      <MerchantScreen />
    </PhoneFrame>

    <div style={{ position: "absolute", left: 900, top: 420, width: 900 }}>
      <SideLine text="Orders hit your till. Money follows." start={10} />
    </div>
  </AbsoluteFill>
);

// --- beat 3: whatsapp (360-510), compressed -----------------------------------

const CHAT_W = 460;
const CHAT_H = 700;
const CHAT_LEFT = (FILM_W - CHAT_W) / 2;
const CHAT_TOP = 70;

const WA_WALLPAPER = "#0B141A";
const WA_OUT = "#005C4B";
const WA_LINK = "#25D366";

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

const Beat3WhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const tapP = prog(frame, 64, 10, EASE.overshoot);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
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

        <ChatBubble align="left" delay={34} top={126} bg={C.bone} width={360}>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 22, color: C.ink }}>
            Thato&apos;s Bakery
          </span>
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

        <ChatBubble align="left" delay={82} top={380} bg={C.bone} width={340}>
          <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 22, color: C.ink }}>
            Paid. Track your rider:
          </span>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: 999, background: WA_LINK }}>
              <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 16, color: C.ink }}>Track order</span>
            </div>
          </div>
        </ChatBubble>
      </div>

      <BottomLine text="Customers can order straight in WhatsApp." start={14} holdDur={118} size={72} />
    </AbsoluteFill>
  );
};

// --- beat 4: the rider (510-690) ----------------------------------------------
// The council's biggest finding: the physical machine must be seen. The
// real Veo rider clip (the same concept/shot3.mp4 V2 dims to 35 percent
// opacity for its tracking beat) now plays full frame, bright, no whole
// frame scrim. Only a bottom gradient behind the caption for legibility,
// and a small scaled-down tracking card in the top right corner rather
// than a full centre phone.

const RIDER_CARD_BOX = PHONE_SCREEN_W + PHONE_BEZEL * 2 + 60; // 388
const RIDER_CARD_BOX_H = PHONE_SCREEN_H + PHONE_BEZEL * 2 + 60; // 688
const RIDER_CARD_SCALE = 0.46;

const TrackingCorner: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: 60,
      top: 70,
      width: RIDER_CARD_BOX,
      height: RIDER_CARD_BOX_H,
      transform: `scale(${RIDER_CARD_SCALE})`,
      transformOrigin: "top right",
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <PhoneFrame x={RIDER_CARD_BOX / 2} y={RIDER_CARD_BOX_H / 2} delay={26}>
        <ScreenImg file="tracking.png" />
      </PhoneFrame>
    </div>
  </div>
);

const Beat4Rider: React.FC = () => {
  const frame = useCurrentFrame();
  const scrimP = prog(frame, 34, 16, EASE.out);

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

      {/* A bottom-only legibility scrim for the caption, never a full-frame
          dim: the footage stays the bright hero, per the council's ruling. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 380,
          opacity: scrimP,
          background: "linear-gradient(to top, rgba(17,17,17,0.72), rgba(17,17,17,0))",
        }}
      />

      <TrackingCorner />
      <Chip text="Live map" delay={40} style={{ left: 1150, top: 150 }} />
      <Chip text="Arrives by 14:35 or we call you" delay={56} style={{ left: 1150, top: 214 }} />

      <BottomLine text="A real rider, watched the whole way." start={40} holdDur={125} size={82} />
    </AbsoluteFill>
  );
};

// --- beat 5: the money (690-750), two seconds flat ----------------------------
// P90 splits into three labelled rows fast, no lingering: the council capped
// this beat's split at two seconds, so the cutaway card from V2 is dropped
// and the row and total transitions are shortened.

const MONEY_ROWS: { text: string; y: number; highlight?: boolean }[] = [
  { text: "P67.50 to the merchant", y: 400 },
  { text: "P16.20 to the rider", y: 520 },
  { text: "P6.30 to Sprint", y: 640, highlight: true },
];

const MoneyRow: React.FC<{ text: string; y: number; delay: number; highlight?: boolean }> = ({
  text,
  y,
  delay,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 20, EASE.out);
  const startY = FILM_H / 2;
  const currentY = at(p, startY, y);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: currentY,
        opacity: p,
        textAlign: "center",
        transform: "translateY(-50%)",
      }}
    >
      <span style={{ ...displayStyle(66, highlight ? C.orange : C.bone), whiteSpace: "normal" }}>{text}</span>
    </div>
  );
};

const Beat5Money: React.FC = () => {
  const frame = useCurrentFrame();
  const totalP = prog(frame, 0, 8, EASE.out) * (1 - prog(frame, 14, 8, EASE.in));

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: FILM_H / 2,
          transform: "translateY(-50%)",
          opacity: totalP,
          textAlign: "center",
        }}
      >
        <span style={{ ...displayStyle(150, C.bone) }}>P90</span>
      </div>

      {MONEY_ROWS.map((row, i) => (
        <MoneyRow key={row.text} text={row.text} y={row.y} delay={12 + i * 6} highlight={row.highlight} />
      ))}

      <BottomLine text="Everyone paid, automatically." start={32} holdDur={18} />
    </AbsoluteFill>
  );
};

// --- beat 6: close (750-900), end card only ------------------------------------
// The five-node "one machine" diagram is cut entirely per the council
// ("PowerPoint fluff"). The close is the end card alone, carried over
// verbatim from V2: cheetah mark, skewed SPRINT lockup, orange slash, the
// two closing lines.

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
  { at: 0, dur: 180, Comp: Beat1Website },
  { at: 180, dur: 180, Comp: Beat2Till },
  { at: 360, dur: 150, Comp: Beat3WhatsApp },
  { at: 510, dur: 180, Comp: Beat4Rider },
  { at: 690, dur: 60, Comp: Beat5Money },
  { at: 750, dur: 150, Comp: EndCard },
];

export const SprintConceptV3: React.FC = () => {
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
    </AbsoluteFill>
  );
};
