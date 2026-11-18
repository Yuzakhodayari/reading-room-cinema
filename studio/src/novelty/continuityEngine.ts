import { z } from "zod";
import {
  VisualRegisterId,
  VisualRegisterIdSchema,
} from "./strategyPresets";

/**
 * Pillar #14 — Stateful Multi-Act Continuity Engine (`continuityEngine.ts`)
 *
 * Tracks recurring visual entities across a full 20–40 minute documentary so
 * architectural geometry, Dual-Palette color tokens, numerical ledger balances,
 * monotonic failure stamps, and callback stroke trajectories evolve deterministically
 * from plant to payoff without ever resetting between scenes.
 */

export const CONTINUITY_ENTITY_KINDS = [
  "household-dossier",
  "investigation-board",
  "sovereign-ledger",
  "contract-metaphor",
  "corporate-spv",
  "infrastructure-corridor",
  "custom-callback",
] as const;

export type ContinuityEntityKind = (typeof CONTINUITY_ENTITY_KINDS)[number];

export const ContinuityEntityKindSchema = z.enum(CONTINUITY_ENTITY_KINDS);

export const CONTINUITY_PHASES = [
  "plant",
  "mutate",
  "pin",
  "audit",
  "payoff",
] as const;

export type ContinuityPhase = (typeof CONTINUITY_PHASES)[number];

export const ContinuityPhaseSchema = z.enum(CONTINUITY_PHASES);

export const CONTINUITY_PIN_DOCK_ZONES = [
  "none",
  "top-right-pin",
  "header-mini-bar",
  "bottom-dock-pill",
  "right-third-card",
] as const;

export type ContinuityPinDockZone = (typeof CONTINUITY_PIN_DOCK_ZONES)[number];

export const ContinuityPinDockZoneSchema = z.enum(CONTINUITY_PIN_DOCK_ZONES);

export const CONTINUITY_BAY_STATUSES = [
  "locked",
  "active",
  "stamped-failed",
  "stamped-survivor",
] as const;

export type ContinuityBayStatus = (typeof CONTINUITY_BAY_STATUSES)[number];

export const ContinuityBayStatusSchema = z.enum(CONTINUITY_BAY_STATUSES);

export type ContinuityScalarValue = string | number | boolean;

export type ContinuityDisplayMap = Readonly<
  Record<string, ContinuityScalarValue>
>;

/**
 * Reusable deterministic vector stroke trajectory (e.g., Gov. Bill Walker's
 * fountain-pen veto slash from P31 replayed verbatim on P56–P57 `PAYCHECK -> ALLOWANCE`).
 */
export interface VectorStrokeTrajectory {
  readonly trajectoryId: string;
  readonly viewBox: readonly [number, number];
  readonly svgPathD: string;
  readonly controlPoints: readonly (readonly [number, number])[];
  readonly angleDeg: number;
  readonly nibWidthPx: number;
  readonly strokeDurationFrames: number;
  readonly inkHex: string;
  readonly description: string;
}

export const VectorStrokeTrajectorySchema = z.object({
  trajectoryId: z.string().min(1),
  viewBox: z.tuple([z.number().positive(), z.number().positive()]),
  svgPathD: z.string().min(4),
  controlPoints: z
    .array(z.tuple([z.number(), z.number()]))
    .min(2),
  angleDeg: z.number(),
  nibWidthPx: z.number().positive(),
  strokeDurationFrames: z.number().int().positive(),
  inkHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  description: z.string().min(1),
});

/**
 * Stateful bay inside a numbered Max Fisher investigation switchboard (`ARCH-04`).
 * Once `failureStampText` is stamped, monotonic continuity rules forbid clearing it.
 */
export interface ContinuityBoardBay {
  readonly bayId: string;
  readonly bayNumber: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly status: ContinuityBayStatus;
  readonly failureStampText: string | null;
  readonly stampedAtStageId: string | null;
  readonly stampedAtFrac: number | null;
}

export const ContinuityBoardBaySchema = z.object({
  bayId: z.string().min(1),
  bayNumber: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  status: ContinuityBayStatusSchema,
  failureStampText: z.string().min(1).nullable(),
  stampedAtStageId: z.string().min(1).nullable(),
  stampedAtFrac: z.number().min(0).max(1).nullable(),
});

/**
 * Immutable geometric contract ensuring an entity remains visually recognizable
 * 15–35 minutes after its initial plant.
 */
export interface ContinuityGeometryLock {
  readonly geometryLockId: string;
  readonly aspectRatio: string;
  readonly architecturalSeed: number;
  readonly preservedAnchors: readonly string[];
  readonly layoutColumns: readonly string[];
  readonly invariantRule: string;
}

export const ContinuityGeometryLockSchema = z.object({
  geometryLockId: z.string().min(1),
  aspectRatio: z.string().min(1),
  architecturalSeed: z.number().int(),
  preservedAnchors: z.array(z.string().min(1)).min(1),
  layoutColumns: z.array(z.string().min(1)).min(1),
  invariantRule: z.string().min(1),
});

/**
 * Dual-Palette & WCAG AAA compliant color state for a continuity stage.
 * Strictly forbids pure `#000000` and pure `#FFFFFF`.
 */
export interface ContinuityColorTokens {
  readonly surfaceHex: string;
  readonly inkHex: string;
  readonly accentHex: string;
  readonly warningHex: string;
  readonly registerId: VisualRegisterId;
  readonly lutHint: string;
}

const NON_EXTREME_HEX_REGEX =
  /^(?!#[0]{6}$)(?!#[Ff]{6}$)#[0-9A-Fa-f]{6}$/;

export const ContinuityColorTokensSchema = z.object({
  surfaceHex: z.string().regex(NON_EXTREME_HEX_REGEX),
  inkHex: z.string().regex(NON_EXTREME_HEX_REGEX),
  accentHex: z.string().regex(NON_EXTREME_HEX_REGEX),
  warningHex: z.string().regex(NON_EXTREME_HEX_REGEX),
  registerId: VisualRegisterIdSchema,
  lutHint: z.string().min(1),
});

export interface ContinuityMutationKeyframe {
  readonly stageId: string;
  readonly phase: ContinuityPhase;
  readonly triggerFrac: number;
  readonly paragraphRef: string;
  readonly sequenceRef: string;
  readonly eraLabel: string;
  readonly headlineStatus: string;
  readonly dockZone: ContinuityPinDockZone;
  readonly archetypeId: string;
  readonly colors: ContinuityColorTokens;
  readonly numericMetrics: Readonly<Record<string, number>>;
  readonly displayFields: ContinuityDisplayMap;
  readonly bays?: readonly ContinuityBoardBay[];
  readonly callbackTokens: readonly string[];
  readonly activeStrokeTrajectoryId?: string;
  readonly notes: string;
}

export const ContinuityMutationKeyframeSchema = z.object({
  stageId: z.string().min(1),
  phase: ContinuityPhaseSchema,
  triggerFrac: z.number().min(0).max(1),
  paragraphRef: z.string().min(1),
  sequenceRef: z.string().min(1),
  eraLabel: z.string().min(1),
  headlineStatus: z.string().min(1),
  dockZone: ContinuityPinDockZoneSchema,
  archetypeId: z.string().min(1),
  colors: ContinuityColorTokensSchema,
  numericMetrics: z.record(z.string(), z.number()),
  displayFields: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()])
  ),
  bays: z.array(ContinuityBoardBaySchema).optional(),
  callbackTokens: z.array(z.string().min(1)),
  activeStrokeTrajectoryId: z.string().min(1).optional(),
  notes: z.string().min(1),
});

export interface ContinuityEntityDefinition {
  readonly entityId: string;
  readonly episodeNumber: number;
  readonly name: string;
  readonly kind: ContinuityEntityKind;
  readonly geometryLock: ContinuityGeometryLock;
  readonly enforceMonotonicStamps: boolean;
  readonly sharedTrajectories: Readonly<
    Record<string, VectorStrokeTrajectory>
  >;
  readonly keyframes: readonly ContinuityMutationKeyframe[];
}

export const ContinuityEntityDefinitionSchema = z.object({
  entityId: z.string().min(1),
  episodeNumber: z.number().int().min(1),
  name: z.string().min(1),
  kind: ContinuityEntityKindSchema,
  geometryLock: ContinuityGeometryLockSchema,
  enforceMonotonicStamps: z.boolean(),
  sharedTrajectories: z.record(z.string(), VectorStrokeTrajectorySchema),
  keyframes: z.array(ContinuityMutationKeyframeSchema).min(1),
});

export interface EvaluatedContinuityState {
  readonly entityId: string;
  readonly name: string;
  readonly kind: ContinuityEntityKind;
  readonly geometryLock: ContinuityGeometryLock;
  readonly isPlanted: boolean;
  readonly activeStageIndex: number;
  readonly activeStage: ContinuityMutationKeyframe;
  readonly previousStage: ContinuityMutationKeyframe | null;
  readonly transitionProgress: number;
  readonly dockZone: ContinuityPinDockZone;
  readonly isPinnedOverlay: boolean;
  readonly resolvedColors: ContinuityColorTokens;
  readonly interpolatedMetrics: Readonly<Record<string, number>>;
  readonly displayFields: ContinuityDisplayMap;
  readonly resolvedBays: readonly ContinuityBoardBay[];
  readonly activeStroke: {
    readonly trajectory: VectorStrokeTrajectory;
    readonly drawProgress: number;
  } | null;
  readonly accumulatedCallbackTokens: readonly string[];
}

export interface ContinuityAuditIssue {
  readonly entityId: string;
  readonly code:
    | "NON_MONOTONIC_TRIGGER_FRAC"
    | "STAMP_CLEARED_OR_MUTATED"
    | "R44_FAKE_CRISIS_HOUR_STAMP"
    | "MISSING_TRAJECTORY_REF"
    | "UNPLANTED_TRAJECTORY_REUSE"
    | "MISSING_PAYOFF_CLOSURE";
  readonly severity: "P0" | "P1";
  readonly message: string;
}

export interface ContinuityAuditReport {
  readonly valid: boolean;
  readonly entityCount: number;
  readonly totalKeyframes: number;
  readonly verifiedCallbackChains: readonly string[];
  readonly issues: readonly ContinuityAuditIssue[];
}

// ============================================================================
// Pure Deterministic Math & Color Interpolation Helpers (Zero CSS / Math.random)
// ============================================================================

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

/** Critically damped smoothstep (`3t^2 - 2t^3`) bounded strictly to `[0, 1]`. */
function dampedSmoothstep(rawT: number): number {
  const t = clamp01(rawT);
  return t * t * (3 - 2 * t);
}

function parseHexRgb(hex: string): readonly [number, number, number] {
  const clean = hex.charAt(0) === "#" ? hex.slice(1) : hex;
  if (clean.length !== 6) {
    return [28, 43, 58];
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [
    Number.isFinite(r) ? r : 28,
    Number.isFinite(g) ? g : 43,
    Number.isFinite(b) ? b : 58,
  ];
}

function byteToHex(value: number): string {
  const clamped = Math.max(4, Math.min(251, Math.round(value)));
  const hex = clamped.toString(16).toUpperCase();
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Deterministic RGB interpolation that strictly clamps channel output to `[4, 251]`
 * so interpolated transitional frames can NEVER emit `#000000` or `#FFFFFF`.
 */
export function interpolateContinuityHex(
  fromHex: string,
  toHex: string,
  progress: number
): string {
  const t = dampedSmoothstep(progress);
  if (t <= 0) {
    return fromHex;
  }
  if (t >= 1) {
    return toHex;
  }
  const [r1, g1, b1] = parseHexRgb(fromHex);
  const [r2, g2, b2] = parseHexRgb(toHex);
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function interpolateMetricMaps(
  fromMetrics: Readonly<Record<string, number>>,
  toMetrics: Readonly<Record<string, number>>,
  progress: number
): Record<string, number> {
  const t = dampedSmoothstep(progress);
  const result: Record<string, number> = {};
  const keysSet = new Set<string>([
    ...Object.keys(fromMetrics),
    ...Object.keys(toMetrics),
  ]);
  keysSet.forEach((key) => {
    const startVal =
      fromMetrics[key] !== undefined ? fromMetrics[key] : toMetrics[key];
    const endVal =
      toMetrics[key] !== undefined ? toMetrics[key] : fromMetrics[key];
    result[key] = startVal + (endVal - startVal) * t;
  });
  return result;
}

/**
 * Merges board bays monotonically from stage `0` through `upToStageIndex`:
 * once a bay receives a non-null `failureStampText`, that failure stamp is permanently
 * preserved even if a downstream author forgets to repeat it on a later keyframe.
 */
function resolveMonotonicBays(
  keyframes: readonly ContinuityMutationKeyframe[],
  upToStageIndex: number,
  enforceMonotonic: boolean
): readonly ContinuityBoardBay[] {
  const currentBays = keyframes[upToStageIndex].bays;
  if (!currentBays || currentBays.length === 0) {
    return [];
  }
  if (!enforceMonotonic) {
    return currentBays;
  }

  const lockedStamps: Record<
    string,
    {
      readonly text: string;
      readonly stageId: string;
      readonly frac: number;
    }
  > = {};

  for (let s = 0; s <= upToStageIndex; s++) {
    const stage = keyframes[s];
    const stageBays = stage.bays;
    if (!stageBays) {
      continue;
    }
    for (let b = 0; b < stageBays.length; b++) {
      const bay = stageBays[b];
      if (bay.failureStampText && !lockedStamps[bay.bayId]) {
        lockedStamps[bay.bayId] = {
          text: bay.failureStampText,
          stageId: bay.stampedAtStageId ?? stage.stageId,
          frac: bay.stampedAtFrac ?? stage.triggerFrac,
        };
      }
    }
  }

  const merged: ContinuityBoardBay[] = [];
  for (let i = 0; i < currentBays.length; i++) {
    const bay = currentBays[i];
    const priorLock = lockedStamps[bay.bayId];
    if (priorLock) {
      const preservedStatus: ContinuityBayStatus =
        bay.status === "stamped-survivor"
          ? "stamped-survivor"
          : "stamped-failed";
      merged.push({
        bayId: bay.bayId,
        bayNumber: bay.bayNumber,
        title: bay.title,
        subtitle: bay.subtitle,
        status: preservedStatus,
        failureStampText: priorLock.text,
        stampedAtStageId: priorLock.stageId,
        stampedAtFrac: priorLock.frac,
      });
    } else {
      merged.push(bay);
    }
  }
  return merged;
}

// ============================================================================
// Generic Declarative Entity State-Machine Builder (Episodes 02–30+)
// ============================================================================

export interface ContinuityEntityBuilderInit {
  readonly entityId: string;
  readonly episodeNumber: number;
  readonly name: string;
  readonly kind: ContinuityEntityKind;
  readonly geometryLock: ContinuityGeometryLock;
  readonly enforceMonotonicStamps?: boolean;
}

export class ContinuityEntityBuilder {
  private readonly init: ContinuityEntityBuilderInit;
  private readonly trajectories: Record<string, VectorStrokeTrajectory> = {};
  private readonly stages: ContinuityMutationKeyframe[] = [];

  public constructor(init: ContinuityEntityBuilderInit) {
    this.init = init;
  }

  public withTrajectory(trajectory: VectorStrokeTrajectory): this {
    const parsed = VectorStrokeTrajectorySchema.parse(trajectory);
    this.trajectories[parsed.trajectoryId] = parsed;
    return this;
  }

  public addStage(stage: ContinuityMutationKeyframe): this {
    const parsed = ContinuityMutationKeyframeSchema.parse(stage);
    this.stages.push(parsed);
    return this;
  }

  public build(): ContinuityEntityDefinition {
    const sorted = this.stages
      .slice()
      .sort((a, b) => a.triggerFrac - b.triggerFrac);

    const def: ContinuityEntityDefinition = {
      entityId: this.init.entityId,
      episodeNumber: this.init.episodeNumber,
      name: this.init.name,
      kind: this.init.kind,
      geometryLock: this.init.geometryLock,
      enforceMonotonicStamps: this.init.enforceMonotonicStamps ?? true,
      sharedTrajectories: { ...this.trajectories },
      keyframes: sorted,
    };

    return ContinuityEntityDefinitionSchema.parse(def);
  }
}

/**
 * Entry-point builder so Episodes 02–30 declaratively construct persistent
 * household dossiers, suspect boards, SPV carousels, and callback props.
 */
export function defineContinuityEntity(
  init: ContinuityEntityBuilderInit
): ContinuityEntityBuilder {
  return new ContinuityEntityBuilder(init);
}

// ============================================================================
// Stateful ContinuityEngine Runtime
// ============================================================================

const FAKE_FUTURE_HOUR_STAMP_REGEX =
  /\b20(2[89]|3\d|4\d)\b[^\n]*\b([01]?\d|2[0-3]):[0-5]\d(\s*(AM|PM|UTC|EST))?\b/i;

export class ContinuityEngine {
  private readonly episodeNumber: number;
  private readonly entitiesById: Record<string, ContinuityEntityDefinition> = {};
  private readonly orderedIds: string[] = [];

  public constructor(
    episodeNumber: number,
    entities: readonly ContinuityEntityDefinition[] = []
  ) {
    this.episodeNumber = episodeNumber;
    for (let i = 0; i < entities.length; i++) {
      this.registerEntity(entities[i]);
    }
  }

  public getEpisodeNumber(): number {
    return this.episodeNumber;
  }

  public registerEntity(entity: ContinuityEntityDefinition): this {
    const validated = ContinuityEntityDefinitionSchema.parse(entity);
    if (!this.entitiesById[validated.entityId]) {
      this.orderedIds.push(validated.entityId);
    }
    this.entitiesById[validated.entityId] = validated;
    return this;
  }

  public getEntityIds(): readonly string[] {
    return this.orderedIds.slice();
  }

  public getEntityDefinition(
    entityId: string
  ): ContinuityEntityDefinition | undefined {
    return this.entitiesById[entityId];
  }

  /**
   * Evaluates an entity's exact visual, numerical, color, bay-stamp, and stroke
   * state at any normalized timeline fraction `timelineFrac` in `[0, 1]`.
   */
  public evaluateAtFrac(
    entityId: string,
    timelineFrac: number,
    transitionWindowFrac = 0.018
  ): EvaluatedContinuityState {
    const entity = this.entitiesById[entityId];
    if (!entity) {
      throw new Error(
        `ContinuityEngine: unknown entityId "${entityId}" in Episode ${this.episodeNumber}`
      );
    }

    const clampedFrac = clamp01(timelineFrac);
    const safeWindow = Math.max(0.001, transitionWindowFrac);
    const keyframes = entity.keyframes;

    let activeIndex = 0;
    const isPlanted = clampedFrac >= keyframes[0].triggerFrac;

    for (let i = 0; i < keyframes.length; i++) {
      if (clampedFrac >= keyframes[i].triggerFrac) {
        activeIndex = i;
      } else {
        break;
      }
    }

    const activeStage = keyframes[activeIndex];
    const previousStage = activeIndex > 0 ? keyframes[activeIndex - 1] : null;

    let transitionProgress = 1;
    if (!isPlanted) {
      transitionProgress = 0;
    } else if (previousStage !== null) {
      const elapsed = clampedFrac - activeStage.triggerFrac;
      transitionProgress = clamp01(elapsed / safeWindow);
    } else {
      const elapsedFromPlant = clampedFrac - activeStage.triggerFrac;
      transitionProgress = clamp01(elapsedFromPlant / safeWindow);
    }

    const resolvedColors: ContinuityColorTokens =
      previousStage !== null && transitionProgress < 1
        ? {
            surfaceHex: interpolateContinuityHex(
              previousStage.colors.surfaceHex,
              activeStage.colors.surfaceHex,
              transitionProgress
            ),
            inkHex: interpolateContinuityHex(
              previousStage.colors.inkHex,
              activeStage.colors.inkHex,
              transitionProgress
            ),
            accentHex: interpolateContinuityHex(
              previousStage.colors.accentHex,
              activeStage.colors.accentHex,
              transitionProgress
            ),
            warningHex: interpolateContinuityHex(
              previousStage.colors.warningHex,
              activeStage.colors.warningHex,
              transitionProgress
            ),
            registerId: activeStage.colors.registerId,
            lutHint: activeStage.colors.lutHint,
          }
        : activeStage.colors;

    const interpolatedMetrics =
      previousStage !== null && transitionProgress < 1
        ? interpolateMetricMaps(
            previousStage.numericMetrics,
            activeStage.numericMetrics,
            transitionProgress
          )
        : { ...activeStage.numericMetrics };

    const resolvedBays = resolveMonotonicBays(
      keyframes,
      activeIndex,
      entity.enforceMonotonicStamps
    );

    const tokenSet = new Set<string>();
    if (isPlanted) {
      for (let s = 0; s <= activeIndex; s++) {
        const tokens = keyframes[s].callbackTokens;
        for (let t = 0; t < tokens.length; t++) {
          tokenSet.add(tokens[t]);
        }
      }
    }
    const accumulatedCallbackTokens: string[] = [];
    tokenSet.forEach((tok) => accumulatedCallbackTokens.push(tok));

    let activeStroke: {
      readonly trajectory: VectorStrokeTrajectory;
      readonly drawProgress: number;
    } | null = null;

    if (isPlanted && activeStage.activeStrokeTrajectoryId) {
      const traj =
        entity.sharedTrajectories[activeStage.activeStrokeTrajectoryId];
      if (traj) {
        const drawProgress = dampedSmoothstep(
          (clampedFrac - activeStage.triggerFrac) / safeWindow
        );
        activeStroke = {
          trajectory: traj,
          drawProgress,
        };
      }
    }

    return {
      entityId: entity.entityId,
      name: entity.name,
      kind: entity.kind,
      geometryLock: entity.geometryLock,
      isPlanted,
      activeStageIndex: activeIndex,
      activeStage,
      previousStage,
      transitionProgress: dampedSmoothstep(transitionProgress),
      dockZone: isPlanted ? activeStage.dockZone : "none",
      isPinnedOverlay: isPlanted && activeStage.dockZone !== "none",
      resolvedColors,
      interpolatedMetrics,
      displayFields: activeStage.displayFields,
      resolvedBays,
      activeStroke,
      accumulatedCallbackTokens,
    };
  }

  /**
   * Frame-exact evaluator for Remotion `useCurrentFrame()` (zero `NaN`/`Infinity` even if `totalFrames <= 0`).
   */
  public evaluateAtFrame(
    entityId: string,
    frame: number,
    totalFrames: number,
    transitionFrames = 24
  ): EvaluatedContinuityState {
    const safeTotal = Math.max(1, totalFrames);
    const safeFrame = Math.max(0, Math.min(safeTotal, frame));
    const frac = clamp01(safeFrame / safeTotal);
    const windowFrac = clamp01(Math.max(1, transitionFrames) / safeTotal);
    return this.evaluateAtFrac(entityId, frac, windowFrac);
  }

  /**
   * Evaluates all registered entities at `timelineFrac`.
   */
  public evaluateAllAtFrac(
    timelineFrac: number
  ): Readonly<Record<string, EvaluatedContinuityState>> {
    const out: Record<string, EvaluatedContinuityState> = {};
    for (let i = 0; i < this.orderedIds.length; i++) {
      const id = this.orderedIds[i];
      out[id] = this.evaluateAtFrac(id, timelineFrac);
    }
    return out;
  }

  /**
   * Returns all planted entities currently docked in persistent corner/header pins
   * (e.g., Claire's `2036 PENDING` corner pin across Acts III–VI, or the miniature
   * 3-bay Escape Hatch header above Claire's Oct 2036 ledger).
   */
  public getActivePinnedEntities(
    timelineFrac: number
  ): readonly EvaluatedContinuityState[] {
    const pinned: EvaluatedContinuityState[] = [];
    for (let i = 0; i < this.orderedIds.length; i++) {
      const state = this.evaluateAtFrac(this.orderedIds[i], timelineFrac);
      if (state.isPinnedOverlay) {
        pinned.push(state);
      }
    }
    return pinned;
  }

  /**
   * Audits the entire continuity graph for monotonic trigger ordering, monotonic
   * bay failure stamps, R44 fake hour-stamp bans, trajectory reuse integrity,
   * and plant-to-payoff closure.
   */
  public auditContinuityGraph(): ContinuityAuditReport {
    const issues: ContinuityAuditIssue[] = [];
    const verifiedCallbackChains: string[] = [];
    let totalKeyframes = 0;

    for (let i = 0; i < this.orderedIds.length; i++) {
      const entity = this.entitiesById[this.orderedIds[i]];
      const stages = entity.keyframes;
      totalKeyframes += stages.length;

      const seenStamps: Record<string, string> = {};
      const plantedTrajectories: Record<string, number> = {};
      let reusedTrajectory = false;

      for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];

        if (s > 0 && stage.triggerFrac < stages[s - 1].triggerFrac) {
          issues.push({
            entityId: entity.entityId,
            code: "NON_MONOTONIC_TRIGGER_FRAC",
            severity: "P0",
            message: `Stage "${stage.stageId}" triggerFrac (${stage.triggerFrac}) precedes "${stages[s - 1].stageId}" (${stages[s - 1].triggerFrac}).`,
          });
        }

        if (FAKE_FUTURE_HOUR_STAMP_REGEX.test(stage.eraLabel)) {
          issues.push({
            entityId: entity.entityId,
            code: "R44_FAKE_CRISIS_HOUR_STAMP",
            severity: "P0",
            message: `Stage "${stage.stageId}" eraLabel "${stage.eraLabel}" invents a near-future HH:MM hour stamp (banned by R44).`,
          });
        }

        if (entity.enforceMonotonicStamps && stage.bays) {
          const presentStampCheck: Record<string, string | null> = {};
          for (let b = 0; b < stage.bays.length; b++) {
            const bay = stage.bays[b];
            presentStampCheck[bay.bayId] = bay.failureStampText;
            if (bay.failureStampText && !seenStamps[bay.bayId]) {
              seenStamps[bay.bayId] = bay.failureStampText;
            }
          }
          const priorBayIds = Object.keys(seenStamps);
          for (let p = 0; p < priorBayIds.length; p++) {
            const bayId = priorBayIds[p];
            const currentStamp = presentStampCheck[bayId];
            if (currentStamp !== seenStamps[bayId]) {
              issues.push({
                entityId: entity.entityId,
                code: "STAMP_CLEARED_OR_MUTATED",
                severity: "P0",
                message: `Stage "${stage.stageId}" cleared or altered prior failure stamp "${seenStamps[bayId]}" on bay "${bayId}".`,
              });
            }
          }
        }

        if (stage.activeStrokeTrajectoryId) {
          const trajId = stage.activeStrokeTrajectoryId;
          if (!entity.sharedTrajectories[trajId]) {
            issues.push({
              entityId: entity.entityId,
              code: "MISSING_TRAJECTORY_REF",
              severity: "P0",
              message: `Stage "${stage.stageId}" references unregistered trajectory "${trajId}".`,
            });
          } else if (plantedTrajectories[trajId] === undefined) {
            if (stage.phase === "payoff" && stages.length > 1) {
              issues.push({
                entityId: entity.entityId,
                code: "UNPLANTED_TRAJECTORY_REUSE",
                severity: "P1",
                message: `Trajectory "${trajId}" used in payoff stage "${stage.stageId}" without an earlier plant/mutate stage.`,
              });
            }
            plantedTrajectories[trajId] = s;
          } else {
            reusedTrajectory = true;
          }
        }
      }

      const hasPlant = stages[0].phase === "plant";
      const hasPayoff = stages[stages.length - 1].phase === "payoff";
      if (!hasPlant || !hasPayoff) {
        issues.push({
          entityId: entity.entityId,
          code: "MISSING_PAYOFF_CLOSURE",
          severity: "P1",
          message: `Entity "${entity.entityId}" should begin with phase="plant" and close with phase="payoff".`,
        });
      } else {
        const suffix = reusedTrajectory ? " (with reusable stroke callback)" : "";
        verifiedCallbackChains.push(
          `${entity.entityId}: ${stages[0].stageId} @ ${stages[0].triggerFrac.toFixed(3)} -> ${stages[stages.length - 1].stageId} @ ${stages[stages.length - 1].triggerFrac.toFixed(3)}${suffix}`
        );
      }
    }

    const hasP0 = issues.some((iss) => iss.severity === "P0");
    return {
      valid: !hasP0 && issues.length === 0,
      entityCount: this.orderedIds.length,
      totalKeyframes,
      verifiedCallbackChains,
      issues,
    };
  }
}

// ============================================================================
// Episode 01 Built-In Stateful Continuity Graph ("The Allowance: AI vs $40.5T Debt")
// ============================================================================

export const EPISODE_01_ENTITY_IDS = [
  "ENT_CLAIRE_AUSTIN",
  "ENT_ESCAPE_HATCH_BOARD",
  "ENT_SOVEREIGN_DEBT_WALL",
  "ENT_PAYCHECK_TO_ALLOWANCE",
] as const;

export type Episode01EntityId = (typeof EPISODE_01_ENTITY_IDS)[number];

/**
 * Exact fountain-pen nib stroke trajectory planted in `P31` (June 2016 Alaska Gov. Bill Walker
 * cutting the Permanent Fund Dividend `$2,052 -> $1,022` in one signature) and replayed
 * verbatim in `P56–P57` (`"Cutting it in half takes one signature"` -> `PAYCHECK -> ALLOWANCE`).
 */
export const GOV_WALKER_FOUNTAIN_PEN_SLASH_V1: VectorStrokeTrajectory = {
  trajectoryId: "GOV_WALKER_FOUNTAIN_PEN_SLASH_V1",
  viewBox: [1120, 320],
  svgPathD: "M 148 214 C 362 188, 684 146, 972 108",
  controlPoints: [
    [148, 214],
    [362, 188],
    [684, 146],
    [972, 108],
  ],
  angleDeg: -7.25,
  nibWidthPx: 5.5,
  strokeDurationFrames: 16,
  inkHex: "#9E2A2B",
  description:
    "Executive fountain-pen veto slash (-7.25 deg wrist arc) slicing Alaska PFD in P31 and striking PAYCHECK into ALLOWANCE in P56-P57.",
};

/**
 * ENTITY-01 (`ENT_CLAIRE_AUSTIN`): Longitudinal Austin Household Dossier (`ARCH-06`).
 * Evolves: Late 2025 $3,400 fixed lock -> 2030 -70% pay cut & refi denial -> P15 corner pin ->
 * P18 $45k locked 401(k) -> P33 subordinated below $2.1T bond spillway -> Oct 2036 house kept
 * via inflation while 60%-margin server farms outbid her Austin August A/C.
 */
export const ENT_CLAIRE_AUSTIN_DEFINITION: ContinuityEntityDefinition =
  defineContinuityEntity({
    entityId: "ENT_CLAIRE_AUSTIN",
    episodeNumber: 1,
    name: "Claire's Austin Household Balance Sheet",
    kind: "household-dossier",
    geometryLock: {
      geometryLockId: "austin-bungalow-elevation-t-account-v1",
      aspectRatio: "16:9",
      architecturalSeed: 202503400,
      preservedAnchors: [
        "austin-limestone-gable-roofline",
        "three-pane-front-window-grid",
        "exterior-split-ac-condenser-unit",
        "smart-kwh-meter-dial",
        "right-pane-household-t-account",
      ],
      layoutColumns: ["left-elevation-48pct", "right-t-account-52pct"],
      invariantRule:
        "Identical architectural house vector, window grid, exterior HVAC condenser, and right-hand T-account column layout across P11, P14, P15, P18, P33, and P53.",
    },
    enforceMonotonicStamps: true,
  })
    .addStage({
      stageId: "plant-late-2025",
      phase: "plant",
      triggerFrac: 0.151,
      paragraphRef: "P11",
      sequenceRef: "SEQ-09",
      eraLabel: "Late 2025",
      headlineStatus: "30-YR FIXED MORTGAGE LOCKED ($3,400/MO THRU 2055)",
      dockZone: "none",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#C9A875",
        warningHex: "#A3402E",
        registerId: "milk-page-editorial",
        lutHint: "editorial-warm",
      },
      numericMetrics: {
        ageYears: 32,
        w2PayIndexPct: 100,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 30,
        groceryAnnualCpiPct: 2.0,
        k401BalanceUsd: 45000,
        austinAugElectricMultiplier: 1.0,
      },
      displayFields: {
        resident: "Claire (Senior SWE, Austin TX)",
        era: "Late 2025",
        payStatus: "100% Senior SWE W-2",
        mortgageLock: "$3,400/mo fixed thru 2055",
        refiGate: "GOOD STANDING",
        k401Drawer: "$45,000 Retirement Account",
        acCondenserState: "72F Normal Summer Load",
      },
      callbackTokens: ["austin-2025-plant", "mortgage-3400-fixed"],
      notes: "Warm limestone dusk elevation as Claire locks her 30-year Austin mortgage.",
    })
    .addStage({
      stageId: "squeeze-2030-refi-denied",
      phase: "mutate",
      triggerFrac: 0.159,
      paragraphRef: "P11-P14",
      sequenceRef: "SEQ-09..SEQ-12",
      eraLabel: "2030",
      headlineStatus: "-70% PAY CUT | +2% FIAT GROCERIES | REFI DENIED",
      dockZone: "none",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#EEF2F6",
        inkHex: "#1C2B3A",
        accentHex: "#526375",
        warningHex: "#8A2C1D",
        registerId: "milk-page-editorial",
        lutHint: "cold-2030-deflation",
      },
      numericMetrics: {
        ageYears: 37,
        w2PayIndexPct: 30,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 25,
        groceryAnnualCpiPct: 2.0,
        k401BalanceUsd: 45000,
        austinAugElectricMultiplier: 1.25,
      },
      displayFields: {
        resident: "Claire (Team Cut by Coding Agents)",
        era: "2030",
        payStatus: "30% (-70% Pay Cut)",
        mortgageLock: "$3,400/mo UNCHANGED (Thru 2055)",
        refiGate: "REJECTED — INSUFFICIENT W-2 COVERAGE",
        k401Drawer: "$45,000 Retirement Account",
        acCondenserState: "Sheriff Lockout Warning Active",
      },
      callbackTokens: ["coding-agent-70pct-cut", "fiat-2pct-squeeze", "refi-denied"],
      notes: "Color grade cools 1500K; nominal $3,400 bar stays cast-iron rigid while W-2 inflow drops 70%.",
    })
    .addStage({
      stageId: "pin-dormant-2036-loop",
      phase: "pin",
      triggerFrac: 0.225,
      paragraphRef: "P15",
      sequenceRef: "SEQ-12",
      eraLabel: "2030 -> 2036 Loop",
      headlineStatus: "2036 PENDING — PINNED DOSSIER",
      dockZone: "top-right-pin",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#152231",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#E27358",
        registerId: "smoked-navy-glass",
        lutHint: "documentary-slate",
      },
      numericMetrics: {
        ageYears: 37,
        w2PayIndexPct: 30,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 25,
        groceryAnnualCpiPct: 2.0,
        k401BalanceUsd: 45000,
        austinAugElectricMultiplier: 1.25,
      },
      displayFields: {
        resident: "Claire — Austin Dossier Pin",
        era: "2036 Open Loop",
        payStatus: "30% (-70% Pay Cut)",
        mortgageLock: "$3,400/mo Pending 2036 Resolution",
        refiGate: "REJECTED",
        k401Drawer: "$45,000",
        acCondenserState: "Pinned Top-Right Safe Zone",
      },
      callbackTokens: ["claire-2036-open-loop-pin"],
      notes: "Dossier shrinks cleanly into top-right presenter-safe corner pin for open-loop retention.",
    })
    .addStage({
      stageId: "audit-401k-padlock",
      phase: "audit",
      triggerFrac: 0.274,
      paragraphRef: "P18",
      sequenceRef: "SEQ-15",
      eraLabel: "2030 Wealth Rebuttal",
      headlineStatus: "$45,000 401(K) LOCKED — 10% PENALTY / WON'T COVER TUESDAY DRAFT",
      dockZone: "right-third-card",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#3E6A94",
        warningHex: "#A3402E",
        registerId: "milk-page-editorial",
        lutHint: "documentary-slate",
      },
      numericMetrics: {
        ageYears: 37,
        w2PayIndexPct: 30,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 25,
        groceryAnnualCpiPct: 2.0,
        k401BalanceUsd: 45000,
        austinAugElectricMultiplier: 1.25,
      },
      displayFields: {
        resident: "Claire (Bottom-90% Stock Reality)",
        era: "2030 Audit",
        payStatus: "30% (-70% Pay Cut)",
        mortgageLock: "$3,400/mo Auto-Draft Tuesday",
        refiGate: "REJECTED",
        k401Drawer: "LOCKED: $45,000 (Early Tax Penalty)",
        acCondenserState: "Illiquid Retirement Asset",
      },
      callbackTokens: ["45k-401k-padlock", "top-10pct-owns-90pct"],
      notes: "Padlocks Claire's $45k 401(k) drawer alongside the 90/9/1 Fed stock wealth monoliths.",
    })
    .addStage({
      stageId: "audit-spillway-subordination",
      phase: "audit",
      triggerFrac: 0.534,
      paragraphRef: "P33",
      sequenceRef: "SEQ-25",
      eraLabel: "Federal Spillway Stress Test",
      headlineStatus: "CITIZEN DIVIDEND SUBORDINATED BELOW $2.1T BONDHOLDERS",
      dockZone: "top-right-pin",
      archetypeId: "ARCH-08",
      colors: {
        surfaceHex: "#152231",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#E27358",
        registerId: "smoked-navy-glass",
        lutHint: "midnight-desk",
      },
      numericMetrics: {
        ageYears: 39,
        w2PayIndexPct: 30,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 23,
        groceryAnnualCpiPct: 2.5,
        k401BalanceUsd: 45000,
        austinAugElectricMultiplier: 2.4,
      },
      displayFields: {
        resident: "Claire (Tier-3 Spillway Recipient)",
        era: "Debt-Ceiling Priority Waterfall",
        payStatus: "Tier-3 Residual Check",
        mortgageLock: "$3,400/mo Fixed",
        refiGate: "SUBORDINATED TO TIER-1 BONDS ($2.1T)",
        k401Drawer: "LOCKED: $45,000",
        acCondenserState: "Awaiting Monetary Print Valve",
      },
      callbackTokens: ["tier3-subordinated-inflow"],
      notes: "Links Claire's household inflow port below Tier-1 $2.1T sovereign bondholders.",
    })
    .addStage({
      stageId: "payoff-oct-2036-heat-convergence",
      phase: "payoff",
      triggerFrac: 0.902,
      paragraphRef: "P52-P53",
      sequenceRef: "SEQ-38..SEQ-39",
      eraLabel: "Oct 2036",
      headlineStatus:
        "HOUSE KEPT VIA INFLATION — AUSTIN AUG A/C PRICED OUT BY 60%-MARGIN SERVER FARMS",
      dockZone: "none",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#F4EFE6",
        inkHex: "#1C2B3A",
        accentHex: "#C96A1B",
        warningHex: "#8A2C1D",
        registerId: "archival-light-table",
        lutHint: "austin-august-heat",
      },
      numericMetrics: {
        ageYears: 43,
        w2PayIndexPct: 30,
        monthlyMortgageUsd: 3400,
        loanYearsRemaining: 19,
        groceryAnnualCpiPct: 6.8,
        k401BalanceUsd: 62000,
        austinAugElectricMultiplier: 8.33,
      },
      displayFields: {
        resident: "Claire (Age 43, Austin TX)",
        era: "Oct 2036",
        payStatus: "Inflated Nominal Allowance + Shrunk Real Debt",
        mortgageLock: "19 Yrs Left @ $3,400 (REAL BURDEN SHRUNK — HOUSE KEPT)",
        refiGate: "SOLVENT ON NOMINAL DEED",
        k401Drawer: "Digital Goods: Pennies",
        acCondenserState:
          "PRICED OUT: 104F Aug A/C Outbid by 60%-Margin AI Server Farms",
      },
      callbackTokens: [
        "oct-2036-house-kept",
        "austin-aug-ac-rationed",
        "60pct-margin-server-bid",
      ],
      notes:
        "16-minute payoff: identical Austin house elevation returns in summer heat amber as inflation saves her deed while grid scarcity prices out her A/C.",
    })
    .build();

function buildEscapeHatchBays(
  s1: ContinuityBayStatus,
  stamp1: string | null,
  s2: ContinuityBayStatus,
  stamp2: string | null,
  s3: ContinuityBayStatus,
  stamp3: string | null
): readonly ContinuityBoardBay[] {
  return [
    {
      bayId: "hatch-01-check",
      bayNumber: "01",
      title: "FEDERAL DIVIDEND CHECK",
      subtitle: "UHI / American Equity Fund",
      status: s1,
      failureStampText: stamp1,
      stampedAtStageId: stamp1 ? "bay-01-stamped" : null,
      stampedAtFrac: stamp1 ? 0.534 : null,
    },
    {
      bayId: "hatch-02-compute",
      bayNumber: "02",
      title: "UNIVERSAL BASIC COMPUTE",
      subtitle: "Raw GPT-7 Slice / Token Scrip",
      status: s2,
      failureStampText: stamp2,
      stampedAtStageId: stamp2 ? "bay-02-stamped" : null,
      stampedAtFrac: stamp2 ? 0.72 : null,
    },
    {
      bayId: "hatch-03-print",
      bayNumber: "03",
      title: "SOVEREIGN MONEY PRINTING",
      subtitle: "Central-Bank Balance Sheet Expansion",
      status: s3,
      failureStampText: stamp3,
      stampedAtStageId: stamp3 ? "bay-03-stamped" : null,
      stampedAtFrac: stamp3 ? 0.885 : null,
    },
  ];
}

/**
 * ENTITY-02 (`ENT_ESCAPE_HATCH_BOARD`): Persistent 3-Column Investigation Board (`ARCH-04`).
 * Accumulates permanent crimson failure stamps across Bays `01 Check`, `02 Compute`, `03 Print`
 * without ever clearing prior stamps, then docks as a miniature header above Claire's 2036 ledger.
 */
export const ENT_ESCAPE_HATCH_BOARD_DEFINITION: ContinuityEntityDefinition =
  defineContinuityEntity({
    entityId: "ENT_ESCAPE_HATCH_BOARD",
    episodeNumber: 1,
    name: "Three Escape Hatches Master Switchboard",
    kind: "investigation-board",
    geometryLock: {
      geometryLockId: "fisher-three-bay-switchboard-v1",
      aspectRatio: "16:9",
      architecturalSeed: 3010203,
      preservedAnchors: [
        "crossed-out-tax-the-robots-header",
        "bay-01-check-column",
        "bay-02-compute-column",
        "bay-03-print-column",
        "bank-switch-warning-busbar",
      ],
      layoutColumns: ["bay-01-33pct", "bay-02-33pct", "bay-03-33pct"],
      invariantRule:
        "Never clear prior failure stamps; bay order (01 Check, 02 Compute, 03 Print) and switchboard typography remain locked throughout.",
    },
    enforceMonotonicStamps: true,
  })
    .addStage({
      stageId: "init-board-and-fracture",
      phase: "plant",
      triggerFrac: 0.088,
      paragraphRef: "P06-P07",
      sequenceRef: "SEQ-06",
      eraLabel: "Master Roadmap",
      headlineStatus: "ALL THREE ESCAPE HATCHES FRACTURE — BANK SWITCH TRANSFERRED",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "documentary-slate",
      },
      numericMetrics: { failedBayCount: 0, activeBayIndex: 0 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "BANK SWITCH TRANSFERRED",
      },
      bays: buildEscapeHatchBays(
        "locked",
        null,
        "locked",
        null,
        "locked",
        null
      ),
      callbackTokens: ["three-hatches-fracture", "all-three-break"],
      notes: "Crosses out 'Tax the Robots', mounts all 3 bays, and fractures across all three on P07.",
    })
    .addStage({
      stageId: "bay-01-active",
      phase: "mutate",
      triggerFrac: 0.404,
      paragraphRef: "P24",
      sequenceRef: "SEQ-20",
      eraLabel: "Act IV — Hatch 01",
      headlineStatus: "TESTING BAY 01: FEDERAL DIVIDEND CHECK",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "documentary-slate",
      },
      numericMetrics: { failedBayCount: 0, activeBayIndex: 1 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "BAY 01 ENERGIZED: UHI & ALASKA PFD TEST",
      },
      bays: buildEscapeHatchBays(
        "active",
        null,
        "locked",
        null,
        "locked",
        null
      ),
      callbackTokens: ["bay-01-unlocked"],
      notes: "Unlocks Bay 01 while Bays 02 and 03 remain sealed.",
    })
    .addStage({
      stageId: "bay-01-stamped",
      phase: "mutate",
      triggerFrac: 0.534,
      paragraphRef: "P33",
      sequenceRef: "SEQ-25",
      eraLabel: "Act IV Verdict",
      headlineStatus: "BAY 01 STAMPED: VETOABLE BUDGET LINE",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "documentary-slate",
      },
      numericMetrics: { failedBayCount: 1, activeBayIndex: 1 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "1 OF 3 BROKEN: VETOABLE ANNUAL APPROPRIATION",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "locked",
        null,
        "locked",
        null
      ),
      callbackTokens: ["stamp-01-vetoable-budget-line"],
      notes: "Permanently locks red failure stamp onto Bay 01.",
    })
    .addStage({
      stageId: "bay-02-active",
      phase: "mutate",
      triggerFrac: 0.561,
      paragraphRef: "P34",
      sequenceRef: "SEQ-26",
      eraLabel: "Act V — Hatch 02",
      headlineStatus: "TESTING BAY 02: UNIVERSAL BASIC COMPUTE (BAY 01 REMAINS STAMPED)",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "midnight-desk",
      },
      numericMetrics: { failedBayCount: 1, activeBayIndex: 2 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "BAY 02 ENERGIZED: GPT-7 COMPUTE QUOTA",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "active",
        null,
        "locked",
        null
      ),
      callbackTokens: ["bay-02-unlocked"],
      notes: "Bay 01 retains VETOABLE BUDGET LINE stamp as Bay 02 illuminates.",
    })
    .addStage({
      stageId: "bay-02-stamped",
      phase: "mutate",
      triggerFrac: 0.72,
      paragraphRef: "P43",
      sequenceRef: "SEQ-31",
      eraLabel: "Act V Verdict",
      headlineStatus: "BAY 02 STAMPED: DEPRECIATING COMPANY SCRIP",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "midnight-desk",
      },
      numericMetrics: { failedBayCount: 2, activeBayIndex: 2 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "2 OF 3 BROKEN: -99% PERISHABLE SCRIP",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "stamped-failed",
        "DEPRECIATING COMPANY SCRIP",
        "locked",
        null
      ),
      callbackTokens: ["stamp-02-company-scrip"],
      notes: "Bays 01 and 02 both carry permanent red failure stamps.",
    })
    .addStage({
      stageId: "bay-03-active",
      phase: "mutate",
      triggerFrac: 0.735,
      paragraphRef: "P44",
      sequenceRef: "SEQ-32",
      eraLabel: "Act VI — Hatch 03",
      headlineStatus: "TESTING BAY 03: SOVEREIGN MONEY PRINTING",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "blueprint-cyanotype",
      },
      numericMetrics: { failedBayCount: 2, activeBayIndex: 3 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "FINAL HATCH ENERGIZED: CENTRAL-BANK PRINTING VS GRID",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "stamped-failed",
        "DEPRECIATING COMPANY SCRIP",
        "active",
        null
      ),
      callbackTokens: ["bay-03-unlocked"],
      notes: "Final hatch opens with Bays 01 and 02 visibly broken beside it.",
    })
    .addStage({
      stageId: "bay-03-stamped",
      phase: "mutate",
      triggerFrac: 0.885,
      paragraphRef: "P51",
      sequenceRef: "SEQ-37",
      eraLabel: "Act VI Verdict",
      headlineStatus: "BAY 03 STAMPED: PHYSICAL KILOWATT BOTTLENECK",
      dockZone: "none",
      archetypeId: "ARCH-04",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "silver-gelatin-1941",
      },
      numericMetrics: { failedBayCount: 3, activeBayIndex: 3 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "ALL 3 STAMPED: +833% PJM GRID RATIONING",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "stamped-failed",
        "DEPRECIATING COMPANY SCRIP",
        "stamped-failed",
        "PHYSICAL KILOWATT BOTTLENECK"
      ),
      callbackTokens: ["stamp-03-kilowatt-bottleneck"],
      notes: "All three bays carry cumulative red mechanical failure stamps.",
    })
    .addStage({
      stageId: "converge-header-dock-2036",
      phase: "payoff",
      triggerFrac: 0.905,
      paragraphRef: "P53",
      sequenceRef: "SEQ-39",
      eraLabel: "Oct 2036 Convergence",
      headlineStatus:
        "BAY 03 (PRINT) SURVIVES AS DEFAULT POLICY — INFLATES AWAY MORTGAGE, RATIONS A/C",
      dockZone: "header-mini-bar",
      archetypeId: "ARCH-06",
      colors: {
        surfaceHex: "#181D24",
        inkHex: "#FAF8F3",
        accentHex: "#C96A1B",
        warningHex: "#A3402E",
        registerId: "investigation-switchboard",
        lutHint: "austin-august-heat",
      },
      numericMetrics: { failedBayCount: 3, activeBayIndex: 3 },
      displayFields: {
        crossedOutInstinct: "Tax the Robots -> Mail Checks",
        busbarWarning: "DOCKED ABOVE CLAIRE 2036 LEDGER — BAY 03 ACTIVE SURVIVOR",
      },
      bays: buildEscapeHatchBays(
        "stamped-failed",
        "VETOABLE BUDGET LINE",
        "stamped-failed",
        "DEPRECIATING COMPANY SCRIP",
        "stamped-survivor",
        "PHYSICAL KILOWATT BOTTLENECK"
      ),
      callbackTokens: ["board-header-dock-convergence"],
      notes:
        "Miniaturized 3-bay header docks directly above Claire's Oct 2036 ledger, preserving all 3 stamps while highlighting Bay 03 as the surviving mechanism.",
    })
    .build();

/**
 * ENTITY-03 (`ENT_SOVEREIGN_DEBT_WALL`): Sovereign Debt & CBO $2.1T Interest Wall (`ARCH-01` / `ARCH-08`).
 * Preserves identical `cbo-2036-2p1t-masonry-v1` block geometry across P04, P33, and P50,
 * then pulses into Episode 02's global buyer bridge in P58.
 */
export const ENT_SOVEREIGN_DEBT_WALL_DEFINITION: ContinuityEntityDefinition =
  defineContinuityEntity({
    entityId: "ENT_SOVEREIGN_DEBT_WALL",
    episodeNumber: 1,
    name: "Sovereign $40.5T Debt & CBO $2.1T Interest Wall",
    kind: "sovereign-ledger",
    geometryLock: {
      geometryLockId: "cbo-2036-2p1t-masonry-v1",
      aspectRatio: "16:9",
      architecturalSeed: 40502100,
      preservedAnchors: [
        "w2-86pct-inflow-conduit",
        "cbo-2036-2p1t-stacked-masonry-wall",
        "table-9-receipts-to-outlays-platen",
        "sovereign-40p5t-monolith",
      ],
      layoutColumns: ["left-receipt-pipe-40pct", "right-debt-masonry-60pct"],
      invariantRule:
        "Keep $2.1T/yr (2036) rendered with the exact same stacked masonry/ledger block geometry across P04, P33, and P50.",
    },
    enforceMonotonicStamps: false,
  })
    .addStage({
      stageId: "plant-debt-and-cbo-wall",
      phase: "plant",
      triggerFrac: 0.0,
      paragraphRef: "P01-P04",
      sequenceRef: "SEQ-01..SEQ-04",
      eraLabel: "FY 2026 -> 2036 CBO Baseline",
      headlineStatus: ">86% LABOR TAX SHARE VS $40.5T DEBT & $2.1T/YR INTEREST WALL",
      dockZone: "none",
      archetypeId: "ARCH-01",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#1B5E3A",
        warningHex: "#A3402E",
        registerId: "archival-light-table",
        lutHint: "archival-parchment",
      },
      numericMetrics: {
        laborTaxSharePct: 86.0,
        corporateTaxSharePct: 10.8,
        nationalDebtTrillions: 40.5,
        householdDebtTrillions: 19.1,
        cbo2036InterestTrillions: 2.1,
      },
      displayFields: {
        primaryReceiptSource: ">86% Individual & Payroll Withholding",
        debtHorizon2036: "$40.5 Trillion National Debt",
        cboNetInterest2036: "$2.1 Trillion / Yr Brick Wall",
        bondholderExpectation: "PAID ON TIME IN US DOLLARS",
      },
      callbackTokens: ["86pct-labor-tax", "40p5t-debt", "cbo-2p1t-brick-wall"],
      notes: "Plants the 86% paycheck tax dependency and CBO $2.1T/yr 2036 interest wall.",
    })
    .addStage({
      stageId: "audit-treasury-table-9",
      phase: "audit",
      triggerFrac: 0.309,
      paragraphRef: "P20-P23",
      sequenceRef: "SEQ-16..SEQ-19",
      eraLabel: "FY 2024 -> FY 2026 Table 9",
      headlineStatus:
        "CORP TAX SHARE DROPS 10.8% -> 7.1% | FY26 NET INTEREST > $1.0T (> DEFENSE)",
      dockZone: "none",
      archetypeId: "ARCH-01",
      colors: {
        surfaceHex: "#F4EFE6",
        inkHex: "#1C2B3A",
        accentHex: "#9A6B16",
        warningHex: "#8A2C1D",
        registerId: "archival-light-table",
        lutHint: "archival-parchment",
      },
      numericMetrics: {
        laborTaxSharePct: 86.2,
        corporateTaxSharePct: 7.1,
        nationalDebtTrillions: 40.5,
        householdDebtTrillions: 19.1,
        cbo2036InterestTrillions: 2.1,
      },
      displayFields: {
        primaryReceiptSource: "84.1% (FY24) -> >86% (FY26) Labor Share",
        debtHorizon2036: "July 2025 100% Capex Write-Off + Ireland IP + Margin Loans",
        cboNetInterest2036: "FY26 Net Interest > $1.0T (Overtakes US Defense)",
        bondholderExpectation: "Table 9 Outlay Row Verified",
      },
      callbackTokens: ["table-9-7p1pct-corp", "interest-beats-defense-1t"],
      notes: "Vertical camera rack down physical Monthly Treasury Statement Table 9.",
    })
    .addStage({
      stageId: "tier-1-spillway-priority",
      phase: "mutate",
      triggerFrac: 0.534,
      paragraphRef: "P33",
      sequenceRef: "SEQ-25",
      eraLabel: "Sovereign Payment Waterfall",
      headlineStatus: "TIER 1: $2.1T BONDHOLDERS PAID FIRST — DIVIDEND BASIN DRY",
      dockZone: "none",
      archetypeId: "ARCH-08",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#9A6B16",
        warningHex: "#A3402E",
        registerId: "blueprint-schematic",
        lutHint: "documentary-slate",
      },
      numericMetrics: {
        laborTaxSharePct: 86.2,
        corporateTaxSharePct: 7.1,
        nationalDebtTrillions: 40.5,
        householdDebtTrillions: 19.1,
        cbo2036InterestTrillions: 2.1,
      },
      displayFields: {
        primaryReceiptSource: "Eroding W-2 Payroll Stream",
        debtHorizon2036: "Tier 1: $2.1T Bondholders (Systemic Default Lock)",
        cboNetInterest2036: "Tier 2: Defense / Social Security | Tier 3: Citizen Check",
        bondholderExpectation: "FIRST IN LINE BEFORE HOUSEHOLD DIVIDEND",
      },
      callbackTokens: ["spillway-tier1-2p1t-bonds"],
      notes: "Reuses identical CBO $2.1T masonry geometry as the Tier-1 spillway dam.",
    })
    .addStage({
      stageId: "triple-monetization-into-ep02-bridge",
      phase: "payoff",
      triggerFrac: 0.845,
      paragraphRef: "P50 & P58",
      sequenceRef: "SEQ-36..SEQ-42",
      eraLabel: "2036 Monetization & Global Bridge",
      headlineStatus:
        "FED PRINTS PAYROLL GAP + $2.1T INTEREST + CHECKS -> VIDEO 02 GLOBAL BUYER HOOK",
      dockZone: "bottom-dock-pill",
      archetypeId: "ARCH-08",
      colors: {
        surfaceHex: "#0F1923",
        inkHex: "#FAF8F3",
        accentHex: "#4FB3AE",
        warningHex: "#E27358",
        registerId: "geospatial-telemetry",
        lutHint: "verdict-high-contrast",
      },
      numericMetrics: {
        laborTaxSharePct: 60.0,
        corporateTaxSharePct: 7.1,
        nationalDebtTrillions: 40.5,
        householdDebtTrillions: 19.1,
        cbo2036InterestTrillions: 2.1,
      },
      displayFields: {
        primaryReceiptSource: "3-Way Central-Bank Liquidity Split",
        debtHorizon2036: "$40.5T US Debt Node Pulsing to Tokyo & Stablecoin Buyers",
        cboNetInterest2036: "$2.1T/yr Interest Floods Narrow Megawatt Grid Nozzle",
        bondholderExpectation: "Bridge to Episode 02: Who Buys America's $40T Debt Now?",
      },
      callbackTokens: ["triple-printing-choke", "video-02-debt-buyer-bridge"],
      notes: "Closes Episode 01's sovereign arc while planting Episode 02's TIC/Tether cold open.",
    })
    .build();

/**
 * ENTITY-04 (`ENT_PAYCHECK_TO_ALLOWANCE`): 200-Year Friday Paycheck Contract -> Allowance (`ARCH-09` / `ARCH-13`).
 * Reuses Gov. Walker's exact fountain-pen veto stroke (`GOV_WALKER_FOUNTAIN_PEN_SLASH_V1`)
 * from P31 (`$2,052 -> $1,022`) on the final P56–P57 `PAYCHECK -> ALLOWANCE` strike.
 */
export const ENT_PAYCHECK_TO_ALLOWANCE_DEFINITION: ContinuityEntityDefinition =
  defineContinuityEntity({
    entityId: "ENT_PAYCHECK_TO_ALLOWANCE",
    episodeNumber: 1,
    name: "Friday Paycheck Truce -> Vetoable Allowance",
    kind: "contract-metaphor",
    geometryLock: {
      geometryLockId: "friday-contract-badge-and-walker-slash-v1",
      aspectRatio: "16:9",
      architecturalSeed: 19552034,
      preservedAnchors: [
        "friday-paycheck-contract-plate",
        "bargaining-power-fulcrum-meter",
        "walker-fountain-pen-nib-angle",
        "paycheck-to-allowance-serif-slot",
      ],
      layoutColumns: ["center-contract-plate-100pct"],
      invariantRule:
        "Reuse the exact GOV_WALKER_FOUNTAIN_PEN_SLASH_V1 nib stroke trajectory from P31 (Alaska veto) in P56-P57 ('Cutting it in half takes one signature' -> ALLOWANCE).",
    },
    enforceMonotonicStamps: false,
  })
    .withTrajectory(GOV_WALKER_FOUNTAIN_PEN_SLASH_V1)
    .addStage({
      stageId: "plant-friday-paycheck-switch",
      phase: "plant",
      triggerFrac: 0.03,
      paragraphRef: "P03 & P07",
      sequenceRef: "SEQ-03..SEQ-06",
      eraLabel: "200-Year Industrial Baseline",
      headlineStatus: "FRIDAY PAYCHECK CLEARS — WHO HOLDS THE BANK ACCOUNT SWITCH?",
      dockZone: "none",
      archetypeId: "ARCH-08",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#3E6A94",
        warningHex: "#A3402E",
        registerId: "milk-page-editorial",
        lutHint: "editorial-warm",
      },
      numericMetrics: {
        workerShutdownLeveragePct: 100,
        machineAutonomousUptimePct: 0,
        payoutRetentionAfterSignaturePct: 100,
      },
      displayFields: {
        contractTitle: "FRIDAY PAYCHECK",
        leverageBasis: "Saveable Market Wage Earned by Necessary Human Labor",
        switchHolder: "Household Checking Account",
      },
      callbackTokens: ["friday-paycheck-plant", "bank-account-switch"],
      notes: "Plants Friday paycheck auto-draft and the warning about handing away the bank switch.",
    })
    .addStage({
      stageId: "w2-withholding-guillotine",
      phase: "mutate",
      triggerFrac: 0.358,
      paragraphRef: "P22",
      sequenceRef: "SEQ-18",
      eraLabel: "Tax Plumbing Asymmetry",
      headlineStatus: "AUTOMATIC FRIDAY W-2 WITHHOLDING VS CAPITAL BYPASS",
      dockZone: "none",
      archetypeId: "ARCH-08",
      colors: {
        surfaceHex: "#FAF8F3",
        inkHex: "#1C2B3A",
        accentHex: "#2F8F8B",
        warningHex: "#A3402E",
        registerId: "blueprint-schematic",
        lutHint: "documentary-slate",
      },
      numericMetrics: {
        workerShutdownLeveragePct: 80,
        machineAutonomousUptimePct: 35,
        payoutRetentionAfterSignaturePct: 74,
      },
      displayFields: {
        contractTitle: "W-2 PAYCHECK PIPE",
        leverageBasis: "Top-Line Withholding Guillotine Before Checking",
        switchHolder: "Statutory Payroll Withholding",
      },
      callbackTokens: ["w2-withholding-slice"],
      notes: "Shows W-2 wages sliced automatically before hitting checking.",
    })
    .addStage({
      stageId: "bargaining-power-flip-1955-vs-2034",
      phase: "mutate",
      triggerFrac: 0.45,
      paragraphRef: "P27-P29",
      sequenceRef: "SEQ-21..SEQ-22",
      eraLabel: "1955 Strike vs 2034 Autonomous Port",
      headlineStatus:
        "EVERY MACHINE KEEPS RUNNING (99.9% UPTIME) — MARKET WAGE -> POLITICAL BUDGET LINE",
      dockZone: "none",
      archetypeId: "ARCH-09",
      colors: {
        surfaceHex: "#14181F",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#E27358",
        registerId: "silver-gelatin-chronicle",
        lutHint: "silver-gelatin-1941",
      },
      numericMetrics: {
        workerShutdownLeveragePct: 0,
        machineAutonomousUptimePct: 99.9,
        payoutRetentionAfterSignaturePct: 100,
      },
      displayFields: {
        contractTitle: "POLITICAL BUDGET LINE ITEM",
        leverageBasis: "1955 48h Walkout Shutdown -> 2034 99.9% Autonomous Uptime",
        switchHolder: "Annual Legislative Appropriation",
      },
      callbackTokens: ["every-machine-keeps-running", "market-wage-to-budget-line"],
      notes: "1955 Rotterdam/Detroit strike power collapses against 2034 robotic port cranes.",
    })
    .addStage({
      stageId: "walker-veto-slash-plant",
      phase: "mutate",
      triggerFrac: 0.495,
      paragraphRef: "P31-P32",
      sequenceRef: "SEQ-23..SEQ-24",
      eraLabel: "June 2016 Juneau Veto & 2017 Wielechowski",
      headlineStatus:
        "GOV. WALKER VETO PEN CUTS ALASKA PFD $2,052 -> $1,022 (-50% IN ONE SIGNATURE)",
      dockZone: "none",
      archetypeId: "ARCH-09",
      colors: {
        surfaceHex: "#F4EFE6",
        inkHex: "#1C2B3A",
        accentHex: "#526375",
        warningHex: "#9E2A2B",
        registerId: "archival-light-table",
        lutHint: "archival-parchment",
      },
      numericMetrics: {
        workerShutdownLeveragePct: 0,
        machineAutonomousUptimePct: 99.9,
        payoutRetentionAfterSignaturePct: 49.8,
      },
      displayFields: {
        contractTitle: "ALASKA PFD: $2,052 -> $1,022 ($1,000 IN 2025)",
        leverageBasis: "Wielechowski v. State: Regular Annual Budget Line",
        switchHolder: "One Executive Signature",
      },
      callbackTokens: ["walker-veto-pen-slash", "they-got-1000"],
      activeStrokeTrajectoryId: "GOV_WALKER_FOUNTAIN_PEN_SLASH_V1",
      notes: "Plants the exact -7.25 deg fountain-pen veto stroke slicing the dividend bar in half.",
    })
    .addStage({
      stageId: "verdict-one-signature-allowance-slam",
      phase: "payoff",
      triggerFrac: 0.96,
      paragraphRef: "P55-P57",
      sequenceRef: "SEQ-40..SEQ-41",
      eraLabel: "200-Year Truce Broken",
      headlineStatus:
        "CUTTING IT IN HALF TAKES ONE SIGNATURE — PAYCHECK STRIKES INTO ALLOWANCE",
      dockZone: "none",
      archetypeId: "ARCH-13",
      colors: {
        surfaceHex: "#14161A",
        inkHex: "#FAF8F3",
        accentHex: "#A9C4DE",
        warningHex: "#9E2A2B",
        registerId: "restraint-vellum",
        lutHint: "verdict-high-contrast",
      },
      numericMetrics: {
        workerShutdownLeveragePct: 0,
        machineAutonomousUptimePct: 99.9,
        payoutRetentionAfterSignaturePct: 50.0,
      },
      displayFields: {
        contractTitle: "ALLOWANCE",
        leverageBasis: "Cranes, Codebases & Trucks Keep Running Without You",
        switchHolder: "Whoever Signs the Transfer — 'We Call That an Allowance.'",
      },
      callbackTokens: [
        "200-year-truce-bookend",
        "one-signature-callback",
        "we-call-that-an-allowance",
      ],
      activeStrokeTrajectoryId: "GOV_WALKER_FOUNTAIN_PEN_SLASH_V1",
      notes:
        "Replays GOV_WALKER_FOUNTAIN_PEN_SLASH_V1 across the phone balance and strikes PAYCHECK into ALLOWANCE after 0.8s silence.",
    })
    .build();

/**
 * Canonical array of all 4 stateful multi-act entities for Episode 01.
 */
export const EPISODE_01_CONTINUITY_ENTITIES: readonly ContinuityEntityDefinition[] =
  [
    ENT_CLAIRE_AUSTIN_DEFINITION,
    ENT_ESCAPE_HATCH_BOARD_DEFINITION,
    ENT_SOVEREIGN_DEBT_WALL_DEFINITION,
    ENT_PAYCHECK_TO_ALLOWANCE_DEFINITION,
  ];

/**
 * Instantiates a ready-to-query `ContinuityEngine` pre-loaded with Episode 01's 4 entities.
 */
export function createEpisode01ContinuityEngine(): ContinuityEngine {
  return new ContinuityEngine(1, EPISODE_01_CONTINUITY_ENTITIES);
}
