import { useGameStore } from "@/domains/game/services/state/store";

/**
 * Singleton pressed-keys tracker, read synchronously inside the game loop.
 * Menus use their own discrete keydown handlers; this is for held keys.
 */
export const pressed = new Set<string>();

/**
 * Edge-triggered keys (one entry per physical press, no auto-repeat).
 * Consumers delete what they handle; a quick tap between two frames is
 * never lost the way a polled `pressed` check would lose it.
 */
export const triggered = new Set<string>();

// Keys whose browser default (scrolling) must be suppressed during play.
const CAPTURED = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
]);

let detach: (() => void) | null = null;

export function attachKeyboard(): () => void {
  if (detach) return detach;

  const onKeyDown = (event: KeyboardEvent) => {
    pressed.add(event.code);
    if (!event.repeat) triggered.add(event.code);
    const { phase } = useGameStore.getState();
    if (
      CAPTURED.has(event.code) &&
      (phase === "arena" || phase === "vehicleSelect" || phase === "paused")
    ) {
      event.preventDefault();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    pressed.delete(event.code);
  };
  const onBlur = () => {
    pressed.clear();
    triggered.clear();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  detach = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    pressed.clear();
    detach = null;
  };
  return detach;
}
