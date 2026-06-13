/**
 * Per-frame values shared between the game loop and the DOM HUD without
 * going through React state (no re-renders at 60fps). The controller
 * writes; the HUD reads in its own rAF.
 */
export const telemetry = {
  speed: 0, // m/s, signed
  turbo: 1, // 0..1
  specialReadyIn: 0, // seconds until special is ready, 0 = ready
  playerX: 0,
  playerZ: 0,
  playerHeading: 0,
  shakeImpulse: 0, // weapons add to this; the camera controller consumes it
};
