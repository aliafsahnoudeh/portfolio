import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { getProject, getProjects } from "@/domains/projects/server";
import { localizeProject } from "@/domains/projects";
import { loadGoogleFont, ogFontFamily, OG_SIZE } from "@/domains/shared/services/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

const STAT_LABELS: Record<Locale, [string, string, string, string]> = {
  en: ["FIREPOWER", "ARMOR", "SPEED", "SPECIAL"],
  fa: ["قدرت آتش", "زره", "سرعت", "ویژه"],
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { content, stats } = localizeProject(project, locale);

  const family = ogFontFamily(locale);
  const labels = STAT_LABELS[locale];
  const text = `${content.title}${content.tagline}Ali's Portfolio${labels.join("")}`;
  const fontData = await loadGoogleFont(family, text);

  const statRows = (
    [
      [labels[0], stats.firepower],
      [labels[1], stats.armor],
      [labels[2], stats.speed],
      [labels[3], stats.special],
    ] as const
  ).map(([label, value]) => (
    <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 200, fontSize: 24, color: "#9a8f7d" }}>{label}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 26,
              height: 18,
              transform: "skewX(-12deg)",
              background:
                i < value
                  ? "linear-gradient(180deg, #ffa222, #c81d1d)"
                  : "#2b2620",
            }}
          />
        ))}
      </div>
    </div>
  ));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background:
          "radial-gradient(ellipse 120% 90% at 50% -10%, #3a1210, #0a0908 65%)",
        color: "#e8e0cf",
        fontFamily: fontData ? family : "sans-serif",
        direction: locale === "fa" ? "rtl" : "ltr",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 28, color: "#ff5a1f", letterSpacing: 4 }}>
          Ali&apos;s Portfolio
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          {content.title}
        </div>
        <div style={{ fontSize: 30, color: "#9a8f7d", lineHeight: 1.4 }}>
          {content.tagline}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {statRows}
      </div>
    </div>,
    {
      ...size,
      fonts: fontData
        ? [{ name: family, data: fontData, weight: 700 as const }]
        : undefined,
    },
  );
}
