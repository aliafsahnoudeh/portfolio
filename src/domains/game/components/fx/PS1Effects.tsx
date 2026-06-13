"use client";

import { useMemo } from "react";
import { EffectComposer, Scanline, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useGameStore } from "@/domains/game/services/state/store";
import { DitherPosterizeEffect } from "@/domains/game/services/fx/dither-effect";

export function PS1Effects() {
  const crt = useGameStore((state) => state.crt);
  const dither = useMemo(() => new DitherPosterizeEffect(), []);

  return (
    <EffectComposer multisampling={0}>
      <primitive object={dither} />
      {crt ? (
        <Scanline blendFunction={BlendFunction.OVERLAY} density={1.1} opacity={0.08} />
      ) : (
        <></>
      )}
      {crt ? <Vignette eskil={false} offset={0.15} darkness={0.45} /> : <></>}
    </EffectComposer>
  );
}
