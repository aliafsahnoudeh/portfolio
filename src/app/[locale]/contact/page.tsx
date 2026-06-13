import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { OWNER } from "@/domains/shared/services/const";
import { pageAlternates } from "@/domains/shared/services/seo";
import { SiteHeader } from "@/domains/shared/components/SiteHeader";
import { SiteFooter } from "@/domains/shared/components/SiteFooter";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4">
      <SiteHeader />
      <main className="grow space-y-8 py-10">
        <header className="space-y-2">
          <p className="tm-display text-blood text-sm">{t("subtitle")}</p>
          <h1 className="tm-display text-bone text-4xl sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-ash max-w-2xl leading-relaxed">{t("blurb")}</p>
        </header>
        <ul className="space-y-4">
          <li>
            <a href={OWNER.github} rel="me noopener" className="tm-link">
              {t("github")}
            </a>
          </li>
          <li>
            <a href={OWNER.linkedin} rel="me noopener" className="tm-link">
              {t("linkedin")}
            </a>
          </li>
          <li>
            <a href={OWNER.medium} rel="me noopener" className="tm-link">
              {t("medium")}
            </a>
          </li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
