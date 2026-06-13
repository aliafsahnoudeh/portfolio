import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { projectSchema, type Project } from "./project-schema";

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");

/**
 * Projects are discovered from src/content/projects/*.json at build time —
 * adding a project means dropping a new file there, no code changes.
 */
export const getProjects = cache((): Project[] => {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json"));

  const projects = files.map((file) => {
    const raw: unknown = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"),
    );
    const parsed = projectSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid project content in ${file}:\n${parsed.error}`);
    }
    if (parsed.data.slug !== path.basename(file, ".json")) {
      throw new Error(
        `Project slug "${parsed.data.slug}" must match its filename "${file}"`,
      );
    }
    return parsed.data;
  });

  return projects.sort((a, b) => a.order - b.order);
});

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}
