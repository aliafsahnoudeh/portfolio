"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { ps1Material } from "@/domains/game/services/fx/ps1-material";
import {
  aabbFromBox,
  ARENA_HALF,
  setColliders,
} from "@/domains/game/services/arena/colliders";
import type { AABB } from "@/domains/game/types";

const GROUND = "#5a5345";
const GROUND_ALT = "#4c4639";
const WALL = "#6a5d48";

interface Prop {
  kind: "crate" | "tires" | "pillar";
  x: number;
  z: number;
}

const PROPS: Prop[] = [
  { kind: "crate", x: 8, z: 5 },
  { kind: "crate", x: -12, z: 18 },
  { kind: "crate", x: 20, z: -14 },
  { kind: "crate", x: -25, z: -8 },
  { kind: "crate", x: 15, z: 28 },
  { kind: "crate", x: -18, z: -30 },
  { kind: "tires", x: -8, z: 14 },
  { kind: "tires", x: -30, z: 10 },
  { kind: "tires", x: 28, z: 12 },
  { kind: "tires", x: 10, z: -32 },
  { kind: "pillar", x: 36, z: 36 },
  { kind: "pillar", x: -36, z: 36 },
  { kind: "pillar", x: 36, z: -36 },
  { kind: "pillar", x: -36, z: -36 },
];

export function propColliders(): AABB[] {
  return PROPS.map((prop) =>
    prop.kind === "crate"
      ? aabbFromBox(prop.x, prop.z, 2.2, 2.2)
      : prop.kind === "tires"
        ? aabbFromBox(prop.x, prop.z, 1.8, 1.8)
        : aabbFromBox(prop.x, prop.z, 3.2, 3.2),
  );
}

function groundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = GROUND_ALT;
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(32, 32, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

/** The arena: checkered ground, perimeter walls, PS1 clutter. */
export function Arena({ extraColliders }: { extraColliders?: AABB[] }) {
  const texture = useMemo(() => groundTexture(), []);
  const size = ARENA_HALF * 2 + 4;

  useEffect(() => {
    setColliders([...propColliders(), ...(extraColliders ?? [])]);
    return () => setColliders([]);
  }, [extraColliders]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshLambertMaterial map={texture} />
      </mesh>

      {/* Perimeter walls */}
      {(
        [
          [0, -(ARENA_HALF + 1), size + 2, 2],
          [0, ARENA_HALF + 1, size + 2, 2],
          [-(ARENA_HALF + 1), 0, 2, size + 2],
          [ARENA_HALF + 1, 0, 2, size + 2],
        ] as const
      ).map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 1.5, z]} material={ps1Material(WALL)}>
          <boxGeometry args={[w, 3, d]} />
        </mesh>
      ))}
      {/* Hazard stripe along wall tops */}
      {(
        [
          [0, -(ARENA_HALF + 1), size + 2.1, 2.1],
          [0, ARENA_HALF + 1, size + 2.1, 2.1],
          [-(ARENA_HALF + 1), 0, 2.1, size + 2.1],
          [ARENA_HALF + 1, 0, 2.1, size + 2.1],
        ] as const
      ).map(([x, z, w, d], i) => (
        <mesh
          key={`stripe-${i}`}
          position={[x, 3.1, z]}
          material={ps1Material("#8a1d12")}
        >
          <boxGeometry args={[w, 0.25, d]} />
        </mesh>
      ))}

      {/* Clutter */}
      {PROPS.map((prop, i) => {
        if (prop.kind === "crate") {
          return (
            <mesh
              key={i}
              position={[prop.x, 1, prop.z]}
              rotation-y={(i * 0.7) % 1.2}
              material={ps1Material("#6e5a3a")}
            >
              <boxGeometry args={[2, 2, 2]} />
            </mesh>
          );
        }
        if (prop.kind === "tires") {
          return (
            <group key={i} position={[prop.x, 0, prop.z]}>
              {[0.25, 0.72, 1.19].map((y, j) => (
                <mesh
                  key={j}
                  position={[0, y, 0]}
                  material={ps1Material("#1c1a17")}
                >
                  <cylinderGeometry args={[0.85, 0.85, 0.45, 10]} />
                </mesh>
              ))}
            </group>
          );
        }
        return (
          <mesh
            key={i}
            position={[prop.x, 3, prop.z]}
            material={ps1Material("#55483a")}
          >
            <boxGeometry args={[3, 6, 3]} />
          </mesh>
        );
      })}
    </group>
  );
}
