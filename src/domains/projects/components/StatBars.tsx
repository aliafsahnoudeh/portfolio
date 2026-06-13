import { useTranslations } from "next-intl";
import type { Project } from "@/domains/projects/types";

const SEGMENTS = 10;
const STAT_KEYS = ["firepower", "armor", "speed", "special"] as const;

/** Twisted Metal vehicle-select style stat bars. */
export function StatBars({ stats }: { stats: Project["stats"] }) {
  const t = useTranslations("stats");

  return (
    <dl className="space-y-2">
      {STAT_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-3">
          <dt className="tm-display text-ash w-28 shrink-0 text-xs">
            {t(key)}
          </dt>
          <dd className="m-0 flex flex-1 gap-1">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                key={i}
                className="tm-seg"
                data-on={i < stats[key]}
                aria-hidden
              />
            ))}
            <span className="sr-only">
              {stats[key]}/{SEGMENTS}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
