"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import {
  explosionSlots,
  FLASH_SECONDS,
  shockwave,
  SPARK_DIRS,
  SPARK_SECONDS,
} from "@/domains/game/services/weapons/effects";

/** Renders the pooled flash + spark explosions and the special's shockwave ring. */
export function Explosions() {
  const groupRefs = useRef<(Group | null)[]>([]);
  const ringRef = useRef<Mesh>(null);

  useFrame(() => {
    const now = performance.now();

    explosionSlots.forEach((slot, index) => {
      const group = groupRefs.current[index];
      if (!group) return;
      if (slot.start === 0) {
        group.visible = false;
        return;
      }
      const t = (now - slot.start) / 1000;
      if (t > SPARK_SECONDS) {
        slot.start = 0;
        group.visible = false;
        return;
      }
      group.visible = true;
      group.position.set(slot.x, slot.y, slot.z);
      const scale = slot.big ? 1.6 : 1;

      const [flash, ...sparks] = group.children;
      // Flash ball: grow fast, fade out
      const flashT = Math.min(1, t / FLASH_SECONDS);
      flash.visible = flashT < 1;
      flash.scale.setScalar((0.6 + flashT * 2.6) * scale);
      ((flash as Mesh).material as MeshBasicMaterial).opacity = 1 - flashT;
      // Sparks: ballistic
      sparks.forEach((spark, i) => {
        const d = SPARK_DIRS[i];
        spark.position.set(
          d.vx * t * scale,
          d.vy * t - 9.8 * t * t,
          d.vz * t * scale,
        );
        spark.rotation.x = t * 7;
        ((spark as Mesh).material as MeshBasicMaterial).opacity =
          1 - t / SPARK_SECONDS;
      });
    });

    // Shockwave ring
    const ring = ringRef.current;
    if (ring) {
      const t = (now - shockwave.start) / 1000;
      if (shockwave.start === 0 || t > 0.6) {
        ring.visible = false;
      } else {
        ring.visible = true;
        ring.position.set(shockwave.x, 0.3, shockwave.z);
        const r = 1 + (t / 0.6) * 14;
        ring.scale.set(r, r, 1);
        (ring.material as MeshBasicMaterial).opacity = 0.9 * (1 - t / 0.6);
      }
    }
  });

  return (
    <>
      {explosionSlots.map((_, index) => (
        <group
          key={index}
          visible={false}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
        >
          <mesh>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial
              color="#ffd27a"
              transparent
              opacity={1}
              fog={false}
            />
          </mesh>
          {SPARK_DIRS.map((_, i) => (
            <mesh key={i}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshBasicMaterial
                color={i % 2 ? "#ff5a1f" : "#ffa222"}
                transparent
                opacity={1}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      <mesh ref={ringRef} visible={false} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.85, 1, 24]} />
        <meshBasicMaterial
          color="#ffa222"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </>
  );
}
