import { useTranslations } from "next-intl";
import type { LocalizedProject } from "@/domains/projects/types";
import { StatBars } from "@/domains/projects/components/StatBars";

/**
 * The Twisted-Metal-style "project intel" dossier.
 * Shared between the static project page and the in-game overlay.
 */
export function ProjectIntel({ project }: { project: LocalizedProject }) {
  const t = useTranslations("project");
  const tStatus = useTranslations("status");

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="tm-display text-blood text-sm">{t("intel")}</p>
        <h1 className="tm-display text-bone text-4xl sm:text-5xl">
          {project.content.title}
        </h1>
        <p className="text-ash text-lg">{project.content.tagline}</p>
        <dl className="text-ash flex flex-wrap gap-x-8 gap-y-1 pt-2 text-xs tracking-wider uppercase">
          <div className="flex gap-2">
            <dt>{t("period")}:</dt>
            <dd className="text-bone m-0">{project.period}</dd>
          </div>
          <div className="flex gap-2">
            <dt>{tStatus("label")}:</dt>
            <dd className="text-ember m-0 font-bold">
              {tStatus(project.status)}
            </dd>
          </div>
        </dl>
      </header>

      <div className="tm-panel p-5">
        <StatBars stats={project.stats} />
      </div>

      <div className="space-y-4 leading-relaxed">
        {project.content.description.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      {project.content.highlights.length > 0 && (
        <section className="space-y-3">
          <h2 className="tm-display text-ember text-xl">{t("highlights")}</h2>
          <ul className="space-y-2">
            {project.content.highlights.map((highlight) => (
              <li key={highlight.slice(0, 32)} className="flex gap-3">
                <span aria-hidden className="text-blood">
                  ✦
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="tm-display text-ember text-xl">{t("tech")}</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {project.tech.map((tech) => (
            <li
              key={tech}
              className="border-rivet bg-coal text-bone border px-2 py-1"
            >
              <bdi>{tech}</bdi>
            </li>
          ))}
        </ul>
      </section>

      {Object.keys(project.links).length > 0 && (
        <section className="space-y-3">
          <h2 className="tm-display text-ember text-xl">{t("links")}</h2>
          <ul className="flex flex-wrap gap-6">
            {project.links.github && (
              <li>
                <a
                  href={project.links.github}
                  rel="noopener"
                  className="tm-link text-sm"
                >
                  {t("github")}
                </a>
              </li>
            )}
            {project.links.demo && (
              <li>
                <a
                  href={project.links.demo}
                  rel="noopener"
                  className="tm-link text-sm"
                >
                  {t("demo")}
                </a>
              </li>
            )}
            {project.links.writeup && (
              <li>
                <a
                  href={project.links.writeup}
                  rel="noopener"
                  className="tm-link text-sm"
                >
                  {t("writeup")}
                </a>
              </li>
            )}
          </ul>
        </section>
      )}
    </article>
  );
}
