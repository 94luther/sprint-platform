import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { CheetahProof } from "./sprint/CheetahProof";
import { PROMO_DURATION, SprintPromo } from "./sprint/SprintPromo";
import { MANIFESTO_DURATION, SprintManifesto } from "./sprint/manifesto";
import { SPRINT_APP_DEMO_DURATION, SprintAppDemo } from "./sprint/SprintAppDemo";
import { SPRINT_CONCEPT_DURATION, SprintConcept } from "./sprint/SprintConcept";
import { SPRINT_CONCEPT_V2_DURATION, SprintConceptV2 } from "./sprint/SprintConceptV2";
import { SPRINT_CONCEPT_V3_DURATION, SprintConceptV3 } from "./sprint/SprintConceptV3";
import { SPRINT_JOURNEY_V5_DURATION, SprintJourneyV5 } from "./sprint/SprintJourneyV5";
import { SPRINT_EXPLAINER_V4_DURATION, SprintExplainerV4 } from "./sprint/SprintExplainerV4";
import { SPRINT_KEYNOTE_DURATION, SprintKeynote } from "./sprint/SprintKeynote";
import { AD_DURATION, SprintAd } from "./sprint/ad";
import { REEL_DURATION, SprintReel } from "./sprint/reel";
import {
  CHALLENGE_DURATION,
  INTRO_DURATION,
  SGC1Relay,
  SGC2Load,
  SGC3Blind,
  SGC4Sort,
  SGC5Hour,
  SGC6Tug,
  SGC7Hold,
  SGC8Puzzle,
  SGIntro,
} from "./sprint/challenges";
import { SocialFeed, SocialStory, socialSchema } from "./sprint/social";
import { ClientTeaser, TEASER_DURATION, teaserSchema } from "./sprint/teaser";
import { ANNIV_DURATION, AnnivReel, CTA_DURATION, CtaReel } from "./sprint/reels-extra";
import { BIZ_DURATION, BizReel, LIST_DURATION, ListReel, LOOP_DURATION, LoopReel, PROOF_DURATION, ProofReel, URGENCY_DURATION, UrgencyReel } from "./sprint/reels5";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SocialFeed"
        component={SocialFeed}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1350}
        schema={socialSchema}
        defaultProps={socialSchema.parse({})}
      />

      <Composition
        id="SocialStory"
        component={SocialStory}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        schema={socialSchema}
        defaultProps={socialSchema.parse({})}
      />

      <Composition
        id="UrgencyReel"
        component={UrgencyReel}
        durationInFrames={URGENCY_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ListReel"
        component={ListReel}
        durationInFrames={LIST_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="BizReel"
        component={BizReel}
        durationInFrames={BIZ_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ProofReel"
        component={ProofReel}
        durationInFrames={PROOF_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="LoopReel"
        component={LoopReel}
        durationInFrames={LOOP_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="AnnivReel"
        component={AnnivReel}
        durationInFrames={ANNIV_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="CtaReel"
        component={CtaReel}
        durationInFrames={CTA_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SprintReel"
        component={SprintReel}
        durationInFrames={REEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SprintAd"
        component={SprintAd}
        durationInFrames={AD_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SprintManifesto"
        component={SprintManifesto}
        durationInFrames={MANIFESTO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SprintAppDemo"
        component={SprintAppDemo}
        durationInFrames={SPRINT_APP_DEMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SprintConcept"
        component={SprintConcept}
        durationInFrames={SPRINT_CONCEPT_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintConceptV2"
        component={SprintConceptV2}
        durationInFrames={SPRINT_CONCEPT_V2_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintConceptV3"
        component={SprintConceptV3}
        durationInFrames={SPRINT_CONCEPT_V3_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintJourneyV5"
        component={SprintJourneyV5}
        durationInFrames={SPRINT_JOURNEY_V5_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintExplainerV4"
        component={SprintExplainerV4}
        durationInFrames={SPRINT_EXPLAINER_V4_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintKeynote"
        component={SprintKeynote}
        durationInFrames={SPRINT_KEYNOTE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="SprintPromo"
        component={SprintPromo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="ClientTeaser"
        component={ClientTeaser}
        durationInFrames={TEASER_DURATION}
        fps={30}
        width={1080}
        height={1920}
        schema={teaserSchema}
        defaultProps={teaserSchema.parse({})}
      />

      <Composition
        id="SGIntro"
        component={SGIntro}
        durationInFrames={INTRO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC1Relay"
        component={SGC1Relay}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC2Load"
        component={SGC2Load}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC3Blind"
        component={SGC3Blind}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC4Sort"
        component={SGC4Sort}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC5Hour"
        component={SGC5Hour}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC8Puzzle"
        component={SGC8Puzzle}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC7Hold"
        component={SGC7Hold}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SGC6Tug"
        component={SGC6Tug}
        durationInFrames={CHALLENGE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="CheetahProof"
        component={CheetahProof}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
