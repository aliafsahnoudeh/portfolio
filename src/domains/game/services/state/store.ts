import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GamePhase } from "@/domains/game/types";
import { canTransition } from "./machine";

export const MAX_HP = 100;
export const MAX_MISSILES = 4;
export const SPECIAL_COOLDOWN_MS = 30_000;

interface GameState {
  phase: GamePhase;
  intelSlug: string | null;
  hp: number;
  turbo: number; // 0..1, regenerates while driving
  missiles: number;
  specialReadyAt: number; // epoch ms
  destroyed: string[];
  // settings (persisted)
  muted: boolean;
  crt: boolean;

  setPhase: (next: GamePhase, intelSlug?: string | null) => void;
  damage: (amount: number) => void;
  setTurbo: (value: number) => void;
  useMissile: () => boolean;
  useSpecial: () => boolean;
  markDestroyed: (slug: string) => void;
  respawn: () => void;
  resetRun: () => void;
  toggleMute: () => void;
  toggleCrt: () => void;
}

const initialRun = {
  hp: MAX_HP,
  turbo: 1,
  missiles: MAX_MISSILES,
  specialReadyAt: 0,
  destroyed: [] as string[],
  intelSlug: null as string | null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: "boot",
      ...initialRun,
      muted: false,
      crt: true,

      setPhase: (next, intelSlug = null) => {
        const { phase } = get();
        if (phase === next) return;
        if (!canTransition(phase, next)) return;
        set({
          phase: next,
          intelSlug: next === "intel" ? intelSlug : null,
          ...(next === "vehicleSelect" ? initialRun : null),
        });
      },

      damage: (amount) =>
        set((state) => ({ hp: Math.max(0, state.hp - amount) })),

      setTurbo: (value) => set({ turbo: Math.min(1, Math.max(0, value)) }),

      useMissile: () => {
        const { missiles } = get();
        if (missiles <= 0) return false;
        set({ missiles: missiles - 1 });
        return true;
      },

      useSpecial: () => {
        const now = Date.now();
        if (now < get().specialReadyAt) return false;
        set({ specialReadyAt: now + SPECIAL_COOLDOWN_MS });
        return true;
      },

      markDestroyed: (slug) =>
        set((state) =>
          state.destroyed.includes(slug)
            ? state
            : { destroyed: [...state.destroyed, slug] },
        ),

      /** After a wreck: refill armor, keep progress. */
      respawn: () => set({ hp: MAX_HP }),

      resetRun: () => set(initialRun),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      toggleCrt: () => set((state) => ({ crt: !state.crt })),
    }),
    {
      name: "tp-settings",
      partialize: (state) => ({ muted: state.muted, crt: state.crt }),
    },
  ),
);
