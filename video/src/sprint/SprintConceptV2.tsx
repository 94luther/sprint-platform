/**
 * Sprint Concept Film V2, 47 seconds, 1920x1080 landscape, 30fps.
 *
 * The first concept film (SprintConcept.tsx) was rejected for showing mood
 * instead of the product. This version shows THE MACHINE: the real app
 * screens, a fictional shop's own website with Sprint checkout bolted on,
 * a WhatsApp order flow, live tracking, the payout split, and the five
 * channels feeding one dispatch engine. Every screen is either a real
 * capture from public/appdemo or a JSX rebuild that respects the brand
 * colour system, never a new invented hex.
 *
 * v2.1 panel rulings (2026-08-30): business first, consumer second. Beat
 * order is now OPEN, WEBSITE, THE SHOP'S PHONE (new merchant payout beat),
 * WHATSAPP, THE APP (compressed to catalog + checkout only), TRACKING,
 * MONEY, ONE MACHINE + CLOSE. Component names below still carry their
 * original beat numbers (Beat2App, Beat3Website, etc) for git-blame
 * continuity; the BEATS assembly array at the bottom is the source of
 * truth for playback order and timing.
 *
 * Built from the same primitives as SprintConcept.tsx (brand.ts tokens, the
 * prog/at/EASE motion grammar, Anton display type entering on a 200ms
 * fade+rise and exiting on 150ms, staticFile media) and the PhoneFrame
 * pattern from SprintAppDemo.tsx, reimplemented locally at a landscape
 * centre-left scale instead of imported, so this file stays self contained.
 *
 * No Audio tag yet, the score comes later.
 */

import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { at, C, displayStyle, EASE, fontsReady, PAD, prog, SANS, SKEW, TEXT } from "./brand";

export const SPRINT_CONCEPT_V2_DURATION = 1410;

const FILM_W = 1920;
const FILM_H = 1080;

// --- shared phone geometry ---------------------------------------------------
// The real captures in public/appdemo are 1024x2048, exactly 1:2. Keeping the
// frame at that same ratio means objectFit cover never crops or stretches a
// pixel of real UI.
const PHONE_SCREEN_W = 300;
const PHONE_SCREEN_H = PHONE_SCREEN_W * 2; // 600, preserves 1024:2048
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

// --- shared chip -------------------------------------------------------------
// Every caption chip and payment pill in this film. Orange is rationed to the
// end card slash and the one money row highlight, so this defaults to green.

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

// --- shared type treatment ----------------------------------------------------
// Anton, entering on a 200ms fade with rise (6 frames), exiting on 150ms (5
// frames). Two placements: bottom centre for narrative lines, full centre for
// the cold open.

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

// --- beat 1: cold open (0-90) -------------------------------------------------
// One line, full centre, big. Holds to a hard cut, no exit fade of its own:
// the Sequence boundary at frame 90 is the cut.

const OPEN_TEXT = "Give your shop a delivery button.";

const Beat1Open: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, 6, EASE.out);
  const rise = at(p, 26, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: p,
          transform: `translateY(${rise}px)`,
          textAlign: "center",
          maxWidth: 1560,
          padding: `0 ${PAD}px`,
        }}
      >
        <span style={{ ...displayStyle(108, C.bone), whiteSpace: "normal" }}>{OPEN_TEXT}</span>
      </div>
    </AbsoluteFill>
  );
};

// --- beat 5 (new order): the app (720-870, 150f), compressed -------------------
// v2.1: compressed to catalog then checkout fees only, the cart step cut.
// Phone centre-left running the real catalog and payment captures with a
// quick crossfade and a slight scale settle on the swap. Type line and one
// caption chip (the fees callout) sit beside the phone on the right; the
// "search the whole city" chip was cut with the cart step.

const APP_PHONE_X = 540;
const APP_PHONE_Y = 560;
const APP_BOUNDARIES = [0, 75, 150];
const APP_FILES = ["catalog.png", "payment.png"];
const APP_CROSSFADE = 14;

const AppScreens: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {APP_FILES.map((file, i) => {
        const start = APP_BOUNDARIES[i];
        const end = APP_BOUNDARIES[i + 1];
        const fadeIn = i === 0 ? 1 : prog(frame, start - APP_CROSSFADE, APP_CROSSFADE, EASE.out);
        const fadeOut = i === APP_FILES.length - 1 ? 1 : 1 - prog(frame, end - APP_CROSSFADE, APP_CROSSFADE, EASE.in);
        const opacity = Math.min(fadeIn, fadeOut);
        const settle = i === 0 ? 1 : at(prog(frame, start - APP_CROSSFADE, APP_CROSSFADE, EASE.out), 1.05, 1);
        return <ScreenImg key={file} file={file} opacity={opacity} scale={settle} />;
      })}
    </>
  );
};

const Beat2App: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <PhoneFrame x={APP_PHONE_X} y={APP_PHONE_Y}>
      <AppScreens />
    </PhoneFrame>

    <div style={{ position: "absolute", left: 900, top: 380, width: 900 }}>
      <SideLine text="Your customers order in the app." start={10} />
    </div>

    <Chip text="Fees shown before you pay" delay={90} style={{ left: 900, top: 500 }} />
  </AbsoluteFill>
);

/** The Anton narrative line placed beside the phone rather than bottom centre. */
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

// --- beat 2 (new order): the website (90-300, 210f), unchanged -----------------
// A fictional browser window with a JSX bakery landing page, an animated
// cursor that clicks the Sprint button, and a checkout panel that slides in
// from the right rebuilding the payment rails as chips.

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

/** A simple cursor arrow that walks to the CTA button and clicks it. */
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const moveP = prog(frame, 34, 54, EASE.out);
  const x = at(moveP, CURSOR_START_X, BTN_CX - 12);
  const y = at(moveP, CURSOR_START_Y, BTN_CY - 10);
  const clickP = prog(frame, 88, 8, EASE.overshoot);
  const ringP = prog(frame, 90, 22, EASE.out);

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
          opacity: prog(frame, 30, 8, EASE.out),
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
  const slideP = prog(frame, 96, 30, EASE.out);
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
          const p = prog(frame, 130 + i * 10, 14, EASE.overshoot);
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

const Beat3Website: React.FC = () => {
  const frame = useCurrentFrame();
  const winP = prog(frame, 0, 16, EASE.out);
  const clickP = prog(frame, 88, 6, EASE.out) * (1 - prog(frame, 100, 6, EASE.out));

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

      <BottomLine text="Or on any shop's own website." start={20} holdDur={175} />
      <SmallCaption text="The shop keeps its customer. Sprint does the delivery." start={30} holdDur={165} />
    </AbsoluteFill>
  );
};

// --- beat 3 (new order): the shop's phone (300-510, 210f), NEW v2.1 ------------
// Finding B: the shop owner never felt the operational relief. A merchant
// notification view, JSX rebuilt like the WhatsApp mock but staged inside
// the shared PhoneFrame chrome: an order card pops in, a cursor-free tap
// highlight lands on Accept after a beat, the card flips to "Rider on the
// way", then a green payout chip (never orange, that colour stays rationed
// to the money-row highlight and the end card slash) slides in underneath.

const SHOP_PHONE_X = 540;
const SHOP_PHONE_Y = 560;

const MerchantScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const headerP = prog(frame, 6, 14, EASE.out);
  const cardP = prog(frame, 24, 16, EASE.overshoot);
  const tapP = prog(frame, 92, 10, EASE.overshoot);
  const flipP = prog(frame, 104, 14, EASE.out);
  const payoutP = prog(frame, 140, 16, EASE.overshoot);

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

const Beat3bShopPhone: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <PhoneFrame x={SHOP_PHONE_X} y={SHOP_PHONE_Y}>
      <MerchantScreen />
    </PhoneFrame>

    <div style={{ position: "absolute", left: 900, top: 420, width: 900 }}>
      <SideLine text="Orders land on your phone. Money follows." start={10} />
    </div>
  </AbsoluteFill>
);

// --- beat 4: whatsapp (510-720, 210f), unchanged --------------------------------
// A JSX chat mock: dark wallpaper, green outgoing bubbles right, white
// incoming left, an order card with two payment chips, a tap highlight, and
// a paid confirmation with a tracking link chip.

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

const Beat4WhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const tapP = prog(frame, 92, 10, EASE.overshoot);

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
        <ChatBubble align="right" delay={14} top={36} bg={WA_OUT}>
          <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 22, color: C.white }}>
            2 loaves and milk to Block 8
          </span>
        </ChatBubble>

        <ChatBubble align="left" delay={44} top={126} bg={C.bone} width={360}>
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

        <ChatBubble align="left" delay={118} top={380} bg={C.bone} width={340}>
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

      <BottomLine text="Or straight in WhatsApp." start={20} holdDur={175} />
    </AbsoluteFill>
  );
};

// --- beat 6 (new order): the tracking (870-1080, 210f), unchanged --------------
// shot3.mp4 full bleed, dimmed to 35 percent, the real tracking capture in a
// centred phone, two caption chips.

const Beat5Tracking: React.FC = () => {
  const frame = useCurrentFrame();
  const dim = prog(frame, 0, 14, EASE.out) * 0.65;

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
      <AbsoluteFill style={{ backgroundColor: C.ink, opacity: dim }} />

      <PhoneFrame x={FILM_W / 2} y={FILM_H / 2}>
        <ScreenImg file="tracking.png" />
      </PhoneFrame>

      <Chip text="Live map" delay={30} style={{ left: 1210, top: 400 }} />
      <Chip text="Arrives by 14:35 or we call you" delay={54} style={{ left: 1210, top: 460 }} />

      <BottomLine text="They watch it come." start={16} holdDur={185} />
    </AbsoluteFill>
  );
};

// --- beat 7 (new order): the money (1080-1230, 150f), retimed ------------------
// The P90 total splits into three rows that slide apart, the Sprint row
// carrying the film's one money highlight in orange. v2.1 shrank this beat
// by 30 frames, so the closing line starts sooner to still land before cut.

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
  const p = prog(frame, delay, 30, EASE.out);
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

const Beat6Money: React.FC = () => {
  const frame = useCurrentFrame();
  const totalP = prog(frame, 0, 18, EASE.out) * (1 - prog(frame, 22, 16, EASE.in));
  const cardP = prog(frame, 92, 18, EASE.out);

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
        <MoneyRow key={row.text} text={row.text} y={row.y} delay={25 + i * 8} highlight={row.highlight} />
      ))}

      <div
        style={{
          position: "absolute",
          right: PAD,
          top: 100,
          width: 384,
          height: 216,
          borderRadius: 18,
          overflow: "hidden",
          opacity: cardP,
          transform: `translateY(${at(cardP, -24, 0)}px)`,
          boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
        }}
      >
        <Img
          src={staticFile("concept/shot4.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <BottomLine text="The money splits itself, fairly." start={92} holdDur={40} />
    </AbsoluteFill>
  );
};

// --- beat 8 (new order): one machine, then close (1230-1410, 180f), retimed ----
// Five channel nodes draw thin lines into a central Sprint node, the line
// holds, then a hard cut lands on the end card. v2.1 shrank the diagram hold
// by 30 frames and rehomed the old opening line here as a small caption
// under "Five ways in. One machine.", since it now describes the network
// diagram's five channels rather than the film's opening claim.

const DIAGRAM_CX = FILM_W / 2;
const DIAGRAM_CY = 420;
const DIAGRAM_R = 250;

const polar = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: DIAGRAM_CX + DIAGRAM_R * Math.cos(rad), y: DIAGRAM_CY + DIAGRAM_R * Math.sin(rad) };
};

const NODES = [
  { label: "The app", angle: -90 },
  { label: "The web", angle: -18 },
  { label: "The shop's site", angle: 54 },
  { label: "WhatsApp", angle: 126 },
  { label: "Corporate", angle: 198 },
].map((n, i) => ({ ...n, ...polar(n.angle), delay: 6 + i * 10 }));

const NetworkDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const centerP = prog(frame, 0, 10, EASE.out);

  return (
    <>
      <svg
        width={FILM_W}
        height={FILM_H}
        style={{ position: "absolute", inset: 0 }}
      >
        {NODES.map((n) => {
          const lineP = prog(frame, n.delay + 10, 22, EASE.out);
          const length = Math.hypot(n.x - DIAGRAM_CX, n.y - DIAGRAM_CY);
          return (
            <line
              key={n.label}
              x1={n.x}
              y1={n.y}
              x2={DIAGRAM_CX}
              y2={DIAGRAM_CY}
              stroke={C.bone}
              strokeOpacity={0.35}
              strokeWidth={2}
              strokeDasharray={length}
              strokeDashoffset={length * (1 - lineP)}
            />
          );
        })}
      </svg>

      {NODES.map((n) => {
        const p = prog(frame, n.delay, 12, EASE.overshoot);
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              transform: `translate(-50%, -50%) scale(${at(p, 0.5, 1)})`,
              opacity: p,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: C.inkSoft,
                border: `2px solid ${C.green}`,
                margin: "0 auto",
              }}
            />
            <div style={{ marginTop: 10 }}>
              <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 22, color: C.bone, whiteSpace: "pre" }}>
                {n.label}
              </span>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: DIAGRAM_CX,
          top: DIAGRAM_CY,
          transform: `translate(-50%, -50%) scale(${at(centerP, 0.6, 1)})`,
          opacity: centerP,
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: C.ink,
          boxShadow: `0 0 0 4px ${C.green}, 0 20px 40px rgba(0,0,0,0.5)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img src={staticFile("logo-mark.png")} style={{ width: 58 }} />
      </div>
    </>
  );
};

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

const Beat7Machine: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Sequence from={0} durationInFrames={120}>
      <AbsoluteFill>
        <NetworkDiagram />
        <BottomLine text="Five ways in. One machine." start={80} holdDur={40} size={92} />
        <SmallCaption
          text="Everything in Gaborone gets a Sprint delivery option."
          start={88}
          holdDur={24}
        />
      </AbsoluteFill>
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);

// --- assembly ------------------------------------------------------------------

// v2.1 order: OPEN, WEBSITE, THE SHOP'S PHONE (new), WHATSAPP,
// THE APP (compressed), TRACKING, MONEY, ONE MACHINE + CLOSE.
const BEATS = [
  { at: 0, dur: 90, Comp: Beat1Open },
  { at: 90, dur: 210, Comp: Beat3Website },
  { at: 300, dur: 210, Comp: Beat3bShopPhone },
  { at: 510, dur: 210, Comp: Beat4WhatsApp },
  { at: 720, dur: 150, Comp: Beat2App },
  { at: 870, dur: 210, Comp: Beat5Tracking },
  { at: 1080, dur: 150, Comp: Beat6Money },
  { at: 1230, dur: 180, Comp: Beat7Machine },
];

export const SprintConceptV2: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading brand fonts"));

  useEffect(() => {
    fontsReady.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {BEATS.map(({ at: from, dur, Comp }) => (
        <Sequence key={from} from={from} durationInFrames={dur}>
          <Comp />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
