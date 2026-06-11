import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { loadGoogleFont, ogFontFamily, OG_SIZE } from "@/domains/shared/services/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const family = ogFontFamily(locale);
  const title = t("h1");
  const role = t("role");
  const fontData = await loadGoogleFont(
    family,
    `${title}${role}Ali's Portfolio`,
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        background:
          "radial-gradient(ellipse 120% 90% at 50% -10%, #3a1210, #0a0908 65%)",
        color: "#e8e0cf",
        fontFamily: fontData ? family : "sans-serif",
        direction: locale === "fa" ? "rtl" : "ltr",
      }}
    >
      <div style={{ fontSize: 32, color: "#ff5a1f", letterSpacing: 6 }}>
        Ali&apos;s Portfolio
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, textAlign: "center" }}>
        {title}
      </div>
      <div style={{ fontSize: 36, color: "#9a8f7d" }}>{role}</div>
      <div
        style={{
          marginTop: 24,
          width: 560,
          height: 6,
          background: "linear-gradient(90deg, #c81d1d, #ffa222, #c81d1d)",
        }}
      />
    </div>,
    {
      ...size,
      fonts: fontData
        ? [{ name: family, data: fontData, weight: 700 as const }]
        : undefined,
    },
  );
}
