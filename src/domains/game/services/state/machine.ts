import type { GamePhase } from "@/domains/game/types";

const TRANSITIONS: Record<GamePhase, readonly GamePhase[]> = {
  boot: ["menu", "skipped"],
  menu: ["vehicleSelect", "boot", "skipped"],
  vehicleSelect: ["arena", "menu", "skipped"],
  arena: ["paused", "intel", "skipped"],
  paused: ["arena", "menu", "skipped"],
  intel: ["arena", "skipped"],
  skipped: ["boot"],
};

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  return TRANSITIONS[from].includes(to);
}
