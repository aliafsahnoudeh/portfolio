import type { LocalizedProject } from "@/domains/projects";
import type { AABB, BillboardState } from "@/domains/game/types";
import { aabbFromBox } from "./colliders";

export const BILLBOARD_W = 7;
export const BILLBOARD_H = 3.4;
export const BILLBOARD_BASE_Y = 2.4; // bottom edge of the face
const RING_RADIUS = 34;
const MAX_HP = 100;

let billboards: BillboardState[] = [];

/** Ring placement facing the arena center; explicit positions win. */
export function initBillboards(
  projects: LocalizedProject[],
  destroyedSlugs: readonly string[],
) {
  billboards = projects.map((project, index) => {
    const angle = (index / projects.length) * Math.PI * 2;
    const x = project.billboard?.x ?? Math.sin(angle) * RING_RADIUS;
    const z = project.billboard?.z ?? Math.cos(angle) * RING_RADIUS;
    const rotY = project.billboard?.rotY ?? Math.atan2(-x, -z);
    const destroyed = destroyedSlugs.includes(project.slug);
    return {
      slug: project.slug,
      title: project.content.title,
      x,
      z,
      rotY,
      hp: destroyed ? 0 : MAX_HP,
      destroyedAt: destroyed ? -10_000 : null, // long past: no debris replay
    };
  });
}

export function getBillboards(): readonly BillboardState[] {
  return billboards;
}

export function billboardColliders(): AABB[] {
  // The frame keeps blocking the car even after destruction (wreck stays).
  return billboards.map((b) => {
    const alongX = Math.abs(Math.sin(b.rotY)); // face normal direction
    const w = BILLBOARD_W * (1 - alongX) + 1.2 * alongX;
    const d = BILLBOARD_W * alongX + 1.2 * (1 - alongX);
    return aabbFromBox(b.x, b.z, Math.max(w, 1.6), Math.max(d, 1.6), b.slug);
  });
}

/** Returns "destroyed" exactly once, on the killing blow. */
export function damageBillboard(
  slug: string,
  amount: number,
): "hit" | "destroyed" | "dead" {
  const billboard = billboards.find((b) => b.slug === slug);
  if (!billboard || billboard.hp <= 0) return "dead";
  billboard.hp = Math.max(0, billboard.hp - amount);
  if (billboard.hp === 0) {
    billboard.destroyedAt = performance.now();
    return "destroyed";
  }
  return "hit";
}
