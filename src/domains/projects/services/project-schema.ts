import { z } from "zod";

const localizedContentSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)),
});

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int(),
  period: z.string().min(1),
  status: z.enum(["active", "archived", "wip"]),
  tech: z.array(z.string().min(1)).min(1),
  links: z
    .object({
      github: z.url().optional(),
      demo: z.url().optional(),
      writeup: z.url().optional(),
    })
    .default({}),
  // Twisted Metal style vehicle stats, 1-10.
  stats: z.object({
    firepower: z.number().min(1).max(10),
    armor: z.number().min(1).max(10),
    speed: z.number().min(1).max(10),
    special: z.number().min(1).max(10),
  }),
  // Optional fixed arena placement; defaults to a ring position derived from `order`.
  billboard: z
    .object({ x: z.number(), z: z.number(), rotY: z.number().optional() })
    .optional(),
  i18n: z.object({
    en: localizedContentSchema,
    fa: localizedContentSchema,
  }),
});

export type Project = z.infer<typeof projectSchema>;
export type LocalizedContent = z.infer<typeof localizedContentSchema>;

/** A project flattened to a single locale — what pages and the game consume. */
export type LocalizedProject = Omit<Project, "i18n"> & {
  content: LocalizedContent;
};

export function localizeProject(
  project: Project,
  locale: keyof Project["i18n"],
): LocalizedProject {
  const { i18n, ...base } = project;
  return { ...base, content: i18n[locale] };
}
