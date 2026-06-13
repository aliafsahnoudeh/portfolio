/**
 * Client-safe public API of the projects domain. Anything that touches
 * the filesystem ('server-only') lives behind ./server instead — never
 * re-export it here or client imports break.
 */
export { ProjectCard } from "./components/ProjectCard";
export { ProjectIntel } from "./components/ProjectIntel";
export { StatBars } from "./components/StatBars";
export { localizeProject, projectSchema } from "./services/project-schema";
export { projectJsonLd } from "./services/seo";
export type { Project, LocalizedProject, LocalizedContent } from "./types";
