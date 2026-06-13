"use client";

import { useEffect, useRef } from "react";
import { ARENA_HALF } from "@/domains/game/services/arena/colliders";
import { getBillboards } from "@/domains/game/services/arena/billboards";
import { telemetry } from "@/domains/game/services/state/telemetry";

const SIZE = 128;
const PAD = 6;

/** 2D canvas minimap, redrawn in its own rAF outside React. */
export function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const scale = (SIZE - PAD * 2) / (ARENA_HALF * 2);
    const toMap = (v: number) => PAD + (v + ARENA_HALF) * scale;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = "rgba(10, 9, 8, 0.65)";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.strokeStyle = "#4a4138";
      ctx.lineWidth = 2;
      ctx.strokeRect(PAD, PAD, SIZE - PAD * 2, SIZE - PAD * 2);

      for (const billboard of getBillboards()) {
        ctx.fillStyle = billboard.hp > 0 ? "#ff5a1f" : "#55504a";
        ctx.fillRect(toMap(billboard.x) - 3, toMap(billboard.z) - 3, 6, 6);
      }

      // Player triangle. Map is a plain top-down view (world +z = map down),
      // so a heading of 0 (facing +z) points the triangle down-map.
      const px = toMap(telemetry.playerX);
      const pz = toMap(telemetry.playerZ);
      const h = telemetry.playerHeading;
      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(Math.PI - h);
      ctx.fillStyle = "#e8e0cf";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4.5, 5);
      ctx.lineTo(-4.5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      aria-hidden
      className="border-rivet pointer-events-none absolute top-12 right-4 border"
    />
  );
}
