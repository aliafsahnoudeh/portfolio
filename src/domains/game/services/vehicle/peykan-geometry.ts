import * as THREE from "three";

/**
 * Procedural Peykan (Hillman Hunter silhouette), built from a side-profile
 * extrusion. Model space: +x = nose, y up, z = width. ~Real proportions:
 * 4.2m long, 1.62m wide, 1.42m tall. Flat-shaded, low-poly on purpose.
 */

export const BODY_WIDTH = 1.62;
export const GLASS_WIDTH = 1.46;

function profileGeometry(points: [number, number][], width: number) {
  // Shape must be counter-clockwise or the extruded faces point inward.
  const ccw = [...points].reverse();
  const shape = new THREE.Shape();
  shape.moveTo(ccw[0][0], ccw[0][1]);
  for (const [x, y] of ccw.slice(1)) shape.lineTo(x, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
  });
  // Center the extrusion on z.
  geometry.translate(0, 0, -width / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Lower body + cabin silhouette: flat hood, raked windshield, squared tail. */
export function bodyGeometry() {
  return profileGeometry(
    [
      [-2.1, 0.42], // rear lower corner
      [-2.12, 0.62], // rear face
      [-2.05, 0.93], // tail top
      [-1.5, 0.99], // trunk lid
      [-1.22, 1.36], // C-pillar base → roof
      [-0.12, 1.42], // roof front
      [0.58, 1.0], // windshield base / cowl
      [1.1, 0.97], // hood mid
      [2.08, 0.88], // hood front
      [2.14, 0.6], // front face
      [2.08, 0.42], // front lower corner
      [1.5, 0.3], // sill, front
      [-1.5, 0.3], // sill, rear
    ],
    BODY_WIDTH,
  );
}

/**
 * Greenhouse glass band. Slightly proud of the body profile so it forms the
 * visible cabin surface (windshield/roof/rear window read as dark glass),
 * while being narrower than the body so the side pillars stay white.
 */
export function glassGeometry() {
  return profileGeometry(
    [
      [0.62, 0.98],
      [-0.14, 1.46],
      [-1.26, 1.41],
      [-1.52, 0.98],
    ],
    GLASS_WIDTH,
  );
}

export function wheelGeometry() {
  const geometry = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
  geometry.rotateX(Math.PI / 2); // axis along z (car width)
  return geometry;
}

export function hubcapGeometry() {
  const geometry = new THREE.CylinderGeometry(0.14, 0.14, 0.24, 8);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

/** Wheel positions in model space: [x, y, z]. Front pair first. */
export const WHEEL_POSITIONS: [number, number, number][] = [
  [1.32, 0.32, 0.72],
  [1.32, 0.32, -0.72],
  [-1.32, 0.32, 0.72],
  [-1.32, 0.32, -0.72],
];
