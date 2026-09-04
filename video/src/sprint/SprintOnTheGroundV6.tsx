/**
 * Sprint On The Ground V6, 30 seconds, 1920x1080, 30fps.
 *
 * Council-approved board: docs/concept-v6-board.md. THE DEVICE: every beat is
 * a real phone, front and centre, showing a real Pulse capture (never
 * stretched), set in a named Gaborone moment by big Anton scene-type and a
 * beat-specific ambient backdrop tint. No fake stock humans anywhere.
 *
 * Reused verbatim in spirit from SprintConceptV3.tsx and SprintJourneyV5.tsx:
 * PhoneFrame + ScreenImg (identical geometry, 300x600 screen, 14px bezel,
 * never stretched), the WhatsApp chat mock (V3's ChatBubble grammar, now
 * housed inside the phone frame since every beat is device-first here), the
 * order/accept till card (V3's MerchantScreen copy and beats verbatim: "2
 * loaves and milk", Block 8, P57, Accept -> "Rider on the way", "P42.75 to
 * you on delivery"), the branded rider token (V5's RiderIllustration: green
 * bike, orange helmet, green box carrying logo-mark.png, no stock human),
 * the EndCard (V3/V5's cheetah mark + skewed SPRINT lockup + orange slash),
 * and the Audio wiring (audio/v3-score.wav). Same brand.ts tokens (C, EASE,
 * prog, at, displayStyle), no new invented hex.
 *
 * V6-specific colour rule, tighter than V3/V5: green is glow, never paint
 * (box-shadow + border on a dark chip, not a solid fill), orange is reserved
 * for money labels (P57, P42.75, Orange Money) and beat 5's turn, and the
 * existing end-card slash. Ambient backdrop tints stay inside the same six
 * brand hex values (rgba variants only), matching the "no new invented hex"
 * fidelity gate.
 *
 * Approval amendments baked in: beat 3's arrival line strikes in (instant
 * full size, green flash decaying to bone over ~150ms) instead of fading;
 * beat 5's turn ("AND THE PARTS THEY CANNOT.") gets the film's hardest
 * stamp-down, a hit-stop then a scale 1.2->1.0 settle with an orange burst.
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

export const SPRINT_ON_THE_GROUND_V6_DURATION = 900;

const FILM_W = 1920;

// --- shared phone geometry, carried over verbatim from V3/V5 ----------------
const PHONE_SCREEN_W = 300;
const PHONE_SCREEN_H = PHONE_SCREEN_W * 2;
const PHONE_BEZEL = 14;

// Dead centre, every beat: "the phone IS the film."
const PHONE_X = 960;
const PHONE_Y = 540;

type Ease = (n: number) => number;

const PhoneFrame: React.FC<{
  children: React.ReactNode;
  delay?: number;
  x: number;
  y: number;
  ease?: Ease;
}> = ({ children, delay = 0, x, y, ease = EASE.out }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, ease);
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
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
  />
);

/** A tap landing on the screen: green as glow (a ring), never a paint fill. */
const TapRipple: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 20, EASE.out);
  if (p <= 0) return null;
  const scale = at(p, 0.2, 2.6);
  const opacity = (1 - p) * 0.85;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 70,
        height: 70,
        borderRadius: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        border: `3px solid ${C.green}`,
        boxShadow: `0 0 ${20 * (1 - p) + 6}px rgba(58,170,53,0.8)`,
        opacity,
      }}
    />
  );
};

// --- scene-type + caption grammar --------------------------------------------

/** The big Anton "where and when" line, top of frame, above the phone. */
const SceneType: React.FC<{ text: string; start?: number; holdDur?: number; size?: number }> = ({
  text,
  start = 0,
  holdDur = 96,
  size = 58,
}) => {
  const frame = useCurrentFrame();
  const inDur = 7;
  const outDur = 6;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const rise = at(fadeIn, 22, 0);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 64 }}>
      <div style={{ opacity, transform: `translateY(${rise}px)`, maxWidth: 1700, textAlign: "center" }}>
        <span style={{ ...displayStyle(size, C.bone), whiteSpace: "normal" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

/** The plain caption grammar: fade + rise, bottom of frame, below the phone. */
const Caption: React.FC<{ text: string; start: number; holdDur?: number }> = ({ text, start, holdDur = 90 }) => {
  const frame = useCurrentFrame();
  const inDur = 6;
  const outDur = 5;
  const local = frame - start;
  const span = inDur + holdDur + outDur;
  if (local < -1 || local > span + 1) return null;

  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + inDur + holdDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut) * 0.94;
  const rise = at(fadeIn, 18, 0);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 70 }}>
      <div style={{ opacity, transform: `translateY(${rise}px)`, maxWidth: 1400, textAlign: "center" }}>
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 34, color: C.bone }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Approval amendment: the arrival-window caption enters as a mission-objective
 * STRIKE-IN, not a fade. Instant full size (no rise, no scale ramp), a green
 * flash that decays to bone over ~150ms (5 frames at 30fps), plus a brief
 * green glow halo selling the "target acquired" snap.
 */
const StrikeInCaption: React.FC<{ text: string; start: number; holdDur?: number }> = ({
  text,
  start,
  holdDur = 100,
}) => {
  const frame = useCurrentFrame();
  const flashDur = 5;
  const outDur = 6;
  const local = frame - start;
  const span = flashDur + holdDur + outDur;
  if (local < 0 || local > span + 1) return null;

  const decay = prog(frame, start, flashDur, EASE.out); // 0 -> 1: green burns off into bone
  const fadeOut = 1 - prog(frame, start + flashDur + holdDur, outDur, EASE.in);
  const haloOpacity = (1 - decay) * 0.55;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 70 }}>
      <div style={{ position: "relative", opacity: fadeOut, textAlign: "center", maxWidth: 1500 }}>
        <div
          style={{
            position: "absolute",
            inset: "-18px -30px",
            borderRadius: 14,
            opacity: haloOpacity,
            boxShadow: "0 0 46px 12px rgba(58,170,53,0.85)",
          }}
        />
        <div style={{ position: "relative", display: "inline-block" }}>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 36, color: C.green, opacity: 1 - decay }}>
            {text}
          </span>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: TEXT,
              fontWeight: 700,
              fontSize: 36,
              color: C.bone,
              opacity: decay,
            }}
          >
            {text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- ambient backdrop tints ---------------------------------------------------
// All rgba variants of the same six brand.ts hex values: no new invented hex.

const TINT_LUNCH = "radial-gradient(circle at 50% 20%, rgba(244,244,241,0.16) 0%, rgba(17,17,17,1) 68%)";
const TINT_DUSK = "linear-gradient(to top, rgba(58,170,53,0.22) 0%, rgba(17,17,17,1) 55%)";
const TINT_WAIT = "radial-gradient(circle at 50% 58%, rgba(58,170,53,0.11) 0%, rgba(17,17,17,1) 66%)";
const TINT_TILL = "radial-gradient(circle at 50% 76%, rgba(244,244,241,0.14) 0%, rgba(17,17,17,1) 62%)";

const Tint: React.FC<{ gradient: string }> = ({ gradient }) => (
  <div style={{ position: "absolute", inset: 0, background: gradient }} />
);

// --- beat 1: lunch run (0-150) -------------------------------------------------

const Beat1Lunch: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Tint gradient={TINT_LUNCH} />
    <SceneType text="GABORONE. TUESDAY. 13:02." start={0} holdDur={96} size={58} />
    <PhoneFrame x={PHONE_X} y={PHONE_Y} delay={18} ease={EASE.overshoot}>
      <ScreenImg file="home-pulse.png" />
      {/* the tap ripple lands on Mama T's Kitchen card */}
      <TapRipple x={150} y={220} delay={54} />
    </PhoneFrame>
    <Caption text="Lunch, ordered in forty seconds." start={68} holdDur={64} />
  </AbsoluteFill>
);

// --- beat 2: block 8, whatsapp (150-300) --------------------------------------
// Housed inside the phone frame (unlike V3's floating chat card) so this
// beat still reads as a real device, per the film's device-first rule.

const WA_WALLPAPER = "#0B141A";
const WA_OUT = "#005C4B";

const WhatsAppScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const orderP = prog(frame, 26, 14, EASE.overshoot);
  const replyP = prog(frame, 50, 14, EASE.overshoot);
  const highlightP = prog(frame, 74, 12, EASE.overshoot);

  return (
    <div style={{ position: "absolute", inset: 0, background: WA_WALLPAPER, padding: "22px 16px" }}>
      <div
        style={{
          marginLeft: "auto",
          width: 220,
          opacity: orderP,
          transform: `scale(${at(orderP, 0.7, 1)}) translateY(${at(orderP, 14, 0)}px)`,
          transformOrigin: "right center",
          background: WA_OUT,
          borderRadius: 14,
          padding: "10px 14px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 15, color: C.white }}>2 loaves and milk</span>
      </div>

      <div
        style={{
          marginTop: 16,
          width: 250,
          opacity: replyP,
          transform: `scale(${at(replyP, 0.7, 1)}) translateY(${at(replyP, 14, 0)}px)`,
          transformOrigin: "left center",
          background: C.bone,
          borderRadius: 14,
          padding: "12px 14px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 15, color: C.ink }}>Thato&apos;s Bakery</span>
        <div style={{ marginTop: 4, marginBottom: 10 }}>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 13, color: C.orange }}>
            P57 total, deliver 25 min
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: C.ink,
              border: `1.5px solid ${C.orange}`,
              boxShadow: highlightP > 0.05 ? `0 0 ${14 * highlightP}px rgba(247,148,29,0.7)` : "none",
              transform: `scale(${at(highlightP, 1, 1.08)})`,
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 12, color: C.orange }}>Orange Money</span>
          </div>
          <div
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: C.ink,
              border: "1.5px solid rgba(244,244,241,0.25)",
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 12, color: C.bone }}>Cash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Beat2Block8: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Tint gradient={TINT_DUSK} />
    <SceneType text="BLOCK 8. 17:45." start={0} holdDur={96} size={64} />
    <PhoneFrame x={PHONE_X} y={PHONE_Y} delay={16}>
      <WhatsAppScreen />
    </PhoneFrame>
    <Caption text="No app needed. Straight in WhatsApp." start={92} holdDur={44} />
  </AbsoluteFill>
);

// --- beat 3: the wait that isn't (300-480) ------------------------------------
// AMENDMENT: the arrival line strikes in instead of fading. See StrikeInCaption.

const Beat3Wait: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Tint gradient={TINT_WAIT} />
    <SceneType text="PLOT 2147. BLUE GATE OPPOSITE ABC HARDWARE." start={0} holdDur={110} size={44} />
    <PhoneFrame x={PHONE_X} y={PHONE_Y} delay={18}>
      <ScreenImg file="tracking.png" />
    </PhoneFrame>
    <StrikeInCaption text="She knows it lands between 14:28 and 14:35." start={58} holdDur={104} />
  </AbsoluteFill>
);

// --- beat 4: the shop side (480-630) ------------------------------------------
// The order/accept till card, reused from V3's MerchantScreen: same copy,
// same beats (card lands, Accept taps, flips to "Rider on the way", payout
// stamps down), restyled to V6's glow rule: green as a border+glow (never a
// paint fill), orange reserved for the money line.

const MerchantScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = prog(frame, 18, 16, EASE.overshoot);
  const tapP = prog(frame, 70, 10, EASE.overshoot);
  const flipP = prog(frame, 82, 14, EASE.out);
  const payoutP = prog(frame, 98, 16, EASE.overshoot);

  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, padding: "26px 20px" }}>
      <div
        style={{
          opacity: cardP,
          transform: `translateY(${at(cardP, 26, 0)}px) scale(${at(cardP, 0.9, 1)})`,
          background: C.inkSoft,
          borderRadius: 18,
          padding: "20px 18px 22px",
          boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 19, color: C.bone }}>2 loaves and milk</span>
        <div style={{ marginTop: 6 }}>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 14, color: C.orange }}>Block 8 {"•"} P57</span>
        </div>

        <div style={{ marginTop: 18, position: "relative", height: 44 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - flipP,
              borderRadius: 12,
              background: C.ink,
              border: `2px solid ${C.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tapP > 0.05 && flipP < 0.5 ? `0 0 ${18 * tapP}px rgba(58,170,53,0.75)` : "0 0 10px rgba(58,170,53,0.3)",
              transform: `scale(${at(tapP, 1, 1.06)})`,
            }}
          >
            <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 16, color: C.green }}>Accept</span>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: flipP,
              borderRadius: 12,
              background: C.inkSoft,
              border: `1.5px solid ${C.green}`,
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
          marginTop: 18,
          opacity: payoutP,
          transform: `translateY(${at(payoutP, -18, 0)}px) scale(${at(payoutP, 0.82, 1)})`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "11px 18px",
            borderRadius: 999,
            background: C.ink,
            border: `2px solid ${C.orange}`,
            boxShadow: `0 0 ${18 * payoutP}px rgba(247,148,29,0.6)`,
          }}
        >
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 15, color: C.orange }}>
            P42.75 to you on delivery
          </span>
        </div>
      </div>
    </div>
  );
};

const Beat4Till: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Tint gradient={TINT_TILL} />
    <SceneType text="MAMA T'S TILL." start={0} holdDur={94} size={62} />
    <PhoneFrame x={PHONE_X} y={PHONE_Y} delay={14}>
      <MerchantScreen />
    </PhoneFrame>
    <Caption text="The shop is paid before the rider leaves the gate." start={106} holdDur={30} />
  </AbsoluteFill>
);

// --- beat 5: the claim (630-780) -----------------------------------------------
// AMENDMENT: this is the film's biggest moment. Fast phone-screen flicks,
// a hit-stop freeze, then the turn slams in at scale 1.2 settling to 1.0
// with an orange burst, followed by four rapid type beats.

const FLICK_FILES = ["catalog.png", "payment.png", "ops.png", "tracking.png"];
const B5_FLICK_START = 8;
const B5_FLICK_STEP = 12;
const B5_HITSTOP_START = 56;
const B5_HITSTOP_DUR = 8;
const B5_TURN_START = 64;
const B5_RAPID_START = 101;

const RAPID_BEATS = [
  "55 branches.",
  "A real fleet, 20 years on these roads.",
  "WhatsApp ordering.",
  "Any shop's own website.",
];

const HitStopDim: React.FC<{ start: number; dur: number }> = ({ start, dur }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0 || local > dur + 8) return null;
  const inP = prog(frame, start, dur, EASE.out);
  const outP = prog(frame, start + dur, 6, EASE.out);
  const opacity = inP * (1 - outP) * 0.55;
  return <div style={{ position: "absolute", inset: 0, background: C.ink, opacity }} />;
};

/** The orange burst behind the turn: a flash plus three expanding rings. */
const Burst: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0 || local > 26) return null;
  const ringP = prog(frame, start, 20, EASE.out);
  const flashP = prog(frame, start, 6, EASE.out);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(247,148,29,0.85)", opacity: 1 - flashP }} />
      {[0, 1, 2].map((i) => {
        const rp = Math.max(0, Math.min(1, ringP - i * 0.12));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `4px solid ${C.orange}`,
              opacity: (1 - rp) * 0.8,
              transform: `scale(${at(rp, 0.3, 5.5)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** The hardest stamp-down of the film: instant, scale 1.2 -> 1.0, orange. */
const TurnStamp: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const holdDur = 31;
  const outDur = 6;
  if (local < 0 || local > holdDur + outDur + 1) return null;

  const settle = prog(frame, start, 10, EASE.out);
  const scale = at(settle, 1.2, 1.0);
  const fadeOut = 1 - prog(frame, start + holdDur, outDur, EASE.in);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: fadeOut, transform: `scale(${scale})`, textAlign: "center", maxWidth: 1750 }}>
        <span style={{ ...displayStyle(118, C.orange), whiteSpace: "normal" }}>AND THE PARTS THEY CANNOT.</span>
      </div>
    </AbsoluteFill>
  );
};

const RapidBeat: React.FC<{ text: string; start: number; dur: number }> = ({ text, start, dur }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0 || local > dur + 1) return null;
  const inDur = 3;
  const outDur = 3;
  const fadeIn = prog(frame, start, inDur, EASE.out);
  const fadeOut = 1 - prog(frame, start + dur - outDur, outDur, EASE.in);
  const opacity = Math.min(fadeIn, fadeOut);
  const scale = at(fadeIn, 0.85, 1);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center", maxWidth: 1750 }}>
        <span style={{ ...displayStyle(96, C.bone), whiteSpace: "normal" }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};

const Beat5Claim: React.FC = () => {
  const frame = useCurrentFrame();
  const flickCutoff = B5_HITSTOP_START + B5_HITSTOP_DUR;
  const flickLocal = Math.max(0, Math.min(FLICK_FILES.length * B5_FLICK_STEP - 1, frame - B5_FLICK_START));
  const file = FLICK_FILES[Math.min(FLICK_FILES.length - 1, Math.floor(flickLocal / B5_FLICK_STEP))];

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <SceneType text="EVERYTHING WANZY AND GABS EATS DO." start={0} holdDur={44} size={54} />
      {frame < flickCutoff && (
        <PhoneFrame x={PHONE_X} y={PHONE_Y} delay={4}>
          <ScreenImg file={file} />
        </PhoneFrame>
      )}
      <HitStopDim start={B5_HITSTOP_START} dur={B5_HITSTOP_DUR} />
      <Burst start={B5_TURN_START} />
      <TurnStamp start={B5_TURN_START} />
      {RAPID_BEATS.map((text, i) => (
        <RapidBeat key={text} text={text} start={B5_RAPID_START + i * 12} dur={12} />
      ))}
    </AbsoluteFill>
  );
};

// --- beat 6: close (780-900) ---------------------------------------------------
// The branded rider token (V5's RiderIllustration, verbatim: green bike,
// orange helmet, green box carrying logo-mark.png) crosses the frame, then
// the end card, adapted with the new headline plus the existing tagline.

const RIDER_SCALE = 1.5;
const RIDER_W = 190 * RIDER_SCALE;
const RIDER_H = 150 * RIDER_SCALE;
const RIDER_CROSS_DUR = 50;
const ENDCARD_START = 46;

const RiderCross: React.FC = () => {
  const frame = useCurrentFrame();
  const travel = prog(frame, 0, RIDER_CROSS_DUR, EASE.wipe);
  const x = at(travel, -RIDER_W - 40, FILM_W + 40);
  const bob = Math.sin(frame * 0.35) * 5;
  const fadeOut = 1 - prog(frame, RIDER_CROSS_DUR - 8, 10, EASE.in);
  const s = RIDER_SCALE;

  return (
    <div style={{ position: "absolute", left: x, top: 560 + bob, width: RIDER_W, height: RIDER_H, opacity: fadeOut }}>
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

const ENDCARD_LOCKUP_SIZE = 140;

const EndCard: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  if (f < 0) return null;
  const logoP = prog(f, 0, 7, EASE.out);
  const nameP = prog(f, 5, 8, EASE.overshoot);
  const slashP = prog(f, 9, 8, EASE.overshoot);
  const lineP = prog(f, 15, 8, EASE.out);
  const tagP = prog(f, 23, 8, EASE.out);

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
          <span style={{ ...displayStyle(50, C.bone), whiteSpace: "normal" }}>The whole city, in your hand.</span>
        </div>
        <div style={{ opacity: tagP, transform: `translateY(${at(tagP, 14, 0)}px)` }}>
          <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: 28, color: C.bone }}>
            Built for Gaborone. Moving with you.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Beat6Close: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {frame < RIDER_CROSS_DUR + 10 && <RiderCross />}
      <EndCard start={ENDCARD_START} />
    </AbsoluteFill>
  );
};

// --- assembly ------------------------------------------------------------------

const BEATS = [
  { at: 0, dur: 150, Comp: Beat1Lunch },
  { at: 150, dur: 150, Comp: Beat2Block8 },
  { at: 300, dur: 180, Comp: Beat3Wait },
  { at: 480, dur: 150, Comp: Beat4Till },
  { at: 630, dur: 150, Comp: Beat5Claim },
  { at: 780, dur: 120, Comp: Beat6Close },
];

export const SprintOnTheGroundV6: React.FC = () => {
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
