import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LocalizedProject } from "@/domains/projects/types";

export function ProjectCard({ project }: { project: LocalizedProject }) {
  const t = useTranslations("project");
  const tStatus = useTranslations("status");

  return (
    <article className="tm-panel flex h-full flex-col gap-3 p-5">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="tm-display text-bone text-xl">
          <Link
            href={`/projects/${project.slug}`}
            className="hover:text-ember focus-visible:text-ember"
          >
            {project.content.title}
          </Link>
        </h2>
        <span className="text-ember shrink-0 text-xs font-bold tracking-wider">
          {tStatus(project.status)}
        </span>
      </header>
      <p className="text-ash grow text-sm leading-relaxed">
        {project.content.tagline}
      </p>
      <ul className="flex flex-wrap gap-1.5 text-xs">
        {project.tech.slice(0, 4).map((tech) => (
          <li
            key={tech}
            className="border-rivet text-bone/80 border px-1.5 py-0.5"
          >
            <bdi>{tech}</bdi>
          </li>
        ))}
      </ul>
      <Link
        href={`/projects/${project.slug}`}
        className="tm-link text-sm"
        aria-label={`${t("fullDossier")}: ${project.content.title}`}
      >
        {t("fullDossier")}
      </Link>
    </article>
  );
}
