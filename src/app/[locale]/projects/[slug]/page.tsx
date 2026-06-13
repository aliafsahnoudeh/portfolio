import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProject, getProjects } from "@/domains/projects/server";
import { localizeProject, projectJsonLd } from "@/domains/projects";
import { pageAlternates } from "@/domains/shared/services/seo";
import { JsonLd } from "@/domains/shared/components/JsonLd";
import { SiteHeader } from "@/domains/shared/components/SiteHeader";
import { SiteFooter } from "@/domains/shared/components/SiteFooter";
import { ProjectIntel } from "@/domains/projects";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { content } = localizeProject(project, locale);
  return {
    title: content.title,
    description: content.tagline,
    alternates: pageAlternates(locale, `/projects/${slug}`),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProject(slug);
  if (!project) notFound();
  const localized = localizeProject(project, locale);
  const t = await getTranslations("project");

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4">
      <JsonLd data={projectJsonLd(localized, locale)} />
      <SiteHeader />
      <main className="grow py-10">
        <ProjectIntel project={localized} />
        <p className="pt-10">
          <Link href="/projects" className="tm-link text-sm">
            {t("backToProjects")}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
