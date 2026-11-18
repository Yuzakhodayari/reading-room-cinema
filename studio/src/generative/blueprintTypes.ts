import { z } from "zod";

/**
 * Pillar #13 — Declarative SceneBlueprint Schema
 *
 * Allows any LLM director (DeepSeek, Gemini, Claude, Fable 5.2) or human author
 * to invent bespoke multi-actor animated mechanical & financial contraptions
 * using semantic zones, typed actors, routed connectors, deterministic 2D physics,
 * and normalized/frame-locked phase triggers — without raw pixel coordinates or JSX.
 */

export const SEMANTIC_ZONES = [
  "left-stage",
  "center-hero",
  "right-stage",
  "top-header",
  "bottom-ledger",
  "split-left",
  "split-right",
] as const;

export type SemanticZone = (typeof SEMANTIC_ZONES)[number];

export const BLUEPRINT_ACTOR_KINDS = [
  "prop-rig",
  "metric-counter",
  "document-card",
  "fluid-tank",
  "balance-scale",
  "conveyor-belt",
  "timeline-track",
  "isometric-tower",
  "verdict-stamp",
] as const;

export type BlueprintActorKind = (typeof BLUEPRINT_ACTOR_KINDS)[number];

export const BLUEPRINT_CONNECTOR_KINDS = [
  "flow-pipe",
  "guillotine-cut",
  "laser-scan",
  "geodesic-arc",
  "veto-slash",
  "dimension-line",
] as const;

export type BlueprintConnectorKind = (typeof BLUEPRINT_CONNECTOR_KINDS)[number];

export const BLUEPRINT_THEME_REGISTERS = [
  "paper_editorial",
  "midnight_telemetry",
  "drafting_blueprint",
  "archival_parchment",
] as const;

export type BlueprintThemeRegister = (typeof BLUEPRINT_THEME_REGISTERS)[number];

export const BLUEPRINT_SURFACE_MODES = ["page", "over-footage"] as const;
export type BlueprintSurfaceMode = (typeof BLUEPRINT_SURFACE_MODES)[number];

export const OVER_FOOTAGE_PLACEMENTS = [
  "right-third",
  "bottom-dock",
  "top-bar",
  "depth-sandwich",
] as const;

export type OverFootagePlacement = (typeof OVER_FOOTAGE_PLACEMENTS)[number];

export const BLUEPRINT_TONES = [
  "navy",
  "slate",
  "teal",
  "crimson",
  "sand",
  "muted",
] as const;

export type BlueprintTone = (typeof BLUEPRINT_TONES)[number];

export const PROP_ARCHETYPES = [
  "running-shoe-bom",
  "flip-whiteboard-iron",
  "house-deed",
  "port-crane",
  "scrip-wallet",
  "power-node",
  "jet-gate",
  "gpu-cluster",
  "roof-drone",
  "transformer-coil",
  "euv-lithography",
  "naval-vls",
  "subsea-cable",
  "sovereign-bond",
  "vault-door",
  "generic-module",
] as const;

export type PropArchetype = (typeof PROP_ARCHETYPES)[number];

export const PHASE_TRIGGER_ACTIONS = [
  "vaporize-slice",
  "flip-180",
  "slam-stamp",
  "guillotine-sever",
  "veto-strike",
  "spillway-overflow",
  "cable-snap",
  "highlight-chisel",
  "counter-surge",
  "camera-focus",
] as const;

export type PhaseTriggerAction = (typeof PHASE_TRIGGER_ACTIONS)[number];

export const PORT_SIDES = ["auto", "north", "south", "east", "west", "center"] as const;
export type PortSide = (typeof PORT_SIDES)[number];

// ============================================================================
// Sub-Specifications for Actors & Isometric 3D Blocks
// ============================================================================

export interface BomSliceSpec {
  id: string;
  label: string;
  costText: string;
  sharePct: number;
  vaporizable?: boolean;
  vaporizeAtProgress?: number;
  tone?: BlueprintTone;
}

export interface DocumentRowSpec {
  label: string;
  value: string;
  delta?: string;
  strike?: boolean;
  strikeAtProgress?: number;
  highlight?: boolean;
  tone?: BlueprintTone;
}

export interface ConveyorItemSpec {
  id: string;
  label: string;
  value?: string;
  vaporizeAtGate?: boolean;
  tone?: BlueprintTone;
}

export interface TimelineMilestoneSpec {
  tick: string;
  label: string;
  metric?: string;
  status?: "ok" | "warn" | "critical";
}

export interface IsometricBlockSpec {
  id: string;
  label?: string;
  calloutValue?: string;
  /** Grid X coordinate (-4..4 typical) */
  gx: number;
  /** Grid Z coordinate (-4..4 typical) */
  gz: number;
  /** Footprint width in grid units */
  widthUnits: number;
  /** Footprint depth in grid units */
  depthUnits: number;
  /** Target extruded height in world units */
  heightUnits: number;
  /** Optional initial height before animated growth */
  initialHeightUnits?: number;
  /** Delay offset in normalized progress (0..0.8) */
  riseAtProgress?: number;
  tone?: BlueprintTone;
  /** Server rack / architectural window LED grid */
  windowMatrix?: {
    rows: number;
    cols: number;
    activeRatio?: number;
    powerDownAfterProgress?: number;
  };
  /** Rising thermal/cooling plume above block */
  coolingPlume?: boolean;
}

export interface PropRigData {
  archetype: PropArchetype;
  eyebrow?: string;
  headline: string;
  metricText?: string;
  sublabel?: string;
  /** Used by running-shoe-bom or layered stack rigs */
  slices?: BomSliceSpec[];
  /** Used by flip-whiteboard-iron 180-degree card/slab flip */
  flipAtProgress?: number;
  backEyebrow?: string;
  backHeadline?: string;
  backMetricText?: string;
  backSublabel?: string;
  statusBadge?: string;
}

export interface MetricCounterData {
  eyebrow?: string;
  label: string;
  fromValue: number;
  toValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  deltaBadge?: string;
  sublabel?: string;
  countStartProgress?: number;
  countEndProgress?: number;
  highlightChisel?: boolean;
}

export interface DocumentCardData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  docCode?: string;
  rows: DocumentRowSpec[];
  footerNote?: string;
  sealText?: string;
}

export interface FluidTankData {
  eyebrow?: string;
  title: string;
  capacityLabel: string;
  initialFill: number; // 0..1
  targetFill: number; // 0..1
  overflowThreshold?: number; // 0..1
  tierIndex?: number;
  statusText?: string;
  liquidTone?: BlueprintTone;
}

export interface BalanceScaleData {
  eyebrow?: string;
  title: string;
  leftLabel: string;
  leftValueText: string;
  leftWeight: number;
  rightLabel: string;
  rightValueText: string;
  rightWeight: number;
  ratioBadge?: string;
}

export interface ConveyorBeltData {
  eyebrow?: string;
  title: string;
  speedMultiplier?: number;
  gateLabel?: string;
  gateAtRatio?: number;
  items: ConveyorItemSpec[];
}

export interface TimelineTrackData {
  eyebrow?: string;
  title: string;
  milestones: TimelineMilestoneSpec[];
  progressTo?: number; // 0..1
  secondaryLane?: {
    label: string;
    metricText?: string;
    progressTo: number;
    tone?: BlueprintTone;
  };
}

export interface IsometricTowerData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  azimuthDeg?: number;
  elevationDeg?: number;
  gridSpan?: number;
  axisUnitLabel?: string;
  blocks: IsometricBlockSpec[];
}

export interface VerdictStampData {
  stampText: string;
  subText?: string;
  authorityLabel?: string;
  slamAtProgress?: number;
  angleDeg?: number;
  inkTone?: "crimson" | "navy" | "teal";
}

// ============================================================================
// Actor, Connector, Mechanism & Phase Trigger Definitions
// ============================================================================

export interface BlueprintActor {
  id: string;
  kind: BlueprintActorKind;
  zone: SemanticZone;
  tone?: BlueprintTone;
  /** Optional relative sizing weight inside a shared zone (default 1.0) */
  sizeWeight?: number;
  /** Optional explicit entry progress override (0..1) */
  enterAtProgress?: number;
  /** Highlight with Reading Room chisel sweep */
  chiselHighlight?: boolean;
  propRig?: PropRigData;
  metricCounter?: MetricCounterData;
  documentCard?: DocumentCardData;
  fluidTank?: FluidTankData;
  balanceScale?: BalanceScaleData;
  conveyorBelt?: ConveyorBeltData;
  timelineTrack?: TimelineTrackData;
  isometricTower?: IsometricTowerData;
  verdictStamp?: VerdictStampData;
}

export interface BlueprintConnector {
  id: string;
  kind: BlueprintConnectorKind;
  fromActorId: string;
  toActorId: string;
  fromPort?: PortSide;
  toPort?: PortSide;
  label?: string;
  metricBadge?: string;
  tone?: BlueprintTone;
  particleCount?: number;
  particleSpeed?: number;
  /** Normalized progress (0..1) when cut, slash, scan, or arc activates */
  triggerAtProgress?: number;
  /** Normalized progress (0..1) when action completes */
  endAtProgress?: number;
  /** If true, downstream particles halt or divert after triggerAtProgress */
  severFlowOnTrigger?: boolean;
  arcLiftPx?: number;
  dashed?: boolean;
}

export type MechanismKind =
  | "torque-scale"
  | "hydraulic-spillway"
  | "bom-vaporizer"
  | "sand-erosion"
  | "circular-carousel"
  | "tension-snap";

export interface TorqueScaleMechanismConfig {
  id: string;
  kind: "torque-scale";
  targetActorId?: string;
  leftWeight: number;
  rightWeight: number;
  maxTiltDeg?: number;
  releaseAtProgress?: number;
  beamSpanPx?: number;
}

export interface HydraulicSpillwayMechanismConfig {
  id: string;
  kind: "hydraulic-spillway";
  targetActorIds?: string[];
  totalInflowUnits: number;
  tierCapacities: number[];
  guillotineAtProgress?: number;
  postGuillotineRetention?: number;
  particleCount?: number;
  seed?: number;
}

export interface BomVaporizerMechanismConfig {
  id: string;
  kind: "bom-vaporizer";
  targetActorId?: string;
  slices: Array<{
    id: string;
    heightRatio: number;
    vaporizable: boolean;
    vaporizeAtProgress?: number;
  }>;
  totalStackPx?: number;
  gravityPxPerSec2?: number;
  dampingZeta?: number; // Default 0.92
  seed?: number;
}

export interface SandErosionMechanismConfig {
  id: string;
  kind: "sand-erosion";
  targetActorId?: string;
  initialUnits: number;
  floorUnits?: number;
  startAtProgress?: number;
  exhaustAtProgress?: number;
  perishable?: boolean;
  grainCount?: number;
  seed?: number;
}

export interface CircularCarouselMechanismConfig {
  id: string;
  kind: "circular-carousel";
  nodeIds: string[];
  radiusX?: number;
  radiusY?: number;
  revolutionsPerMinute?: number;
  pulseCount?: number;
  baseCapitalMultiple?: number;
}

export interface TensionSnapMechanismConfig {
  id: string;
  kind: "tension-snap";
  targetConnectorId?: string;
  spanPx?: number;
  pullStartProgress?: number;
  snapAtProgress?: number;
  maxDeflectionPx?: number;
  recoilFreqHz?: number;
  recoilDamping?: number;
}

export type MechanismConfig =
  | TorqueScaleMechanismConfig
  | HydraulicSpillwayMechanismConfig
  | BomVaporizerMechanismConfig
  | SandErosionMechanismConfig
  | CircularCarouselMechanismConfig
  | TensionSnapMechanismConfig;

export interface PhaseTrigger {
  id: string;
  action: PhaseTriggerAction;
  targetId: string;
  /** Normalized 0..1 timeline trigger */
  atProgress?: number;
  endProgress?: number;
  /** Optional frame-locked trigger */
  atFrame?: number;
  durationFrames?: number;
  label?: string;
}

export interface BlueprintPolishConfig {
  mastheadEyebrow?: string;
  mastheadTitle?: string;
  mastheadFolio?: string;
  sourceCitation?: string;
  sourceDocRef?: string;
  enableCameraPush?: boolean;
  cameraPushScale?: number;
  staggerFrames?: number;
  chiselHighlightIds?: string[];
}

export interface SceneBlueprint {
  id: string;
  episode?: number;
  title: string;
  subtitle?: string;
  themeRegister: BlueprintThemeRegister;
  surfaceMode?: BlueprintSurfaceMode;
  overFootagePlacement?: OverFootagePlacement;
  durationFrames?: number;
  actors: BlueprintActor[];
  connectors?: BlueprintConnector[];
  mechanisms?: MechanismConfig[];
  phaseTriggers?: PhaseTrigger[];
  polish?: BlueprintPolishConfig;
}

// ============================================================================
// Runtime Zod Schemas (Zod v4 Strict Validation & LLM Draft Normalization)
// ============================================================================

export const BomSliceSchema = z.object({
  id: z.string(),
  label: z.string(),
  costText: z.string(),
  sharePct: z.number(),
  vaporizable: z.boolean().optional(),
  vaporizeAtProgress: z.number().min(0).max(1).optional(),
  tone: z.enum(BLUEPRINT_TONES).optional(),
});

export const DocumentRowSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string().optional(),
  strike: z.boolean().optional(),
  strikeAtProgress: z.number().min(0).max(1).optional(),
  highlight: z.boolean().optional(),
  tone: z.enum(BLUEPRINT_TONES).optional(),
});

export const IsometricBlockSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  calloutValue: z.string().optional(),
  gx: z.number(),
  gz: z.number(),
  widthUnits: z.number().positive(),
  depthUnits: z.number().positive(),
  heightUnits: z.number().nonnegative(),
  initialHeightUnits: z.number().nonnegative().optional(),
  riseAtProgress: z.number().min(0).max(1).optional(),
  tone: z.enum(BLUEPRINT_TONES).optional(),
  windowMatrix: z
    .object({
      rows: z.number().int().positive(),
      cols: z.number().int().positive(),
      activeRatio: z.number().min(0).max(1).optional(),
      powerDownAfterProgress: z.number().min(0).max(1).optional(),
    })
    .optional(),
  coolingPlume: z.boolean().optional(),
});

export const BlueprintActorSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(BLUEPRINT_ACTOR_KINDS),
  zone: z.enum(SEMANTIC_ZONES),
  tone: z.enum(BLUEPRINT_TONES).optional(),
  sizeWeight: z.number().positive().optional(),
  enterAtProgress: z.number().min(0).max(1).optional(),
  chiselHighlight: z.boolean().optional(),
  propRig: z
    .object({
      archetype: z.enum(PROP_ARCHETYPES),
      eyebrow: z.string().optional(),
      headline: z.string(),
      metricText: z.string().optional(),
      sublabel: z.string().optional(),
      slices: z.array(BomSliceSchema).optional(),
      flipAtProgress: z.number().min(0).max(1).optional(),
      backEyebrow: z.string().optional(),
      backHeadline: z.string().optional(),
      backMetricText: z.string().optional(),
      backSublabel: z.string().optional(),
      statusBadge: z.string().optional(),
    })
    .optional(),
  metricCounter: z
    .object({
      eyebrow: z.string().optional(),
      label: z.string(),
      fromValue: z.number(),
      toValue: z.number(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      decimals: z.number().int().min(0).max(4).optional(),
      deltaBadge: z.string().optional(),
      sublabel: z.string().optional(),
      countStartProgress: z.number().min(0).max(1).optional(),
      countEndProgress: z.number().min(0).max(1).optional(),
      highlightChisel: z.boolean().optional(),
    })
    .optional(),
  documentCard: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      docCode: z.string().optional(),
      rows: z.array(DocumentRowSchema),
      footerNote: z.string().optional(),
      sealText: z.string().optional(),
    })
    .optional(),
  fluidTank: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      capacityLabel: z.string(),
      initialFill: z.number().min(0).max(1),
      targetFill: z.number().min(0).max(1),
      overflowThreshold: z.number().min(0).max(1).optional(),
      tierIndex: z.number().int().nonnegative().optional(),
      statusText: z.string().optional(),
      liquidTone: z.enum(BLUEPRINT_TONES).optional(),
    })
    .optional(),
  balanceScale: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      leftLabel: z.string(),
      leftValueText: z.string(),
      leftWeight: z.number().nonnegative(),
      rightLabel: z.string(),
      rightValueText: z.string(),
      rightWeight: z.number().nonnegative(),
      ratioBadge: z.string().optional(),
    })
    .optional(),
  conveyorBelt: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      speedMultiplier: z.number().positive().optional(),
      gateLabel: z.string().optional(),
      gateAtRatio: z.number().min(0.1).max(0.9).optional(),
      items: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          value: z.string().optional(),
          vaporizeAtGate: z.boolean().optional(),
          tone: z.enum(BLUEPRINT_TONES).optional(),
        })
      ),
    })
    .optional(),
  timelineTrack: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      milestones: z.array(
        z.object({
          tick: z.string(),
          label: z.string(),
          metric: z.string().optional(),
          status: z.enum(["ok", "warn", "critical"]).optional(),
        })
      ),
      progressTo: z.number().min(0).max(1).optional(),
      secondaryLane: z
        .object({
          label: z.string(),
          metricText: z.string().optional(),
          progressTo: z.number().min(0).max(1),
          tone: z.enum(BLUEPRINT_TONES).optional(),
        })
        .optional(),
    })
    .optional(),
  isometricTower: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      azimuthDeg: z.number().optional(),
      elevationDeg: z.number().optional(),
      gridSpan: z.number().positive().optional(),
      axisUnitLabel: z.string().optional(),
      blocks: z.array(IsometricBlockSchema),
    })
    .optional(),
  verdictStamp: z
    .object({
      stampText: z.string(),
      subText: z.string().optional(),
      authorityLabel: z.string().optional(),
      slamAtProgress: z.number().min(0).max(1).optional(),
      angleDeg: z.number().optional(),
      inkTone: z.enum(["crimson", "navy", "teal"]).optional(),
    })
    .optional(),
});

export const BlueprintConnectorSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(BLUEPRINT_CONNECTOR_KINDS),
  fromActorId: z.string().min(1),
  toActorId: z.string().min(1),
  fromPort: z.enum(PORT_SIDES).optional(),
  toPort: z.enum(PORT_SIDES).optional(),
  label: z.string().optional(),
  metricBadge: z.string().optional(),
  tone: z.enum(BLUEPRINT_TONES).optional(),
  particleCount: z.number().int().min(0).max(120).optional(),
  particleSpeed: z.number().positive().optional(),
  triggerAtProgress: z.number().min(0).max(1).optional(),
  endAtProgress: z.number().min(0).max(1).optional(),
  severFlowOnTrigger: z.boolean().optional(),
  arcLiftPx: z.number().optional(),
  dashed: z.boolean().optional(),
});

export const MechanismConfigSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("torque-scale"),
    targetActorId: z.string().optional(),
    leftWeight: z.number().nonnegative(),
    rightWeight: z.number().nonnegative(),
    maxTiltDeg: z.number().positive().optional(),
    releaseAtProgress: z.number().min(0).max(1).optional(),
    beamSpanPx: z.number().positive().optional(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("hydraulic-spillway"),
    targetActorIds: z.array(z.string()).optional(),
    totalInflowUnits: z.number().nonnegative(),
    tierCapacities: z.array(z.number().positive()),
    guillotineAtProgress: z.number().min(0).max(1).optional(),
    postGuillotineRetention: z.number().min(0).max(1).optional(),
    particleCount: z.number().int().min(0).max(120).optional(),
    seed: z.number().int().optional(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("bom-vaporizer"),
    targetActorId: z.string().optional(),
    slices: z.array(
      z.object({
        id: z.string(),
        heightRatio: z.number().positive(),
        vaporizable: z.boolean(),
        vaporizeAtProgress: z.number().min(0).max(1).optional(),
      })
    ),
    totalStackPx: z.number().positive().optional(),
    gravityPxPerSec2: z.number().positive().optional(),
    dampingZeta: z.number().min(0.1).max(0.999).optional(),
    seed: z.number().int().optional(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("sand-erosion"),
    targetActorId: z.string().optional(),
    initialUnits: z.number().nonnegative(),
    floorUnits: z.number().nonnegative().optional(),
    startAtProgress: z.number().min(0).max(1).optional(),
    exhaustAtProgress: z.number().min(0).max(1).optional(),
    perishable: z.boolean().optional(),
    grainCount: z.number().int().min(0).max(120).optional(),
    seed: z.number().int().optional(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("circular-carousel"),
    nodeIds: z.array(z.string()),
    radiusX: z.number().positive().optional(),
    radiusY: z.number().positive().optional(),
    revolutionsPerMinute: z.number().positive().optional(),
    pulseCount: z.number().int().min(1).max(32).optional(),
    baseCapitalMultiple: z.number().positive().optional(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("tension-snap"),
    targetConnectorId: z.string().optional(),
    spanPx: z.number().positive().optional(),
    pullStartProgress: z.number().min(0).max(1).optional(),
    snapAtProgress: z.number().min(0).max(1).optional(),
    maxDeflectionPx: z.number().positive().optional(),
    recoilFreqHz: z.number().positive().optional(),
    recoilDamping: z.number().positive().optional(),
  }),
]);

export const PhaseTriggerSchema = z.object({
  id: z.string(),
  action: z.enum(PHASE_TRIGGER_ACTIONS),
  targetId: z.string(),
  atProgress: z.number().min(0).max(1).optional(),
  endProgress: z.number().min(0).max(1).optional(),
  atFrame: z.number().int().nonnegative().optional(),
  durationFrames: z.number().int().positive().optional(),
  label: z.string().optional(),
});

export const BlueprintPolishSchema = z.object({
  mastheadEyebrow: z.string().optional(),
  mastheadTitle: z.string().optional(),
  mastheadFolio: z.string().optional(),
  sourceCitation: z.string().optional(),
  sourceDocRef: z.string().optional(),
  enableCameraPush: z.boolean().optional(),
  cameraPushScale: z.number().min(1).max(1.12).optional(),
  staggerFrames: z.number().int().min(0).max(24).optional(),
  chiselHighlightIds: z.array(z.string()).optional(),
});

export const SceneBlueprintSchema = z.object({
  id: z.string().min(1),
  episode: z.number().int().positive().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  themeRegister: z.enum(BLUEPRINT_THEME_REGISTERS).default("paper_editorial"),
  surfaceMode: z.enum(BLUEPRINT_SURFACE_MODES).optional(),
  overFootagePlacement: z.enum(OVER_FOOTAGE_PLACEMENTS).optional(),
  durationFrames: z.number().int().positive().optional(),
  actors: z.array(BlueprintActorSchema).min(1),
  connectors: z.array(BlueprintConnectorSchema).optional(),
  mechanisms: z.array(MechanismConfigSchema).optional(),
  phaseTriggers: z.array(PhaseTriggerSchema).optional(),
  polish: BlueprintPolishSchema.optional(),
});

/**
 * Validates & normalizes an untrusted JSON SceneBlueprint (e.g. from DeepSeek or Fable 5.2).
 */
export function parseSceneBlueprint(input: unknown): SceneBlueprint {
  return SceneBlueprintSchema.parse(input);
}

/**
 * Safe boolean type guard for SceneBlueprint payloads.
 */
export function isSceneBlueprint(input: unknown): input is SceneBlueprint {
  return SceneBlueprintSchema.safeParse(input).success;
}

/**
 * Resolves a PhaseTrigger (0..1 normalized OR frame-locked) into deterministic start/end frames.
 */
export function resolvePhaseWindow(
  trigger: Pick<PhaseTrigger, "atProgress" | "endProgress" | "atFrame" | "durationFrames">,
  totalFrames: number
): { startFrame: number; endFrame: number; durationFrames: number } {
  const safeTotal = Math.max(30, totalFrames);
  if (trigger.atFrame !== undefined) {
    const startFrame = Math.max(0, Math.min(safeTotal - 1, trigger.atFrame));
    const dur = Math.max(1, trigger.durationFrames ?? 24);
    return {
      startFrame,
      endFrame: Math.min(safeTotal, startFrame + dur),
      durationFrames: dur,
    };
  }
  const pStart = Math.max(0, Math.min(0.98, trigger.atProgress ?? 0.35));
  const pEnd = Math.max(
    pStart + 0.04,
    Math.min(1, trigger.endProgress ?? pStart + 0.18)
  );
  const startFrame = Math.round(pStart * safeTotal);
  const endFrame = Math.max(startFrame + 1, Math.round(pEnd * safeTotal));
  return {
    startFrame,
    endFrame,
    durationFrames: endFrame - startFrame,
  };
}
