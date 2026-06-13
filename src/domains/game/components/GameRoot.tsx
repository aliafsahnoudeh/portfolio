"use client";

import "client-only";
import { useEffect } from "react";
import type { LocalizedProject } from "@/domains/projects";
import { useGameStore } from "@/domains/game/services/state/store";
import { attachKeyboard } from "@/domains/game/services/input/keyboard";
import { audio } from "@/domains/game/services/audio/audio-manager";
import { BootScreen } from "@/domains/game/components/screens/BootScreen";
import { MainMenu } from "@/domains/game/components/screens/MainMenu";
import { VehicleSelect } from "@/domains/game/components/screens/VehicleSelect";
import { ArenaScreen } from "@/domains/game/components/screens/ArenaScreen";

export default function GameRoot({
  projects,
}: {
  projects: LocalizedProject[];
}) {
  const phase = useGameStore((state) => state.phase);

  useEffect(() => attachKeyboard(), []);

  // M toggles mute; the store subscription keeps the audio graph in sync.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyM") useGameStore.getState().toggleMute();
    };
    window.addEventListener("keydown", onKeyDown);
    const unsubscribe = useGameStore.subscribe((state, previous) => {
      if (state.muted !== previous.muted) audio.setMuted(state.muted);
    });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unsubscribe();
      audio.stopEngine();
    };
  }, []);

  // Auto-pause when the tab is hidden mid-game.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && useGameStore.getState().phase === "arena") {
        useGameStore.getState().setPhase("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="bg-void absolute inset-0 overflow-hidden">
      {phase === "boot" && <BootScreen />}
      {phase === "menu" && <MainMenu />}
      {phase === "vehicleSelect" && <VehicleSelect />}
      {(phase === "arena" || phase === "paused" || phase === "intel") && (
        <ArenaScreen projects={projects} />
      )}
    </div>
  );
}
