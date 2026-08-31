/** Throwaway composition used only to eyeball the cheetah silhouette. */

import { AbsoluteFill } from "remotion";
import { Cheetah } from "./Cheetah";
import { C } from "./brand";

export const CheetahProof: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: C.white,
      alignItems: "center",
      justifyContent: "space-evenly",
    }}
  >
    <Cheetah width={900} color={C.ink} />
    <div style={{ background: C.green, padding: 40 }}>
      <Cheetah width={500} color={C.ink} />
    </div>
    {/* legibility check at social-thumbnail scale */}
    <Cheetah width={120} color={C.ink} />
  </AbsoluteFill>
);
