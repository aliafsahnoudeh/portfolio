import * as THREE from "three";

const WIDTH = 1024;
const HEIGHT = 512;

/**
 * Bakes a project title into a billboard face texture. Uses the locale's
 * display font (resolved from the next/font CSS variable) and redraws once
 * web fonts finish loading.
 */
export function createBillboardTexture(title: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const isRtl = document.documentElement.dir === "rtl";
  const fontVar = isRtl ? "--font-lalezar" : "--font-metal";
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue(fontVar)
      .trim() || "sans-serif";

  const draw = () => {
    // Steel panel — bright enough to read against fog and dithering
    const panel = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    panel.addColorStop(0, "#3b352c");
    panel.addColorStop(1, "#2a251e");
    ctx.fillStyle = panel;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Hazard border
    ctx.strokeStyle = "#a8281a";
    ctx.lineWidth = 28;
    ctx.strokeRect(14, 14, WIDTH - 28, HEIGHT - 28);
    ctx.strokeStyle = "#0c0a08";
    ctx.lineWidth = 8;
    ctx.strokeRect(32, 32, WIDTH - 64, HEIGHT - 64);
    // Accent bar
    ctx.fillStyle = "#e03318";
    ctx.fillRect(80, HEIGHT - 110, WIDTH - 160, 14);
    // Title
    ctx.fillStyle = "#f5eedb";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = isRtl ? "rtl" : "ltr";
    let size = 190;
    do {
      ctx.font = `${size}px ${family}`;
      size -= 10;
    } while (ctx.measureText(title).width > WIDTH - 180 && size > 60);
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 8;
    ctx.fillText(title, WIDTH / 2, HEIGHT / 2 - 28);
    ctx.shadowOffsetY = 0;
    texture.needsUpdate = true;
  };

  draw();
  document.fonts?.ready.then(draw).catch(() => {});
  return texture;
}
