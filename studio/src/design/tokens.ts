import { spring, SpringConfig } from "remotion";

export { FONTS } from "./fonts";

/**
 * 1. Dual-Palette Token System:
 *    - PAGE_PALETTE: "Reading Room: Page (milk canvas)" for full-screen cutaways
 *    - OVER_FOOTAGE_PALETTE: "Reading Room: Over Footage (navy glass)" for translucent smoked-navy glass floating on video
 */
export const PAGE_PALETTE = {
  paperLight: "#FAF8F3", // Main full-screen cutaway milk canvas
  paper: "#F2F0EA", // Secondary card / table ground
  paperBorder: "#E1DED5", // Crisp warm milk hairline border
  navy: "#1C2B3A", // Primary classic dark navy ink, hero bars, map highlights, active badges
  navyDeep: "#0F1923", // Deepest ink / shadow vignette / dark cover
  muted: "#6B7783", // Secondary metadata, footnotes
  gold: "#3E6A94", // Subtle editorial slate hairline glint ONLY (use navy #1C2B3A for hero bars & map fills)
  goldWarm: "#A9C4DE", // Soft blue accent for dark cover text / borders
  highlightSweep: "rgba(255, 213, 79, 0.38)", // Yellow marker sweep behind #1C2B3A ink
  chartSecondary: "#2F8F8B", // Teal second metric / route / comparison accent
  brickRed: "#A3402E", // Warnings, drops, risk headings, eyebrow tags
  riskFill: "#F8ECE8", // Soft blush fill (ONLY on risk/warning boxes)
  riskBorder: "#E6C3B9", // Soft blush border (ONLY on risk/warning boxes)
} as const;

export const OVER_FOOTAGE_PALETTE = {
  // Optical silky smoked-navy crystal glass fills (~0.58-0.64 smoked depth; crystal translucent while >=4.5:1 over pure white)
  glassPrimary:
    "linear-gradient(135deg, rgba(28, 43, 58, 0.64) 0%, rgba(15, 25, 35, 0.60) 55%, rgba(28, 43, 58, 0.66) 100%)",
  glassDarkWell: "rgba(15, 25, 35, 0.50)", // Readable smoked inner well behind key numbers/sub-boxes
  glassBorder: "rgba(255, 255, 255, 0.58)", // Crisp glass specular rim
  glassInnerHairline: "rgba(255, 255, 255, 0.16)", // Subtle inner hairline
  // Rich warmer cream text & crisp accents (zero muddy grey, zero blurry halo)
  textBody: "#FAECD4", // Body copy (rich warmer cream, >=4.6:1 over bright walls)
  textHeadline: "#FFF6E5", // Headlines & key metrics (luminous warmer cream)
  textMuted: "#F7E8CE", // Subtitles, citations, eyebrows & timestamps (warm soft cream)
  accentPrimary: "#BFD6EA", // Subtle ice-blue accent for lines, dots & borders
  accentWarm: "#FAECD4", // Warm sand-cream highlight for eyebrows & active tags
  highlightSweep: "rgba(255, 213, 79, 0.30)", // Marker sweep on glass
  chartSecondary: "#4FB3AE", // Lifted teal secondary metric / positive delta
  brickRedText: "#E27358", // Lifted brick red for readable text & deltas on glass
  brickRedFill: "#A3402E", // Solid red chip/badge fill with #FFF6E5 text
  riskFill: "rgba(163, 64, 46, 0.38)", // Translucent glass risk wash
  riskBorder: "rgba(255, 200, 185, 0.44)", // Soft coral glass risk rim
  textShadow: "0 1px 2px rgba(8, 14, 22, 0.85)", // Tight razor-sharp optical drop (zero smear)
} as const;

/**
 * 2. Shared Global Color Tokens (Mapped cleanly to Dual-Palette)
 */
export const COLORS = {
  navy: PAGE_PALETTE.navy,
  navyDeep: PAGE_PALETTE.navyDeep,
  ink: PAGE_PALETTE.navy,
  panel: PAGE_PALETTE.paperLight,
  panelDark: PAGE_PALETTE.navyDeep,
  panelBorder: PAGE_PALETTE.paperBorder,
  paper: PAGE_PALETTE.paper,
  paperLight: PAGE_PALETTE.paperLight,
  paperBorder: PAGE_PALETTE.paperBorder,
  paperInk: PAGE_PALETTE.navy,
  paperMuted: PAGE_PALETTE.muted,
  highlight: PAGE_PALETTE.gold,
  highlightSweep: PAGE_PALETTE.highlightSweep,
  highlightBg: PAGE_PALETTE.highlightSweep,
  gold: PAGE_PALETTE.gold,
  goldWarm: PAGE_PALETTE.goldWarm,
  chartSecondary: PAGE_PALETTE.chartSecondary,
  brickRed: PAGE_PALETTE.brickRed,
  warning: PAGE_PALETTE.brickRed,
  warningBg: "rgba(163, 64, 46, 0.12)",
  riskFill: PAGE_PALETTE.riskFill,
  riskBorder: PAGE_PALETTE.riskBorder,
  muted: PAGE_PALETTE.muted,
  gridLine: "rgba(28, 43, 58, 0.045)",
  gridLineDark: "rgba(169, 196, 222, 0.06)",
  glassBg: "rgba(28, 43, 58, 0.32)",
  glassDarkWell: OVER_FOOTAGE_PALETTE.glassDarkWell,
  glassBorder: OVER_FOOTAGE_PALETTE.glassBorder,
  glassInnerHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
  glassHighlight: "rgba(255, 255, 255, 0.56)",
};

/**
 * 3. Shared Spatial Skeleton & Presenter-Safe Layout Geometry (1920x1080 Master Reference)
 */
export const LAYOUT = {
  width: 1920,
  height: 1080,
  safeMargin: 96,
  mastheadY: 44,
  mastheadRuleY: 76,
  citationBaselineY: 1040,
  contentStage: {
    x: 96,
    y: 96,
    width: 1728,
    height: 912,
  },
  overFootageSafeZones: {
    rightThird: { left: 1180, top: 96, width: 644, height: 860 },
    bottomDock: { left: 120, bottom: 56, width: 1680, height: 156 },
    topBar: { left: 96, top: 44, width: 1728, height: 84 },
    leftShoulderWing: { left: 96, top: 140, width: 460, height: 540 },
    rightShoulderWing: { right: 96, top: 140, width: 580, height: 640 },
  },
} as const;

/**
 * 4. Dedicated Style Family Palettes
 */
export const STYLE_FAMILIES = {
  // Family 1: Newsthink Reading Room (Page Milk Canvas / Deep Navy / Slate Blue)
  newsthink: {
    ink: PAGE_PALETTE.navy,
    navyDeep: PAGE_PALETTE.navyDeep,
    panel: PAGE_PALETTE.paperLight,
    panelBorder: PAGE_PALETTE.paperBorder,
    paper: PAGE_PALETTE.paper,
    paperLight: PAGE_PALETTE.paperLight,
    paperBorder: PAGE_PALETTE.paperBorder,
    paperInk: PAGE_PALETTE.navy,
    paperMuted: PAGE_PALETTE.muted,
    highlight: PAGE_PALETTE.gold,
    highlightSweep: PAGE_PALETTE.highlightSweep,
    highlightBg: PAGE_PALETTE.highlightSweep,
    gold: PAGE_PALETTE.gold,
    goldWarm: PAGE_PALETTE.goldWarm,
    chartSecondary: PAGE_PALETTE.chartSecondary,
    brickRed: PAGE_PALETTE.brickRed,
    riskFill: PAGE_PALETTE.riskFill,
    riskBorder: PAGE_PALETTE.riskBorder,
    goldMuted: "rgba(62, 106, 148, 0.18)",
    divider: PAGE_PALETTE.paperBorder,
  },

  // Family 2: Visual Investigation (Page Milk Evidence Desk + Brick Red Risk Pointer)
  visualInvestigation: {
    lightDesk: PAGE_PALETTE.paperLight,
    darkDesk: PAGE_PALETTE.paper,
    deskCard: PAGE_PALETTE.paperLight,
    deskCardBorder: PAGE_PALETTE.paperBorder,
    gridLine: "rgba(28, 43, 58, 0.05)",
    accentRed: PAGE_PALETTE.brickRed,
    accentRedBg: PAGE_PALETTE.riskFill,
    accentRedBorder: PAGE_PALETTE.riskBorder,
    monochromeHigh: PAGE_PALETTE.navy,
    monochromeMid: PAGE_PALETTE.muted,
    monochromeLow: PAGE_PALETTE.paperBorder,
    coordinateLine: "rgba(28, 43, 58, 0.08)",
  },

  // Family 3: Apple Liquid Glass Optical System (Over Footage Smoked-Navy Crystal Glass)
  liquidGlass: {
    tintBase: OVER_FOOTAGE_PALETTE.glassPrimary,
    tintDark: OVER_FOOTAGE_PALETTE.glassPrimary,
    tintNavy: OVER_FOOTAGE_PALETTE.glassPrimary,
    tintLight:
      "linear-gradient(135deg, rgba(28, 43, 58, 0.48) 0%, rgba(15, 25, 35, 0.40) 55%, rgba(28, 43, 58, 0.50) 100%)",
    borderHighlight: OVER_FOOTAGE_PALETTE.glassBorder,
    borderSubtle: OVER_FOOTAGE_PALETTE.glassInnerHairline,
    innerGlow: "rgba(191, 214, 234, 0.34)",
    specularSweep:
      "linear-gradient(180deg, rgba(255, 250, 240, 0.18) 0%, rgba(255, 250, 240, 0.04) 16%, transparent 45%)",
    frostedBackdrop: "blur(12px) saturate(165%) brightness(0.76)",
    dockPillBackdrop: "blur(12px) saturate(165%) brightness(0.76)",
    refractionScale: 18,
    turbulenceFreq: "0.006 0.006",
    shadow:
      "0 22px 48px -12px rgba(15, 25, 35, 0.46), 0 0 0 1px rgba(255, 255, 255, 0.22)",
  },

  // Family 4: Vintage 1920s / Silent Film (Preserved authentic 1920s sepia/noir)
  vintage1920s: {
    cardBlack: "#0D0C0B",
    intertitleCream: "#EFE6CF",
    sepiaDark: "#271E15",
    sepiaGlow: "#9E7B54",
    agedPaper: "#E3DAC2",
    agedInk: "#231D15",
    filmBorder: "#4A3C2A",
    grainTint: "rgba(227, 218, 194, 0.07)",
    vignette: "radial-gradient(ellipse at center, rgba(39,30,21,0) 40%, rgba(13,12,11,0.92) 100%)",
  },

  // Family 5: Constructivist Red / Milk / Navy
  constructivist: {
    agitpropRed: PAGE_PALETTE.brickRed,
    paperCream: PAGE_PALETTE.paper,
    industrialBlack: PAGE_PALETTE.navy,
    steelGrey: PAGE_PALETTE.muted,
    redAccentBg: PAGE_PALETTE.riskFill,
    hairline: PAGE_PALETTE.navy,
  },

  // Family 6: Spy Titles / Chapter Cover Dossier (Deep Navy + Slate Blue + Brick Red)
  spyTitles: {
    dossierManila: PAGE_PALETTE.paper,
    classifiedRed: PAGE_PALETTE.brickRed,
    redactedBlack: PAGE_PALETTE.navy,
    typewriterCharcoal: PAGE_PALETTE.navyDeep,
    stampInk: PAGE_PALETTE.brickRed,
    topSecretYellow: OVER_FOOTAGE_PALETTE.accentPrimary,
    tapeTranslucent: "rgba(242, 240, 234, 0.55)",
  },

  // Family 7: Stained Glass (Milk Canvas Framed Panes + Soft Blue & Blush)
  stainedGlass: {
    leadCame: PAGE_PALETTE.navy,
    cobaltBlue: PAGE_PALETTE.gold,
    rubyRed: PAGE_PALETTE.brickRed,
    amberGold: PAGE_PALETTE.goldWarm,
    emeraldGreen: PAGE_PALETTE.chartSecondary,
    amethystViolet: "#5A6B7E",
    illuminationGlow: "rgba(250, 248, 243, 0.45)",
  },

  // Family 8: Blueprint Technical Manual (Deep Navy & Crisp Ice Blue)
  blueprintManual: {
    blueprintBg: PAGE_PALETTE.navy,
    blueprintGrid: "#2A3F54",
    chalkWhite: OVER_FOOTAGE_PALETTE.textHeadline,
    draftingAmber: OVER_FOOTAGE_PALETTE.accentPrimary,
    hairlineCyan: OVER_FOOTAGE_PALETTE.accentWarm,
    ruleMuted: OVER_FOOTAGE_PALETTE.textMuted,
  },
} as const;

export type StyleFamilyName = keyof typeof STYLE_FAMILIES;

/**
 * 5. Five-Register Optical Substrate System (WCAG 2.1 AAA >= 7.0:1 Verified)
 */
export const REGISTER_IDS = [
  "page_editorial",
  "archival_parchment",
  "midnight_telemetry",
  "drafting_blueprint",
  "vintage_newsreel",
] as const;

export type RegisterId = (typeof REGISTER_IDS)[number];

export type SemanticRole = "liability" | "capital" | "solvent" | "statutory";

export interface RegisterPalette {
  id: RegisterId;
  label: string;
  isDark: boolean;
  bg: {
    canvas: string;
    elevated: string;
    recessed: string;
  };
  ink: {
    primary: string;
    secondary: string;
    muted: string;
  };
  rule: {
    hairline: string;
    oxford: string;
  };
  accent: Record<SemanticRole, string> & {
    wash: string;
    liabilityStroke: string;
    highlighterWash: string;
    highlighterBlend: "multiply" | "screen";
  };
  bezelHex: string;
  vignetteRgba: string;
  grainOpacity: number;
}

export const REGISTERS: Record<RegisterId, RegisterPalette> = {
  page_editorial: {
    id: "page_editorial",
    label: "Reading Room Milk Paper",
    isDark: false,
    bg: {
      canvas: "#FAF8F3",
      elevated: "#FDFBF7",
      recessed: "#F2F0EA",
    },
    ink: {
      primary: "#1C2B3A", // 13.62:1 vs #FAF8F3 (AAA)
      secondary: "#354656", // 9.23:1 vs #FAF8F3 (AAA)
      muted: "#43515E", // 7.70:1 vs #FAF8F3 (AAA)
    },
    rule: {
      hairline: "#E1DED5",
      oxford: "#1C2B3A",
    },
    accent: {
      liability: "#8A2519", // 8.41:1 vs #FAF8F3 (AAA)
      capital: "#6E440B", // 7.96:1 vs #FAF8F3 (AAA)
      solvent: "#165246", // 8.52:1 vs #FAF8F3 (AAA)
      statutory: "#1C3D63", // 10.45:1 vs #FAF8F3 (AAA)
      wash: "#E9C46A",
      liabilityStroke: "#A3402E",
      highlighterWash: "rgba(255, 213, 79, 0.38)",
      highlighterBlend: "multiply",
    },
    bezelHex: "#B08D57",
    vignetteRgba: "rgba(28, 43, 58, 0.11)",
    grainOpacity: 0.03,
  },

  archival_parchment: {
    id: "archival_parchment",
    label: "Archival Cotton Rag Parchment",
    isDark: false,
    bg: {
      canvas: "#F4EFE6",
      elevated: "#FAF7F1",
      recessed: "#EAE2D3",
    },
    ink: {
      primary: "#181614", // 15.75:1 vs #F4EFE6 (AAA)
      secondary: "#3D3832", // 10.13:1 vs #F4EFE6 (AAA)
      muted: "#544D44", // 7.27:1 vs #F4EFE6 (AAA)
    },
    rule: {
      hairline: "#D4C9B8",
      oxford: "#2B2723",
    },
    accent: {
      liability: "#8C1D18", // 7.96:1 vs #F4EFE6 (AAA)
      capital: "#6E450B", // 7.29:1 vs #F4EFE6 (AAA)
      solvent: "#1B4D3E", // 8.42:1 vs #F4EFE6 (AAA)
      statutory: "#1D3557", // 10.79:1 vs #F4EFE6 (AAA)
      wash: "#E9C46A",
      liabilityStroke: "#8C1D18",
      highlighterWash: "rgba(233, 196, 106, 0.55)",
      highlighterBlend: "multiply",
    },
    bezelHex: "#B08D57",
    vignetteRgba: "rgba(28, 22, 16, 0.14)",
    grainOpacity: 0.034,
  },

  midnight_telemetry: {
    id: "midnight_telemetry",
    label: "Midnight Instrument Telemetry",
    isDark: true,
    bg: {
      canvas: "#111315",
      elevated: "#191C20",
      recessed: "#0B0C0E",
    },
    ink: {
      primary: "#F2ECE1", // 15.84:1 vs #111315 (AAA)
      secondary: "#B8B0A2", // 8.66:1 vs #111315 (AAA)
      muted: "#A79F91", // 7.11:1 vs #111315 (AAA)
    },
    rule: {
      hairline: "#262A30",
      oxford: "#4A4F57",
    },
    accent: {
      liability: "#F48C7F", // 7.90:1 vs #111315 (AAA)
      capital: "#E5A93C", // 8.93:1 vs #111315 (AAA)
      solvent: "#6CC4A1", // 8.91:1 vs #111315 (AAA)
      statutory: "#8AB4D8", // 8.51:1 vs #111315 (AAA)
      wash: "#E5A93C",
      liabilityStroke: "#E85D4E",
      highlighterWash: "rgba(229, 169, 60, 0.20)",
      highlighterBlend: "screen",
    },
    bezelHex: "#B08D57",
    vignetteRgba: "rgba(4, 6, 10, 0.26)",
    grainOpacity: 0.03,
  },

  drafting_blueprint: {
    id: "drafting_blueprint",
    label: "Prussian Cyanotype Drafting Plate",
    isDark: true,
    bg: {
      canvas: "#0F2236",
      elevated: "#162E47",
      recessed: "#0A1726",
    },
    ink: {
      primary: "#F4F1EA", // 14.29:1 vs #0F2236 (AAA)
      secondary: "#BFD3E6", // 10.50:1 vs #0F2236 (AAA)
      muted: "#94B2CC", // 7.29:1 vs #0F2236 (AAA)
    },
    rule: {
      hairline: "#234161",
      oxford: "#335980",
    },
    accent: {
      liability: "#FF9B82", // 7.88:1 vs #0F2236 (AAA)
      capital: "#F7C35C", // 9.92:1 vs #0F2236 (AAA)
      solvent: "#7CE0E6", // 10.49:1 vs #0F2236 (AAA)
      statutory: "#BFD3E6", // 10.50:1 vs #0F2236 (AAA)
      wash: "#F7C35C",
      liabilityStroke: "#E04F33",
      highlighterWash: "rgba(247, 195, 92, 0.22)",
      highlighterBlend: "screen",
    },
    bezelHex: "#7A9BB8",
    vignetteRgba: "rgba(3, 9, 18, 0.26)",
    grainOpacity: 0.032,
  },

  vintage_newsreel: {
    id: "vintage_newsreel",
    label: "1930s Silver-Nitrate Sepia Newsreel",
    isDark: true,
    bg: {
      canvas: "#141210",
      elevated: "#1E1A16",
      recessed: "#0D0C0B",
    },
    ink: {
      primary: "#EFE6CF", // 15.02:1 vs #141210 (AAA)
      secondary: "#CBBFA4", // 10.27:1 vs #141210 (AAA)
      muted: "#AFA38A", // 7.49:1 vs #141210 (AAA)
    },
    rule: {
      hairline: "#332B22",
      oxford: "#5C4D3C",
    },
    accent: {
      liability: "#F28E79", // 7.94:1 vs #141210 (AAA)
      capital: "#E6B055", // 9.52:1 vs #141210 (AAA)
      solvent: "#7AC7A4", // 9.36:1 vs #141210 (AAA)
      statutory: "#9AB8D4", // 9.07:1 vs #141210 (AAA)
      wash: "#E6B055",
      liabilityStroke: "#D9644A",
      highlighterWash: "rgba(230, 176, 85, 0.22)",
      highlighterBlend: "screen",
    },
    bezelHex: "#9E7B54",
    vignetteRgba: "rgba(13, 12, 11, 0.34)",
    grainOpacity: 0.036,
  },
};

// ============================================================================
// 6. WCAG 2.1 Luminance Contrast & Perceptual OKLCH Cross-Dissolve Utilities
// ============================================================================

interface RgbTuple {
  r: number;
  g: number;
  b: number;
}

interface OklchTuple {
  L: number;
  C: number;
  h: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseHexToRgb01(hex: string): RgbTuple {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return {
      r: Number.isFinite(r) ? r : 0,
      g: Number.isFinite(g) ? g : 0,
      b: Number.isFinite(b) ? b : 0,
    };
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return {
    r: Number.isFinite(r) ? r : 0,
    g: Number.isFinite(g) ? g : 0,
    b: Number.isFinite(b) ? b : 0,
  };
}

function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearChannelToSrgb(c: number): number {
  const clamped = clamp(c, 0, 1);
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

/**
 * Computes WCAG 2.1 relative luminance L in [0, 1] for any #RRGGBB or #RGB hex string.
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = parseHexToRgb01(hex);
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * Computes WCAG 2.1 contrast ratio in [1.0, 21.0] between two hex colors.
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToOklch(hex: string): OklchTuple {
  const { r, g, b } = parseHexToRgb01(hex);
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const lCbrt = Math.cbrt(Math.max(0, l));
  const mCbrt = Math.cbrt(Math.max(0, m));
  const sCbrt = Math.cbrt(Math.max(0, s));

  const L = 0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt;
  const okA = 1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt;
  const okB = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt;

  const C = Math.sqrt(okA * okA + okB * okB);
  const rawHue = (Math.atan2(okB, okA) * 180) / Math.PI;
  const h = rawHue < 0 ? rawHue + 360 : rawHue;

  return { L, C, h };
}

function oklchToHex(oklch: OklchTuple): string {
  const rad = (oklch.h * Math.PI) / 180;
  const okA = oklch.C * Math.cos(rad);
  const okB = oklch.C * Math.sin(rad);

  const lCbrt = oklch.L + 0.3963377774 * okA + 0.2158037573 * okB;
  const mCbrt = oklch.L - 0.1055613458 * okA - 0.0638541728 * okB;
  const sCbrt = oklch.L - 0.0894841775 * okA - 1.291485548 * okB;

  const l = lCbrt * lCbrt * lCbrt;
  const m = mCbrt * mCbrt * mCbrt;
  const s = sCbrt * sCbrt * sCbrt;

  const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Enforce Reading Room zero-pure-extremes law (#030303 .. #FCFCFC)
  const rByte = clamp(Math.round(linearChannelToSrgb(rl) * 255), 3, 252);
  const gByte = clamp(Math.round(linearChannelToSrgb(gl) * 255), 3, 252);
  const bByte = clamp(Math.round(linearChannelToSrgb(bl) * 255), 3, 252);

  const toHex2 = (n: number): string => {
    const sHex = n.toString(16).toUpperCase();
    return sHex.length === 1 ? `0${sHex}` : sHex;
  };

  return `#${toHex2(rByte)}${toHex2(gByte)}${toHex2(bByte)}`;
}

/**
 * Interpolates two #RRGGBB colors in cylindrical perceptual OKLCH space
 * using shortest-arc hue rotation and an optional midpoint exposure dip.
 */
export function interpolateHexOKLCH(
  hexFrom: string,
  hexTo: string,
  progress: number,
  exposureDipPct = 0
): string {
  const t = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  if (t <= 0) return hexFrom;
  if (t >= 1) return hexTo;

  const c0 = hexToOklch(hexFrom);
  const c1 = hexToOklch(hexTo);

  let h0 = c0.h;
  let h1 = c1.h;
  if (c0.C < 0.002) h0 = h1;
  if (c1.C < 0.002) h1 = h0;

  const deltaHue = ((h1 - h0 + 540) % 360) - 180;
  const h = (h0 + deltaHue * t + 360) % 360;
  const dipFactor = 1 - clamp(exposureDipPct, 0, 0.25) * Math.sin(Math.PI * t);
  const L = clamp((c0.L + (c1.L - c0.L) * t) * dipFactor, 0.02, 0.99);
  const C = Math.max(0, c0.C + (c1.C - c0.C) * t);

  return oklchToHex({ L, C, h });
}

function parseRgbaString(rgba: string): { r: number; g: number; b: number; a: number } {
  const match = rgba.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!match) {
    return { r: 28, g: 43, b: 58, a: 0.2 };
  }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  };
}

function interpolateRgbaString(fromRgba: string, toRgba: string, t: number): string {
  const a = parseRgbaString(fromRgba);
  const b = parseRgbaString(toRgba);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  const alpha = Number((a.a + (b.a - a.a) * t).toFixed(3));
  return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
}

export function resolveRegisterPalette(reg: RegisterId | RegisterPalette): RegisterPalette {
  return typeof reg === "string" ? REGISTERS[reg] : reg;
}

/**
 * Perceptual 18-frame RegisterBridge cross-dissolve in cylindrical OKLCH
 * paired with a 6% midpoint exposure dip to avoid muddy sRGB mid-gray dead zones.
 */
export function interpolateRegisterOKLCH(
  fromReg: RegisterId | RegisterPalette,
  toReg: RegisterId | RegisterPalette,
  progress: number
): RegisterPalette {
  const a = resolveRegisterPalette(fromReg);
  const b = resolveRegisterPalette(toReg);
  const t = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);

  if (t <= 0 || a.id === b.id) return a;
  if (t >= 1) return b;

  const surfaceDip = a.isDark !== b.isDark ? 0.06 : 0.03;

  return {
    id: t < 0.5 ? a.id : b.id,
    label: t < 0.5 ? a.label : b.label,
    isDark: t < 0.5 ? a.isDark : b.isDark,
    bg: {
      canvas: interpolateHexOKLCH(a.bg.canvas, b.bg.canvas, t, surfaceDip),
      elevated: interpolateHexOKLCH(a.bg.elevated, b.bg.elevated, t, surfaceDip),
      recessed: interpolateHexOKLCH(a.bg.recessed, b.bg.recessed, t, surfaceDip),
    },
    ink: {
      primary: interpolateHexOKLCH(a.ink.primary, b.ink.primary, t, 0),
      secondary: interpolateHexOKLCH(a.ink.secondary, b.ink.secondary, t, 0),
      muted: interpolateHexOKLCH(a.ink.muted, b.ink.muted, t, 0),
    },
    rule: {
      hairline: interpolateHexOKLCH(a.rule.hairline, b.rule.hairline, t, surfaceDip * 0.5),
      oxford: interpolateHexOKLCH(a.rule.oxford, b.rule.oxford, t, 0),
    },
    accent: {
      liability: interpolateHexOKLCH(a.accent.liability, b.accent.liability, t, 0),
      capital: interpolateHexOKLCH(a.accent.capital, b.accent.capital, t, 0),
      solvent: interpolateHexOKLCH(a.accent.solvent, b.accent.solvent, t, 0),
      statutory: interpolateHexOKLCH(a.accent.statutory, b.accent.statutory, t, 0),
      wash: interpolateHexOKLCH(a.accent.wash, b.accent.wash, t, 0),
      liabilityStroke: interpolateHexOKLCH(
        a.accent.liabilityStroke,
        b.accent.liabilityStroke,
        t,
        0
      ),
      highlighterWash: interpolateRgbaString(
        a.accent.highlighterWash,
        b.accent.highlighterWash,
        t
      ),
      highlighterBlend: t < 0.5 ? a.accent.highlighterBlend : b.accent.highlighterBlend,
    },
    bezelHex: interpolateHexOKLCH(a.bezelHex, b.bezelHex, t, 0),
    vignetteRgba: interpolateRgbaString(a.vignetteRgba, b.vignetteRgba, t),
    grainOpacity: Number((a.grainOpacity + (b.grainOpacity - a.grainOpacity) * t).toFixed(4)),
  };
}

// Boot-time WCAG AAA (>= 7.0:1) invariant check across all 5 registers
for (const regKey of REGISTER_IDS) {
  const reg = REGISTERS[regKey];
  const requiredTokens = [
    reg.ink.primary,
    reg.ink.secondary,
    reg.ink.muted,
    reg.accent.liability,
    reg.accent.capital,
    reg.accent.solvent,
    reg.accent.statutory,
  ];
  for (const fg of requiredTokens) {
    const cr = getContrastRatio(fg, reg.bg.canvas);
    if (cr < 7.0) {
      throw new Error(
        `[ReadingRoomTokens] Register "${regKey}" token ${fg} vs ${reg.bg.canvas} failed WCAG AAA (${cr.toFixed(2)}:1 < 7.0:1).`
      );
    }
  }
}

/**
 * 7. Legacy Expressive Spring Configs (100% Preserved)
 */
export const SPRINGS: Record<string, SpringConfig> = {
  documentSnap: {
    damping: 24,
    mass: 0.9,
    stiffness: 110,
    overshootClamping: true,
  },
  cardGlide: {
    damping: 30,
    mass: 1.1,
    stiffness: 90,
    overshootClamping: true,
  },
  smoothFocus: {
    damping: 28,
    mass: 1.2,
    stiffness: 75,
    overshootClamping: false,
  },
  liquidGlass: {
    damping: 22,
    mass: 0.85,
    stiffness: 120,
    overshootClamping: false,
  },
  dockSnap: {
    damping: 26,
    mass: 0.75,
    stiffness: 140,
    overshootClamping: true,
  },
  nudgeAlert: {
    damping: 14,
    mass: 0.5,
    stiffness: 180,
    overshootClamping: false,
  },
  exitGlide: {
    damping: 28,
    mass: 0.9,
    stiffness: 100,
    overshootClamping: true,
  },
};

/**
 * 8. Critically-Damped Cinema Springs (All zeta = c / (2 * sqrt(k * m)) >= 1.00)
 */
export const CINEMA_SPRINGS = {
  editorialSnap: {
    mass: 1.0,
    stiffness: 310,
    damping: 36.0,
    overshootClamping: false,
  }, // zeta = 1.022
  archivalSettle: {
    mass: 1.4,
    stiffness: 165,
    damping: 33.0,
    overshootClamping: false,
  }, // zeta = 1.086
  heavyStamp: {
    mass: 0.85,
    stiffness: 1180,
    damping: 64.0,
    overshootClamping: true,
  }, // zeta = 1.010
  mechanicalTick: {
    mass: 0.55,
    stiffness: 1320,
    damping: 54.0,
    overshootClamping: true,
  }, // zeta = 1.002
  cameraGlide: {
    mass: 2.2,
    stiffness: 105,
    damping: 33.5,
    overshootClamping: false,
  }, // zeta = 1.102
  inkSweep: {
    mass: 1.1,
    stiffness: 195,
    damping: 31.0,
    overshootClamping: true,
  }, // zeta = 1.058
} as const satisfies Record<string, SpringConfig>;

export type CinemaSpringPresetName = keyof typeof CINEMA_SPRINGS;

export function getDampingRatio(cfg: Pick<SpringConfig, "mass" | "stiffness" | "damping">): number {
  return cfg.damping / (2 * Math.sqrt(cfg.stiffness * cfg.mass));
}

// Boot-time physics invariant check: zero underdamped cartoon springs in CINEMA_SPRINGS
for (const presetKey of Object.keys(CINEMA_SPRINGS) as CinemaSpringPresetName[]) {
  const cfg = CINEMA_SPRINGS[presetKey];
  const zeta = getDampingRatio(cfg);
  if (zeta < 1.0) {
    throw new Error(
      `[ReadingRoomPhysics] CINEMA_SPRINGS.${presetKey} is underdamped (zeta=${zeta.toFixed(3)} < 1.0).`
    );
  }
}

export function studioSpring(
  frame: number,
  fps: number,
  preset: CinemaSpringPresetName,
  delayFrames = 0
): number {
  return spring({
    frame: frame - delayFrames,
    fps,
    config: CINEMA_SPRINGS[preset],
  });
}

/**
 * Jerk-free fluid-head S-curve blended into cameraGlide to eliminate frame-0 startle.
 */
export function fluidCameraSpring(frame: number, fps: number, delayFrames = 0): number {
  const localFrame = Math.max(0, frame - delayFrames);
  const raw = studioSpring(frame, fps, "cameraGlide", delayFrames);
  const rampFrames = Math.max(1, Math.round(0.2 * fps));
  const u = clamp(localFrame / rampFrames, 0, 1);
  const smoothstep = u * u * (3 - 2 * u);
  return raw * smoothstep;
}

/**
 * Bounded logarithmic stagger so multi-row archival tables never lag behind narration.
 */
export function staggerDelayFrames(
  index: number,
  fps: number,
  stepSec = 0.1,
  maxTotalSec = 0.54,
  compression = 0.35
): number {
  if (index <= 0) return 0;
  const baseStep = stepSec * fps;
  const maxFrames = maxTotalSec * fps;
  const compressed =
    baseStep * (Math.log(1 + compression * index) / Math.log(1 + compression));
  return Math.round(Math.min(maxFrames, compressed));
}
