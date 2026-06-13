"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, PerspectiveCamera } from "three";
import { pressed } from "@/domains/game/services/input/keyboard";
import { useGameStore } from "@/domains/game/services/state/store";
import { telemetry } from "@/domains/game/services/state/telemetry";
import { collideCircle } from "@/domains/game/services/arena/colliders";
import { audio } from "@/domains/game/services/audio/audio-manager";
import type { CarApi, PeykanMotion } from "@/domains/game/types";

// Tuning — arcade, not simulation.
const V_MAX = 24; // m/s forward
const V_REVERSE = 9;
const TURBO_MULT = 1.55;
const ACCEL = 1.4; // damp lambda toward target speed
const BRAKE = 3.2;
const STEER_RATE = 2.2; // rad/s at full grip-speed
const GRIP = 8;
const GRIP_DRIFT = 2.4;
const CAR_RADIUS = 1.35;
const TURBO_DRAIN = 0.55; // per second
const TURBO_REGEN = 0.16;
const IMPACT_DAMAGE_SPEED = 9; // m/s into a surface before it hurts

const FOV_BASE = 60;
const FOV_TURBO = 70;

// Module-scoped temporaries — zero allocation in the loop.
const forward = new THREE.Vector2();
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

/**
 * Kinematic arcade car: damp toward engine speed, lerp velocity toward the
 * facing direction (grip), integrate, collide, drive the chase camera.
 */
export function useCarController(
  carRef: React.RefObject<Group | null>,
  motionRef: React.RefObject<PeykanMotion>,
): CarApi {
  const pos = useRef(new THREE.Vector3(0, 0, -30)).current;
  const vel = useRef(new THREE.Vector2()).current; // x ↔ world x, y ↔ world z
  const state = useRef({
    heading: 0,
    engineSpeed: 0,
    shake: 0,
    camInitialized: false,
  }).current;
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== "arena") {
      telemetry.speed = 0;
      return;
    }
    // Clamp both ways: delta is 0 on the first frame (NaN division risk).
    const dt = Math.min(Math.max(delta, 1e-4), 1 / 30);

    // --- input
    const up = pressed.has("ArrowUp");
    const down = pressed.has("ArrowDown");
    const left = pressed.has("ArrowLeft");
    const right = pressed.has("ArrowRight");
    const space = pressed.has("Space");
    const steerInput = (left ? 1 : 0) - (right ? 1 : 0);

    // --- turbo / handbrake (Space steers double duty, like R1)
    const store = useGameStore.getState();
    let turbo = telemetry.turbo;
    const wantsTurbo = space && steerInput === 0 && up && turbo > 0.05;
    const drifting = space && steerInput !== 0 && Math.abs(state.engineSpeed) > 4;
    turbo = wantsTurbo
      ? Math.max(0, turbo - TURBO_DRAIN * dt)
      : Math.min(1, turbo + TURBO_REGEN * dt);
    telemetry.turbo = turbo;

    // --- throttle
    const vMax = wantsTurbo ? V_MAX * TURBO_MULT : V_MAX;
    const target = up ? vMax : down ? -V_REVERSE : 0;
    const lambda = up || down ? ACCEL : BRAKE;
    const prevSpeed = state.engineSpeed;
    state.engineSpeed = THREE.MathUtils.damp(
      state.engineSpeed,
      target,
      lambda,
      dt,
    );

    // --- steering (scaled by speed so there's no pivot-in-place)
    const speedFactor = THREE.MathUtils.clamp(
      Math.abs(state.engineSpeed) / (V_MAX * 0.2),
      0,
      1,
    );
    const highSpeedEase = THREE.MathUtils.lerp(
      1,
      0.7,
      Math.abs(state.engineSpeed) / V_MAX,
    );
    const driftSteerBoost = drifting ? 1.5 : 1;
    state.heading +=
      steerInput *
      STEER_RATE *
      speedFactor *
      highSpeedEase *
      driftSteerBoost *
      Math.sign(state.engineSpeed || 1) *
      dt;

    // --- grip: velocity chases the facing direction
    forward.set(Math.sin(state.heading), Math.cos(state.heading));
    const grip = drifting ? GRIP_DRIFT : GRIP;
    const blend = 1 - Math.exp(-grip * dt);
    vel.x += (forward.x * state.engineSpeed - vel.x) * blend;
    vel.y += (forward.y * state.engineSpeed - vel.y) * blend;

    // --- integrate + collide
    pos.x += vel.x * dt;
    pos.z += vel.y * dt;
    const impact = collideCircle(pos, CAR_RADIUS, vel);
    if (impact > IMPACT_DAMAGE_SPEED) {
      store.damage(Math.round((impact - IMPACT_DAMAGE_SPEED) * 1.5));
      state.shake = Math.min(1, state.shake + impact / 30);
      state.engineSpeed *= 0.4;
      audio.play("hit");
    }
    // Weapons (explosions, special) feed shake through telemetry.
    if (telemetry.shakeImpulse > 0) {
      state.shake = Math.min(1, state.shake + telemetry.shakeImpulse);
      telemetry.shakeImpulse = 0;
    }
    state.shake = THREE.MathUtils.damp(state.shake, 0, 6, dt);

    // Wrecked: refill armor and respawn at the start position.
    if (useGameStore.getState().hp <= 0) {
      useGameStore.getState().respawn();
      pos.set(0, 0, -30);
      vel.set(0, 0);
      state.heading = 0;
      state.engineSpeed = 0;
      state.shake = 1;
      state.camInitialized = false;
    }

    audio.updateEngine(state.engineSpeed, wantsTurbo);

    telemetry.speed = state.engineSpeed;
    telemetry.playerX = pos.x;
    telemetry.playerZ = pos.z;
    telemetry.playerHeading = state.heading;
    telemetry.specialReadyIn = Math.max(
      0,
      (store.specialReadyAt - Date.now()) / 1000,
    );

    // --- write transforms
    const car = carRef.current;
    if (car) {
      car.position.copy(pos);
      car.rotation.y = state.heading;
    }
    const motion = motionRef.current;
    if (motion) {
      motion.steer = THREE.MathUtils.damp(motion.steer, steerInput, 10, dt);
      motion.spinSpeed = state.engineSpeed / 0.32;
      motion.lean = THREE.MathUtils.damp(
        motion.lean,
        -steerInput * speedFactor * 0.05,
        8,
        dt,
      );
      motion.pitch = THREE.MathUtils.damp(
        motion.pitch,
        THREE.MathUtils.clamp((state.engineSpeed - prevSpeed) / dt / 60, -0.05, 0.05),
        6,
        dt,
      );
    }

    // --- chase camera
    camTarget.set(
      pos.x - forward.x * 7,
      3.2,
      pos.z - forward.y * 7,
    );
    if (!state.camInitialized) {
      camera.position.copy(camTarget);
      state.camInitialized = true;
    } else {
      const camBlend = 1 - Math.exp(-4 * dt);
      camera.position.lerp(camTarget, camBlend);
    }
    // Impact shake
    if (state.shake > 0.01) {
      camera.position.x += (Math.random() - 0.5) * state.shake * 0.5;
      camera.position.y += (Math.random() - 0.5) * state.shake * 0.3;
    }
    lookTarget.set(
      pos.x + forward.x * 2,
      1,
      pos.z + forward.y * 2,
    );
    camera.lookAt(lookTarget);
    const targetFov = wantsTurbo ? FOV_TURBO : FOV_BASE;
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 5, dt);
      camera.updateProjectionMatrix();
    }
  });

  return {
    pos,
    heading: () => state.heading,
    velocity: () => vel,
  };
}
