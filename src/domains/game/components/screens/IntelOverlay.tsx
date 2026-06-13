"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LocalizedProject } from "@/domains/projects";
import { ProjectIntel } from "@/domains/projects";
import { useGameStore } from "@/domains/game/services/state/store";

/** TM-style dossier slammed over the arena after a billboard is destroyed. */
export function IntelOverlay({ projects }: { projects: LocalizedProject[] }) {
  const intelSlug = useGameStore((state) => state.intelSlug);
  const setPhase = useGameStore((state) => state.setPhase);
  const t = useTranslations("project");
  const project = projects.find((p) => p.slug === intelSlug);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Enter") setPhase("arena");
      // Escape is handled by ArenaScreen (intel → arena).
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPhase]);

  if (!project) return null;

  return (
    <div className="bg-void/85 absolute inset-0 flex items-center justify-center p-6">
      <div className="tm-panel flex max-h-[85vh] w-full max-w-2xl flex-col">
        <p className="tm-display text-ember border-rivet/60 border-b px-6 py-3 text-sm tracking-[0.3em]">
          {t("destroyed")}
        </p>
        <div className="overflow-y-auto px-6 py-5">
          <ProjectIntel project={project} />
        </div>
        <div className="border-rivet/60 flex flex-wrap items-center justify-between gap-4 border-t px-6 py-3">
          <button
            type="button"
            autoFocus
            onClick={() => setPhase("arena")}
            className="tm-link text-lg"
          >
            {t("backToArena")}
          </button>
          <Link
            href={`/projects/${project.slug}`}
            className="tm-link text-lg"
          >
            {t("fullDossier")}
          </Link>
        </div>
      </div>
    </div>
  );
}
