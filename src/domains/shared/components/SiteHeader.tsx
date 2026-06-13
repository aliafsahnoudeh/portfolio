import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tSite = useTranslations("site");

  return (
    <header className="border-rivet/60 border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="tm-display text-ember hover:text-flame text-2xl"
        >
          {tSite("name")}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/projects" className="tm-link">
              {t("projects")}
            </Link>
            <Link href="/bio" className="tm-link">
              {t("bio")}
            </Link>
            <Link href="/contact" className="tm-link">
              {t("contact")}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
