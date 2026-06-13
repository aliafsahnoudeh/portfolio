"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { LocalizedProject } from "@/domains/projects";
import { useGameStore } from "@/domains/game/services/state/store";
import { MobileNotice } from "@/domains/game/components/screens/MobileNotice";

/**
 * Opaque void backdrop that sits over the server-rendered fallback while the
 * game layer mounts, so the plain site never flashes before the boot screen.
 * Matches GameRoot's own background for a seamless handoff.
 */
function StageBackdrop() {
  return <div className="bg-void fixed inset-0 z-50" aria-hidden />;
}

const GameRoot = dynamic(() => import("./GameRoot"), {
  ssr: false,
  loading: () => <StageBackdrop />,
});

function subscribeToViewport(callback: () => void) {
  const media = window.matchMedia("(pointer: coarse)");
  media.addEventListener("change", callback);
  window.addEventListener("resize", callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("resize", callback);
  };
}

/** true = touch/small screen, false = game-capable, null = server render. */
function useTouchOnly(): boolean | null {
  return useSyncExternalStore(
    subscribeToViewport,
    () =>
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900,
    () => null,
  );
}

/**
 * The single client boundary for the game. Mounts the game layer above the
 * server-rendered fallback content; crawlers and no-JS visitors never see it.
 */
export function GameLoader({ projects }: { projects: LocalizedProject[] }) {
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const tNav = useTranslations("nav");
  const tMenu = useTranslations("menu");
  const touchOnly = useTouchOnly();

  // Pre-detection (SSR + first client paint): cover the fallback so it never
  // flashes before the game boots. The <noscript> rule reveals the plain site
  // for no-JS visitors; the fallback stays in the DOM either way, so crawlers
  // still get the full site.
  if (touchOnly === null) {
    return (
      <>
        <noscript>
          <style>{".tp-stage-cover{display:none!important}"}</style>
        </noscript>
        <div
          className="tp-stage-cover bg-void fixed inset-0 z-50"
          aria-hidden
        />
      </>
    );
  }

  if (phase === "skipped") {
    return (
      <button
        type="button"
        onClick={() => setPhase("boot")}
        className="tm-panel tm-display text-ember hover:text-flame fixed bottom-4 z-50 px-4 py-2 text-sm ltr:right-4 rtl:left-4"
      >
        ▶ {tMenu("startGame")}
      </button>
    );
  }

  if (touchOnly) {
    return <MobileNotice />;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="application"
      aria-label="Ali's Portfolio"
    >
      <GameRoot projects={projects} />
      <button
        type="button"
        onClick={() => setPhase("skipped")}
        className="text-ash hover:text-bone focus-visible:text-bone fixed bottom-3 left-1/2 z-50 -translate-x-1/2 text-xs tracking-widest uppercase underline-offset-4 hover:underline"
      >
        {tNav("skipIntro")}
      </button>
    </div>
  );
}
