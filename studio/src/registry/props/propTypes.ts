import type { CSSProperties, FC } from "react";
import { interpolate } from "remotion";
import { z } from "zod";
import { OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "../../design/tokens";

// ============================================================================
// 1. Domain Taxonomy, Motion Verbs & Zod Schemas
// ============================================================================

export const PROP_CATEGORIES = [
  "fiscal-debt",
  "compute-chips",
  "energy-grid",
  "minerals-industrial",
  "defense-maritime",
  "subsea-telecom",
  "housing-insurance",
  "credit-markets",
  "labor-household",
  "history-archive",
  "legal-filings",
  "telestrator-schematic",
] as const;

export const PropCategorySchema = z.enum(PROP_CATEGORIES);
export type PropCategory = z.infer<typeof PropCategorySchema>;

export const PROP_KINDS = ["hero-contraption", "parametric-blueprint"] as const;
export const PropKindSchema = z.enum(PROP_KINDS);
export type PropKind = z.infer<typeof PropKindSchema>;

export const PROP_DEFAULT_MOTIONS = [
  "dial-sweep",
  "piston-cycle",
  "ledger-tick",
  "pulse-signal",
  "rotor-spin",
  "guillotine-drop",
  "conveyor-shift",
  "scale-tilt",
  "beam-scan",
  "wave-propagate",
  "stamp-press",
  "thermal-shimmer",
  "carousel-loop",
  "snowball-compound",
  "anchor-drag",
  "draw-blueprint",
] as const;

export const PropDefaultMotionSchema = z.enum(PROP_DEFAULT_MOTIONS);
export type PropDefaultMotion = z.infer<typeof PropDefaultMotionSchema>;

export const PALETTE_REGISTER_MODES = ["page", "over-footage"] as const;
export const PaletteRegisterModeSchema = z.enum(PALETTE_REGISTER_MODES);
export type PaletteRegisterMode = z.infer<typeof PaletteRegisterModeSchema>;

export const PARAMETRIC_ARCHETYPES = [
  "precision-dial-gauge",
  "rotary-valve-manifold",
  "banknote-bond-instrument",
  "legal-dossier-filing",
  "semiconductor-die-reticle",
  "server-compute-chassis",
  "grid-power-apparatus",
  "industrial-plant-rig",
  "maritime-defense-vessel",
  "subsea-network-node",
  "architectural-elevation",
  "consumer-exploded-bom",
  "balance-ledger-contraption",
  "archival-artifact-engraving",
  "chart-instrument-frame",
  "telestrator-annotation-rig",
] as const;

export const ParametricArchetypeSchema = z.enum(PARAMETRIC_ARCHETYPES);
export type ParametricArchetype = z.infer<typeof ParametricArchetypeSchema>;

export type AccentColorRole = "brick" | "teal" | "slate";

export const PropRenderPropsSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  frame: z.number().optional(),
  progress: z.number().min(0).max(1).optional(),
  paletteMode: PaletteRegisterModeSchema.optional(),
  inkColor: z.string().optional(),
  accentColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  paperColor: z.string().optional(),
  mutedColor: z.string().optional(),
  strokeScale: z.number().positive().optional(),
  showAnnotations: z.boolean().optional(),
  stateVariant: z.string().optional(),
  labelOverride: z.string().optional(),
  metricOverride: z.string().optional(),
  className: z.string().optional(),
});

export interface PropRenderProps {
  width?: number;
  height?: number;
  frame?: number;
  progress?: number;
  paletteMode?: PaletteRegisterMode;
  inkColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  paperColor?: string;
  mutedColor?: string;
  strokeScale?: number;
  showAnnotations?: boolean;
  stateVariant?: string;
  labelOverride?: string;
  metricOverride?: string;
  className?: string;
  style?: CSSProperties;
}

// ============================================================================
// 2. Parametric Geometry Specifications (16 Blueprint Archetypes)
// ============================================================================

export interface PrecisionDialParams {
  archetype: "precision-dial-gauge";
  arcSweepDeg: number;
  majorTicks: number;
  minorSubdivisions: number;
  dangerZoneStartPct: number;
  bezelStyle: "double-ring" | "octagonal-bolted" | "square-panel" | "flanged-brass";
  needleStyle: "tapered" | "counterweight" | "vernier-dual" | "chronograph";
  subDialCount: 0 | 1 | 2;
  targetNorm: number;
  secondaryNorm?: number;
}

export interface RotaryValveParams {
  archetype: "rotary-valve-manifold";
  inletPipes: 1 | 2 | 3 | 4;
  outletPipes: 1 | 2 | 3 | 4;
  handwheelSpokes: number;
  bodyTopology: "cross-manifold" | "gate-siphon" | "check-chamber" | "three-way-diverter";
  flangeBolts: number;
  flowMeterWindow: boolean;
  pressureReliefStack: boolean;
  bypassLoop: boolean;
}

export interface BanknoteBondParams {
  archetype: "banknote-bond-instrument";
  borderGuillocheWaves: number;
  cornerFrame: "oval" | "octagon" | "shield" | "diamond";
  sealPosition: "left" | "right" | "dual" | "center";
  sealSpikes: number;
  couponStubs: number;
  signatureLines: 1 | 2 | 3;
  watermarkMotif: "eagle-crest" | "globe-grid" | "scales" | "tower" | "cipher";
}

export interface LegalDossierParams {
  archetype: "legal-dossier-filing";
  pageStackCount: 1 | 2 | 3 | 4;
  headerStyle: "sec-edgar" | "irs-boxed" | "congress-bill" | "court-caption" | "actuarial-schedule";
  tableRows: number;
  tableCols: 2 | 3 | 4 | 5;
  redactionBars: number;
  highlightedRow: number;
  officialStamp: "circular-seal" | "boxed-stamp" | "notary-ribbon" | "none";
  binderHoles: "top-two" | "left-three" | "none";
}

export interface SemiconductorDieParams {
  archetype: "semiconductor-die-reticle";
  coreGridCols: number;
  coreGridRows: number;
  hbmStacks: number;
  substratePinsPerSide: number;
  packageShape: "square-bga" | "rect-interposer" | "wafer-sector" | "pcie-card";
  heatSpreaderNotches: number;
  traceDensity: 1 | 2 | 3;
}

export interface ServerChassisParams {
  archetype: "server-compute-chassis";
  rackUnitsU: number;
  driveBaysPerRow: number;
  fanRotors: 0 | 1 | 2 | 3 | 4;
  frontPanelStyle: "led-matrix" | "patch-cables" | "liquid-manifold" | "tape-reels";
  exhaustVents: number;
  powerBusBars: boolean;
}

export interface GridApparatusParams {
  archetype: "grid-power-apparatus";
  insulatorStacks: number;
  insulatorSheds: number;
  radiatorFins: number;
  trussTiers: number;
  apparatusForm:
    | "transformer-tank"
    | "lattice-pylon"
    | "turbine-nacelle"
    | "bess-enclosure"
    | "breaker-bank";
  coronaArcs: boolean;
}

export interface IndustrialPlantParams {
  archetype: "industrial-plant-rig";
  chimneyCount: 0 | 1 | 2 | 3 | 4;
  gearTeeth: number;
  pistonCount: 1 | 2 | 3 | 4;
  rigForm:
    | "rotary-kiln"
    | "articulated-arm"
    | "gantry-press"
    | "distillation-tower"
    | "bucket-wheel";
  conveyorRollers: number;
  hopperCone: boolean;
}

export interface MaritimeDefenseParams {
  archetype: "maritime-defense-vessel";
  hullLengthRatio: number;
  superstructurePos: "aft" | "mid" | "forward" | "submerged" | "airframe";
  cargoBaysOrCells: number;
  radarMasts: 1 | 2 | 3;
  craftClass:
    | "container-hull"
    | "tanker-hull"
    | "cable-ship"
    | "warship-vls"
    | "submarine"
    | "delta-uav"
    | "missile-stage";
  wakeWaves: number;
}

export interface SubseaNetworkParams {
  archetype: "subsea-network-node";
  armorWireCount: number;
  fiberPairCount: number;
  sheathLayers: 2 | 3 | 4 | 5;
  nodeForm:
    | "radial-cross-section"
    | "inline-repeater"
    | "branching-y"
    | "landing-vault"
    | "grapnel-plow";
}

export interface ArchitecturalElevationParams {
  archetype: "architectural-elevation";
  stories: number;
  windowCols: number;
  roofProfile:
    | "pitched-gable"
    | "classical-pediment"
    | "sawtooth-factory"
    | "flat-cleanroom"
    | "mansard"
    | "vaulted-hangar";
  columnsCount: number;
  hvacUnits: number;
  wingExtension: boolean;
  foundationSteps: 1 | 2 | 3 | 4;
}

export interface ConsumerExplodedBomParams {
  archetype: "consumer-exploded-bom";
  explodedLayers: 3 | 4 | 5 | 6;
  layerSpreadPx: number;
  calloutSide: "right" | "alternating";
  silhouetteItem:
    | "device-slab"
    | "chassis-pack"
    | "medical-scanner"
    | "carton-crate"
    | "garment-footwear"
    | "vial-blister";
  fastenerAxisLines: 2 | 3 | 4;
}

export interface BalanceLedgerParams {
  archetype: "balance-ledger-contraption";
  beamTiltDeg: number;
  leftWeights: 1 | 2 | 3 | 4 | 5;
  rightWeights: 1 | 2 | 3 | 4 | 5;
  fulcrumStyle: "knife-edge" | "truss-pedestal" | "hydraulic-ram" | "hanging-yoke";
  graduatedArcTicks: number;
  panShape: "flat-tray" | "suspended-dish" | "hopper-bucket";
}

export interface ArchivalArtifactParams {
  archetype: "archival-artifact-engraving";
  rimSerrations: number;
  artifactShape:
    | "medallion-coin"
    | "coupon-sheet"
    | "ingot-trapezoid"
    | "ticker-dome"
    | "punch-card"
    | "wax-ribbon-seal";
  engravingHatchLines: number;
  perforationCols: number;
  eraYear: string;
}

export interface ChartInstrumentParams {
  archetype: "chart-instrument-frame";
  gridDivisionsX: number;
  gridDivisionsY: number;
  curveProfile:
    | "inversion-spread"
    | "exponential-cliff"
    | "step-ratchet"
    | "dual-divergence"
    | "pyramid-bars"
    | "waterfall-steps";
  dataPointsCount: number;
  thresholdLinePct: number;
  calloutIndex: number;
}

export interface TelestratorAnnotationParams {
  archetype: "telestrator-annotation-rig";
  rigVariant:
    | "curly-brace"
    | "vernier-caliper"
    | "rubber-stamp"
    | "loupe-reticle"
    | "dimension-span"
    | "timeline-flag"
    | "audit-tag";
  tickSubdivisions: number;
  rotationDeg: number;
  doubleBorder: boolean;
  cornerTicks: boolean;
}

export type ParametricGeometryParams =
  | PrecisionDialParams
  | RotaryValveParams
  | BanknoteBondParams
  | LegalDossierParams
  | SemiconductorDieParams
  | ServerChassisParams
  | GridApparatusParams
  | IndustrialPlantParams
  | MaritimeDefenseParams
  | SubseaNetworkParams
  | ArchitecturalElevationParams
  | ConsumerExplodedBomParams
  | BalanceLedgerParams
  | ArchivalArtifactParams
  | ChartInstrumentParams
  | TelestratorAnnotationParams;

export const PROP_DOMAIN_SLUGS = [
  "fiscal",
  "ai-compute",
  "energy-grid",
  "labor",
  "legal",
  "geopolitics",
  "household",
  "history",
  "maritime-defense",
  "editorial-annotation",
] as const;

export const PropDomainSlugSchema = z.enum(PROP_DOMAIN_SLUGS);
export type PropDomainSlug = z.infer<typeof PropDomainSlugSchema>;

export interface ParametricPropBlueprint {
  id: string;
  title: string;
  label?: string;
  domain?: PropDomainSlug;
  category: PropCategory;
  episodeTags: string[];
  keywords: string[];
  animatableParts: string[];
  defaultMotion: PropDefaultMotion;
  accentRole: AccentColorRole;
  datumCode: string;
  primaryMetric: string;
  secondaryLabel: string;
  geometry: ParametricGeometryParams;
}

export type ParametricSpec = ParametricPropBlueprint;

export const PropMetadataSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(2),
  label: z.string().optional(),
  componentName: z.string().optional(),
  kind: PropKindSchema,
  domain: PropDomainSlugSchema.optional(),
  category: PropCategorySchema,
  episodeTags: z.array(z.string()),
  keywords: z.array(z.string()).min(2),
  animatableParts: z.array(z.string()).min(1),
  defaultMotion: PropDefaultMotionSchema,
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "3:4"]),
  viewBox: z.string(),
});

export interface PropVaultEntry {
  id: string;
  title: string;
  label?: string;
  componentName?: string;
  kind: PropKind;
  domain?: PropDomainSlug;
  category: PropCategory;
  episodeTags: string[];
  keywords: string[];
  animatableParts: string[];
  defaultMotion: PropDefaultMotion;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4";
  viewBox: string;
  blueprint?: ParametricPropBlueprint;
  Component: FC<PropRenderProps>;
}

export interface PropSearchOptions {
  domain?: PropDomainSlug;
  category?: PropCategory;
  kind?: PropKind;
  episodeTag?: string;
  limit?: number;
}

// ============================================================================
// 3. Reading Room Dual-Palette Guardrails (Zero #000000 / Zero #FFFFFF)
// ============================================================================

export interface ResolvedPropPalette {
  mode: PaletteRegisterMode;
  ink: string;
  inkDeep: string;
  accent: string;
  secondary: string;
  slate: string;
  muted: string;
  paper: string;
  surfaceSubtle: string;
  border: string;
  riskFill: string;
  highlightWash: string;
}

function sanitizeForbiddenHex(color: string, fallback: string): string {
  const normalized = color.trim().toUpperCase();
  if (
    normalized === "#000" ||
    normalized === "#000000" ||
    normalized === "BLACK" ||
    normalized === "RGB(0,0,0)" ||
    normalized === "RGB(0, 0, 0)"
  ) {
    return PAGE_PALETTE.navyDeep;
  }
  if (
    normalized === "#FFF" ||
    normalized === "#FFFFFF" ||
    normalized === "WHITE" ||
    normalized === "RGB(255,255,255)" ||
    normalized === "RGB(255, 255, 255)"
  ) {
    return PAGE_PALETTE.paperLight;
  }
  return color || fallback;
}

export function resolvePropPalette(
  props: PropRenderProps,
  defaultAccentRole: AccentColorRole = "brick"
): ResolvedPropPalette {
  const mode: PaletteRegisterMode = props.paletteMode ?? "page";

  if (mode === "over-footage") {
    const defaultAccent =
      defaultAccentRole === "teal"
        ? OVER_FOOTAGE_PALETTE.chartSecondary
        : defaultAccentRole === "slate"
          ? OVER_FOOTAGE_PALETTE.accentPrimary
          : OVER_FOOTAGE_PALETTE.brickRedText;

    return {
      mode,
      ink: sanitizeForbiddenHex(
        props.inkColor ?? OVER_FOOTAGE_PALETTE.textHeadline,
        OVER_FOOTAGE_PALETTE.textHeadline
      ),
      inkDeep: PAGE_PALETTE.navyDeep,
      accent: sanitizeForbiddenHex(props.accentColor ?? defaultAccent, defaultAccent),
      secondary: sanitizeForbiddenHex(
        props.secondaryColor ?? OVER_FOOTAGE_PALETTE.chartSecondary,
        OVER_FOOTAGE_PALETTE.chartSecondary
      ),
      slate: OVER_FOOTAGE_PALETTE.accentPrimary,
      muted: sanitizeForbiddenHex(
        props.mutedColor ?? OVER_FOOTAGE_PALETTE.textMuted,
        OVER_FOOTAGE_PALETTE.textMuted
      ),
      paper: sanitizeForbiddenHex(
        props.paperColor ?? OVER_FOOTAGE_PALETTE.glassDarkWell,
        OVER_FOOTAGE_PALETTE.glassDarkWell
      ),
      surfaceSubtle: "rgba(191, 214, 234, 0.10)",
      border: OVER_FOOTAGE_PALETTE.glassInnerHairline,
      riskFill: OVER_FOOTAGE_PALETTE.riskFill,
      highlightWash: OVER_FOOTAGE_PALETTE.highlightSweep,
    };
  }

  const defaultAccent =
    defaultAccentRole === "teal"
      ? PAGE_PALETTE.chartSecondary
      : defaultAccentRole === "slate"
        ? PAGE_PALETTE.gold
        : PAGE_PALETTE.brickRed;

  return {
    mode,
    ink: sanitizeForbiddenHex(props.inkColor ?? PAGE_PALETTE.navy, PAGE_PALETTE.navy),
    inkDeep: PAGE_PALETTE.navyDeep,
    accent: sanitizeForbiddenHex(props.accentColor ?? defaultAccent, defaultAccent),
    secondary: sanitizeForbiddenHex(
      props.secondaryColor ?? PAGE_PALETTE.chartSecondary,
      PAGE_PALETTE.chartSecondary
    ),
    slate: PAGE_PALETTE.gold,
    muted: sanitizeForbiddenHex(props.mutedColor ?? PAGE_PALETTE.muted, PAGE_PALETTE.muted),
    paper: sanitizeForbiddenHex(
      props.paperColor ?? PAGE_PALETTE.paperLight,
      PAGE_PALETTE.paperLight
    ),
    surfaceSubtle: PAGE_PALETTE.paper,
    border: PAGE_PALETTE.paperBorder,
    riskFill: PAGE_PALETTE.riskFill,
    highlightWash: PAGE_PALETTE.highlightSweep,
  };
}

// ============================================================================
// 4. Deterministic Math, Seeded Hash & Blueprint SVG Geometry Primitives
// ============================================================================

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function clampRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deterministic 32-bit FNV-1a string hash (100% Math.random-free).
 */
export function detHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic float in [0, 1) from a string seed + integer salt.
 */
export function detRand(seed: string, salt: number = 0): number {
  let t = (detHash(seed) + Math.imul(salt + 1, 0x6d2b79f5)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Resolves frame + clamped [0, 1] progress deterministically.
 */
export function resolveAnimState(
  contextFrame: number,
  explicitFrame?: number,
  explicitProgress?: number,
  rampFrames: number = 42
): { frame: number; progress: number; phaseRad: number } {
  const f = explicitFrame !== undefined ? explicitFrame : contextFrame;
  const computedProgress = interpolate(f, [0, Math.max(1, rampFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p = explicitProgress !== undefined ? clamp01(explicitProgress) : computedProgress;
  return {
    frame: f,
    progress: p,
    phaseRad: f * 0.12,
  };
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const safeSpan = clampRange(endAngle - startAngle, -359.9, 359.9);
  const actualEnd = startAngle + safeSpan;
  const start = polarToCartesian(cx, cy, radius, actualEnd);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = Math.abs(safeSpan) <= 180 ? "0" : "1";
  const sweepFlag = safeSpan >= 0 ? "0" : "1";
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function regularPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotationDeg: number = 0
): string {
  const n = Math.max(3, Math.floor(sides));
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = rotationDeg + (360 / n) * i;
    const p = polarToCartesian(cx, cy, radius, a);
    pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return pts.join(" ");
}

/**
 * Generates an accurate involute-style mechanical gear SVG path.
 */
export function gearPathD(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  teeth: number,
  rotationDeg: number = 0
): string {
  const n = Math.max(6, Math.floor(teeth));
  const step = 360 / n;
  const commands: string[] = [];
  for (let i = 0; i < n; i++) {
    const base = rotationDeg + i * step;
    const p1 = polarToCartesian(cx, cy, innerRadius, base);
    const p2 = polarToCartesian(cx, cy, outerRadius, base + step * 0.16);
    const p3 = polarToCartesian(cx, cy, outerRadius, base + step * 0.44);
    const p4 = polarToCartesian(cx, cy, innerRadius, base + step * 0.6);
    commands.push(
      `${i === 0 ? "M" : "L"} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
      `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
      `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`
    );
  }
  commands.push("Z");
  return commands.join(" ");
}

/**
 * Generates a scalloped banknote seal / medallion rosette path.
 */
export function rosetteSealPathD(
  cx: number,
  cy: number,
  radius: number,
  spikes: number,
  depth: number = 4,
  rotationDeg: number = 0
): string {
  const total = Math.max(8, Math.floor(spikes)) * 2;
  const pts: string[] = [];
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? radius : radius - depth;
    const a = rotationDeg + (360 / total) * i;
    const p = polarToCartesian(cx, cy, r, a);
    pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}
