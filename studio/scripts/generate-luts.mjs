#!/usr/bin/env node
/**
 * Procedural 3D Color Grading LUT Generator (.cube) for Reading Room Cinema.
 *
 * Preserves the 3 original baseline LUTs untouched by default:
 *   - editorial-warm.cube
 *   - documentary-slate.cube
 *   - clean-room-pop.cube
 *
 * Generates 9 distinct DaVinci Resolve / FFmpeg `lut3d`-compatible `.cube` grades
 * (12 `.cube` LUTs total in `studio/luts/`):
 *   1. archival-parchment.cube
 *   2. kodak-2383-print.cube
 *   3. midnight-desk.cube
 *   4. cold-2030-deflation.cube
 *   5. austin-august-heat.cube
 *   6. blueprint-cyanotype.cube
 *   7. silver-gelatin-1941.cube
 *   8. subsea-sodium.cube
 *   9. verdict-high-contrast.cube
 *
 * Usage:
 *   node scripts/generate-luts.mjs [--size 17|33] [--overwrite-legacy]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LUTS_DIR = path.resolve(__dirname, "../luts");

function parseArgs(argv) {
  let size = 17;
  let overwriteLegacy = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--size" && argv[i + 1]) {
      const parsed = Number(argv[++i]);
      if (!Number.isInteger(parsed) || parsed < 2 || parsed > 65) {
        throw new Error(`Invalid --size value: ${argv[i]} (expected integer in 2..65)`);
      }
      size = parsed;
    } else if (arg.startsWith("--size=")) {
      const parsed = Number(arg.slice("--size=".length));
      if (!Number.isInteger(parsed) || parsed < 2 || parsed > 65) {
        throw new Error(`Invalid --size value: ${arg}`);
      }
      size = parsed;
    } else if (arg === "--overwrite-legacy") {
      overwriteLegacy = true;
    }
  }
  return { size, overwriteLegacy };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Filmic S-curve contrast around pivot with soft toe/shoulder roll-off.
 */
function sCurve(x, contrast = 1.15, pivot = 0.44) {
  const v = clamp01(x);
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  const centered = v - pivot;
  const logistic = 1 / (1 + Math.exp(-contrast * 5.2 * centered));
  const lo = 1 / (1 + Math.exp(-contrast * 5.2 * -pivot));
  const hi = 1 / (1 + Math.exp(-contrast * 5.2 * (1 - pivot)));
  return clamp01((logistic - lo) / Math.max(1e-6, hi - lo));
}

/**
 * Rec.709 luma and saturation helper.
 */
function luma709(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function adjustSaturation(r, g, b, sat) {
  const y = luma709(r, g, b);
  return [
    clamp01(y + (r - y) * sat),
    clamp01(y + (g - y) * sat),
    clamp01(y + (b - y) * sat),
  ];
}

/**
 * Skin-tone protection weight centered around warm human complexion hues.
 */
function skinWeight(r, g, b) {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const chroma = maxC - minC;
  if (chroma < 0.04 || r <= b || g <= b * 0.92) return 0;
  const warmth = clamp01((r - g) / Math.max(0.05, chroma));
  const midLuma = 1 - Math.abs(luma709(r, g, b) - 0.52) * 1.5;
  return clamp01(warmth * 1.15) * clamp01(midLuma) * smoothstep(0.04, 0.22, chroma);
}

/**
 * Lift / Gamma / Gain + shadow/highlight split-toning helper.
 */
function gradeLiftGammaGain(r, g, b, opts) {
  const {
    lift = [0, 0, 0],
    gamma = [1, 1, 1],
    gain = [1, 1, 1],
    contrast = 1.0,
    pivot = 0.44,
    sat = 1.0,
    shadowTint = [0, 0, 0],
    highlightTint = [0, 0, 0],
    toeFloor = 0.008,
    shoulderCeil = 0.992,
    skinProtect = 0.35,
  } = opts;

  const skin = skinWeight(r, g, b) * skinProtect;

  let nr = clamp01(r * gain[0] + lift[0] * (1 - r));
  let ng = clamp01(g * gain[1] + lift[1] * (1 - g));
  let nb = clamp01(b * gain[2] + lift[2] * (1 - b));

  nr = Math.pow(clamp01(nr), 1 / Math.max(0.2, gamma[0]));
  ng = Math.pow(clamp01(ng), 1 / Math.max(0.2, gamma[1]));
  nb = Math.pow(clamp01(nb), 1 / Math.max(0.2, gamma[2]));

  if (Math.abs(contrast - 1.0) > 1e-3) {
    nr = sCurve(nr, contrast, pivot);
    ng = sCurve(ng, contrast, pivot);
    nb = sCurve(nb, contrast, pivot);
  }

  const y = luma709(nr, ng, nb);
  const shMask = (1 - smoothstep(0.0, 0.55, y)) * (1 - skin * 0.65);
  const hiMask = smoothstep(0.45, 1.0, y) * (1 - skin * 0.45);

  nr = clamp01(nr + shadowTint[0] * shMask + highlightTint[0] * hiMask);
  ng = clamp01(ng + shadowTint[1] * shMask + highlightTint[1] * hiMask);
  nb = clamp01(nb + shadowTint[2] * shMask + highlightTint[2] * hiMask);

  [nr, ng, nb] = adjustSaturation(nr, ng, nb, sat);

  // Blend back subtle natural skin hue when requested
  if (skin > 0) {
    const [sr, sg, sb] = adjustSaturation(
      sCurve(r, 1.05, 0.46),
      sCurve(g * 0.995, 1.05, 0.46),
      sCurve(b * 0.97, 1.05, 0.46),
      0.98
    );
    nr = nr * (1 - skin) + sr * skin;
    ng = ng * (1 - skin) + sg * skin;
    nb = nb * (1 - skin) + sb * skin;
  }

  // Enforce Reading Room zero-pure-extremes rule (soft toe/shoulder)
  nr = toeFloor + nr * (shoulderCeil - toeFloor);
  ng = toeFloor + ng * (shoulderCeil - toeFloor);
  nb = toeFloor + nb * (shoulderCeil - toeFloor);

  return [clamp01(nr), clamp01(ng), clamp01(nb)];
}

export const NEW_LUT_RECIPES = [
  {
    id: "archival-parchment",
    title: "Archival Parchment",
    comment: "Aged cotton-rag warmth, muted cyan, library tungsten highlight roll-off",
    transform: (r, g, b) =>
      gradeLiftGammaGain(r, g, b, {
        lift: [0.024, 0.018, 0.006],
        gamma: [1.03, 1.01, 0.94],
        gain: [0.99, 0.965, 0.895],
        contrast: 1.08,
        pivot: 0.46,
        sat: 0.84,
        shadowTint: [0.018, 0.01, -0.014],
        highlightTint: [0.032, 0.02, -0.028],
        toeFloor: 0.016,
        shoulderCeil: 0.976,
        skinProtect: 0.4,
      }),
  },
  {
    id: "kodak-2383-print",
    title: "Kodak 2383 Print",
    comment: "Classic motion-picture print stock S-curve, teal-slate shadows, warm amber-gold highs",
    transform: (r, g, b) => {
      // Subtle 3x3 photochemical dye cross-talk before print S-curve
      const mr = clamp01(r * 0.96 + g * 0.05 - b * 0.01);
      const mg = clamp01(r * 0.02 + g * 0.97 + b * 0.01);
      const mb = clamp01(-r * 0.01 + g * 0.05 + b * 0.96);
      return gradeLiftGammaGain(mr, mg, mb, {
        lift: [0.004, 0.014, 0.026],
        gamma: [1.01, 0.995, 0.985],
        gain: [1.02, 0.99, 0.93],
        contrast: 1.24,
        pivot: 0.43,
        sat: 0.95,
        shadowTint: [-0.016, 0.008, 0.028],
        highlightTint: [0.034, 0.016, -0.024],
        toeFloor: 0.012,
        shoulderCeil: 0.984,
        skinProtect: 0.5,
      });
    },
  },
  {
    id: "midnight-desk",
    title: "Midnight Desk",
    comment: "Obsidian telemetry shadows with warm desk-lamp brass midtones and crisp bone highlights",
    transform: (r, g, b) =>
      gradeLiftGammaGain(r, g, b, {
        lift: [0.006, 0.01, 0.022],
        gamma: [0.95, 0.96, 1.01],
        gain: [0.98, 0.96, 0.94],
        contrast: 1.22,
        pivot: 0.42,
        sat: 0.88,
        shadowTint: [-0.012, -0.004, 0.026],
        highlightTint: [0.028, 0.018, -0.012],
        toeFloor: 0.014,
        shoulderCeil: 0.978,
        skinProtect: 0.45,
      }),
  },
  {
    id: "cold-2030-deflation",
    title: "Cold 2030 Deflation",
    comment: "Restrained macro-deflationary steel blue-slate cast, crisp analytical midtone separation",
    transform: (r, g, b) =>
      gradeLiftGammaGain(r, g, b, {
        lift: [0.005, 0.012, 0.028],
        gamma: [0.94, 0.99, 1.06],
        gain: [0.91, 0.96, 1.03],
        contrast: 1.16,
        pivot: 0.45,
        sat: 0.72,
        shadowTint: [-0.02, 0.004, 0.032],
        highlightTint: [-0.018, 0.006, 0.024],
        toeFloor: 0.012,
        shoulderCeil: 0.982,
        skinProtect: 0.35,
      }),
  },
  {
    id: "austin-august-heat",
    title: "Austin August Heat",
    comment: "Sun-baked Texas afternoon warmth, golden ochre midtones, rolled-off plaster highlights",
    transform: (r, g, b) =>
      gradeLiftGammaGain(r, g, b, {
        lift: [0.022, 0.012, 0.002],
        gamma: [1.07, 1.02, 0.91],
        gain: [1.03, 0.97, 0.86],
        contrast: 1.14,
        pivot: 0.44,
        sat: 1.06,
        shadowTint: [0.02, 0.006, -0.018],
        highlightTint: [0.042, 0.022, -0.036],
        toeFloor: 0.015,
        shoulderCeil: 0.98,
        skinProtect: 0.42,
      }),
  },
  {
    id: "blueprint-cyanotype",
    title: "Blueprint Cyanotype",
    comment: "Prussian drafting-plate cyanotype tone curve with vellum bone highlights",
    transform: (r, g, b) => {
      const y = luma709(r, g, b);
      const cy = sCurve(y, 1.18, 0.44);
      // Duotone Prussian-indigo (#0F2236) -> circuit steel -> vellum bone (#F4F1EA) mixed 68% with graded RGB
      const prussianR = 0.059 + cy * 0.895 * Math.pow(cy, 0.38);
      const prussianG = 0.133 + cy * 0.812 * Math.pow(cy, 0.18);
      const prussianB = 0.212 + cy * 0.706;
      const [sr, sg, sb] = adjustSaturation(r, g, b, 0.45);
      const nr = prussianR * 0.68 + sr * 0.32;
      const ng = prussianG * 0.68 + sg * 0.32;
      const nb = prussianB * 0.68 + sb * 0.32;
      return [
        clamp01(0.014 + nr * 0.968),
        clamp01(0.022 + ng * 0.958),
        clamp01(0.036 + nb * 0.942),
      ];
    },
  },
  {
    id: "silver-gelatin-1941",
    title: "Silver Gelatin 1941",
    comment: "1941 wartime archival silver-gelatin monochrome with warm selenium paper undertone",
    transform: (r, g, b) => {
      // Panchromatic B&W filter weights (slight yellow-green filter for rich skies & skin)
      const mono = clamp01(0.29 * r + 0.59 * g + 0.12 * b);
      const curved = sCurve(mono, 1.28, 0.45);
      // Warm fiber-base selenium split: cool neutral-warm blacks, warm ivory highlights
      const sh = 1 - smoothstep(0.0, 0.5, curved);
      const hi = smoothstep(0.45, 1.0, curved);
      const nr = curved + 0.012 * sh + 0.026 * hi;
      const ng = curved + 0.009 * sh + 0.018 * hi;
      const nb = curved + 0.008 * sh - 0.014 * hi;
      return [
        clamp01(0.018 + nr * 0.958),
        clamp01(0.017 + ng * 0.956),
        clamp01(0.016 + nb * 0.948),
      ];
    },
  },
  {
    id: "subsea-sodium",
    title: "Subsea Sodium",
    comment: "Deep benthic abyssal teal-navy shadows paired with sodium-vapor amber instrument highs",
    transform: (r, g, b) =>
      gradeLiftGammaGain(r, g, b, {
        lift: [0.002, 0.022, 0.034],
        gamma: [0.95, 1.02, 1.04],
        gain: [1.01, 0.97, 0.91],
        contrast: 1.2,
        pivot: 0.43,
        sat: 0.92,
        shadowTint: [-0.028, 0.018, 0.038],
        highlightTint: [0.044, 0.016, -0.032],
        toeFloor: 0.012,
        shoulderCeil: 0.982,
        skinProtect: 0.38,
      }),
  },
  {
    id: "verdict-high-contrast",
    title: "Verdict High Contrast",
    comment: "Authoritative courtroom & fiscal reckoning grade: deep charcoal toe, preserved crimson accents",
    transform: (r, g, b) => {
      // Preserve crimson/vermilion saturation while desaturating distracting greens/cyans
      const redDom = clamp01((r - Math.max(g, b)) * 2.2);
      const [dr, dg, db] = adjustSaturation(r, g, b, 0.66 + 0.34 * redDom);
      return gradeLiftGammaGain(dr, dg, db, {
        lift: [0.008, 0.008, 0.012],
        gamma: [0.97, 0.96, 0.97],
        gain: [1.01, 0.985, 0.965],
        contrast: 1.34,
        pivot: 0.44,
        sat: 0.96,
        shadowTint: [-0.006, -0.004, 0.012],
        highlightTint: [0.02, 0.012, -0.008],
        toeFloor: 0.01,
        shoulderCeil: 0.985,
        skinProtect: 0.45,
      });
    },
  },
];

export function serializeCubeLut({ title, comment, size, transform }) {
  const lines = [
    `# ${comment}`,
    `TITLE "${title}"`,
    `LUT_3D_SIZE ${size}`,
    "DOMAIN_MIN 0.0 0.0 0.0",
    "DOMAIN_MAX 1.0 1.0 1.0",
    "",
  ];

  const denom = size - 1;
  for (let bi = 0; bi < size; bi++) {
    const b = bi / denom;
    for (let gi = 0; gi < size; gi++) {
      const g = gi / denom;
      for (let ri = 0; ri < size; ri++) {
        const r = ri / denom;
        const [or, og, ob] = transform(r, g, b);
        lines.push(`${clamp01(or).toFixed(6)} ${clamp01(og).toFixed(6)} ${clamp01(ob).toFixed(6)}`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function generateAllLuts(options = {}) {
  const size = options.size ?? 17;
  const outDir = options.outDir ?? LUTS_DIR;
  fs.mkdirSync(outDir, { recursive: true });

  const preservedLegacy = ["editorial-warm.cube", "documentary-slate.cube", "clean-room-pop.cube"];
  for (const legacyFile of preservedLegacy) {
    const legacyPath = path.join(outDir, legacyFile);
    if (!fs.existsSync(legacyPath)) {
      throw new Error(`Expected baseline LUT missing: ${legacyPath}`);
    }
  }

  const written = [];
  for (const recipe of NEW_LUT_RECIPES) {
    const filename = `${recipe.id}.cube`;
    const targetPath = path.join(outDir, filename);
    const content = serializeCubeLut({
      title: recipe.title,
      comment: recipe.comment,
      size,
      transform: recipe.transform,
    });
    fs.writeFileSync(targetPath, content, "utf8");
    written.push({ filename, size, bytes: Buffer.byteLength(content, "utf8") });
  }
  return { preservedLegacy, written };
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const { size, overwriteLegacy } = parseArgs(process.argv.slice(2));
  const result = generateAllLuts({ size, overwriteLegacy });
  console.log(
    `Preserved ${result.preservedLegacy.length} baseline LUTs and generated ${result.written.length} new LUT_3D_SIZE ${size} .cube files in ${LUTS_DIR}:`
  );
  for (const item of result.written) {
    console.log(`  ✓ ${item.filename} (${item.bytes} bytes, ${item.size}^3 lattice)`);
  }
  console.log(`Total .cube LUTs in ${LUTS_DIR}: ${result.preservedLegacy.length + result.written.length}`);
}
