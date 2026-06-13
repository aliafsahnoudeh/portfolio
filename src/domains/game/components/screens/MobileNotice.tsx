"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useGameStore } from "@/domains/game/services/state/store";

/** Shown instead of the game on touch/small-screen devices (phase 1: desktop only). */
export function MobileNotice() {
  const setPhase = useGameStore((state) => state.setPhase);
  const t = useTranslations("mobile");
  const tNav = useTranslations("nav");

  return (
    <div className="bg-void/95 fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="tm-panel max-w-sm space-y-4 p-6 text-center">
        <h2 className="tm-display text-ember text-3xl">{t("title")}</h2>
        <p className="text-ash text-sm leading-relaxed">{t("body")}</p>
        <p>
          <Link href="/projects" className="tm-link text-lg">
            {t("cta")}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setPhase("skipped")}
          className="text-ash hover:text-bone text-xs tracking-widest uppercase underline underline-offset-4"
        >
          {tNav("skipIntro")}
        </button>
      </div>
    </div>
  );
}
