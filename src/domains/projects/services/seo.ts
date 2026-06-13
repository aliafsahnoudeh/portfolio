import type { Locale } from "@/i18n/routing";
import { OWNER, SITE_URL } from "@/domains/shared/services/const";
import type { LocalizedProject } from "../types";

export function projectJsonLd(project: LocalizedProject, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.content.title,
    description: project.content.tagline,
    inLanguage: locale,
    ...(project.links.github && { codeRepository: project.links.github }),
    programmingLanguage: project.tech[0],
    author: {
      "@type": "Person",
      name: OWNER.name,
      url: SITE_URL,
    },
    url: `${SITE_URL}/${locale}/projects/${project.slug}`,
  };
}
