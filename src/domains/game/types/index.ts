import type { Vector2, Vector3 } from "three";

export type GamePhase =
  | "boot" // PS1-style boot + title screen ("PRESS START")
  | "menu" // Twisted-Metal main menu (options live inside it)
  | "vehicleSelect"
  | "arena"
  | "paused"
  | "intel" // project dossier overlay after destroying a billboard
  | "skipped"; // game layer dismissed, plain site visible

/** Per-frame cosmetic motion the controller feeds the Peykan model. */
export interface PeykanMotion {
  steer: number; // -1..1, front wheel yaw
  spinSpeed: number; // rad/s wheel rotation
  lean: number; // body roll
  pitch: number; // body pitch (accel/brake squat)
}

export interface CarApi {
  pos: Vector3;
  heading: () => number;
  velocity: () => Vector2;
}

/** Axis-aligned collision box on the xz plane; id marks billboards. */
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  id?: string;
}

export interface BillboardState {
  slug: string;
  title: string;
  x: number;
  z: number;
  rotY: number;
  hp: number;
  destroyedAt: number | null; // performance.now() when it blew up
}

export type SfxName =
  | "menuMove"
  | "menuConfirm"
  | "mg"
  | "missile"
  | "explosion"
  | "hit";
