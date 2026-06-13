"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useGameStore } from "@/domains/game/services/state/store";
import { audio } from "@/domains/game/services/audio/audio-manager";

/** PS1-style boot: "presents" card, then the title screen with PRESS START. */
export function BootScreen() {
  const setPhase = useGameStore((state) => state.setPhase);
  const t = useTranslations("menu");
  const tSite = useTranslations("site");
  const [stage, setStage] = useState<"presents" | "title">("presents");

  useEffect(() => {
    if (stage !== "presents") return;
    const id = setTimeout(() => setStage("title"), 2400);
    return () => clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    const advance = () => {
      // A guaranteed user gesture: the only safe place to create AudioContext.
      audio.unlock(useGameStore.getState().muted);
      if (stage === "presents") {
        setStage("title");
      } else {
        audio.play("menuConfirm");
        setPhase("menu");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Tab") return; // keep keyboard a11y intact
      advance();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", advance);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", advance);
    };
  }, [stage, setPhase]);

  if (stage === "presents") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="tm-display text-ash tm-flicker text-xl tracking-[0.3em] sm:text-2xl">
          {t("presents")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="tm-flicker space-y-1" dir="ltr">
        <p className="tm-logo text-6xl leading-none sm:text-8xl">ALI&apos;S</p>
        <p className="tm-logo text-7xl leading-none sm:text-9xl">PORTFOLIO</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/peykan-icon.svg"
        alt=""
        aria-hidden
        width={96}
        height={96}
        className="opacity-90 [image-rendering:pixelated]"
      />

      <p className="tm-display text-bone tm-blink text-2xl sm:text-3xl">
        {t("pressStart")}
      </p>

      <p className="text-ash max-w-md text-xs">
        {t("smallprint")} · {tSite("title")}
      </p>
    </div>
  );
}
