import {
  ScriptLock,
  ScriptToken,
  SentenceLock,
  findTokenById,
  getSentenceSpan,
  sha256Hex,
} from "./scriptLock";
import {
  ARCHETYPE_FAMILY_MAP,
  BeatArchetype,
  BeatNode,
  EmotionalRegister,
  StoryboardIR,
} from "./storyboardIR";

/**
 * Pillar #15 — Dynamic-Programming Viterbi Cinematographic Solver (`viterbiChoreographer.ts`)
 *
 * Solves global minimum-cost assignment of:
 * 1. Register polarity (`page_editorial`, `archival_parchment`, `midnight_telemetry`,
 *    `drafting_blueprint`, `vintage_newsreel`, `over_footage`) with verified WCAG AAA palettes
 * 2. Collision-free 1920x1080 safe-zone `LayoutVariantId` slots
 * 3. 2.5D camera trajectories (with triplet repetition bans)
 * 4. Entry transitions (`HARD_CUT` on <=6w staccato punches, `MATCH_MORPH` FLIP on continuity)
 * 5. Locked critically-damped physics presets + `<3.8s` progressive sub-beat subdivision
 */

export const REGISTER_POLARITIES = [
  "page_editorial",
  "archival_parchment",
  "midnight_telemetry",
  "drafting_blueprint",
  "vintage_newsreel",
  "over_footage",
] as const;

export type RegisterPolarity = (typeof REGISTER_POLARITIES)[number];

export const LAYOUT_VARIANT_IDS = [
  "FULL_BLEED_LEDGER",
  "ASYMMETRIC_62_38",
  "ASYMMETRIC_38_62",
  "COLUMNS_50_50",
  "HORIZONTAL_BANDS",
  "TRIPTYCH_3_BAY",
  "ISOMETRIC_CENTER_STAGE",
  "MONOLITH_AXIS_LOCK",
  "OVER_FOOTAGE_RIGHT_THIRD",
  "OVER_FOOTAGE_BOTTOM_DOCK",
  "OVER_FOOTAGE_TOP_BAR",
  "DEPTH_SANDWICH_5_PLANE",
] as const;

export type LayoutVariantId = (typeof LAYOUT_VARIANT_IDS)[number];

export const CAMERA_TRAJECTORY_IDS = [
  "STATIC_LOCK",
  "PUSH_IN_103",
  "PULL_BACK_104",
  "PAN_LEFT_TO_RIGHT",
  "FOCUS_ZOOM_SLOT",
  "ISOMETRIC_PARALLAX_GLIDE",
  "DEPTH_DOLLY_SANDWICH",
] as const;

export type CameraTrajectoryId = (typeof CAMERA_TRAJECTORY_IDS)[number];

export const BEAT_TRANSITION_IDS = [
  "HARD_CUT",
  "MATCH_MORPH",
  "OKLCH_DISSOLVE_18F",
  "EDITORIAL_WIPE",
  "LATERAL_SLIDE",
] as const;

export type BeatTransitionId = (typeof BEAT_TRANSITION_IDS)[number];

export const SPRING_PRESET_IDS = [
  "SNAP_STRIKE",
  "EDITORIAL_CUT",
  "PRECISION_LEDGER",
  "MATCH_GLIDE",
  "DOCUMENT_SETTLE",
] as const;

export type SpringPresetId = (typeof SPRING_PRESET_IDS)[number];

export interface LockedSpringPhysicsSpec {
  readonly id: SpringPresetId;
  readonly mass: number;
  readonly stiffness: number;
  readonly damping: number;
  readonly dampingRatioZeta: number;
  readonly settleFrames60fps: number;
}

export const LOCKED_SPRING_PRESETS: Readonly<
  Record<SpringPresetId, LockedSpringPhysicsSpec>
> = {
  SNAP_STRIKE: {
    id: "SNAP_STRIKE",
    mass: 0.7,
    stiffness: 390,
    damping: 31.5,
    dampingRatioZeta: 0.95,
    settleFrames60fps: 11,
  },
  EDITORIAL_CUT: {
    id: "EDITORIAL_CUT",
    mass: 0.9,
    stiffness: 280,
    damping: 29.0,
    dampingRatioZeta: 0.91,
    settleFrames60fps: 16,
  },
  PRECISION_LEDGER: {
    id: "PRECISION_LEDGER",
    mass: 1.0,
    stiffness: 210,
    damping: 27.5,
    dampingRatioZeta: 0.95,
    settleFrames60fps: 21,
  },
  MATCH_GLIDE: {
    id: "MATCH_GLIDE",
    mass: 1.1,
    stiffness: 175,
    damping: 27.8,
    dampingRatioZeta: 1.0,
    settleFrames60fps: 25,
  },
  DOCUMENT_SETTLE: {
    id: "DOCUMENT_SETTLE",
    mass: 1.15,
    stiffness: 155,
    damping: 26.0,
    dampingRatioZeta: 0.97,
    settleFrames60fps: 27,
  },
};

export interface RegisterPaletteSpec {
  readonly id: RegisterPolarity;
  readonly canvasHex: string;
  readonly primaryInkHex: string;
  readonly secondaryInkHex: string;
  readonly mutedInkHex: string;
  readonly liabilityAccentHex: string;
  readonly solventAccentHex: string;
  readonly pairedLutFile: string;
  readonly isDarkSubstrate: boolean;
}

/**
 * Verified WCAG 2.1 AAA (>= 7.0:1) contrast palettes across all 6 registers.
 * Zero `#000000` and zero `#FFFFFF`.
 */
export const REGISTER_PALETTE_SPECS: Readonly<
  Record<RegisterPolarity, RegisterPaletteSpec>
> = {
  page_editorial: {
    id: "page_editorial",
    canvasHex: "#FAF8F3",
    primaryInkHex: "#1C2B3A",
    secondaryInkHex: "#3D4C5C",
    mutedInkHex: "#404E5C",
    liabilityAccentHex: "#8A2C1D",
    solventAccentHex: "#1B4D3E",
    pairedLutFile: "editorial-warm.cube",
    isDarkSubstrate: false,
  },
  archival_parchment: {
    id: "archival_parchment",
    canvasHex: "#F4EFE6",
    primaryInkHex: "#181614",
    secondaryInkHex: "#3D3832",
    mutedInkHex: "#544D44",
    liabilityAccentHex: "#8C1D18",
    solventAccentHex: "#1B4D3E",
    pairedLutFile: "archival-parchment.cube",
    isDarkSubstrate: false,
  },
  midnight_telemetry: {
    id: "midnight_telemetry",
    canvasHex: "#111315",
    primaryInkHex: "#F2ECE1",
    secondaryInkHex: "#B8B0A2",
    mutedInkHex: "#ACA496",
    liabilityAccentHex: "#F48C7F",
    solventAccentHex: "#6CC4A1",
    pairedLutFile: "midnight-desk.cube",
    isDarkSubstrate: true,
  },
  drafting_blueprint: {
    id: "drafting_blueprint",
    canvasHex: "#0F2236",
    primaryInkHex: "#F4F1EA",
    secondaryInkHex: "#BFD3E6",
    mutedInkHex: "#9BB8D2",
    liabilityAccentHex: "#FF9B82",
    solventAccentHex: "#7CE0E6",
    pairedLutFile: "blueprint-cyanotype.cube",
    isDarkSubstrate: true,
  },
  vintage_newsreel: {
    id: "vintage_newsreel",
    canvasHex: "#141210",
    primaryInkHex: "#EDE6DA",
    secondaryInkHex: "#BFB5A4",
    mutedInkHex: "#B0A696",
    liabilityAccentHex: "#F08A78",
    solventAccentHex: "#7EC4A8",
    pairedLutFile: "silver-gelatin-1941.cube",
    isDarkSubstrate: true,
  },
  over_footage: {
    id: "over_footage",
    canvasHex: "#0F1923",
    primaryInkHex: "#F5F2EB",
    secondaryInkHex: "#C5D1DE",
    mutedInkHex: "#A7B8CA",
    liabilityAccentHex: "#FF9482",
    solventAccentHex: "#76D4BE",
    pairedLutFile: "smoked-navy-nocturne.cube",
    isDarkSubstrate: true,
  },
};

export interface LayoutRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface SolvedVisualStep {
  readonly stepId: string;
  readonly anchorTokenId: string;
  readonly triggerTimeMs: number;
  readonly triggerFrame: number;
  readonly holdDurationMs: number;
  readonly intent: string;
  readonly targetSlotKey: string;
  readonly springPreset: SpringPresetId;
  readonly isAutoInjectedSubBeat: boolean;
  readonly sfxCueId: string;
}

export interface ChoreographedBeatPlan {
  readonly beatId: string;
  readonly actId: string;
  readonly archetype: BeatArchetype;
  readonly emotionalRegister: EmotionalRegister;
  readonly registerPolarity: RegisterPolarity;
  readonly layoutVariant: LayoutVariantId;
  readonly cameraTrajectory: CameraTrajectoryId;
  readonly entryTransition: BeatTransitionId;
  readonly primarySpringPreset: SpringPresetId;
  readonly lutFile: string;
  readonly musicMuteOnPunch: boolean;
  readonly isStaccatoPunch: boolean;
  readonly hasContinuityMatchCut: boolean;
  readonly startMs: number;
  readonly endMs: number;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly slotBoxes: readonly LayoutRect[];
  readonly staggerDeltaFrames: number;
  readonly solvedSteps: readonly SolvedVisualStep[];
}

export interface CompiledChoreographyPlan {
  readonly planSha256: string;
  readonly fps: number;
  readonly totalCost: number;
  readonly maxVisualGapMs: number;
  readonly beats: readonly ChoreographedBeatPlan[];
}

// ============================================================================
// Safe-Zone Non-Overlapping Slot Geometries (1920x1080 Master Grid)
// Hard Safe Zone: x in [96..1824], y in [72..1008], avoiding [1680..1920, 920..1080]
// ============================================================================

export const LAYOUT_VARIANT_BOXES: Readonly<
  Record<LayoutVariantId, readonly LayoutRect[]>
> = {
  FULL_BLEED_LEDGER: [
    { x: 112, y: 96, width: 1696, height: 112 },
    { x: 112, y: 232, width: 1520, height: 660 },
  ],
  ASYMMETRIC_62_38: [
    { x: 112, y: 108, width: 1020, height: 780 },
    { x: 1164, y: 108, width: 644, height: 780 },
  ],
  ASYMMETRIC_38_62: [
    { x: 112, y: 108, width: 644, height: 780 },
    { x: 788, y: 108, width: 1020, height: 780 },
  ],
  COLUMNS_50_50: [
    { x: 112, y: 116, width: 828, height: 768 },
    { x: 980, y: 116, width: 828, height: 768 },
  ],
  HORIZONTAL_BANDS: [
    { x: 112, y: 104, width: 1540, height: 360 },
    { x: 112, y: 496, width: 1540, height: 396 },
  ],
  TRIPTYCH_3_BAY: [
    { x: 112, y: 120, width: 540, height: 760 },
    { x: 690, y: 120, width: 540, height: 760 },
    { x: 1268, y: 120, width: 540, height: 760 },
  ],
  ISOMETRIC_CENTER_STAGE: [
    { x: 112, y: 96, width: 1540, height: 96 },
    { x: 180, y: 216, width: 1460, height: 676 },
  ],
  MONOLITH_AXIS_LOCK: [
    { x: 240, y: 240, width: 1440, height: 420 },
    { x: 320, y: 688, width: 1280, height: 160 },
  ],
  OVER_FOOTAGE_RIGHT_THIRD: [{ x: 1220, y: 128, width: 584, height: 740 }],
  OVER_FOOTAGE_BOTTOM_DOCK: [{ x: 160, y: 748, width: 1480, height: 220 }],
  OVER_FOOTAGE_TOP_BAR: [{ x: 140, y: 88, width: 1640, height: 148 }],
  DEPTH_SANDWICH_5_PLANE: [
    { x: 128, y: 116, width: 1020, height: 740 },
    { x: 1236, y: 168, width: 568, height: 680 },
  ],
};

function candidateVariantsForBeat(beat: BeatNode): readonly LayoutVariantId[] {
  const arch = beat.payload.archetype;
  if (arch === "DEPTH_SANDWICH_STAGE" || beat.presenterMode === "DEPTH_SANDWICH") {
    return ["DEPTH_SANDWICH_5_PLANE", "OVER_FOOTAGE_RIGHT_THIRD"];
  }
  if (beat.presenterMode === "OVER_FOOTAGE_GLASS") {
    return [
      "OVER_FOOTAGE_RIGHT_THIRD",
      "OVER_FOOTAGE_BOTTOM_DOCK",
      "OVER_FOOTAGE_TOP_BAR",
    ];
  }
  switch (arch) {
    case "THREE_PILLAR_ROADMAP":
      return ["TRIPTYCH_3_BAY", "HORIZONTAL_BANDS", "ASYMMETRIC_62_38"];
    case "SPLIT_COMPARISON":
      return ["COLUMNS_50_50", "ASYMMETRIC_62_38", "HORIZONTAL_BANDS"];
    case "DOCUMENT_LEDGER_HIGHLIGHT":
    case "COURT_RULING_EXHIBIT":
      return ["FULL_BLEED_LEDGER", "ASYMMETRIC_62_38", "ASYMMETRIC_38_62"];
    case "CUSTOM_CONTRAPTION_BLUEPRINT":
    case "MULTIPLIER_SCALE_LADDER":
      return ["ISOMETRIC_CENTER_STAGE", "ASYMMETRIC_62_38", "HORIZONTAL_BANDS"];
    case "KINETIC_THESIS_STRIKE":
    case "STAT_MONOLITH":
    case "QUESTION_PIVOT":
      return ["MONOLITH_AXIS_LOCK", "ASYMMETRIC_38_62", "HORIZONTAL_BANDS"];
    default:
      return [
        "ASYMMETRIC_62_38",
        "ASYMMETRIC_38_62",
        "COLUMNS_50_50",
        "FULL_BLEED_LEDGER",
      ];
  }
}

function candidateRegistersForBeat(beat: BeatNode): readonly RegisterPolarity[] {
  const arch = beat.payload.archetype;
  if (
    arch === "DEPTH_SANDWICH_STAGE" ||
    beat.presenterMode === "DEPTH_SANDWICH" ||
    beat.presenterMode === "OVER_FOOTAGE_GLASS" ||
    beat.presenterMode === "TALKING_HEAD_BREATHER"
  ) {
    return ["over_footage"];
  }
  switch (arch) {
    case "DOCUMENT_LEDGER_HIGHLIGHT":
    case "COURT_RULING_EXHIBIT":
      return ["archival_parchment", "page_editorial"];
    case "HISTORICAL_PARALLEL_CARD":
      return ["vintage_newsreel", "archival_parchment"];
    case "THRESHOLD_CROSSING":
    case "DUAL_SERIES_DIVERGENCE":
    case "STAT_MONOLITH":
      return ["midnight_telemetry", "page_editorial"];
    case "FLOW_SANKEY":
    case "CAUSAL_CHAIN":
    case "CLOSED_LOOP_TRAP":
    case "MULTIPLIER_SCALE_LADDER":
    case "CUSTOM_CONTRAPTION_BLUEPRINT":
      return ["drafting_blueprint", "page_editorial", "midnight_telemetry"];
    case "CHARACTER_BALANCE_SHEET":
      return ["page_editorial", "archival_parchment"];
    default:
      return ["page_editorial", "midnight_telemetry", "archival_parchment"];
  }
}

function candidateCamerasForBeat(
  beat: BeatNode,
  isStaccatoPunch: boolean,
): readonly CameraTrajectoryId[] {
  if (isStaccatoPunch) {
    return ["STATIC_LOCK"];
  }
  const arch = beat.payload.archetype;
  if (arch === "DEPTH_SANDWICH_STAGE" || beat.presenterMode === "DEPTH_SANDWICH") {
    return ["DEPTH_DOLLY_SANDWICH", "PUSH_IN_103", "STATIC_LOCK"];
  }
  if (arch === "CUSTOM_CONTRAPTION_BLUEPRINT" || arch === "MULTIPLIER_SCALE_LADDER") {
    return ["ISOMETRIC_PARALLAX_GLIDE", "PULL_BACK_104", "PAN_LEFT_TO_RIGHT"];
  }
  if (arch === "DOCUMENT_LEDGER_HIGHLIGHT" || arch === "COURT_RULING_EXHIBIT") {
    return ["FOCUS_ZOOM_SLOT", "PUSH_IN_103", "STATIC_LOCK"];
  }
  return [
    "STATIC_LOCK",
    "PUSH_IN_103",
    "PULL_BACK_104",
    "PAN_LEFT_TO_RIGHT",
    "FOCUS_ZOOM_SLOT",
  ];
}

// ============================================================================
// Entity Sharing & Progressive Sub-Beat Disclosure (`< 3.8s` Gap Rule)
// ============================================================================

function extractActiveEntityIds(beat: BeatNode): string[] {
  const ids: string[] = [];
  if (beat.continuity?.introduces) {
    for (let i = 0; i < beat.continuity.introduces.length; i++) {
      ids.push(beat.continuity.introduces[i]);
    }
  }
  if (beat.continuity?.recalls) {
    for (let i = 0; i < beat.continuity.recalls.length; i++) {
      const eid = beat.continuity.recalls[i].entityId;
      if (ids.indexOf(eid) === -1) {
        ids.push(eid);
      }
    }
  }
  if (beat.continuity?.roadmapUpdate) {
    ids.push(`ROADMAP:${beat.continuity.roadmapUpdate.roadmapId}`);
  }
  if (beat.payload.archetype === "CHARACTER_BALANCE_SHEET") {
    if (ids.indexOf(beat.payload.personaEntityId) === -1) {
      ids.push(beat.payload.personaEntityId);
    }
  }
  return ids;
}

function sharesContinuityEntity(prev: BeatNode, curr: BeatNode): boolean {
  const prevIds = extractActiveEntityIds(prev);
  const currIds = extractActiveEntityIds(curr);
  for (let i = 0; i < currIds.length; i++) {
    if (prevIds.indexOf(currIds[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function selectSpringForBeatAndStep(
  isStaccatoPunch: boolean,
  archetype: BeatArchetype,
  stepIntent: string,
  hasMatchCut: boolean,
  stepIdx: number,
): SpringPresetId {
  if (stepIdx === 0 && hasMatchCut) {
    return "MATCH_GLIDE";
  }
  if (isStaccatoPunch || stepIntent === "STRIKE_ANOMALY" || stepIntent === "ISOLATE_VERDICT") {
    return "SNAP_STRIKE";
  }
  if (archetype === "DOCUMENT_LEDGER_HIGHLIGHT" || archetype === "COURT_RULING_EXHIBIT") {
    return "DOCUMENT_SETTLE";
  }
  if (ARCHETYPE_FAMILY_MAP[archetype] === "MACRO_DATA") {
    return "PRECISION_LEDGER";
  }
  return "EDITORIAL_CUT";
}

function sfxForStep(
  registerPolarity: RegisterPolarity,
  stepIntent: string,
  stepIndex: number,
): string {
  if (registerPolarity === "over_footage") {
    return stepIndex === 0 ? "glass-enter" : "glass-pill-tick";
  }
  if (stepIntent === "STRIKE_ANOMALY" || stepIntent === "ISOLATE_VERDICT") {
    return registerPolarity === "archival_parchment"
      ? "veto-stamp-slam"
      : "warning-thud";
  }
  if (registerPolarity === "archival_parchment") {
    return stepIndex === 0 ? "paper-slide" : "marker-sweep";
  }
  if (registerPolarity === "drafting_blueprint") {
    return stepIndex === 0 ? "blueprint-unroll" : "audit-row-lock";
  }
  return stepIndex === 0 ? "paper-slide" : "data-tick";
}

/**
 * Resolves `SubBeatStep[]` to exact millisecond/frame timestamps (`-66ms` perceptual
 * anticipation lead) and deterministically injects progressive micro-reveals whenever
 * any visual interval exceeds `3,800ms`, while enforcing `>= 90ms` SFX spacing.
 */
export function buildProgressiveVisualSteps(
  beat: BeatNode,
  sentences: readonly SentenceLock[],
  scriptLock: ScriptLock,
  beatStartMs: number,
  beatEndMs: number,
  registerPolarity: RegisterPolarity,
  isStaccatoPunch: boolean,
  hasMatchCut: boolean,
): readonly SolvedVisualStep[] {
  const fps = scriptLock.fps;
  const allTokens: ScriptToken[] = [];
  for (let s = 0; s < sentences.length; s++) {
    for (let t = 0; t < sentences[s].tokens.length; t++) {
      allTokens.push(sentences[s].tokens[t]);
    }
  }

  interface RawTimedStep {
    anchorTokenId: string;
    timeMs: number;
    intent: string;
    targetSlotKey: string;
    isAuto: boolean;
  }

  const rawSteps: RawTimedStep[] = [];
  for (let i = 0; i < beat.steps.length; i++) {
    const st = beat.steps[i];
    const tok = findTokenById(scriptLock, st.anchorTokenId);
    const rawOnset = tok ? tok.startMs - 66 : beatStartMs;
    const clampedMs = Math.max(beatStartMs, Math.min(beatEndMs - 300, rawOnset));
    rawSteps.push({
      anchorTokenId: tok ? tok.id : allTokens[0]?.id ?? st.anchorTokenId,
      timeMs: i === 0 ? beatStartMs : clampedMs,
      intent: st.intent,
      targetSlotKey: st.targetSlotKey,
      isAuto: false,
    });
  }

  rawSteps.sort((a, b) => a.timeMs - b.timeMs);

  // Deduplicate steps closer than 1,100ms (unless beat itself is < 2,200ms)
  const minHoldMs = beatEndMs - beatStartMs < 2200 ? 600 : 1100;
  const filteredSteps: RawTimedStep[] = [];
  for (let i = 0; i < rawSteps.length; i++) {
    if (
      filteredSteps.length === 0 ||
      rawSteps[i].timeMs - filteredSteps[filteredSteps.length - 1].timeMs >= minHoldMs
    ) {
      filteredSteps.push(rawSteps[i]);
    }
  }

  // Subdivide any visual gap > 3,800ms using highest-scoring internal tokens
  const MAX_GAP_MS = 3800;
  const expanded: RawTimedStep[] = [];

  for (let i = 0; i < filteredSteps.length; i++) {
    const curr = filteredSteps[i];
    expanded.push(curr);
    const nextBoundaryMs =
      i + 1 < filteredSteps.length ? filteredSteps[i + 1].timeMs : beatEndMs;
    const gapMs = nextBoundaryMs - curr.timeMs;

    if (gapMs > MAX_GAP_MS) {
      const splitsNeeded = Math.ceil(gapMs / 3200) - 1;
      for (let k = 1; k <= splitsNeeded; k++) {
        const idealTimeMs =
          curr.timeMs + Math.round((gapMs * k) / (splitsNeeded + 1));
        let bestTok: ScriptToken | undefined;
        let bestScore = -1e9;

        for (let t = 0; t < allTokens.length; t++) {
          const cand = allTokens[t];
          const candTrigger = Math.max(beatStartMs, cand.startMs - 66);
          if (
            candTrigger < curr.timeMs + 1150 ||
            candTrigger > nextBoundaryMs - 1150
          ) {
            continue;
          }
          const distPenalty = Math.abs(candTrigger - idealTimeMs) * 0.6;
          const clauseBonus = cand.isClauseBoundary ? 240 : 0;
          const factBonus = cand.factId ? 380 : 0;
          const score =
            clauseBonus + factBonus + cand.pauseAfterMs - distPenalty;
          if (score > bestScore) {
            bestScore = score;
            bestTok = cand;
          }
        }

        const chosenMs = bestTok
          ? Math.max(beatStartMs, bestTok.startMs - 66)
          : idealTimeMs;
        if (
          chosenMs - expanded[expanded.length - 1].timeMs >= 1100 &&
          nextBoundaryMs - chosenMs >= 1100
        ) {
          expanded.push({
            anchorTokenId:
              bestTok?.id ?? allTokens[0]?.id ?? curr.anchorTokenId,
            timeMs: chosenMs,
            intent: bestTok?.factId ? "REVEAL_BASELINE" : "ANNOTATE_CAUSE",
            targetSlotKey: curr.targetSlotKey,
            isAuto: true,
          });
        }
      }
    }
  }

  expanded.sort((a, b) => a.timeMs - b.timeMs);

  // Guaranteed ceiling pass: subdivide any residual interval > 3,700ms at midpoint
  let ceilingSplitOccurred = true;
  while (ceilingSplitOccurred) {
    ceilingSplitOccurred = false;
    for (let i = 0; i < expanded.length; i++) {
      const startT = expanded[i].timeMs;
      const endT = i + 1 < expanded.length ? expanded[i + 1].timeMs : beatEndMs;
      if (endT - startT > 3700) {
        const midT = Math.round((startT + endT) / 2);
        let nearestTok: ScriptToken | undefined;
        let minDiff = 1e9;
        for (let t = 0; t < allTokens.length; t++) {
          const candT = Math.max(beatStartMs, allTokens[t].startMs - 66);
          if (candT >= startT + 1000 && candT <= endT - 1000) {
            const diff = Math.abs(candT - midT);
            if (diff < minDiff) {
              minDiff = diff;
              nearestTok = allTokens[t];
            }
          }
        }
        expanded.splice(i + 1, 0, {
          anchorTokenId:
            nearestTok?.id ?? allTokens[0]?.id ?? expanded[i].anchorTokenId,
          timeMs: nearestTok ? Math.max(beatStartMs, nearestTok.startMs - 66) : midT,
          intent: "ANNOTATE_CAUSE",
          targetSlotKey: expanded[i].targetSlotKey,
          isAuto: true,
        });
        ceilingSplitOccurred = true;
        break;
      }
    }
  }

  // Enforce >= 90ms audio SFX spacing and compute hold durations
  const solved: SolvedVisualStep[] = [];
  let prevTriggerMs = -1000;
  for (let i = 0; i < expanded.length; i++) {
    const item = expanded[i];
    const spacedTimeMs =
      i === 0 ? beatStartMs : Math.max(item.timeMs, prevTriggerMs + 90);
    const nextTimeMs =
      i + 1 < expanded.length ? expanded[i + 1].timeMs : beatEndMs;
    const holdDurationMs = Math.max(250, nextTimeMs - spacedTimeMs);

    solved.push({
      stepId: `ST${i + 1 < 10 ? "0" : ""}${i + 1}`,
      anchorTokenId: item.anchorTokenId,
      triggerTimeMs: spacedTimeMs,
      triggerFrame: Math.round((spacedTimeMs / 1000) * fps),
      holdDurationMs,
      intent: item.intent,
      targetSlotKey: item.targetSlotKey,
      springPreset: selectSpringForBeatAndStep(
        isStaccatoPunch,
        beat.payload.archetype,
        item.intent,
        hasMatchCut,
        i,
      ),
      isAutoInjectedSubBeat: item.isAuto,
      sfxCueId: sfxForStep(registerPolarity, item.intent, i),
    });
    prevTriggerMs = spacedTimeMs;
  }

  return solved;
}

// ============================================================================
// Viterbi Minimum-Cost Path Solver (`solveViterbiChoreography`)
// ============================================================================

interface BeatCandidateState {
  readonly registerPolarity: RegisterPolarity;
  readonly layoutVariant: LayoutVariantId;
  readonly cameraTrajectory: CameraTrajectoryId;
  readonly entryTransition: BeatTransitionId;
}

function buildCandidatesForBeat(
  beat: BeatNode,
  beatIndex: number,
  isStaccatoPunch: boolean,
  hasContinuityWithPrev: boolean,
): BeatCandidateState[] {
  const registers = candidateRegistersForBeat(beat);
  const variants = candidateVariantsForBeat(beat);
  const cameras = candidateCamerasForBeat(beat, isStaccatoPunch);

  const transitions: BeatTransitionId[] =
    beatIndex === 0
      ? ["HARD_CUT"]
      : isStaccatoPunch
        ? ["HARD_CUT"]
        : hasContinuityWithPrev
          ? ["MATCH_MORPH", "OKLCH_DISSOLVE_18F", "HARD_CUT"]
          : ["HARD_CUT", "OKLCH_DISSOLVE_18F", "EDITORIAL_WIPE", "LATERAL_SLIDE"];

  const list: BeatCandidateState[] = [];
  for (let r = 0; r < registers.length; r++) {
    for (let v = 0; v < variants.length; v++) {
      for (let c = 0; c < cameras.length; c++) {
        for (let t = 0; t < transitions.length; t++) {
          list.push({
            registerPolarity: registers[r],
            layoutVariant: variants[v],
            cameraTrajectory: cameras[c],
            entryTransition: transitions[t],
          });
        }
      }
    }
  }
  return list;
}

function unaryStateCost(
  beat: BeatNode,
  state: BeatCandidateState,
  isStaccatoPunch: boolean,
): number {
  let cost = 0;
  const arch = beat.payload.archetype;

  if (isStaccatoPunch) {
    if (
      state.cameraTrajectory !== "STATIC_LOCK" ||
      state.entryTransition !== "HARD_CUT"
    ) {
      return 1e8;
    }
    cost -= 30;
  }

  if (
    (arch === "COURT_RULING_EXHIBIT" || arch === "DOCUMENT_LEDGER_HIGHLIGHT") &&
    state.registerPolarity === "archival_parchment"
  ) {
    cost -= 24;
  }

  if (
    arch === "HISTORICAL_PARALLEL_CARD" &&
    state.registerPolarity === "vintage_newsreel"
  ) {
    cost -= 22;
  }

  if (
    (arch === "CUSTOM_CONTRAPTION_BLUEPRINT" || arch === "FLOW_SANKEY") &&
    state.registerPolarity === "drafting_blueprint"
  ) {
    cost -= 20;
  }

  if (
    (arch === "THRESHOLD_CROSSING" || arch === "DUAL_SERIES_DIVERGENCE") &&
    state.registerPolarity === "midnight_telemetry"
  ) {
    cost -= 18;
  }

  if (state.cameraTrajectory === "STATIC_LOCK" && !isStaccatoPunch) {
    cost -= 4; // Keeps static camera share grounded (~30-45%)
  }

  return cost;
}

function pairwiseTransitionCost(
  prevBeat: BeatNode,
  currBeat: BeatNode,
  prevState: BeatCandidateState,
  currState: BeatCandidateState,
  currDurationMs: number,
  isStaccatoPunch: boolean,
  hasContinuity: boolean,
  prevPrevCamera: CameraTrajectoryId | undefined,
): number {
  let cost = 0;

  // Hard ban: adjacent identical layout variant
  if (currState.layoutVariant === prevState.layoutVariant) {
    return 1e8;
  }

  // Hard ban: back-to-back LATERAL_SLIDE
  if (
    currState.entryTransition === "LATERAL_SLIDE" &&
    prevState.entryTransition === "LATERAL_SLIDE"
  ) {
    return 1e8;
  }

  // Hard ban: 3-beat identical camera trajectory run (non-static, or >2 static)
  if (
    prevPrevCamera !== undefined &&
    prevPrevCamera === prevState.cameraTrajectory &&
    prevState.cameraTrajectory === currState.cameraTrajectory
  ) {
    return 1e8;
  }

  // Anti-strobing: prevent register polarity flips on short (<3,000ms) non-punch beats
  const registerChanged =
    currState.registerPolarity !== prevState.registerPolarity;
  if (registerChanged) {
    if (currDurationMs < 3000 && !isStaccatoPunch) {
      cost += 1e6;
    } else if (
      !isStaccatoPunch &&
      currState.entryTransition !== "OKLCH_DISSOLVE_18F" &&
      currState.entryTransition !== "MATCH_MORPH"
    ) {
      cost += 18;
    } else {
      cost += 6;
    }
  } else if (currState.entryTransition === "OKLCH_DISSOLVE_18F") {
    cost += 10; // Prefer crisp cuts/wipes when staying inside the same register
  }

  // Continuity FLIP Match-Cut reward
  if (hasContinuity) {
    if (currState.entryTransition === "MATCH_MORPH" && !isStaccatoPunch) {
      cost -= 85;
    } else if (!isStaccatoPunch) {
      cost += 25;
    }
  } else if (currState.entryTransition === "MATCH_MORPH") {
    return 1e8; // Never claim FLIP match-morph without shared continuity entity
  }

  // Slight penalty for repeating camera move consecutively
  if (
    currState.cameraTrajectory === prevState.cameraTrajectory &&
    currState.cameraTrajectory !== "STATIC_LOCK"
  ) {
    cost += 16;
  }

  // Encourage variety across same-family neighbors
  if (
    ARCHETYPE_FAMILY_MAP[prevBeat.payload.archetype] ===
      ARCHETYPE_FAMILY_MAP[currBeat.payload.archetype] &&
    currState.registerPolarity === prevState.registerPolarity
  ) {
    cost += 8;
  }

  return cost;
}

/**
 * Solves optimal global scene choreography across all beats in `ir` via
 * dynamic-programming Viterbi trellis optimization and `<3.8s` progressive
 * sub-beat subdivision.
 */
export function solveViterbiChoreography(
  ir: StoryboardIR,
  scriptLock: ScriptLock,
): CompiledChoreographyPlan {
  const n = ir.beats.length;
  const fps = scriptLock.fps;

  const beatSentences: Array<readonly SentenceLock[]> = [];
  const beatStartsMs: number[] = [];
  const beatEndsMs: number[] = [];
  const beatIsPunch: boolean[] = [];
  const beatHasContinuity: boolean[] = [];
  const candidatesPerBeat: BeatCandidateState[][] = [];

  for (let i = 0; i < n; i++) {
    const beat = ir.beats[i];
    const span = getSentenceSpan(scriptLock, beat.sentenceRange);
    beatSentences.push(span);

    const startMs =
      span.length > 0
        ? span[0].startMs
        : i > 0
          ? beatEndsMs[i - 1]
          : 0;
    const lastSent = span.length > 0 ? span[span.length - 1] : undefined;
    const lastPause =
      lastSent && lastSent.tokens.length > 0
        ? lastSent.tokens[lastSent.tokens.length - 1].pauseAfterMs
        : 300;
    const endMs = lastSent ? lastSent.endMs + lastPause : startMs + 3200;

    beatStartsMs.push(startMs);
    beatEndsMs.push(Math.max(startMs + 600, endMs));

    const totalWords = span.reduce((acc, s) => acc + s.wordCount, 0);
    const isPunch =
      (span.length === 1 &&
        span[0].cadenceClass === "STACCATO_PUNCH" &&
        totalWords <= 6) ||
      (beat.payload.archetype === "KINETIC_THESIS_STRIKE" && totalWords <= 6);
    beatIsPunch.push(isPunch);

    const hasCont = i > 0 ? sharesContinuityEntity(ir.beats[i - 1], beat) : false;
    beatHasContinuity.push(hasCont);

    candidatesPerBeat.push(
      buildCandidatesForBeat(beat, i, isPunch, hasCont),
    );
  }

  // Viterbi forward pass tracking best predecessor per candidate state
  const dpCost: number[][] = [];
  const dpBackptr: number[][] = [];
  const dpBestPrevCamera: Array<Array<CameraTrajectoryId | undefined>> = [];

  for (let i = 0; i < n; i++) {
    const cands = candidatesPerBeat[i];
    const rowCost = new Array<number>(cands.length);
    const rowBack = new Array<number>(cands.length);
    const rowPrevCam = new Array<CameraTrajectoryId | undefined>(cands.length);

    if (i === 0) {
      const nextIsPunch = n > 1 ? beatIsPunch[1] : false;
      for (let c = 0; c < cands.length; c++) {
        const prePunchPenalty =
          !beatIsPunch[0] &&
          nextIsPunch &&
          cands[c].cameraTrajectory === "STATIC_LOCK"
            ? 60
            : 0;
        rowCost[c] =
          unaryStateCost(ir.beats[0], cands[c], beatIsPunch[0]) +
          prePunchPenalty;
        rowBack[c] = -1;
        rowPrevCam[c] = undefined;
      }
    } else {
      const prevCands = candidatesPerBeat[i - 1];
      const prevCosts = dpCost[i - 1];
      const prevPrevCams = dpBestPrevCamera[i - 1];
      const durMs = beatEndsMs[i] - beatStartsMs[i];
      const nextIsPunch = i + 1 < n ? beatIsPunch[i + 1] : false;

      for (let c = 0; c < cands.length; c++) {
        const prePunchPenalty =
          !beatIsPunch[i] &&
          nextIsPunch &&
          cands[c].cameraTrajectory === "STATIC_LOCK"
            ? 60
            : 0;
        const uCost =
          unaryStateCost(ir.beats[i], cands[c], beatIsPunch[i]) +
          prePunchPenalty;
        let bestTotal = 1e12;
        let bestPrevIdx = 0;

        for (let p = 0; p < prevCands.length; p++) {
          const wCost = pairwiseTransitionCost(
            ir.beats[i - 1],
            ir.beats[i],
            prevCands[p],
            cands[c],
            durMs,
            beatIsPunch[i],
            beatHasContinuity[i],
            prevPrevCams[p],
          );
          const candTotal = prevCosts[p] + wCost + uCost;
          if (candTotal < bestTotal) {
            bestTotal = candTotal;
            bestPrevIdx = p;
          }
        }

        rowCost[c] = bestTotal;
        rowBack[c] = bestPrevIdx;
        rowPrevCam[c] = prevCands[bestPrevIdx].cameraTrajectory;
      }
    }

    dpCost.push(rowCost);
    dpBackptr.push(rowBack);
    dpBestPrevCamera.push(rowPrevCam);
  }

  // Backtrack optimal global state sequence
  const chosenStates: BeatCandidateState[] = new Array<BeatCandidateState>(n);
  let bestFinalCost = 1e12;
  let currStateIdx = 0;
  const lastCosts = dpCost[n - 1];
  for (let c = 0; c < lastCosts.length; c++) {
    if (lastCosts[c] < bestFinalCost) {
      bestFinalCost = lastCosts[c];
      currStateIdx = c;
    }
  }

  for (let i = n - 1; i >= 0; i--) {
    chosenStates[i] = candidatesPerBeat[i][currStateIdx];
    currStateIdx = dpBackptr[i][currStateIdx];
  }

  // Construct choreographed beat plans & progressive sub-beat steps
  const choreographedBeats: ChoreographedBeatPlan[] = [];
  let maxVisualGapMs = 0;

  for (let i = 0; i < n; i++) {
    const beat = ir.beats[i];
    const state = chosenStates[i];
    const startMs = beatStartsMs[i];
    const endMs = beatEndsMs[i];
    const isPunch = beatIsPunch[i];
    const hasMatchCut = state.entryTransition === "MATCH_MORPH";

    const solvedSteps = buildProgressiveVisualSteps(
      beat,
      beatSentences[i],
      scriptLock,
      startMs,
      endMs,
      state.registerPolarity,
      isPunch,
      hasMatchCut,
    );

    for (let s = 0; s < solvedSteps.length; s++) {
      if (solvedSteps[s].holdDurationMs > maxVisualGapMs) {
        maxVisualGapMs = solvedSteps[s].holdDurationMs;
      }
    }

    const paletteSpec = REGISTER_PALETTE_SPECS[state.registerPolarity];
    const lutFile =
      beat.register === "THESIS_VERDICT" && isPunch
        ? "verdict-high-contrast.cube"
        : paletteSpec.pairedLutFile;

    choreographedBeats.push({
      beatId: beat.beatId,
      actId: beat.actId,
      archetype: beat.payload.archetype,
      emotionalRegister: beat.register,
      registerPolarity: state.registerPolarity,
      layoutVariant: state.layoutVariant,
      cameraTrajectory: state.cameraTrajectory,
      entryTransition: state.entryTransition,
      primarySpringPreset: solvedSteps[0]?.springPreset ?? "EDITORIAL_CUT",
      lutFile,
      musicMuteOnPunch: isPunch,
      isStaccatoPunch: isPunch,
      hasContinuityMatchCut: hasMatchCut,
      startMs,
      endMs,
      startFrame: Math.round((startMs / 1000) * fps),
      endFrame: Math.round((endMs / 1000) * fps),
      slotBoxes: LAYOUT_VARIANT_BOXES[state.layoutVariant],
      staggerDeltaFrames: isPunch ? 3 : 4,
      solvedSteps,
    });
  }

  const canonicalDigestInput = JSON.stringify({
    scriptSha256: scriptLock.scriptSha256,
    beats: choreographedBeats,
  });

  return {
    planSha256: sha256Hex(canonicalDigestInput),
    fps,
    totalCost: Math.round(bestFinalCost * 100) / 100,
    maxVisualGapMs,
    beats: choreographedBeats,
  };
}
