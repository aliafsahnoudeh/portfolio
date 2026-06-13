"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import { ps1Material } from "@/domains/game/services/fx/ps1-material";
import { createBillboardTexture } from "@/domains/game/services/arena/billboard-texture";
import {
  BILLBOARD_BASE_Y,
  BILLBOARD_H,
  BILLBOARD_W,
} from "@/domains/game/services/arena/billboards";
import type { BillboardState } from "@/domains/game/types";

const DEBRIS_COUNT = 7;
const DEBRIS_SECONDS = 1.4;

// Pre-rolled debris trajectories (deterministic, no per-frame allocation).
const DEBRIS_DIRS = Array.from({ length: DEBRIS_COUNT }, (_, i) => {
  const a = (i / DEBRIS_COUNT) * Math.PI * 2 + 0.7;
  return {
    vx: Math.sin(a) * (2.5 + (i % 3)),
    vy: 5 + (i % 4) * 1.5,
    vz: Math.cos(a) * (2.5 + ((i + 1) % 3)),
    spin: 2 + (i % 5),
  };
});

/**
 * One project billboard: legs + textured face. Damage tints the face;
 * destruction swaps it for ballistic debris and leaves a charred stump.
 */
export function Billboard({ state }: { state: BillboardState }) {
  const faceRef = useRef<Mesh>(null);
  const intactRef = useRef<Group>(null);
  const debrisRef = useRef<Group>(null);

  const texture = useMemo(
    () => createBillboardTexture(state.title),
    [state.title],
  );
  // Unlit, like real PS1 billboards — stays readable regardless of lighting.
  const faceMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: texture }),
    [texture],
  );

  useFrame(() => {
    // Damage tint
    const material = faceRef.current?.material as
      | MeshBasicMaterial
      | undefined;
    if (material) {
      const wounded = state.hp < 66 && state.hp > 0;
      material.color.setScalar(wounded ? 0.55 : 1);
    }

    // Destruction: hide the intact board, animate debris
    const destroyed = state.destroyedAt !== null;
    if (intactRef.current) intactRef.current.visible = !destroyed;
    if (debrisRef.current) {
      if (!destroyed) {
        debrisRef.current.visible = false;
      } else {
        const t = (performance.now() - state.destroyedAt!) / 1000;
        if (t > DEBRIS_SECONDS) {
          debrisRef.current.visible = false;
        } else {
          debrisRef.current.visible = true;
          debrisRef.current.children.forEach((child, i) => {
            const d = DEBRIS_DIRS[i];
            child.position.set(
              d.vx * t,
              Math.max(
                0.2,
                BILLBOARD_BASE_Y + BILLBOARD_H / 2 + d.vy * t - 9.8 * t * t,
              ),
              d.vz * t,
            );
            child.rotation.set(d.spin * t, d.spin * t * 0.7, 0);
          });
        }
      }
    }
  });

  return (
    <group position={[state.x, 0, state.z]} rotation-y={state.rotY}>
      <group ref={intactRef}>
        {/* Legs */}
        {[-BILLBOARD_W / 2 + 0.5, BILLBOARD_W / 2 - 0.5].map((x) => (
          <mesh
            key={x}
            position={[x, BILLBOARD_BASE_Y / 2, 0]}
            material={ps1Material("#3a332a")}
          >
            <boxGeometry args={[0.45, BILLBOARD_BASE_Y, 0.45]} />
          </mesh>
        ))}
        {/* Face */}
        <mesh
          ref={faceRef}
          position={[0, BILLBOARD_BASE_Y + BILLBOARD_H / 2, 0]}
          material={faceMaterial}
        >
          <boxGeometry args={[BILLBOARD_W, BILLBOARD_H, 0.3]} />
        </mesh>
      </group>

      {/* Charred stump remains as the wreck */}
      {state.destroyedAt !== null && (
        <mesh position={[0, 0.7, 0]} material={ps1Material("#1c1815")}>
          <boxGeometry args={[BILLBOARD_W * 0.7, 1.4, 0.8]} />
        </mesh>
      )}

      <group ref={debrisRef} visible={false}>
        {DEBRIS_DIRS.map((_, i) => (
          <mesh key={i} material={ps1Material("#4a3a2a")}>
            <boxGeometry args={[0.7, 0.5, 0.2]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
