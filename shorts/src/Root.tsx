import React from "react";
import { Composition } from "remotion";
import { LaughShorts } from "./LaughShorts";
import script from "./script.json";

const total = Math.round(script.scenes.reduce((a, s) => a + s.seconds, 0) * script.fps);

export const Root: React.FC = () => (
  <Composition
    id="LaughShorts"
    component={LaughShorts}
    durationInFrames={total}
    fps={script.fps}
    width={1080}
    height={1920}
  />
);
