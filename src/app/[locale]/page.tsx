import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProjects } from "@/domains/projects/server";
import { localizeProject } from "@/domains/projects";
import { pageAlternates, personJsonLd } from "@/domains/shared/services/seo";
import { JsonLd } from "@/domains/shared/components/JsonLd";
import { SiteFooter } from "@/domains/shared/components/SiteFooter";
import { LanguageSwitcher } from "@/domains/shared/components/LanguageSwitcher";
import { ProjectCard } from "@/domains/projects";
import { GameLoader } from "@/domains/game";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, "") };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const projects = getProjects().map((p) => localizeProject(p, locale));

  return (
    <>
      <JsonLd data={personJsonLd(locale)} />
      <GameLoader projects={projects} />

      {/*
        Semantic fallback content: always server-rendered so crawlers and
        no-JS visitors get the full site. The game mounts above it later.
      */}
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
        <header className="flex items-center justify-between py-6">
          <p className="tm-display text-ember text-xl">Ali&apos;s Portfolio</p>
          <LanguageSwitcher />
        </header>

        <main className="grow space-y-12 py-8">
          <section className="space-y-4">
            <h1 className="tm-display text-bone text-5xl sm:text-6xl">
              {t("h1")}
            </h1>
            <p className="tm-display text-ember text-2xl">{t("role")}</p>
            <p className="text-ash max-w-2xl leading-relaxed">{t("intro")}</p>
            <nav className="flex flex-wrap gap-6 pt-2">
              <Link href="/projects" className="tm-link">
                {t("projectsLink")}
              </Link>
              <Link href="/bio" className="tm-link">
                {t("bioLink")}
              </Link>
              <Link href="/contact" className="tm-link">
                {t("contactLink")}
              </Link>
            </nav>
          </section>

          <section aria-label={tNav("projects")}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
