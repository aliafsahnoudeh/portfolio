/**
 * Pooled explosion/shockwave state and spawn API. The Explosions component
 * reads these pools each frame and renders them; gameplay code calls the
 * spawn functions without touching React.
 */

export const EXPLOSION_SLOTS = 4;
export const FLASH_SECONDS = 0.45;
export const SPARK_COUNT = 8;
export const SPARK_SECONDS = 0.9;

export interface ExplosionSlot {
  start: number; // performance.now(), 0 = idle
  x: number;
  y: number;
  z: number;
  big: boolean;
}

export const explosionSlots: ExplosionSlot[] = Array.from(
  { length: EXPLOSION_SLOTS },
  () => ({ start: 0, x: 0, y: 0, z: 0, big: false }),
);

/** Single shockwave ring (the special's 30s cooldown makes one slot enough). */
export const shockwave = { start: 0, x: 0, z: 0 };

export function spawnExplosion(x: number, y: number, z: number, big = false) {
  const slot =
    explosionSlots.find((s) => s.start === 0) ??
    explosionSlots.reduce((a, b) => (a.start < b.start ? a : b));
  Object.assign(slot, { start: performance.now(), x, y, z, big });
}

export function spawnShockwave(x: number, z: number) {
  shockwave.start = performance.now();
  shockwave.x = x;
  shockwave.z = z;
}

/** Pre-rolled spark trajectories — deterministic, no per-frame allocation. */
export const SPARK_DIRS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const a = (i / SPARK_COUNT) * Math.PI * 2 + 0.4;
  return { vx: Math.sin(a) * 4, vy: 4 + (i % 3) * 2, vz: Math.cos(a) * 4 };
});
