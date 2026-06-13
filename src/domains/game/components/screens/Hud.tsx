"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { LocalizedProject } from "@/domains/projects";
import { useGameStore } from "@/domains/game/services/state/store";
import { telemetry } from "@/domains/game/services/state/telemetry";

/**
 * DOM HUD over the canvas. Discrete values (hp, missiles, counter) come from
 * the store; per-frame values (turbo, special cooldown) are read from the
 * telemetry object in a local rAF to avoid 60fps React re-renders.
 * Positions are physical (left/right), identical in LTR and RTL.
 */
export function Hud({ projects }: { projects: LocalizedProject[] }) {
  const t = useTranslations("hud");
  const hp = useGameStore((state) => state.hp);
  const missiles = useGameStore((state) => state.missiles);
  const destroyed = useGameStore((state) => state.destroyed);
  const turboBarRef = useRef<HTMLDivElement>(null);
  const specialRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (turboBarRef.current) {
        turboBarRef.current.style.transform = `scaleX(${telemetry.turbo})`;
      }
      if (specialRef.current) {
        const s = telemetry.specialReadyIn;
        specialRef.current.textContent = s > 0 ? Math.ceil(s).toString() : "✓";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      {/* Armor (top-left) */}
      <div className="absolute top-4 left-4 w-56 space-y-1">
        <p className="tm-display text-bone text-xs tracking-[0.25em]">
          {t("health")}
        </p>
        <div className="border-rivet bg-coal/80 h-4 border p-0.5">
          <div
            className="h-full origin-left transition-transform duration-200"
            style={{
              transform: `scaleX(${hp / 100})`,
              background:
                hp > 50
                  ? "linear-gradient(to bottom, #ffa222, #c81d1d)"
                  : "linear-gradient(to bottom, #ff5a1f, #7a1010)",
            }}
          />
        </div>
      </div>

      {/* Projects destroyed (top-right) */}
      <p className="tm-display text-bone absolute top-4 right-4 text-sm tracking-[0.2em]">
        {t("destroyed", {
          destroyed: destroyed.length,
          total: projects.length,
        })}
      </p>

      {/* Weapons (bottom-left) */}
      <div className="absolute bottom-4 left-4 flex gap-3 text-xs" dir="ltr">
        <span className="tm-display border-rivet bg-coal/80 text-bone border px-2 py-1">
          <span style={{ color: "#8eb8e5" }}>✕</span> {t("machineGun")} ∞
        </span>
        <span className="tm-display border-rivet bg-coal/80 text-bone border px-2 py-1">
          <span style={{ color: "#e5a9c4" }}>■</span> {t("missile")} ×{missiles}
        </span>
        <span className="tm-display border-rivet bg-coal/80 text-bone border px-2 py-1">
          <span style={{ color: "#6fcf97" }}>▲</span> {t("special")}{" "}
          <span ref={specialRef}>✓</span>
        </span>
      </div>

      {/* Turbo (bottom-right) */}
      <div className="absolute right-4 bottom-4 w-44 space-y-1">
        <p className="tm-display text-bone text-end text-xs tracking-[0.25em]">
          {t("turbo")}
        </p>
        <div className="border-rivet bg-coal/80 h-3 border p-0.5">
          <div
            ref={turboBarRef}
            className="h-full origin-left"
            style={{
              background: "linear-gradient(to bottom, #ffe27a, #ff5a1f)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
