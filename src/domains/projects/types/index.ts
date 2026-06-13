/**
 * Project types are inferred from the zod schema in
 * services/project-schema.ts — the schema stays the single source of truth.
 */
export type {
  Project,
  LocalizedProject,
  LocalizedContent,
} from "../services/project-schema";
