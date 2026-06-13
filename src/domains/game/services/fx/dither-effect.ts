import { Effect } from "postprocessing";

/**
 * 4×4 Bayer ordered dithering + quantization to 5 bits per channel —
 * the PS1's RGB555 framebuffer. This pass is most of the "PS1 look".
 */
const fragmentShader = /* glsl */ `
  const float bayer[16] = float[16](
     0.0,  8.0,  2.0, 10.0,
    12.0,  4.0, 14.0,  6.0,
     3.0, 11.0,  1.0,  9.0,
    15.0,  7.0, 13.0,  5.0
  );

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    ivec2 p = ivec2(mod(uv * resolution, 4.0));
    float threshold = (bayer[p.y * 4 + p.x] + 0.5) / 16.0 - 0.5;
    vec3 color = inputColor.rgb + threshold / 31.0;
    color = floor(color * 31.0 + 0.5) / 31.0;
    outputColor = vec4(color, inputColor.a);
  }
`;

export class DitherPosterizeEffect extends Effect {
  constructor() {
    super("DitherPosterizeEffect", fragmentShader);
  }
}
