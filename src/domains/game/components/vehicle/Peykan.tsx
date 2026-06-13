"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { ps1Material } from "@/domains/game/services/fx/ps1-material";
import {
  BODY_WIDTH,
  bodyGeometry,
  glassGeometry,
  hubcapGeometry,
  WHEEL_POSITIONS,
  wheelGeometry,
} from "@/domains/game/services/vehicle/peykan-geometry";
import type { PeykanMotion } from "@/domains/game/types";

const WHITE = "#e9e6dd";
const GLASS = "#23303d";
const DARK = "#1b1916";
const CHROME = "#b9b4a8";

/**
 * The white Peykan 1374: body-colored fiberglass bumpers, no chrome trim.
 * Faces +z at identity (matches heading 0 in the controller).
 */
export function Peykan({
  motion,
}: {
  motion?: React.RefObject<PeykanMotion>;
}) {
  const bodyRef = useRef<Group>(null);
  const frontWheelRefs = [useRef<Group>(null), useRef<Group>(null)];
  const wheelSpin = useRef(0);
  const spinRefs = useRef<(Group | null)[]>([]);

  const geo = useMemo(
    () => ({
      body: bodyGeometry(),
      glass: glassGeometry(),
      wheel: wheelGeometry(),
      hubcap: hubcapGeometry(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const m = motion?.current;
    if (!m) return;
    wheelSpin.current += m.spinSpeed * delta;
    for (const wheel of spinRefs.current) {
      // Wheels roll about the car-width axis (z in profile space).
      if (wheel) wheel.rotation.z = -wheelSpin.current;
    }
    for (const front of frontWheelRefs) {
      if (front.current) front.current.rotation.y = m.steer * 0.45;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.x = m.lean;
      bodyRef.current.rotation.z = m.pitch;
    }
  });

  return (
    // Profile space builds the car along +x; rotate so the nose faces +z.
    <group rotation-y={-Math.PI / 2}>
      <group ref={bodyRef}>
        {/* Body shell */}
        <mesh geometry={geo.body} material={ps1Material(WHITE)} />
        {/* Glass band */}
        <mesh geometry={geo.glass} material={ps1Material(GLASS)} />

        {/* Bumpers — body-colored fiberglass (model 1374) */}
        <mesh position={[2.2, 0.5, 0]} material={ps1Material(WHITE)}>
          <boxGeometry args={[0.14, 0.13, BODY_WIDTH + 0.08]} />
        </mesh>
        <mesh position={[-2.18, 0.5, 0]} material={ps1Material(WHITE)}>
          <boxGeometry args={[0.14, 0.13, BODY_WIDTH + 0.08]} />
        </mesh>

        {/* Grille */}
        <mesh position={[2.13, 0.74, 0]} material={ps1Material(DARK)}>
          <boxGeometry args={[0.05, 0.16, 1.1]} />
        </mesh>
        {/* Headlights */}
        {[0.66, -0.66].map((z) => (
          <mesh
            key={`head-${z}`}
            position={[2.13, 0.74, z]}
            material={ps1Material("#fff7d6", {
              emissive: "#fff3b0",
              emissiveIntensity: 0.7,
            })}
          >
            <boxGeometry args={[0.06, 0.15, 0.15]} />
          </mesh>
        ))}
        {/* Tail lights */}
        {[0.6, -0.6].map((z) => (
          <mesh
            key={`tail-${z}`}
            position={[-2.16, 0.76, z]}
            material={ps1Material("#7a1010", {
              emissive: "#c81d1d",
              emissiveIntensity: 0.5,
            })}
          >
            <boxGeometry args={[0.05, 0.12, 0.3]} />
          </mesh>
        ))}
        {/* License plate */}
        <mesh position={[2.28, 0.5, 0]} material={ps1Material("#f5f2e8")}>
          <boxGeometry args={[0.02, 0.1, 0.32]} />
        </mesh>
        {/* Side mirrors */}
        {[0.84, -0.84].map((z) => (
          <mesh
            key={`mirror-${z}`}
            position={[0.62, 1.08, z]}
            material={ps1Material(CHROME)}
          >
            <boxGeometry args={[0.1, 0.08, 0.06]} />
          </mesh>
        ))}
      </group>

      {/* Wheels: front pair steers via wrapper group */}
      {WHEEL_POSITIONS.map(([x, y, z], index) => {
        const wheel = (
          <group
            ref={(node) => {
              spinRefs.current[index] = node;
            }}
          >
            <mesh geometry={geo.wheel} material={ps1Material("#14110e")} />
            <mesh geometry={geo.hubcap} material={ps1Material(CHROME)} />
          </group>
        );
        return index < 2 ? (
          <group key={index} position={[x, y, z]} ref={frontWheelRefs[index]}>
            {wheel}
          </group>
        ) : (
          <group key={index} position={[x, y, z]}>
            {wheel}
          </group>
        );
      })}

      {/* Blob shadow — PS1 had no real shadows */}
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2.3, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
