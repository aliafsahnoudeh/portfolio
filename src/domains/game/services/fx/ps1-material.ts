import * as THREE from "three";

/**
 * Vertex snapping resolution — roughly half the internal render buffer.
 * Lower values = more authentic PS1 polygon jitter.
 */
const SNAP = "vec2(427.0, 240.0)";

const cache = new Map<string, THREE.MeshLambertMaterial>();

/**
 * Shared flat-shaded Lambert material with PS1-style vertex snapping
 * injected after the projection transform. One instance per color.
 */
export function ps1Material(
  color: string,
  options?: { emissive?: string; emissiveIntensity?: number },
): THREE.MeshLambertMaterial {
  const key = `${color}|${options?.emissive ?? ""}|${options?.emissiveIntensity ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
    ...(options?.emissive && {
      emissive: new THREE.Color(options.emissive),
      emissiveIntensity: options.emissiveIntensity ?? 1,
    }),
  });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /* glsl */ `#include <project_vertex>
      gl_Position.xyz /= gl_Position.w;
      gl_Position.xy = floor(gl_Position.xy * ${SNAP}) / ${SNAP};
      gl_Position.xyz *= gl_Position.w;`,
    );
  };
  // All ps1 materials share one shader program despite onBeforeCompile.
  material.customProgramCacheKey = () => "ps1-snap";

  cache.set(key, material);
  return material;
}
