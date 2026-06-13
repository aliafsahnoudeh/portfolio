"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useTranslations } from "next-intl";
import type { Group } from "three";
import { useRouter } from "@/i18n/navigation";
import type { LocalizedProject } from "@/domains/projects";
import { useGameStore } from "@/domains/game/services/state/store";
import { Arena } from "@/domains/game/components/arena/Arena";
import {
  billboardColliders,
  getBillboards,
  initBillboards,
} from "@/domains/game/services/arena/billboards";
import { Billboard } from "@/domains/game/components/arena/Billboard";
import { WeaponsLayer } from "@/domains/game/components/weapons/WeaponsLayer";
import { Explosions } from "@/domains/game/components/weapons/Explosions";
import { Peykan } from "@/domains/game/components/vehicle/Peykan";
import type { PeykanMotion } from "@/domains/game/types";
import { useCarController } from "@/domains/game/services/vehicle/useCarController";
import { PS1Effects } from "@/domains/game/components/fx/PS1Effects";
import { audio } from "@/domains/game/services/audio/audio-manager";
import { Hud } from "./Hud";
import { MiniMap } from "./MiniMap";
import { IntelOverlay } from "./IntelOverlay";

/**
 * Internal render height in pixels — the PS1 buffer, upscaled with CSS.
 * 480 keeps the retro crunch while leaving billboard text readable.
 */
const BUFFER_HEIGHT = 480;

function PixelatedBuffer() {
  const setDpr = useThree((state) => state.setDpr);
  const height = useThree((state) => state.size.height);
  useEffect(() => {
    setDpr(Math.min(1, BUFFER_HEIGHT / Math.max(1, height)));
  }, [setDpr, height]);
  return null;
}

function PlayerCar() {
  const carRef = useRef<Group>(null);
  const motionRef = useRef<PeykanMotion>({
    steer: 0,
    spinSpeed: 0,
    lean: 0,
    pitch: 0,
  });
  useCarController(carRef, motionRef);

  return (
    <group ref={carRef} position={[0, 0, -30]}>
      <Peykan motion={motionRef} />
    </group>
  );
}

export function ArenaScreen({ projects }: { projects: LocalizedProject[] }) {
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);

  // Build the billboard registry once per arena entry.
  const extraColliders = useMemo(() => {
    initBillboards(projects, useGameStore.getState().destroyed);
    return billboardColliders();
  }, [projects]);

  // Engine loop runs only while actually driving.
  useEffect(() => {
    if (phase === "arena") audio.startEngine();
    else audio.stopEngine();
    return () => audio.stopEngine();
  }, [phase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      const current = useGameStore.getState().phase;
      if (current === "arena") setPhase("paused");
      else if (current === "paused") setPhase("arena");
      else if (current === "intel") setPhase("arena");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPhase]);

  return (
    <div className="absolute inset-0">
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 60, near: 0.3, far: 150, position: [0, 3.2, -37] }}
        style={{ imageRendering: "pixelated" }}
        flat
      >
        <PixelatedBuffer />
        <color attach="background" args={["#241c14"]} />
        <fog attach="fog" args={["#241c14", 30, 100]} />
        <ambientLight intensity={1.5} color="#cdbfae" />
        <directionalLight position={[5, 12, 3]} intensity={2.9} color="#ffe9c9" />
        <Suspense fallback={null}>
          <Arena extraColliders={extraColliders} />
          {getBillboards().map((billboard) => (
            <Billboard key={billboard.slug} state={billboard} />
          ))}
          <PlayerCar />
          <WeaponsLayer />
          <Explosions />
        </Suspense>
        <PS1Effects />
      </Canvas>

      <Hud projects={projects} />
      <MiniMap />
      <VictoryCard projects={projects} />
      {phase === "paused" && <PauseOverlay />}
      {phase === "intel" && <IntelOverlay projects={projects} />}
    </div>
  );
}

function VictoryCard({ projects }: { projects: LocalizedProject[] }) {
  const destroyed = useGameStore((state) => state.destroyed);
  const phase = useGameStore((state) => state.phase);
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("victory");
  const router = useRouter();

  const complete =
    projects.length > 0 && destroyed.length === projects.length;
  if (!complete || dismissed || phase !== "arena") return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2">
      <div className="tm-panel space-y-2 px-8 py-5 text-center">
        <h2 className="tm-logo text-3xl">{t("title")}</h2>
        <p className="text-ash text-sm">{t("subtitle")}</p>
        <div className="flex items-center justify-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => router.push("/contact")}
            className="tm-link text-lg"
          >
            {t("cta")}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-ash hover:text-bone text-xs tracking-widest uppercase underline underline-offset-4"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function PauseOverlay() {
  const setPhase = useGameStore((state) => state.setPhase);
  const t = useTranslations("menu");
  const [selected, setSelected] = useState(0);

  const items = [
    { label: t("resume"), run: () => setPhase("arena") },
    { label: t("quitToMenu"), run: () => setPhase("menu") },
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          audio.play("menuMove");
          setSelected((i) => (i + 1) % 2);
          break;
        case "Enter":
          event.preventDefault();
          audio.play("menuConfirm");
          document.getElementById(`tm-pause-${selected}`)?.click();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, setPhase]);

  return (
    <div className="bg-void/80 absolute inset-0 flex items-center justify-center">
      <div className="tm-panel space-y-5 px-10 py-8 text-center">
        <h2 className="tm-logo text-4xl">{t("paused")}</h2>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.label}>
              <button
                id={`tm-pause-${index}`}
                type="button"
                onClick={item.run}
                onMouseEnter={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                className={`tm-display text-xl transition-colors ${
                  index === selected ? "text-ember" : "text-bone/70"
                }`}
              >
                <span
                  aria-hidden
                  className={`me-3 ${index === selected ? "opacity-100" : "opacity-0"}`}
                >
                  ▸
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
