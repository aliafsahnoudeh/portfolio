import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="tm-display text-blood text-5xl sm:text-7xl">
        {t("title")}
      </h1>
      <p className="text-ash max-w-md leading-relaxed">{t("body")}</p>
      <Link href="/" className="tm-link text-lg">
        {t("back")}
      </Link>
    </div>
  );
}
