"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Text-only locale toggle — deliberately no flags. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("langSwitcher");

  return (
    <nav aria-label={t("label")} className="flex items-center gap-2 text-sm">
      {routing.locales.map((target, index) => (
        <span key={target} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden className="text-rivet">|</span>}
          <Link
            href={pathname}
            locale={target}
            aria-current={target === locale ? "true" : undefined}
            className={
              target === locale
                ? "text-ember font-bold"
                : "text-ash hover:text-bone focus-visible:text-bone"
            }
          >
            {t(target)}
          </Link>
        </span>
      ))}
    </nav>
  );
}
