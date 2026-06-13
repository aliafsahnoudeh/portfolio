import type { Locale } from "@/i18n/routing";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Load a Google font subset to exactly the glyphs needed, at build time.
 * Returns null on failure so OG generation can fall back to default fonts.
 */
export async function loadGoogleFont(
  family: string,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(url, {
        headers: {
          // Ask for TTF (not woff2) — satori only supports ttf/otf/woff.
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101",
        },
      })
    ).text();
    const match = css.match(
      /src: url\((.+?)\) format\(['"]?(?:opentype|truetype)['"]?\)/,
    );
    if (!match) return null;
    const response = await fetch(match[1]);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

export function ogFontFamily(locale: Locale) {
  return locale === "fa" ? "Vazirmatn" : "Chakra Petch";
}
