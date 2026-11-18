import { z } from "zod";

/**
 * Pillar #15 — Zero-CSS / Zero-Coordinate Semantic Storyboard IR (`storyboardIR.ts`)
 *
 * Strips every pixel coordinate, hex literal, CSS style, frame offset, and spring
 * differential constant from the LLM's output vocabulary. Supports all 18 core
 * documentary archetypes plus declarative `CUSTOM_CONTRAPTION_BLUEPRINT` and
 * `DEPTH_SANDWICH_STAGE` set-piece payloads.
 */

// ============================================================================
// Core Semantic Enums & Archetype Families
// ============================================================================

export const ARCHETYPE_FAMILIES = [
  "MACRO_DATA",
  "PRIMARY_ARTIFACT",
  "SYSTEM_MECHANISM",
  "HUMAN_ANCHOR",
  "RHETORICAL_PUNCH",
  "GENERATIVE_SETPIECE",
] as const;

export type ArchetypeFamily = (typeof ARCHETYPE_FAMILIES)[number];
export const ArchetypeFamilySchema = z.enum(ARCHETYPE_FAMILIES);

export const BEAT_ARCHETYPES = [
  // Family 1: MACRO_DATA
  "DUAL_SERIES_DIVERGENCE",
  "COMPOSITION_STACK",
  "THRESHOLD_CROSSING",
  "MULTIPLIER_SCALE_LADDER",
  "FLOW_SANKEY",
  // Family 2: PRIMARY_ARTIFACT
  "DOCUMENT_LEDGER_HIGHLIGHT",
  "SOCIAL_POST_EXHIBIT",
  "COURT_RULING_EXHIBIT",
  "HEADLINE_DOSSIER",
  // Family 3: SYSTEM_MECHANISM
  "CAUSAL_CHAIN",
  "CLOSED_LOOP_TRAP",
  "SPLIT_COMPARISON",
  "THREE_PILLAR_ROADMAP",
  // Family 4: HUMAN_ANCHOR
  "CHARACTER_BALANCE_SHEET",
  "HISTORICAL_PARALLEL_CARD",
  // Family 5: RHETORICAL_PUNCH
  "KINETIC_THESIS_STRIKE",
  "QUESTION_PIVOT",
  "STAT_MONOLITH",
  // Family 6: GENERATIVE_SETPIECE
  "CUSTOM_CONTRAPTION_BLUEPRINT",
  "DEPTH_SANDWICH_STAGE",
] as const;

export type BeatArchetype = (typeof BEAT_ARCHETYPES)[number];
export const BeatArchetypeEnum = z.enum(BEAT_ARCHETYPES);

export const ARCHETYPE_FAMILY_MAP: Readonly<Record<BeatArchetype, ArchetypeFamily>> = {
  DUAL_SERIES_DIVERGENCE: "MACRO_DATA",
  COMPOSITION_STACK: "MACRO_DATA",
  THRESHOLD_CROSSING: "MACRO_DATA",
  MULTIPLIER_SCALE_LADDER: "MACRO_DATA",
  FLOW_SANKEY: "MACRO_DATA",
  DOCUMENT_LEDGER_HIGHLIGHT: "PRIMARY_ARTIFACT",
  SOCIAL_POST_EXHIBIT: "PRIMARY_ARTIFACT",
  COURT_RULING_EXHIBIT: "PRIMARY_ARTIFACT",
  HEADLINE_DOSSIER: "PRIMARY_ARTIFACT",
  CAUSAL_CHAIN: "SYSTEM_MECHANISM",
  CLOSED_LOOP_TRAP: "SYSTEM_MECHANISM",
  SPLIT_COMPARISON: "SYSTEM_MECHANISM",
  THREE_PILLAR_ROADMAP: "SYSTEM_MECHANISM",
  CHARACTER_BALANCE_SHEET: "HUMAN_ANCHOR",
  HISTORICAL_PARALLEL_CARD: "HUMAN_ANCHOR",
  KINETIC_THESIS_STRIKE: "RHETORICAL_PUNCH",
  QUESTION_PIVOT: "RHETORICAL_PUNCH",
  STAT_MONOLITH: "RHETORICAL_PUNCH",
  CUSTOM_CONTRAPTION_BLUEPRINT: "GENERATIVE_SETPIECE",
  DEPTH_SANDWICH_STAGE: "GENERATIVE_SETPIECE",
};

export const EMOTIONAL_REGISTERS = [
  "CLINICAL_EVIDENCE",
  "TENSION_BUILD",
  "HARD_REVEAL",
  "HUMAN_STAKES",
  "IRONIC_CONTRAST",
  "THESIS_VERDICT",
] as const;

export type EmotionalRegister = (typeof EMOTIONAL_REGISTERS)[number];
export const EmotionalRegisterEnum = z.enum(EMOTIONAL_REGISTERS);

export const STEP_INTENTS = [
  "ESTABLISH_FRAME",
  "REVEAL_BASELINE",
  "STRIKE_ANOMALY",
  "ANNOTATE_CAUSE",
  "MUTATE_ENTITY_STATE",
  "ISOLATE_VERDICT",
] as const;

export type StepIntent = (typeof STEP_INTENTS)[number];
export const StepIntentEnum = z.enum(STEP_INTENTS);

export const PRESENTER_MODES = [
  "FULL_PAGE_CUTAWAY",
  "OVER_FOOTAGE_GLASS",
  "DEPTH_SANDWICH",
  "TALKING_HEAD_BREATHER",
] as const;

export type PresenterMode = (typeof PRESENTER_MODES)[number];
export const PresenterModeEnum = z.enum(PRESENTER_MODES);

export const STRATEGY_PRESET_ENUM_VALUES = [
  "STR-GEN-EXPLAINER",
  "STR-AIC-CLOCKED",
  "STR-AIC-SPECULATIVE",
  "STR-FISHER-ARTIFACT",
  "STR-MAX-ESSAY",
  "STR-AOTP-LADDER",
  "STR-BOYLE-CHAPTERED",
  "STR-HMW-PRIMER",
  "STR-GEN-FIELD",
] as const;

export type IRStrategyPresetId = (typeof STRATEGY_PRESET_ENUM_VALUES)[number];
export const IRStrategyPresetEnum = z.enum(STRATEGY_PRESET_ENUM_VALUES);

export const IR_NARRATIVE_ENGINES = [
  "explainer",
  "clocked",
  "speculative",
  "artifact",
  "essay",
  "ladder",
  "chaptered",
  "primer",
  "field",
  "street",
] as const;

export type IRNarrativeEngine = (typeof IR_NARRATIVE_ENGINES)[number];
export const IRNarrativeEngineEnum = z.enum(IR_NARRATIVE_ENGINES);

// ============================================================================
// Grounded Pointer & Label Primitives
// ============================================================================

export const SentenceRefSchema = z.string().regex(/^S\d{3,4}$/);
export const TokenRefSchema = z.string().regex(/^S\d{3,4}\.T\d{2,3}$/);
export const FactRefSchema = z.string().regex(/^F\d{3,4}$/);
export const EntityRefSchema = z.string().regex(/^ENT_[A-Z0-9_]+$/);
export const BeatRefSchema = z.string().regex(/^B\d{3,4}$/);
export const RegistrySlugSchema = z
  .string()
  .min(2)
  .max(48)
  .regex(/^[A-Za-z0-9_/-]+$/);

/**
 * Semantic micro-labels: <= 4 words, <= 28 characters, zero hex codes, zero raw digits.
 */
export const ShortLabelSchema = z
  .string()
  .min(2)
  .max(28)
  .refine(
    (s) => s.trim().split(/\s+/).length <= 4,
    "Max 4 words per semantic label",
  )
  .refine((s) => !/#[0-9a-f]{3,8}\b/i.test(s), "Hex color literals are forbidden")
  .refine(
    (s) => !/\d/.test(s),
    "Raw digits are forbidden in semantic labels; reference numbers via FactId",
  );

export const SubBeatStepSchema = z
  .object({
    stepId: z.string().regex(/^ST\d{2}$/),
    anchorTokenId: TokenRefSchema,
    intent: StepIntentEnum,
    targetSlotKey: z
      .string()
      .min(2)
      .max(28)
      .regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
    factRef: FactRefSchema.optional(),
  })
  .strict();

export type SubBeatStep = z.infer<typeof SubBeatStepSchema>;

// ============================================================================
// Complete 20-Way Discriminated Archetype Payload Schemas
// ============================================================================

export const DualSeriesDivergencePayloadSchema = z
  .object({
    archetype: z.literal("DUAL_SERIES_DIVERGENCE"),
    chartTitle: ShortLabelSchema,
    upperSeriesLabel: ShortLabelSchema,
    upperFactRef: FactRefSchema,
    lowerSeriesLabel: ShortLabelSchema,
    lowerFactRef: FactRefSchema,
    horizonStartFactRef: FactRefSchema.optional(),
    horizonEndFactRef: FactRefSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const CompositionStackPayloadSchema = z
  .object({
    archetype: z.literal("COMPOSITION_STACK"),
    stackTitle: ShortLabelSchema,
    segments: z
      .array(
        z
          .object({
            segmentKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            label: ShortLabelSchema,
            factRef: FactRefSchema,
            semanticRole: z.enum([
              "solvent",
              "liability",
              "capital",
              "statutory",
            ]),
          })
          .strict(),
      )
      .min(2)
      .max(5),
    totalCompareFactRef: FactRefSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const ThresholdCrossingPayloadSchema = z
  .object({
    archetype: z.literal("THRESHOLD_CROSSING"),
    metricTitle: ShortLabelSchema,
    baselineLabel: ShortLabelSchema,
    baselineFactRef: FactRefSchema,
    crossingLabel: ShortLabelSchema,
    crossingFactRef: FactRefSchema,
    deltaBadgeFactRef: FactRefSchema.optional(),
    geoCorridorRef: RegistrySlugSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const MultiplierScaleLadderPayloadSchema = z
  .object({
    archetype: z.literal("MULTIPLIER_SCALE_LADDER"),
    ladderTitle: ShortLabelSchema,
    rungs: z
      .array(
        z
          .object({
            rungKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            objectLabel: ShortLabelSchema,
            factRef: FactRefSchema,
            propVaultId: RegistrySlugSchema.optional(),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    geoCorridorRef: RegistrySlugSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const FlowSankeyPayloadSchema = z
  .object({
    archetype: z.literal("FLOW_SANKEY"),
    systemTitle: ShortLabelSchema,
    inflowLabel: ShortLabelSchema,
    inflowFactRef: FactRefSchema.optional(),
    branches: z
      .array(
        z
          .object({
            branchKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            routeLabel: ShortLabelSchema,
            flowStatus: z.enum(["WITHHELD", "BYPASSED", "BOTTLENECKED", "SOLVENT"]),
            factRef: FactRefSchema.optional(),
          })
          .strict(),
      )
      .min(2)
      .max(4),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const DocumentLedgerHighlightPayloadSchema = z
  .object({
    archetype: z.literal("DOCUMENT_LEDGER_HIGHLIGHT"),
    documentCiteFactRef: FactRefSchema,
    sectionLabel: ShortLabelSchema,
    highlightedRows: z
      .array(
        z
          .object({
            rowKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            lineLabel: ShortLabelSchema,
            factRef: FactRefSchema,
            calloutIntent: z.enum(["PRIMARY_RECEIPT", "ANOMALY_DROP", "DEBT_WALL"]),
          })
          .strict(),
      )
      .min(1)
      .max(4),
    loupeFocusRowKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(),
  })
  .strict();

export const SocialPostExhibitPayloadSchema = z
  .object({
    archetype: z.literal("SOCIAL_POST_EXHIBIT"),
    speakerLabel: ShortLabelSchema,
    dateFactRef: FactRefSchema.optional(),
    claimSummaryLabel: ShortLabelSchema,
    counterpartyLabel: ShortLabelSchema,
    counterpartyFactRef: FactRefSchema.optional(),
    collisionVerdict: z.enum(["REJECTED_AT_BANK", " CONTRADICTED_BY_LEDGER".trim() as "CONTRADICTED_BY_LEDGER", "CAP_ENFORCED"]),
  })
  .strict();

export const CourtRulingExhibitPayloadSchema = z
  .object({
    archetype: z.literal("COURT_RULING_EXHIBIT"),
    caseCiteFactRef: FactRefSchema,
    courtLabel: ShortLabelSchema,
    yearFactRef: FactRefSchema.optional(),
    holdingLabel: ShortLabelSchema,
    beforeCutFactRef: FactRefSchema.optional(),
    afterCutFactRef: FactRefSchema.optional(),
  })
  .strict();

export const HeadlineDossierPayloadSchema = z
  .object({
    archetype: z.literal("HEADLINE_DOSSIER"),
    outletLabel: ShortLabelSchema,
    subjectLabel: ShortLabelSchema,
    primaryFactRef: FactRefSchema.optional(),
    secondaryFactRef: FactRefSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const CausalChainPayloadSchema = z
  .object({
    archetype: z.literal("CAUSAL_CHAIN"),
    mechanismTitle: ShortLabelSchema,
    nodes: z
      .array(
        z
          .object({
            nodeKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            stageLabel: ShortLabelSchema,
            stateTag: z.enum(["HUMAN_LABOR", "AUTOMATED_SWAP", "PRICE_DROP", "DEBT_COLLISION", "BOTTLENECK"]),
            factRef: FactRefSchema.optional(),
          })
          .strict(),
      )
      .min(2)
      .max(5),
    geoCorridorRef: RegistrySlugSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const ClosedLoopTrapPayloadSchema = z
  .object({
    archetype: z.literal("CLOSED_LOOP_TRAP"),
    loopTitle: ShortLabelSchema,
    issuedAssetLabel: ShortLabelSchema,
    captiveVenueLabel: ShortLabelSchema,
    exitGateLabel: ShortLabelSchema,
    insideFaceFactRef: FactRefSchema.optional(),
    exitPenaltyFactRef: FactRefSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const SplitComparisonPayloadSchema = z
  .object({
    archetype: z.literal("SPLIT_COMPARISON"),
    comparisonTitle: ShortLabelSchema,
    leftSide: z
      .object({
        eraOrRegimeLabel: ShortLabelSchema,
        mechanismLabel: ShortLabelSchema,
        factRef: FactRefSchema.optional(),
        geoCorridorRef: RegistrySlugSchema.optional(),
      })
      .strict(),
    rightSide: z
      .object({
        eraOrRegimeLabel: ShortLabelSchema,
        mechanismLabel: ShortLabelSchema,
        factRef: FactRefSchema.optional(),
        geoCorridorRef: RegistrySlugSchema.optional(),
      })
      .strict(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const ThreePillarRoadmapPayloadSchema = z
  .object({
    archetype: z.literal("THREE_PILLAR_ROADMAP"),
    roadmapId: RegistrySlugSchema,
    boardTitle: ShortLabelSchema,
    pillars: z
      .array(
        z
          .object({
            pillarKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            title: ShortLabelSchema,
            status: z.enum(["PENDING", "ACTIVE", "BROKEN"]),
          })
          .strict(),
      )
      .min(2)
      .max(5),
  })
  .strict();

export const CharacterBalanceSheetPayloadSchema = z
  .object({
    archetype: z.literal("CHARACTER_BALANCE_SHEET"),
    personaEntityId: EntityRefSchema,
    eraTagFactRef: FactRefSchema.optional(),
    locationCorridorRef: RegistrySlugSchema.optional(),
    ledgerRows: z
      .array(
        z
          .object({
            rowKey: z.enum([
              "INCOME",
              "FIXED_DEBT",
              "RETIREMENT_BUFFER",
              "UTILITY_LOAD",
            ]),
            label: ShortLabelSchema,
            factRef: FactRefSchema.optional(),
            qualitativeState: z.enum([
              "LOCKED_NOMINAL",
              "COLLAPSED",
              "PENALTY_TRAPPED",
              "INFLATED_COVERED",
              "BOTTLENECK_SPIKE",
            ]),
          })
          .strict(),
      )
      .min(2)
      .max(4),
  })
  .strict();

export const HistoricalParallelCardPayloadSchema = z
  .object({
    archetype: z.literal("HISTORICAL_PARALLEL_CARD"),
    eraFactRef: FactRefSchema.optional(),
    placeLabel: ShortLabelSchema,
    precedentTitle: ShortLabelSchema,
    lessonLabel: ShortLabelSchema,
    constraintFactRef: FactRefSchema.optional(),
    statuteOrDocFactRef: FactRefSchema.optional(),
    geoCorridorRef: RegistrySlugSchema.optional(),
  })
  .strict();

export const KineticThesisStrikePayloadSchema = z
  .object({
    archetype: z.literal("KINETIC_THESIS_STRIKE"),
    strikeTokenSpan: z.tuple([TokenRefSchema, TokenRefSchema]),
    emphasisRole: z.enum(["VERDICT_SLAM", "FRACTURE_WARNING", "PAYCHECK_TO_ALLOWANCE"]),
    supportingFactRef: FactRefSchema.optional(),
  })
  .strict();

export const QuestionPivotPayloadSchema = z
  .object({
    archetype: z.literal("QUESTION_PIVOT"),
    questionTokenSpan: z.tuple([TokenRefSchema, TokenRefSchema]),
    pivotMode: z.enum(["REBUTTAL_TURN", "BUDGET_RERUN", "OPEN_LOOP_PIN"]),
    callbackEntityId: EntityRefSchema.optional(),
  })
  .strict();

export const StatMonolithPayloadSchema = z
  .object({
    archetype: z.literal("STAT_MONOLITH"),
    heroFactRef: FactRefSchema,
    contextLabel: ShortLabelSchema,
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

// Declarative Pillar #13 Generative Contraption Blueprint (Zero Raw Coordinates)
export const ContraptionSemanticZoneEnum = z.enum([
  "left-stage",
  "center-hero",
  "right-stage",
  "top-header",
  "bottom-ledger",
  "split-left",
  "split-right",
]);

export const ContraptionActorKindEnum = z.enum([
  "prop-rig",
  "metric-counter",
  "document-card",
  "fluid-tank",
  "balance-scale",
  "conveyor-belt",
  "timeline-track",
  "isometric-tower",
  "verdict-stamp",
]);

export const ContraptionPhysicsRuleEnum = z.enum([
  "TORQUE_SCALE",
  "SPILLWAY_OVERFLOW",
  "BOM_VAPORIZER",
  "GUILLOTINE_SLICE",
  "PERISHABLE_DECAY",
  "CIRCULAR_CAROUSEL",
  "CABLE_TENSION_SNAP",
  "DUAL_SPEED_RACE",
]);

export const ContraptionConnectorKindEnum = z.enum([
  "flow-pipe",
  "guillotine-cut",
  "laser-scan",
  "geodesic-arc",
  "veto-slash",
  "dimension-line",
]);

export const CustomContraptionBlueprintPayloadSchema = z
  .object({
    archetype: z.literal("CUSTOM_CONTRAPTION_BLUEPRINT"),
    contraptionTitle: ShortLabelSchema,
    presetSetPieceId: RegistrySlugSchema.optional(),
    physicsRule: ContraptionPhysicsRuleEnum,
    actors: z
      .array(
        z
          .object({
            actorKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            kind: ContraptionActorKindEnum,
            zone: ContraptionSemanticZoneEnum,
            label: ShortLabelSchema,
            propVaultId: RegistrySlugSchema.optional(),
            factRef: FactRefSchema.optional(),
            semanticRole: z
              .enum(["solvent", "liability", "capital", "statutory"])
              .optional(),
          })
          .strict(),
      )
      .min(2)
      .max(6),
    connectors: z
      .array(
        z
          .object({
            fromActorKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            toActorKey: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
            kind: ContraptionConnectorKindEnum,
            triggerTokenId: TokenRefSchema.optional(),
          })
          .strict(),
      )
      .max(5),
    geoCorridorRef: RegistrySlugSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

// Declarative Pillar #10 Presenter Depth-Sandwich Stage (Zero Raw Coordinates)
export const DepthSandwichPresetEnum = z.enum([
  "behind-shoulder-billboard",
  "dual-shoulder-wings",
  "halo-arc-gauge",
  "pass-through-conveyor",
  "over-shoulder-dossier-stack",
  "subsea-horizon-split",
  "colossus-prop-backdrop",
  "spotlight-dim-sandwich",
]);

export const ForegroundGlassPresetEnum = z.enum([
  "GlassCard",
  "GlassCornerPill",
  "GlassBottomDock",
  "GlassFloatingToolbar",
  "GlassToastAlert",
  "GlassSplitModal",
  "GlassDossierStack",
  "GlassEvidenceRail",
  "GlassMagnifierCard",
  "GlassTelemetryStrip",
  "GlassVerdictSeal",
  "GlassCompareScale",
  "GlassTimelineScrubber",
  "GlassReceiptTicker",
  "GlassTerminalConsole",
  "GlassMapCallout",
  "GlassStatTriptych",
  "GlassQuoteCitation",
]);

export const OverFootageSafePlacementEnum = z.enum([
  "right-third",
  "bottom-dock",
  "top-bar",
]);

export const DepthSandwichStagePayloadSchema = z
  .object({
    archetype: z.literal("DEPTH_SANDWICH_STAGE"),
    sandwichPreset: DepthSandwichPresetEnum,
    midgroundBehindPresenter: z.enum([
      "MONOLITH_FIGURE",
      "RISING_DEBT_WALL",
      "CARTOGRAPHIC_WAR_MAP",
      "COLOSSUS_PROP_RIG",
      "ARCHIVE_DOSSIER_FAN",
    ]),
    foregroundGlassPreset: ForegroundGlassPresetEnum,
    foregroundPlacement: OverFootageSafePlacementEnum,
    headlineLabel: ShortLabelSchema,
    primaryFactRef: FactRefSchema,
    secondaryFactRef: FactRefSchema.optional(),
    propVaultId: RegistrySlugSchema.optional(),
    geoCorridorRef: RegistrySlugSchema.optional(),
    sourceAttributionFactRef: FactRefSchema.optional(),
  })
  .strict();

export const ArchetypePayloadUnion = z.discriminatedUnion("archetype", [
  DualSeriesDivergencePayloadSchema,
  CompositionStackPayloadSchema,
  ThresholdCrossingPayloadSchema,
  MultiplierScaleLadderPayloadSchema,
  FlowSankeyPayloadSchema,
  DocumentLedgerHighlightPayloadSchema,
  SocialPostExhibitPayloadSchema,
  CourtRulingExhibitPayloadSchema,
  HeadlineDossierPayloadSchema,
  CausalChainPayloadSchema,
  ClosedLoopTrapPayloadSchema,
  SplitComparisonPayloadSchema,
  ThreePillarRoadmapPayloadSchema,
  CharacterBalanceSheetPayloadSchema,
  HistoricalParallelCardPayloadSchema,
  KineticThesisStrikePayloadSchema,
  QuestionPivotPayloadSchema,
  StatMonolithPayloadSchema,
  CustomContraptionBlueprintPayloadSchema,
  DepthSandwichStagePayloadSchema,
]);

export type ArchetypePayload = z.infer<typeof ArchetypePayloadUnion>;

// ============================================================================
// Continuity, BeatNode & Root StoryboardIR Schemas
// ============================================================================

export const ContinuityMutationEnum = z.enum([
  "INITIALIZE",
  "STRESS_TEST",
  "PARTIAL_RELIEF",
  "COLLAPSE",
  "CALLBACK_PAYOFF",
]);

export type ContinuityMutation = z.infer<typeof ContinuityMutationEnum>;

export const ContinuityBindingSchema = z
  .object({
    introduces: z.array(EntityRefSchema).optional(),
    recalls: z
      .array(
        z
          .object({
            entityId: EntityRefSchema,
            mutation: ContinuityMutationEnum,
          })
          .strict(),
      )
      .optional(),
    roadmapUpdate: z
      .object({
        roadmapId: RegistrySlugSchema,
        activePillarIndex: z.number().int().min(0).max(4),
        pillarStatuses: z
          .array(z.enum(["PENDING", "ACTIVE", "BROKEN"]))
          .min(2)
          .max(5),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ContinuityBinding = z.infer<typeof ContinuityBindingSchema>;

export const BeatNodeSchema = z
  .object({
    beatId: BeatRefSchema,
    actId: z.string().regex(/^ACT_\d{1,2}$/),
    sentenceRange: z.tuple([SentenceRefSchema, SentenceRefSchema]),
    register: EmotionalRegisterEnum,
    presenterMode: PresenterModeEnum.optional(),
    isShowstopperPeak: z.boolean().optional(),
    continuity: ContinuityBindingSchema.optional(),
    payload: ArchetypePayloadUnion,
    steps: z.array(SubBeatStepSchema).min(1).max(8),
  })
  .strict();

export type BeatNode = z.infer<typeof BeatNodeSchema>;

export const EntityDeclarationSchema = z
  .object({
    entityId: EntityRefSchema,
    kind: z.enum([
      "PERSONA",
      "INSTITUTION",
      "LEGAL_CASE",
      "INFRASTRUCTURE",
      "ESCAPE_HATCH",
    ]),
    canonicalTitle: ShortLabelSchema,
    iconSemantic: z.enum([
      "HOUSE_MORTGAGE",
      "TREASURY_LEDGER",
      "SERVER_RACK",
      "POWER_GRID",
      "GAVEL",
      "PAYCHECK",
    ]),
    anchorFactRefs: z.array(FactRefSchema).max(6),
  })
  .strict();

export type EntityDeclaration = z.infer<typeof EntityDeclarationSchema>;

export const RoadmapDeclarationSchema = z
  .object({
    roadmapId: RegistrySlugSchema,
    title: ShortLabelSchema,
    pillars: z.array(ShortLabelSchema).min(2).max(5),
  })
  .strict();

export type RoadmapDeclaration = z.infer<typeof RoadmapDeclarationSchema>;

export const StoryboardIRSchema = z
  .object({
    irVersion: z.literal("1.0.0"),
    scriptSha256: z.string().regex(/^[0-9a-f]{64}$/),
    strategyPresetId: IRStrategyPresetEnum.optional(),
    forbiddenEngines: z.array(IRNarrativeEngineEnum).min(1).optional(),
    entities: z.array(EntityDeclarationSchema).max(16),
    roadmaps: z.array(RoadmapDeclarationSchema).max(4),
    beats: z.array(BeatNodeSchema).min(1),
  })
  .strict();

export type StoryboardIR = z.infer<typeof StoryboardIRSchema>;

// ============================================================================
// Forbidden Token Guardrail (`assertZeroForbiddenTokens`)
// ============================================================================

export interface ForbiddenTokenViolation {
  readonly path: string;
  readonly reason: string;
  readonly offendingSample: string;
}

export interface ForbiddenTokenReport {
  readonly ok: boolean;
  readonly violations: readonly ForbiddenTokenViolation[];
}

export class ForbiddenTokenError extends Error {
  public readonly violations: readonly ForbiddenTokenViolation[];

  public constructor(violations: readonly ForbiddenTokenViolation[]) {
    const summary = violations
      .slice(0, 5)
      .map((v) => `${v.path}: ${v.reason} ("${v.offendingSample}")`)
      .join("; ");
    super(`StoryboardIR contains forbidden raw CSS/coordinate/frame tokens: ${summary}`);
    this.name = "ForbiddenTokenError";
    this.violations = violations;
  }
}

const FORBIDDEN_OBJECT_KEY_REGEX =
  /^(x|y|z|top|left|right|bottom|width|height|minWidth|maxWidth|minHeight|maxHeight|margin|marginTop|marginBottom|marginLeft|marginRight|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|gap|fontSize|lineHeight|letterSpacing|fontFamily|fontWeight|color|background|backgroundColor|borderColor|fill|stroke|strokeWidth|opacity|borderRadius|boxShadow|filter|backdropFilter|transform|translateX|translateY|scale|rotate|skewX|skewY|viewBox|d|points|cx|cy|rx|ry|frame|startFrame|endFrame|durationInFrames|fps|duration|delay|stiffness|damping|mass|overshootClamping|transition|animation|keyframes)$/i;

const FORBIDDEN_HEX_COLOR_REGEX = /#[0-9a-f]{3,8}\b/i;
const FORBIDDEN_CSS_FN_REGEX =
  /\b(rgb|rgba|hsl|hsla|oklch|cubic-bezier|translate3d|translateX|translateY|matrix3d)\s*\(/i;
const FORBIDDEN_PIXEL_UNIT_REGEX =
  /(?:^|[\s:(,-])-?\d+(?:\.\d+)?(px|rem|em|vh|vw|vmin|vmax|deg|rad|ms)\b/i;
const FORBIDDEN_ENGINE_LEAK_REGEX =
  /@keyframes\b|\bMath\.random\s*\(|\bspring\s*\(\s*\{|\binterpolate\s*\(|<[A-Za-z][A-Za-z0-9]*[\s/>]/;

function scanForbiddenNode(
  node: unknown,
  path: string,
  violations: ForbiddenTokenViolation[],
  ignoreShaKey: boolean,
): void {
  if (node === null || node === undefined) {
    return;
  }

  if (typeof node === "string") {
    if (!ignoreShaKey && FORBIDDEN_HEX_COLOR_REGEX.test(node)) {
      violations.push({
        path,
        reason: "Hex color literal forbidden in IR",
        offendingSample: node.slice(0, 48),
      });
    }
    if (FORBIDDEN_CSS_FN_REGEX.test(node)) {
      violations.push({
        path,
        reason: "Raw CSS color/transform function forbidden in IR",
        offendingSample: node.slice(0, 48),
      });
    }
    if (FORBIDDEN_PIXEL_UNIT_REGEX.test(node)) {
      violations.push({
        path,
        reason: "Raw CSS pixel/unit/time literal forbidden in IR",
        offendingSample: node.slice(0, 48),
      });
    }
    if (FORBIDDEN_ENGINE_LEAK_REGEX.test(node)) {
      violations.push({
        path,
        reason: "Raw JSX/keyframes/spring/Math.random leak forbidden in IR",
        offendingSample: node.slice(0, 48),
      });
    }
    return;
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      scanForbiddenNode(node[i], `${path}[${i}]`, violations, false);
    }
    return;
  }

  if (typeof node === "object") {
    const record = node as Record<string, unknown>;
    const keys = Object.keys(record);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const childPath = path ? `${path}.${key}` : key;
      if (FORBIDDEN_OBJECT_KEY_REGEX.test(key)) {
        violations.push({
          path: childPath,
          reason: `Forbidden layout/CSS/frame/physics property key "${key}"`,
          offendingSample: key,
        });
      }
      scanForbiddenNode(
        record[key],
        childPath,
        violations,
        key === "scriptSha256",
      );
    }
  }
}

/**
 * Inspects a raw JSON string or parsed object and reports any forbidden CSS,
 * pixel, coordinate, hex color, JSX, or spring differential tokens.
 */
export function assertZeroForbiddenTokens(raw: unknown): ForbiddenTokenReport {
  const violations: ForbiddenTokenViolation[] = [];
  let target: unknown = raw;

  if (typeof raw === "string") {
    try {
      target = JSON.parse(raw) as unknown;
    } catch {
      scanForbiddenNode(raw, "$rawString", violations, false);
      return { ok: violations.length === 0, violations };
    }
  }

  scanForbiddenNode(target, "$", violations, false);
  return {
    ok: violations.length === 0,
    violations,
  };
}

/**
 * Throws `ForbiddenTokenError` if `assertZeroForbiddenTokens` detects any violation.
 */
export function enforceZeroForbiddenTokens(raw: unknown): void {
  const report = assertZeroForbiddenTokens(raw);
  if (!report.ok) {
    throw new ForbiddenTokenError(report.violations);
  }
}

/**
 * Runs `enforceZeroForbiddenTokens` followed by strict Zod `StoryboardIRSchema.parse`.
 */
export function parseStrictStoryboardIR(raw: unknown): StoryboardIR {
  const parsedJson: unknown =
    typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  enforceZeroForbiddenTokens(parsedJson);
  return StoryboardIRSchema.parse(parsedJson);
}

// ============================================================================
// Payload Introspection Helpers (Typed FactId & Label Collectors)
// ============================================================================

function collectMatchingStrings(
  node: unknown,
  keyMatcher: (key: string) => boolean,
  out: string[],
): void {
  if (node === null || node === undefined) {
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      collectMatchingStrings(node[i], keyMatcher, out);
    }
    return;
  }
  if (typeof node === "object") {
    const rec = node as Record<string, unknown>;
    const keys = Object.keys(rec);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const val = rec[k];
      if (typeof val === "string" && keyMatcher(k)) {
        out.push(val);
      } else if (Array.isArray(val) && keyMatcher(k)) {
        for (let j = 0; j < val.length; j++) {
          if (typeof val[j] === "string") {
            out.push(val[j] as string);
          }
        }
      } else if (typeof val === "object" && val !== null) {
        collectMatchingStrings(val, keyMatcher, out);
      }
    }
  }
}

/**
 * Extracts all `FactId` references (`*FactRef`, `factRef`, `anchorFactRefs`) from a beat.
 */
export function collectBeatFactRefs(beat: BeatNode): string[] {
  const refs: string[] = [];
  collectMatchingStrings(
    beat.payload,
    (k) => k === "factRef" || k.endsWith("FactRef"),
    refs,
  );
  for (let i = 0; i < beat.steps.length; i++) {
    const f = beat.steps[i].factRef;
    if (f && refs.indexOf(f) === -1) {
      refs.push(f);
    }
  }
  return refs;
}

/**
 * Extracts all human-visible `ShortLabel` strings from a beat's payload.
 */
export function collectBeatSemanticLabels(payload: ArchetypePayload): string[] {
  const labels: string[] = [];
  collectMatchingStrings(
    payload,
    (k) =>
      k === "label" ||
      k === "title" ||
      k.endsWith("Title") ||
      k.endsWith("Label") ||
      k === "pillars",
    labels,
  );
  return labels;
}
