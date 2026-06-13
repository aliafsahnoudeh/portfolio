import type { Vector2, Vector3 } from "three";
import type { AABB } from "@/domains/game/types";

/** Half-extent of the square arena (walls live here). */
export const ARENA_HALF = 46;

let colliders: AABB[] = [];

export function setColliders(list: AABB[]) {
  colliders = list;
}

export function getColliders(): readonly AABB[] {
  return colliders;
}

export function aabbFromBox(
  x: number,
  z: number,
  width: number,
  depth: number,
  id?: string,
): AABB {
  return {
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
    id,
  };
}

/** What a projectile at (x,z) hit: a box (maybe a billboard), a wall, or nothing. */
export function queryPoint(
  x: number,
  z: number,
  radius: number,
): AABB | "wall" | null {
  if (Math.abs(x) > ARENA_HALF || Math.abs(z) > ARENA_HALF) return "wall";
  for (const box of colliders) {
    if (
      x > box.minX - radius &&
      x < box.maxX + radius &&
      z > box.minZ - radius &&
      z < box.maxZ + radius
    ) {
      return box;
    }
  }
  return null;
}

/**
 * Resolve a moving circle against arena bounds and all static AABBs.
 * Mutates pos (push-out) and vel (kills the into-surface component).
 * Returns the largest impact speed for damage/shake purposes.
 */
export function collideCircle(pos: Vector3, radius: number, vel: Vector2): number {
  let impact = 0;
  const bound = ARENA_HALF - radius;

  // Arena walls
  if (pos.x < -bound) {
    pos.x = -bound;
    impact = Math.max(impact, Math.abs(vel.x));
    vel.x = Math.abs(vel.x) * 0.25;
  } else if (pos.x > bound) {
    pos.x = bound;
    impact = Math.max(impact, Math.abs(vel.x));
    vel.x = -Math.abs(vel.x) * 0.25;
  }
  if (pos.z < -bound) {
    pos.z = -bound;
    impact = Math.max(impact, Math.abs(vel.y));
    vel.y = Math.abs(vel.y) * 0.25;
  } else if (pos.z > bound) {
    pos.z = bound;
    impact = Math.max(impact, Math.abs(vel.y));
    vel.y = -Math.abs(vel.y) * 0.25;
  }

  // Static boxes (vel is xz: vel.x ↔ pos.x, vel.y ↔ pos.z)
  for (const box of colliders) {
    const closestX = Math.max(box.minX, Math.min(pos.x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));
    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const distSq = dx * dx + dz * dz;
    if (distSq >= radius * radius) continue;

    if (distSq > 1e-6) {
      // Outside the box: push along the contact normal.
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const nz = dz / dist;
      const depth = radius - dist;
      pos.x += nx * depth;
      pos.z += nz * depth;
      const into = vel.x * nx + vel.y * nz;
      if (into < 0) {
        impact = Math.max(impact, -into);
        vel.x -= into * nx * 1.25; // slight bounce
        vel.y -= into * nz * 1.25;
      }
    } else {
      // Center inside the box: push out along the smallest penetration axis.
      const left = pos.x - box.minX + radius;
      const right = box.maxX - pos.x + radius;
      const near = pos.z - box.minZ + radius;
      const far = box.maxZ - pos.z + radius;
      const min = Math.min(left, right, near, far);
      if (min === left) pos.x = box.minX - radius;
      else if (min === right) pos.x = box.maxX + radius;
      else if (min === near) pos.z = box.minZ - radius;
      else pos.z = box.maxZ + radius;
      impact = Math.max(impact, Math.hypot(vel.x, vel.y));
      vel.x *= -0.25;
      vel.y *= -0.25;
    }
  }

  return impact;
}
