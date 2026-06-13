import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProjects } from "@/domains/projects/server";
import { localizeProject } from "@/domains/projects";
import { pageAlternates } from "@/domains/shared/services/seo";
import { SiteHeader } from "@/domains/shared/components/SiteHeader";
import { SiteFooter } from "@/domains/shared/components/SiteFooter";
import { ProjectCard } from "@/domains/projects";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/projects"),
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const projects = getProjects().map((p) => localizeProject(p, locale));

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <SiteHeader />
      <main className="grow space-y-8 py-10">
        <header className="space-y-2">
          <p className="tm-display text-blood text-sm">{t("subtitle")}</p>
          <h1 className="tm-display text-bone text-4xl sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-ash max-w-2xl leading-relaxed">{t("blurb")}</p>
          <Link href="/" className="tm-link text-sm">
            {t("playInstead")}
          </Link>
        </header>
        <ul className="grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
