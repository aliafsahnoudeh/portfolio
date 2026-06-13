"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InstancedMesh } from "three";
import { pressed, triggered } from "@/domains/game/services/input/keyboard";
import { useGameStore } from "@/domains/game/services/state/store";
import { telemetry } from "@/domains/game/services/state/telemetry";
import { queryPoint } from "@/domains/game/services/arena/colliders";
import {
  BILLBOARD_BASE_Y,
  BILLBOARD_H,
  damageBillboard,
  getBillboards,
} from "@/domains/game/services/arena/billboards";
import { audio } from "@/domains/game/services/audio/audio-manager";
import { spawnExplosion, spawnShockwave } from "@/domains/game/services/weapons/effects";

const BULLETS = 24;
const MISSILES = 4;
const BULLET_SPEED = 55;
const BULLET_TTL = 1.4;
const BULLET_DAMAGE = 6;
const MG_INTERVAL = 0.13;
const MISSILE_SPEED = 26;
const MISSILE_TTL = 3.5;
const MISSILE_DAMAGE = 50;
const MISSILE_STEER = 1.4; // rad/s toward target
const MISSILE_CONE = (25 * Math.PI) / 180;
const SPECIAL_RADIUS = 14;
const SPECIAL_DAMAGE = 40;

interface Projectile {
  active: boolean;
  x: number;
  y: number;
  z: number;
  dx: number;
  dz: number;
  ttl: number;
}

const dummy = new THREE.Object3D();

function makePool(size: number): Projectile[] {
  return Array.from({ length: size }, () => ({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    dx: 0,
    dz: 1,
    ttl: 0,
  }));
}

function onBillboardKilled(slug: string) {
  const store = useGameStore.getState();
  store.markDestroyed(slug);
  const billboard = getBillboards().find((b) => b.slug === slug);
  if (billboard) {
    spawnExplosion(
      billboard.x,
      BILLBOARD_BASE_Y + BILLBOARD_H / 2,
      billboard.z,
      true,
    );
  }
  telemetry.shakeImpulse += 0.6;
  audio.play("explosion");
  // Let the explosion play before slamming the intel screen in.
  setTimeout(() => {
    const s = useGameStore.getState();
    if (s.phase === "arena") s.setPhase("intel", slug);
  }, 750);
}

function applyHit(slug: string | undefined, damage: number) {
  if (!slug) return;
  if (damageBillboard(slug, damage) === "destroyed") onBillboardKilled(slug);
}

/** Machine gun + missiles + special: firing, stepping, hits, instanced rendering. */
export function WeaponsLayer() {
  const bulletMeshRef = useRef<InstancedMesh>(null);
  const missileMeshRef = useRef<InstancedMesh>(null);
  const pools = useMemo(
    () => ({
      bullets: makePool(BULLETS),
      missiles: makePool(MISSILES),
      lastMg: 0,
    }),
    [],
  );

  useFrame((state, delta) => {
    const store = useGameStore.getState();
    const dt = Math.min(Math.max(delta, 1e-4), 1 / 30);
    const now = state.clock.elapsedTime;

    if (store.phase === "arena") {
      const fx = Math.sin(telemetry.playerHeading);
      const fz = Math.cos(telemetry.playerHeading);

      // Machine gun: A, full auto
      if (pressed.has("KeyA") && now - pools.lastMg > MG_INTERVAL) {
        const bullet = pools.bullets.find((b) => !b.active);
        if (bullet) {
          pools.lastMg = now;
          audio.play("mg");
          Object.assign(bullet, {
            active: true,
            x: telemetry.playerX + fx * 2.8,
            y: 0.9,
            z: telemetry.playerZ + fz * 2.8,
            dx: fx,
            dz: fz,
            ttl: BULLET_TTL,
          });
        }
      }

      // Missile: S, one per press (edge-triggered so quick taps land)
      if (triggered.has("KeyS") && store.useMissile()) {
        const missile = pools.missiles.find((m) => !m.active);
        if (missile) {
          audio.play("missile");
          Object.assign(missile, {
            active: true,
            x: telemetry.playerX + fx * 3,
            y: 1.1,
            z: telemetry.playerZ + fz * 3,
            dx: fx,
            dz: fz,
            ttl: MISSILE_TTL,
          });
        }
      }

      // Special: D — "Samovar Strike" radial blast
      if (triggered.has("KeyD") && store.useSpecial()) {
        spawnShockwave(telemetry.playerX, telemetry.playerZ);
        telemetry.shakeImpulse += 0.9;
        audio.play("explosion");
        for (const billboard of getBillboards()) {
          if (billboard.hp <= 0) continue;
          const dist = Math.hypot(
            billboard.x - telemetry.playerX,
            billboard.z - telemetry.playerZ,
          );
          if (dist <= SPECIAL_RADIUS) applyHit(billboard.slug, SPECIAL_DAMAGE);
        }
      }
    }
    // Consume weapon triggers every frame, in or out of the arena.
    triggered.delete("KeyS");
    triggered.delete("KeyD");

    // Step + collide (also while intel/paused? no — freeze with the sim)
    if (store.phase === "arena") {
      for (const bullet of pools.bullets) {
        if (!bullet.active) continue;
        bullet.x += bullet.dx * BULLET_SPEED * dt;
        bullet.z += bullet.dz * BULLET_SPEED * dt;
        bullet.ttl -= dt;
        const hit = bullet.ttl <= 0 ? null : queryPoint(bullet.x, bullet.z, 0.2);
        if (bullet.ttl <= 0 || hit) {
          if (hit) {
            spawnExplosion(bullet.x, bullet.y, bullet.z);
            if (hit !== "wall") applyHit(hit.id, BULLET_DAMAGE);
          }
          bullet.active = false;
        }
      }

      for (const missile of pools.missiles) {
        if (!missile.active) continue;
        // Soft homing toward the nearest live billboard in the front cone
        let bestSlug: string | null = null;
        let bestAngle = MISSILE_CONE;
        const heading = Math.atan2(missile.dx, missile.dz);
        for (const billboard of getBillboards()) {
          if (billboard.hp <= 0) continue;
          const toX = billboard.x - missile.x;
          const toZ = billboard.z - missile.z;
          const angle = Math.abs(
            THREE.MathUtils.euclideanModulo(
              Math.atan2(toX, toZ) - heading + Math.PI,
              Math.PI * 2,
            ) - Math.PI,
          );
          if (angle < bestAngle) {
            bestAngle = angle;
            bestSlug = billboard.slug;
          }
        }
        if (bestSlug) {
          const target = getBillboards().find((b) => b.slug === bestSlug)!;
          const desired = Math.atan2(target.x - missile.x, target.z - missile.z);
          const diff =
            THREE.MathUtils.euclideanModulo(
              desired - heading + Math.PI,
              Math.PI * 2,
            ) - Math.PI;
          const turn = THREE.MathUtils.clamp(
            diff,
            -MISSILE_STEER * dt,
            MISSILE_STEER * dt,
          );
          const newHeading = heading + turn;
          missile.dx = Math.sin(newHeading);
          missile.dz = Math.cos(newHeading);
        }
        missile.x += missile.dx * MISSILE_SPEED * dt;
        missile.z += missile.dz * MISSILE_SPEED * dt;
        missile.ttl -= dt;
        const hit =
          missile.ttl <= 0 ? null : queryPoint(missile.x, missile.z, 0.35);
        if (missile.ttl <= 0 || hit) {
          if (hit) {
            spawnExplosion(missile.x, missile.y, missile.z, true);
            telemetry.shakeImpulse += 0.25;
            if (hit !== "wall") applyHit(hit.id, MISSILE_DAMAGE);
          }
          missile.active = false;
        }
      }
    }

    // Render pools into instanced meshes
    const bulletMesh = bulletMeshRef.current;
    if (bulletMesh) {
      pools.bullets.forEach((bullet, i) => {
        dummy.position.set(bullet.x, bullet.y, bullet.z);
        dummy.scale.setScalar(bullet.active ? 1 : 0);
        dummy.rotation.set(0, Math.atan2(bullet.dx, bullet.dz), 0);
        dummy.updateMatrix();
        bulletMesh.setMatrixAt(i, dummy.matrix);
      });
      bulletMesh.instanceMatrix.needsUpdate = true;
    }
    const missileMesh = missileMeshRef.current;
    if (missileMesh) {
      pools.missiles.forEach((missile, i) => {
        dummy.position.set(missile.x, missile.y, missile.z);
        dummy.scale.setScalar(missile.active ? 1 : 0);
        dummy.rotation.set(0, Math.atan2(missile.dx, missile.dz), 0);
        dummy.updateMatrix();
        missileMesh.setMatrixAt(i, dummy.matrix);
      });
      missileMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh
        ref={bulletMeshRef}
        args={[undefined, undefined, BULLETS]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.1, 0.1, 0.5]} />
        <meshBasicMaterial color="#ffe27a" fog={false} />
      </instancedMesh>
      <instancedMesh
        ref={missileMeshRef}
        args={[undefined, undefined, MISSILES]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.22, 0.22, 1.1]} />
        <meshBasicMaterial color="#ff5a1f" fog={false} />
      </instancedMesh>
    </>
  );
}
