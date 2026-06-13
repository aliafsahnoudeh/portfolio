"use client";

import { useTranslations } from "next-intl";

/**
 * Keyboard → PlayStation-style button mapping. Glyphs are plain unicode
 * with PS-ish colors — drawn, not ripped.
 */
export function ControlsLegend() {
  const t = useTranslations("legend");

  const rows = [
    { keys: ["↑", "↓", "←", "→"], glyph: "✚", color: "#b8b2a5", label: t("drive") },
    { keys: ["A"], glyph: "✕", color: "#8eb8e5", label: t("machineGun") },
    { keys: ["S"], glyph: "■", color: "#e5a9c4", label: t("missile") },
    { keys: ["D"], glyph: "▲", color: "#6fcf97", label: t("special") },
    { keys: ["SPACE"], glyph: "R1", color: "#b8b2a5", label: t("turbo") },
    { keys: ["ESC"], glyph: "☰", color: "#b8b2a5", label: t("pause") },
  ];

  return (
    <div className="space-y-2" dir="ltr">
      <p className="tm-display text-ash text-xs tracking-[0.25em]">
        {t("title")}
      </p>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-xs">
            <span className="flex w-24 shrink-0 gap-1">
              {row.keys.map((key) => (
                <kbd
                  key={key}
                  className="border-rivet bg-coal text-bone rounded border px-1 py-0.5 font-mono text-[10px]"
                >
                  {key}
                </kbd>
              ))}
            </span>
            <span
              aria-hidden
              className="ps-glyph shrink-0"
              style={{ color: row.color, fontSize: row.glyph.length > 1 ? "0.55rem" : undefined }}
            >
              {row.glyph}
            </span>
            <span className="text-ash">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
