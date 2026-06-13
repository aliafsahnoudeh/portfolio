import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Chakra_Petch,
  Lalezar,
  Metal_Mania,
  Vazirmatn,
} from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/domains/shared/services/const";
import "../globals.css";

const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-metal",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

const lalezar = Lalezar({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-lalezar",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s — ${t("name")}`,
    },
    description: t("description"),
    icons: {
      icon: { url: "/images/driver-portrait.svg", type: "image/svg+xml" },
    },
    openGraph: {
      siteName: t("name"),
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={`${metalMania.variable} ${chakraPetch.variable} ${lalezar.variable} ${vazirmatn.variable}`}
    >
      <body className="font-body bg-void text-bone min-h-dvh antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
