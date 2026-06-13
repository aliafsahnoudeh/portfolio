import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageAlternates, personJsonLd } from "@/domains/shared/services/seo";
import { JsonLd } from "@/domains/shared/components/JsonLd";
import { SiteHeader } from "@/domains/shared/components/SiteHeader";
import { SiteFooter } from "@/domains/shared/components/SiteFooter";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bio" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/bio"),
  };
}

export default async function BioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bio");
  const facts = t.raw("facts") as string[];

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4">
      <JsonLd data={personJsonLd(locale)} />
      <SiteHeader />
      <main className="grow space-y-8 py-10">
        <header className="space-y-2">
          <p className="tm-display text-blood text-sm">{t("subtitle")}</p>
          <h1 className="tm-display text-bone text-4xl sm:text-5xl">
            {t("name")}
          </h1>
          <p className="tm-display text-ember text-lg">{t("vehicle")}</p>
        </header>

        <div className="space-y-4 leading-relaxed">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>

        <section className="tm-panel space-y-3 p-5">
          <h2 className="tm-display text-ember text-xl">{t("factsTitle")}</h2>
          <ul className="space-y-2">
            {facts.map((fact) => (
              <li key={fact.slice(0, 24)} className="flex gap-3">
                <span aria-hidden className="text-blood">
                  ✦
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
