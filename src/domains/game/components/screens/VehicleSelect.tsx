"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useTranslations } from "next-intl";
import { useGameStore } from "@/domains/game/services/state/store";
import { audio } from "@/domains/game/services/audio/audio-manager";
import { Peykan } from "@/domains/game/components/vehicle/Peykan";
import { ps1Material } from "@/domains/game/services/fx/ps1-material";
import { ControlsLegend } from "./ControlsLegend";

function Turntable() {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6;
  });
  return (
    <group ref={groupRef}>
      <Peykan />
      <mesh position={[0, -0.06, 0]} material={ps1Material("#241f1a")}>
        <cylinderGeometry args={[3.2, 3.4, 0.12, 18]} />
      </mesh>
    </group>
  );
}

function VehicleStage() {
  return (
    <Canvas
      gl={{ antialias: false }}
      dpr={0.35}
      camera={{ position: [4.2, 2.2, 4.2], fov: 38 }}
      style={{ imageRendering: "pixelated" }}
      flat
      onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}
    >
      <color attach="background" args={["#110d0a"]} />
      <ambientLight intensity={1.1} color="#cdbfae" />
      <directionalLight position={[4, 7, 3]} intensity={2.4} color="#ffe9c9" />
      <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#c81d1d" />
      <Turntable />
    </Canvas>
  );
}

const DRIVER_STATS = [
  { key: "statSpeed", value: 8 },
  { key: "statArmor", value: 9 },
  { key: "statSpecial", value: 10 },
] as const;

export function VehicleSelect() {
  const setPhase = useGameStore((state) => state.setPhase);
  const t = useTranslations("vehicleSelect");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        event.preventDefault();
        audio.play("menuConfirm");
        setPhase("arena");
      } else if (event.code === "Escape") {
        setPhase("menu");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPhase]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <h2 className="tm-logo text-4xl sm:text-5xl">{t("title")}</h2>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {/* Vehicle stage: the Peykan on a rotating turntable */}
        <section className="tm-panel flex flex-col gap-3 p-4">
          <div className="h-56 w-full">
            <VehicleStage />
          </div>
          <div className="text-center">
            <h3 className="tm-display text-bone text-2xl">
              {t("vehicleName")}
            </h3>
            <p className="text-ash text-xs">{t("vehicleSub")}</p>
          </div>
        </section>

        {/* Driver dossier */}
        <section className="tm-panel flex flex-col gap-4 p-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/driver-portrait.svg"
              alt={t("driverName")}
              width={88}
              height={88}
              className="border-rivet border [image-rendering:pixelated]"
            />
            <div>
              <p className="tm-display text-ash text-xs">{t("driver")}</p>
              <p className="tm-display text-ember text-3xl">
                {t("driverName")}
              </p>
            </div>
          </div>
          <p className="text-ash text-sm leading-relaxed">{t("driverBlurb")}</p>
          <dl className="space-y-2">
            {DRIVER_STATS.map(({ key, value }) => (
              <div key={key} className="space-y-1">
                <dt className="tm-display text-ash text-xs">{t(key)}</dt>
                <dd className="m-0 flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      className="tm-seg"
                      data-on={i < value}
                      aria-hidden
                    />
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="flex w-full max-w-4xl items-end justify-between gap-6">
        <ControlsLegend />
        <p className="tm-display text-bone tm-blink text-xl">{t("confirm")}</p>
      </div>
    </div>
  );
}
