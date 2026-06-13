import { useTranslations } from "next-intl";
import { OWNER } from "@/domains/shared/services/const";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-rivet/60 mt-16 border-t">
      <div className="text-ash mx-auto max-w-5xl space-y-2 px-4 py-8 text-sm">
        <p>{t("tagline")}</p>
        <p className="flex flex-wrap items-center gap-4">
          <span>{t("rights", { year: new Date().getFullYear() })}</span>
          <a
            href={OWNER.github}
            rel="me noopener"
            className="hover:text-bone underline underline-offset-4"
          >
            GitHub
          </a>
          <a
            href={OWNER.linkedin}
            rel="me noopener"
            className="hover:text-bone underline underline-offset-4"
          >
            LinkedIn
          </a>
          <a
            href={OWNER.medium}
            rel="me noopener"
            className="hover:text-bone underline underline-offset-4"
          >
            Medium
          </a>
        </p>
      </div>
    </footer>
  );
}
