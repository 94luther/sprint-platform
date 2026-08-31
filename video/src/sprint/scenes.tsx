/**
 * The seven scenes of "Run Like The Cheetah".
 *
 * Each scene is mounted inside its own <Sequence>, so `useCurrentFrame()` here
 * is always scene-relative and starts at 0. Timings below are therefore local
 * frame numbers, which is what makes them readable.
 */

import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  at,
  C,
  displayStyle,
  EASE,
  PAD,
  prog,
  textStyle,
  TYPE,
  W,
  WORDMARK,
} from "./brand";
import { Cheetah } from "./Cheetah";
import { MaskLine, Pinstripes } from "./primitives";

// --- shared bits ------------------------------------------------------------

/** Orange rule + tracked label. Their collateral uses this pairing constantly. */
const Kicker: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  ruleColor?: string;
}> = ({ text, delay = 0, color = C.white, ruleColor = C.orange }) => {
  const frame = useCurrentFrame();
  const rule = prog(frame, delay, 4, EASE.out);
  const slide = prog(frame, delay + 2, 8, EASE.out);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div
        style={{
          width: 64,
          height: 6,
          background: ruleColor,
          transform: `scaleX(${rule})`,
          transformOrigin: "left center",
        }}
      />
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            ...textStyle(TYPE.kicker, 900, color),
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            transform: `translateX(${at(slide, -70, 0)}px)`,
            opacity: slide,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

/** Standard left-aligned scene body, inset to the safe margin. */
const Stack: React.FC<{
  children: React.ReactNode;
  x?: number;
  align?: "flex-start" | "center";
}> = ({ children, x = 0, align = "flex-start" }) => (
  <AbsoluteFill
    style={{
      padding: PAD,
      justifyContent: "center",
      alignItems: align,
      transform: `translateX(${x}px)`,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 26,
        alignItems: align,
        width: "100%",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// --- 1. cold open -----------------------------------------------------------

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();

  // Type and rails drift at different speeds: parallax reads as travel.
  const drift = at(prog(frame, 22, 36, (n) => n), 0, -30);
  const railDrift = at(prog(frame, 22, 36, (n) => n), 0, -96);

  // Both lines punch out to the left before the wipe arrives.
  const exit = prog(frame, 58, 14, EASE.in);
  const exitB = prog(frame, 55, 14, EASE.in);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {/* three orange rails, staggered */}
      {[
        { y: 470, h: 10, d: 0, w: "78%" },
        { y: 1418, h: 6, d: 2, w: "56%" },
        { y: 1470, h: 14, d: 4, w: "88%" },
      ].map((r, i) => {
        const p = prog(frame, r.d, 9, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: PAD,
              top: r.y,
              width: r.w,
              height: r.h,
              background: C.orange,
              transform: `translateX(${railDrift}px) scaleX(${p})`,
              transformOrigin: "left center",
            }}
          />
        );
      })}

      {/* green hairline flicks on late and stays */}
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: 1000,
          height: 4,
          width: "42%",
          background: C.green,
          transform: `scaleX(${prog(frame, 52, 3, EASE.out)})`,
          transformOrigin: "left center",
        }}
      />

      <Stack x={drift}>
        <div style={{ transform: `translateX(${at(exit, 0, -1500)}px)` }}>
          <MaskLine delay={6} dur={9}>
            <h1 style={displayStyle(TYPE.headline)}>SOME THINGS</h1>
          </MaskLine>
        </div>
        <div style={{ transform: `translateX(${at(exitB, 0, -1500)}px)` }}>
          <MaskLine delay={10} dur={9}>
            <h1 style={displayStyle(TYPE.headline)}>
              CAN&apos;T <span style={{ color: C.orange }}>WAIT</span>
            </h1>
          </MaskLine>
        </div>
        <div style={{ marginTop: 18 }}>
          <Kicker text="Gaborone · Botswana" delay={14} />
        </div>
      </Stack>
    </AbsoluteFill>
  );
};

// --- 2. cheetah launch ------------------------------------------------------

export const CheetahLaunch: React.FC = () => {
  const frame = useCurrentFrame();

  const runIn = prog(frame, 0, 11, EASE.out);
  const drift = at(prog(frame, 26, 32, (n) => n), 0, 34);
  const push = prog(frame, 58, 8, EASE.in);

  const catX = at(runIn, -900, 140) + drift + at(push, 0, 900);
  const catScale = at(prog(frame, 0, 14, EASE.overshoot), 1.06, 1) + at(push, 0, 0.12);

  return (
    <AbsoluteFill style={{ backgroundColor: C.green }}>
      <Pinstripes color={C.white} opacity={0.08} />

      {/* hard-edged speed streaks trailing the cat, retracting as it settles */}
      {[
        { h: 46, lag: 60, o: 1 },
        { h: 30, lag: 150, o: 0.7 },
        { h: 22, lag: 260, o: 0.45 },
        { h: 14, lag: 380, o: 0.28 },
        { h: 10, lag: 520, o: 0.15 },
      ].map((s, i) => {
        const retract = 1 - prog(frame, 12 + i, 8, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 880 + i * 34,
              left: 0,
              height: s.h,
              width: (s.lag + 200) * retract,
              background: C.ink,
              opacity: s.o * retract,
              transform: `translateX(${catX - s.lag}px)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 760,
          left: 0,
          transform: `translateX(${catX}px) scale(${catScale})`,
        }}
      >
        <Cheetah width={900} color={C.ink} />
      </div>

      <AbsoluteFill style={{ padding: PAD, justifyContent: "flex-end" }}>
        <div style={{ marginBottom: 320, display: "grid", gap: 26 }}>
          <MaskLine delay={14} dur={9}>
            <h1 style={displayStyle(TYPE.mega)}>
              SO WE <span style={{ color: C.ink }}>RUN</span>
            </h1>
          </MaskLine>
          <Kicker text="Express courier & logistics" delay={20} ruleColor={C.ink} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- 3. one hour ------------------------------------------------------------

export const OneHour: React.FC = () => {
  const frame = useCurrentFrame();

  const punch = prog(frame, 0, 14, EASE.overshoot);
  const blockGrow = at(prog(frame, 78, 18, EASE.out), 1, 1.18);
  const slideOut = at(prog(frame, 78, 18, EASE.out), 0, -40);
  const bar = prog(frame, 40, 30, (n) => n); // strictly linear: a literal hour

  return (
    <AbsoluteFill
      style={{ backgroundColor: C.orange, justifyContent: "center" }}
    >
      {/* the slot the numeral is forced through */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 0,
          right: 0,
          height: 680,
          background: C.orange,
          borderTop: `10px solid ${C.ink}`,
          borderBottom: `10px solid ${C.ink}`,
          transform: `scaleY(${blockGrow})`,
        }}
      />

      <AbsoluteFill
        style={{ padding: PAD, justifyContent: "center", overflow: "hidden" }}
      >
        <div style={{ transform: `translateX(${slideOut}px)`, display: "grid", gap: 30 }}>
          <div style={{ marginBottom: 8 }}>
            <Kicker text="Sprint Service" delay={18} color={C.ink} ruleColor={C.ink} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 34,
              height: 560,
            }}
          >
            <span
              style={{
                ...displayStyle(700, C.ink),
                lineHeight: 0.78,
                transform: `scale(${at(punch, 2.4, 1)})`,
                transformOrigin: "left bottom",
                display: "inline-block",
              }}
            >
              1
            </span>
            <MaskLine delay={8} dur={9}>
              <span style={displayStyle(300, C.white)}>HOUR</span>
            </MaskLine>
          </div>

          <MaskLine delay={26} dur={9}>
            <p
              style={{
                ...textStyle(34, 700, C.ink),
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Priority delivery to local destinations
            </p>
          </MaskLine>

          {/* the hour bar: slowest move in the film, which lets the scene hold */}
          <div
            style={{
              height: 8,
              width: 888,
              maxWidth: "100%",
              background: C.ink,
              transform: `scaleX(${bar})`,
              transformOrigin: "left center",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- 4. seventy-five --------------------------------------------------------

export const SeventyFive: React.FC = () => {
  const frame = useCurrentFrame();

  const count = Math.round(at(prog(frame, 0, 18, EASE.out), 0, 75));
  const plus = prog(frame, 18, 5, EASE.overshoot);
  const exit = prog(frame, 70, 10, EASE.in);
  const exitB = prog(frame, 73, 10, EASE.in);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      {/* hairlines streaming right-to-left for the whole scene: constant travel */}
      {[180, 420, 260, 700, 140, 520, 300, 620].map((len, i) => {
        const x = ((frame * 22 + i * 260) % (W + 900)) - 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 1180 + i * 48,
              left: 0,
              height: 4,
              width: len,
              background: C.green,
              opacity: 0.55,
              transform: `translateX(${W - x}px)`,
            }}
          />
        );
      })}

      <AbsoluteFill style={{ padding: PAD, justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            transform: `translateX(${at(exit, 0, -1200)}px)`,
          }}
        >
          <span
            style={{
              ...displayStyle(560, C.orange),
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </span>
          <span
            style={{
              ...displayStyle(260, C.orange),
              transform: `scale(${plus}) translateX(${at(plus, 40, 0)}px)`,
              display: "inline-block",
            }}
          >
            +
          </span>
        </div>

        <div style={{ transform: `translateX(${at(exitB, 0, -1200)}px)` }}>
          <MaskLine delay={6} dur={9}>
            <h1 style={displayStyle(TYPE.sub, C.white)}>DESTINATIONS</h1>
          </MaskLine>
        </div>

        <div style={{ marginTop: 30 }}>
          <Kicker text="Nationwide" delay={15} />
        </div>

        {/* a ticking counter of chevrons along the bottom */}
        <div style={{ display: "flex", gap: 12, marginTop: 60 }}>
          {new Array(12).fill(0).map((_, i) => {
            const p = prog(frame, 22 + i * 3, 4, EASE.overshoot);
            return (
              <div
                key={i}
                style={{
                  width: 34,
                  height: 12,
                  background: C.orange,
                  transform: `skewX(-22deg) scaleX(${p})`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- 5. three lanes ---------------------------------------------------------

const LANES = [
  { word: "DOMESTIC", bg: C.green, fg: C.ink, from: -110, delay: 0 },
  { word: "FREIGHT", bg: C.ink, fg: C.white, from: 110, delay: 6 },
  { word: "WORLDWIDE", bg: C.white, fg: C.orange, from: -110, delay: 12 },
];

export const ThreeLanes: React.FC = () => {
  const frame = useCurrentFrame();
  const shear = [-18, -46, -30];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bone, justifyContent: "center" }}>
      {LANES.map((lane, i) => {
        const p = prog(frame, lane.delay, 8, EASE.wipe);
        const drift = at(prog(frame, 52, 28, (n) => n), 0, shear[i]);
        const out = prog(frame, 80 + i * 4, 10, EASE.in);

        return (
          <div
            key={lane.word}
            style={{
              position: "relative",
              height: 300,
              background: lane.bg,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              paddingLeft: PAD,
              transform: `translateX(${drift}px)`,
            }}
          >
            {/* the globe rises behind the third lane, hard-clipped by the band */}
            {i === 2 && (
              <svg
                width={420}
                height={420}
                viewBox="0 0 400 400"
                style={{
                  position: "absolute",
                  right: 40,
                  top: 60,
                  transform: `scale(${at(prog(frame, 30, 12, EASE.overshoot), 0.6, 1)})`,
                }}
              >
                <circle cx="200" cy="200" r="190" fill={C.green} />
                <ellipse cx="200" cy="200" rx="190" ry="70" fill="none" stroke={C.white} strokeWidth="6" />
                <ellipse cx="200" cy="200" rx="190" ry="140" fill="none" stroke={C.white} strokeWidth="6" />
                <ellipse
                  cx="200"
                  cy="200"
                  rx="80"
                  ry="190"
                  fill="none"
                  stroke={C.white}
                  strokeWidth="6"
                  transform={`rotate(${at(prog(frame, 44, 8, EASE.out), 0, 24)} 200 200)`}
                />
              </svg>
            )}

            <div
              style={{
                transform: `translateX(${at(p, lane.from, 0) * 10 + at(out, 0, lane.from * 12)}px)`,
              }}
            >
              <h2 style={displayStyle(lane.word.length > 8 ? 118 : 150, lane.fg)}>
                {lane.word}
              </h2>
            </div>

            {/* tick mark that snaps out as the word lands */}
            <div
              style={{
                position: "absolute",
                left: PAD,
                bottom: 44,
                height: 6,
                width: 90,
                background: lane.fg,
                transform: `scaleX(${prog(frame, lane.delay + 8, 3, EASE.overshoot)})`,
                transformOrigin: "left center",
              }}
            />
          </div>
        );
      })}

      <div style={{ padding: PAD, paddingTop: 44 }}>
        <MaskLine delay={36} dur={8}>
          <p
            style={{
              ...textStyle(TYPE.body, 700, C.ink),
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            International via Aramex
          </p>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

// --- 6. number one ----------------------------------------------------------

export const NumberOne: React.FC = () => {
  const frame = useCurrentFrame();

  const bars = at(prog(frame, 0, 6, EASE.out), 0, 210) + at(prog(frame, 64, 14, EASE.out), 0, 90);
  const catScale = at(prog(frame, 0, 16, EASE.out), 1.35, 1);
  const catX = at(prog(frame, 0, 16, EASE.out), -60, 60) + at(prog(frame, 30, 34, (n) => n), 0, 70);
  const bandOpen = prog(frame, 10, 4, EASE.out);
  const squeeze = at(prog(frame, 64, 14, EASE.out), 1, 1.06);

  return (
    <AbsoluteFill style={{ backgroundColor: C.green, overflow: "hidden" }}>
      <Pinstripes color={C.white} opacity={0.08} />

      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          transform: `translateX(${catX}px) scale(${catScale})`,
        }}
      >
        <Cheetah width={1400} color={C.ink} />
      </div>

      {/* letterbox bars squeeze the frame */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bars, background: C.ink }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bars, background: C.ink }} />

      <AbsoluteFill style={{ justifyContent: "center" }}>
        {/* Two lines: "YOUR NUMBER 1 COURIER" on one line overflows 1080px at
            display size, and displayStyle sets whiteSpace:pre so it clips. */}
        <div
          style={{
            background: C.ink,
            padding: `30px ${PAD}px`,
            transform: `scaleX(${bandOpen * squeeze})`,
            transformOrigin: "left center",
          }}
        >
          <MaskLine delay={14} dur={9}>
            <h1 style={displayStyle(118, C.white)}>
              YOUR NUMBER{" "}
              <span style={{ color: C.orange, fontSize: 130 }}>1</span>
            </h1>
          </MaskLine>
          <MaskLine delay={19} dur={9}>
            <h1 style={displayStyle(118, C.white)}>COURIER</h1>
          </MaskLine>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "flex-end", padding: PAD }}>
        <div style={{ marginBottom: 40 }}>
          <Kicker text="In Botswana" delay={23} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- 7. logo lockup ---------------------------------------------------------

export const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const slash = at(prog(frame, 0, 9, EASE.overshoot), 0, 1);
  const catIn = prog(frame, 6, 10, EASE.out);
  const rule = prog(frame, 32, 5, EASE.out);
  const twitch = at(prog(frame, 108, 6, EASE.overshoot), 0, 6);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 880, transform: `translateX(${twitch}px)` }}>
        {/* green slash draws itself, then the cat lands on it */}
        <div style={{ position: "relative", height: 300 }}>
          <div
            style={{
              position: "absolute",
              left: -20,
              top: 158,
              width: 920,
              height: 92,
              background: C.green,
              transform: `skewX(-26deg) scaleX(${slash})`,
              transformOrigin: "left center",
            }}
          />
          {/* slightly narrower than the slash so the diagonal reads at both ends */}
          <div
            style={{
              position: "absolute",
              left: at(catIn, -260, 30),
              top: 52,
              transform: `scale(${at(catIn, 1.08, 1)})`,
            }}
          >
            <Cheetah width={800} color={C.ink} />
          </div>
        </div>

        <div style={{ display: "grid", gap: 18, justifyItems: "center", marginTop: 10 }}>
          <MaskLine delay={16} dur={10}>
            <div
              style={{
                fontFamily: WORDMARK,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 118,
                color: C.orange,
                lineHeight: 1.1,
              }}
            >
              Sprint Couriers
            </div>
          </MaskLine>

          <MaskLine delay={24} dur={8}>
            <div
              style={{
                ...textStyle(TYPE.body, 700, C.ink),
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              Your World Delivered
            </div>
          </MaskLine>

          <div
            style={{
              height: 6,
              width: 620,
              background: C.orange,
              transform: `scaleX(${rule})`,
            }}
          />

          <MaskLine delay={36} dur={10}>
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ ...textStyle(28, 700, C.ink), letterSpacing: "0.04em" }}>
                www.sprintcouriers.co.bw
              </span>
              <span style={{ width: 10, height: 10, background: C.orange, borderRadius: 99, flexShrink: 0 }} />
              <span style={{ ...textStyle(28, 700, C.green), letterSpacing: "0.04em" }}>
                WHATSAPP 76 999 965
              </span>
            </div>
          </MaskLine>
        </div>
      </div>

      {/* one black hairline sweeps the bottom and stops dead */}
      <div
        style={{
          position: "absolute",
          bottom: 190,
          left: 0,
          height: 8,
          width: "100%",
          background: C.ink,
          transform: `scaleX(${prog(frame, 46, 10, EASE.wipe)})`,
          transformOrigin: "left center",
        }}
      />
    </AbsoluteFill>
  );
};
