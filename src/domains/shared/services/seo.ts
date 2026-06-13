import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { OWNER, SITE_URL } from "./const";

/**
 * Canonical + hreflang alternates for a route. `path` is locale-less,
 * e.g. "" for home or "/projects/zurvan".
 */
export function pageAlternates(
  locale: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      en: `/en${path}`,
      fa: `/fa${path}`,
      "x-default": `/en${path}`,
    },
  };
}

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: locale === "fa" ? OWNER.nameFa : OWNER.name,
    alternateName: locale === "fa" ? OWNER.name : OWNER.nameFa,
    jobTitle: locale === "fa" ? OWNER.jobTitleFa : OWNER.jobTitleEn,
    url: SITE_URL,
    sameAs: [OWNER.github, OWNER.linkedin, OWNER.medium],
  };
}
