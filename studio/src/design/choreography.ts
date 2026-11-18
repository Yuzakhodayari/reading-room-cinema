import { Easing, interpolate, spring, SpringConfig } from "remotion";
import { z } from "zod";

export { SPRINGS } from "./tokens";

export type LayerStage =
  | "hidden"
  | "enter"
  | "hold"
  | "focus"
  | "dock"
  | "highlight"
  | "nudge"
  | "exit";

export interface LayerState {
  stage: LayerStage;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  highlightProgress: number;
  focusGlow: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  blurPx: number;
  clipInsetTop: number;
  clipInsetRight: number;
  clipInsetBottom: number;
  clipInsetLeft: number;
}

export interface LayerKeyframe {
  frame: number;
  stage: LayerStage;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  highlightProgress?: number;
  focusGlow?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  blurPx?: number;
  clipInsetTop?: number;
  clipInsetRight?: number;
  clipInsetBottom?: number;
  clipInsetLeft?: number;
  springConfig?: SpringConfig;
}

export interface LayerLifecyclePlan {
  enterFrame: number;
  enterDuration?: number;
  focusFrame?: number;
  focusDuration?: number;
  highlightFrame?: number;
  highlightDuration?: number;
  dockFrame?: number;
  dockDuration?: number;
  nudgeFrame?: number;
  nudgeDuration?: number;
  exitFrame?: number;
  exitDuration?: number;

  initial?: Partial<LayerState>;
  entered?: Partial<LayerState>;
  focused?: Partial<LayerState>;
  docked?: Partial<LayerState>;
  exited?: Partial<LayerState>;
}

export const EASINGS = {
  // Apple / Editorial Out-Cubic: quick entry with silky friction settle
  editorial: Easing.bezier(0.16, 1, 0.3, 1),
  // Snappy UI dock transition
  snappy: Easing.bezier(0.05, 0.9, 0.1, 1),
  // Smooth symmetrical glide
  smooth: Easing.bezier(0.42, 0, 0.58, 1),
  // Gentle tactile drift
  gentle: Easing.bezier(0.33, 1, 0.68, 1),
};

const DEFAULT_STATE: LayerState = {
  stage: "hidden",
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,
  highlightProgress: 0,
  focusGlow: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  blurPx: 0,
  clipInsetTop: 0,
  clipInsetRight: 0,
  clipInsetBottom: 0,
  clipInsetLeft: 0,
};

type NumericLayerChannels = Omit<LayerState, "stage">;

/**
 * Convert a declarative LayerLifecyclePlan into an ordered array of keyframes.
 */
export function planToKeyframes(plan: LayerLifecyclePlan): LayerKeyframe[] {
  const kfs: LayerKeyframe[] = [];

  const enterDur = plan.enterDuration ?? 14;
  const initial = plan.initial ?? {};
  const entered = plan.entered ?? {};

  // Hidden start keyframe
  kfs.push({
    frame: plan.enterFrame,
    stage: "hidden",
    x: initial.x ?? 0,
    y: initial.y ?? 24,
    scale: initial.scale ?? 0.94,
    opacity: initial.opacity ?? 0,
    highlightProgress: initial.highlightProgress ?? 0,
    focusGlow: initial.focusGlow ?? 0,
    rotate: initial.rotate ?? 0,
    rotateX: initial.rotateX ?? 0,
    rotateY: initial.rotateY ?? 0,
    skewX: initial.skewX ?? 0,
    blurPx: initial.blurPx ?? 0,
    clipInsetTop: initial.clipInsetTop ?? 0,
    clipInsetRight: initial.clipInsetRight ?? 0,
    clipInsetBottom: initial.clipInsetBottom ?? 0,
    clipInsetLeft: initial.clipInsetLeft ?? 0,
  });

  // Entered steady-state baseline
  const enteredFrame = plan.enterFrame + enterDur;
  let cur: NumericLayerChannels = {
    x: entered.x ?? 0,
    y: entered.y ?? 0,
    scale: entered.scale ?? 1.0,
    opacity: entered.opacity ?? 1.0,
    highlightProgress: entered.highlightProgress ?? 0,
    focusGlow: entered.focusGlow ?? 0,
    rotate: entered.rotate ?? 0,
    rotateX: entered.rotateX ?? 0,
    rotateY: entered.rotateY ?? 0,
    skewX: entered.skewX ?? 0,
    blurPx: entered.blurPx ?? 0,
    clipInsetTop: entered.clipInsetTop ?? 0,
    clipInsetRight: entered.clipInsetRight ?? 0,
    clipInsetBottom: entered.clipInsetBottom ?? 0,
    clipInsetLeft: entered.clipInsetLeft ?? 0,
  };
  let lastFrame = enteredFrame;

  kfs.push({
    frame: enteredFrame,
    stage: "enter",
    ...cur,
  });

  type ScheduledStage = {
    startFrame: number;
    run: () => void;
  };
  const scheduled: ScheduledStage[] = [];

  const pushHoldIfNeeded = (startFrame: number) => {
    if (startFrame > lastFrame) {
      kfs.push({
        frame: startFrame,
        stage: "hold",
        ...cur,
      });
      lastFrame = startFrame;
    }
  };

  // Focus stage
  if (plan.focusFrame !== undefined) {
    const startFrame = plan.focusFrame;
    const focusDur = plan.focusDuration ?? 12;
    const focused = plan.focused ?? {};
    scheduled.push({
      startFrame,
      run: () => {
        pushHoldIfNeeded(startFrame);
        cur = {
          x: focused.x ?? cur.x,
          y: focused.y ?? cur.y,
          scale: focused.scale ?? 1.03,
          opacity: focused.opacity ?? cur.opacity,
          highlightProgress: focused.highlightProgress ?? cur.highlightProgress,
          focusGlow: focused.focusGlow ?? 1.0,
          rotate: focused.rotate ?? cur.rotate,
          rotateX: focused.rotateX ?? cur.rotateX,
          rotateY: focused.rotateY ?? cur.rotateY,
          skewX: focused.skewX ?? cur.skewX,
          blurPx: focused.blurPx ?? cur.blurPx,
          clipInsetTop: focused.clipInsetTop ?? cur.clipInsetTop,
          clipInsetRight: focused.clipInsetRight ?? cur.clipInsetRight,
          clipInsetBottom: focused.clipInsetBottom ?? cur.clipInsetBottom,
          clipInsetLeft: focused.clipInsetLeft ?? cur.clipInsetLeft,
        };
        const endFrame = startFrame + focusDur;
        kfs.push({
          frame: endFrame,
          stage: "focus",
          ...cur,
        });
        lastFrame = Math.max(lastFrame, endFrame);
      },
    });
  }

  // Highlight stage
  if (plan.highlightFrame !== undefined) {
    const startFrame = plan.highlightFrame;
    const hlDur = plan.highlightDuration ?? 18;
    scheduled.push({
      startFrame,
      run: () => {
        cur = { ...cur, highlightProgress: 0 };
        pushHoldIfNeeded(startFrame);
        if (lastFrame < startFrame) {
          kfs.push({
            frame: startFrame,
            stage: "highlight",
            ...cur,
          });
          lastFrame = startFrame;
        }
        cur = { ...cur, highlightProgress: 1.0 };
        const endFrame = startFrame + hlDur;
        kfs.push({
          frame: endFrame,
          stage: "highlight",
          ...cur,
        });
        lastFrame = Math.max(lastFrame, endFrame);
      },
    });
  }

  // Nudge stage (tactile alert micro-impulse)
  if (plan.nudgeFrame !== undefined) {
    const startFrame = plan.nudgeFrame;
    const nudgeDur = plan.nudgeDuration ?? 8;
    scheduled.push({
      startFrame,
      run: () => {
        pushHoldIfNeeded(startFrame);
        const midFrame = startFrame + Math.floor(nudgeDur / 2);
        kfs.push({
          frame: midFrame,
          stage: "nudge",
          ...cur,
          y: cur.y - 6,
          scale: cur.scale * 1.015,
          focusGlow: 0.8,
        });
        const endFrame = startFrame + nudgeDur;
        cur = {
          ...cur,
          focusGlow: 0.2,
        };
        kfs.push({
          frame: endFrame,
          stage: "nudge",
          ...cur,
        });
        lastFrame = Math.max(lastFrame, endFrame);
      },
    });
  }

  // Dock stage
  if (plan.dockFrame !== undefined) {
    const startFrame = plan.dockFrame;
    const dockDur = plan.dockDuration ?? 16;
    const docked = plan.docked ?? {};
    scheduled.push({
      startFrame,
      run: () => {
        pushHoldIfNeeded(startFrame);
        cur = {
          x: docked.x ?? 480,
          y: docked.y ?? 260,
          scale: docked.scale ?? 0.78,
          opacity: docked.opacity ?? 0.95,
          highlightProgress: docked.highlightProgress ?? 0,
          focusGlow: docked.focusGlow ?? 0,
          rotate: docked.rotate ?? 0,
          rotateX: docked.rotateX ?? 0,
          rotateY: docked.rotateY ?? 0,
          skewX: docked.skewX ?? 0,
          blurPx: docked.blurPx ?? 0,
          clipInsetTop: docked.clipInsetTop ?? 0,
          clipInsetRight: docked.clipInsetRight ?? 0,
          clipInsetBottom: docked.clipInsetBottom ?? 0,
          clipInsetLeft: docked.clipInsetLeft ?? 0,
        };
        const endFrame = startFrame + dockDur;
        kfs.push({
          frame: endFrame,
          stage: "dock",
          ...cur,
        });
        lastFrame = Math.max(lastFrame, endFrame);
      },
    });
  }

  // Exit stage
  if (plan.exitFrame !== undefined) {
    const startFrame = plan.exitFrame;
    const exitDur = plan.exitDuration ?? 14;
    const exited = plan.exited ?? {};
    scheduled.push({
      startFrame,
      run: () => {
        pushHoldIfNeeded(startFrame);
        cur = {
          x: exited.x ?? cur.x,
          y: exited.y ?? cur.y - 20,
          scale: exited.scale ?? cur.scale * 0.92,
          opacity: exited.opacity ?? 0,
          highlightProgress: 0,
          focusGlow: 0,
          rotate: exited.rotate ?? cur.rotate,
          rotateX: exited.rotateX ?? cur.rotateX,
          rotateY: exited.rotateY ?? cur.rotateY,
          skewX: exited.skewX ?? cur.skewX,
          blurPx: exited.blurPx ?? cur.blurPx,
          clipInsetTop: exited.clipInsetTop ?? cur.clipInsetTop,
          clipInsetRight: exited.clipInsetRight ?? cur.clipInsetRight,
          clipInsetBottom: exited.clipInsetBottom ?? cur.clipInsetBottom,
          clipInsetLeft: exited.clipInsetLeft ?? cur.clipInsetLeft,
        };
        const endFrame = startFrame + exitDur;
        kfs.push({
          frame: endFrame,
          stage: "exit",
          ...cur,
        });
        lastFrame = Math.max(lastFrame, endFrame);
      },
    });
  }

  // Process stages in chronological start order so hold keyframes preserve
  // the active steady state before each transition begins.
  scheduled.sort((a, b) => a.startFrame - b.startFrame);
  for (const stage of scheduled) {
    stage.run();
  }

  // Sort chronologically by frame
  kfs.sort((a, b) => a.frame - b.frame);
  return kfs;
}

/**
 * Resolves the active transformation and optical properties for any layer
 * at the given frame and fps across its entire lifecycle.
 */
export function resolveLayerLifecycle(
  frame: number,
  fps: number,
  lifecycle: LayerKeyframe[] | LayerLifecyclePlan
): LayerState {
  const keyframes = Array.isArray(lifecycle)
    ? [...lifecycle].sort((a, b) => a.frame - b.frame)
    : planToKeyframes(lifecycle);

  if (keyframes.length === 0) {
    return { ...DEFAULT_STATE };
  }

  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];

  // Before first keyframe: hidden
  if (frame < first.frame) {
    return {
      stage: "hidden",
      x: first.x ?? 0,
      y: first.y ?? 24,
      scale: first.scale ?? 0.94,
      opacity: 0,
      highlightProgress: 0,
      focusGlow: 0,
      rotate: first.rotate ?? 0,
      rotateX: first.rotateX ?? 0,
      rotateY: first.rotateY ?? 0,
      skewX: first.skewX ?? 0,
      blurPx: first.blurPx ?? 0,
      clipInsetTop: first.clipInsetTop ?? 0,
      clipInsetRight: first.clipInsetRight ?? 0,
      clipInsetBottom: first.clipInsetBottom ?? 0,
      clipInsetLeft: first.clipInsetLeft ?? 0,
    };
  }

  // At or after last keyframe: clamped to final state
  if (frame >= last.frame) {
    return {
      stage: last.stage,
      x: last.x ?? 0,
      y: last.y ?? 0,
      scale: last.scale ?? 1,
      opacity: last.opacity ?? (last.stage === "exit" ? 0 : 1),
      highlightProgress: last.highlightProgress ?? 0,
      focusGlow: last.focusGlow ?? 0,
      rotate: last.rotate ?? 0,
      rotateX: last.rotateX ?? 0,
      rotateY: last.rotateY ?? 0,
      skewX: last.skewX ?? 0,
      blurPx: last.blurPx ?? 0,
      clipInsetTop: last.clipInsetTop ?? 0,
      clipInsetRight: last.clipInsetRight ?? 0,
      clipInsetBottom: last.clipInsetBottom ?? 0,
      clipInsetLeft: last.clipInsetLeft ?? 0,
    };
  }

  // Locate bounding keyframe interval [k0, k1]
  let k0 = first;
  let k1 = last;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame && frame < keyframes[i + 1].frame) {
      k0 = keyframes[i];
      k1 = keyframes[i + 1];
      break;
    }
  }

  const span = Math.max(1, k1.frame - k0.frame);
  const elapsed = frame - k0.frame;

  // Use spring if defined, else smooth bezier interpolation
  let progress: number;
  if (k1.springConfig) {
    progress = spring({
      frame: elapsed,
      fps,
      config: k1.springConfig,
      durationInFrames: span,
    });
  } else {
    progress = interpolate(elapsed, [0, span], [0, 1], {
      easing: EASINGS.editorial,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const currentStage: LayerStage = progress > 0.5 ? k1.stage : k0.stage;

  const interp = (v0?: number, v1?: number, fallback: number = 0): number => {
    const start = v0 ?? fallback;
    const end = v1 ?? start;
    const val = start + (end - start) * progress;
    return Number.isFinite(val) ? val : fallback;
  };

  return {
    stage: currentStage,
    x: interp(k0.x, k1.x, 0),
    y: interp(k0.y, k1.y, 0),
    scale: interp(k0.scale, k1.scale, 1),
    opacity: Math.max(0, Math.min(1, interp(k0.opacity, k1.opacity, 1))),
    highlightProgress: Math.max(
      0,
      Math.min(1, interp(k0.highlightProgress, k1.highlightProgress, 0))
    ),
    focusGlow: Math.max(0, Math.min(1, interp(k0.focusGlow, k1.focusGlow, 0))),
    rotate: interp(k0.rotate, k1.rotate, 0),
    rotateX: interp(k0.rotateX, k1.rotateX, 0),
    rotateY: interp(k0.rotateY, k1.rotateY, 0),
    skewX: interp(k0.skewX, k1.skewX, 0),
    blurPx: Math.max(0, interp(k0.blurPx, k1.blurPx, 0)),
    clipInsetTop: Math.max(0, Math.min(100, interp(k0.clipInsetTop, k1.clipInsetTop, 0))),
    clipInsetRight: Math.max(0, Math.min(100, interp(k0.clipInsetRight, k1.clipInsetRight, 0))),
    clipInsetBottom: Math.max(0, Math.min(100, interp(k0.clipInsetBottom, k1.clipInsetBottom, 0))),
    clipInsetLeft: Math.max(0, Math.min(100, interp(k0.clipInsetLeft, k1.clipInsetLeft, 0))),
  };
}

// ============================================================================
// Sub-Beat Progressive Disclosure (buildSubBeatChoreography)
// ============================================================================

export const WordTimestampSchema = z.object({
  word: z.string(),
  startSec: z.number().finite(),
  endSec: z.number().finite(),
});

export type WordTimestamp = z.infer<typeof WordTimestampSchema>;

export type SubBeatPhaseKind =
  | "enter"
  | "camera-focus"
  | "highlight-secondary"
  | "settle-dock";

export const SubBeatMicroCueSchema = z.object({
  index: z.number().int().nonnegative(),
  phase: z.enum(["enter", "camera-focus", "highlight-secondary", "settle-dock"]),
  stage: z.enum(["hidden", "enter", "hold", "focus", "dock", "highlight", "nudge", "exit"]),
  normalizedRatio: z.number().min(0).max(1),
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
  endFrame: z.number().int().nonnegative(),
  anchorWord: z.string().optional(),
  syncedToWord: z.boolean(),
  motionHint: z.string().optional(),
});

export type SubBeatMicroCue = z.infer<typeof SubBeatMicroCueSchema>;

export interface SubBeatChoreographyOptions {
  durationInFrames: number;
  fps?: number;
  startFrame?: number;
  beatStartSec?: number;
  /** Minimum beat duration in seconds to trigger 4-phase progressive disclosure (default 3.2s) */
  thresholdSec?: number;
  wordTimestamps?: readonly WordTimestamp[];
  /** Whether the 0.85 settle/dock phase translates to dock coordinates or subtle in-place settle */
  dockMode?: "subtle-settle" | "side-dock" | "bar-settle";
  includeNudgeOnSalience?: boolean;
  exitDurationFrames?: number;
  enterMotion?: string;
  cameraFocusMotion?: string;
  secondaryMotion?: string;
  dockTarget?: Partial<Pick<LayerState, "x" | "y" | "scale" | "opacity">>;
}

export interface SubBeatChoreographyPlan {
  isSubdivided: boolean;
  durationSec: number;
  durationInFrames: number;
  fps: number;
  microBeats: SubBeatMicroCue[];
  lifecycle: LayerLifecyclePlan;
}

function scoreWordSalience(word: string): number {
  const clean = word.trim();
  if (!clean) return 0;
  let score = 0;
  if (/[$€£%0-9]/.test(clean)) score += 6;
  if (/\b(trillion|billion|million|percent|debt|default|veto|crash|shock|record|table)\b/i.test(clean)) {
    score += 4;
  }
  if (/^[A-Z][a-z]{2,}/.test(clean)) score += 2;
  if (clean.replace(/[^A-Za-z]/g, "").length >= 7) score += 1;
  return score;
}

interface NormalizedWord {
  word: string;
  ratio: number;
  salience: number;
}

function normalizeWordsToBeat(
  words: readonly WordTimestamp[] | undefined,
  durationSec: number,
  explicitBeatStartSec?: number
): NormalizedWord[] {
  if (!words || words.length === 0 || durationSec <= 0) {
    return [];
  }

  let originSec = explicitBeatStartSec ?? 0;
  if (explicitBeatStartSec === undefined && words[0].startSec > durationSec * 0.95) {
    originSec = words[0].startSec;
  }

  const out: NormalizedWord[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!Number.isFinite(w.startSec)) continue;
    const relSec = w.startSec - originSec;
    if (relSec < -0.05 || relSec > durationSec + 0.05) continue;
    const ratio = Math.max(0, Math.min(1, relSec / durationSec));
    out.push({
      word: w.word,
      ratio,
      salience: scoreWordSalience(w.word),
    });
  }
  return out;
}

function snapRatioToWord(
  targetRatio: number,
  windowHalfWidth: number,
  words: readonly NormalizedWord[],
  minRatio: number,
  maxRatio: number
): { ratio: number; anchorWord?: string; synced: boolean } {
  const clampedTarget = Math.max(minRatio, Math.min(maxRatio, targetRatio));
  if (words.length === 0) {
    return { ratio: clampedTarget, synced: false };
  }

  const lo = Math.max(minRatio, clampedTarget - windowHalfWidth);
  const hi = Math.min(maxRatio, clampedTarget + windowHalfWidth);

  let best: NormalizedWord | undefined;
  let bestScore = -1e9;

  for (let i = 0; i < words.length; i++) {
    const cand = words[i];
    if (cand.ratio < lo || cand.ratio > hi) continue;
    const distPenalty = (Math.abs(cand.ratio - clampedTarget) / Math.max(0.01, windowHalfWidth)) * 5;
    const score = cand.salience - distPenalty;
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }

  if (!best) {
    return { ratio: clampedTarget, synced: false };
  }

  return {
    ratio: Math.max(minRatio, Math.min(maxRatio, best.ratio)),
    anchorWord: best.word,
    synced: true,
  };
}

/**
 * Sub-Beat Progressive Disclosure:
 * Automatically subdivides any beat > 3.2s into 4 timed internal micro-beats:
 *   - 0.00: enter
 *   - 0.28: camera / focus shift
 *   - 0.55: highlight / secondary action
 *   - 0.85: settle / dock
 * Snaps internal cue points to salient spoken word timestamps when provided.
 */
export function buildSubBeatChoreography(
  options: SubBeatChoreographyOptions
): SubBeatChoreographyPlan;
export function buildSubBeatChoreography(
  durationInFrames: number,
  fps?: number,
  wordTimestamps?: readonly WordTimestamp[],
  extra?: Omit<SubBeatChoreographyOptions, "durationInFrames" | "fps" | "wordTimestamps">
): SubBeatChoreographyPlan;
export function buildSubBeatChoreography(
  arg1: SubBeatChoreographyOptions | number,
  arg2?: number,
  arg3?: readonly WordTimestamp[],
  arg4?: Omit<SubBeatChoreographyOptions, "durationInFrames" | "fps" | "wordTimestamps">
): SubBeatChoreographyPlan {
  const opts: SubBeatChoreographyOptions =
    typeof arg1 === "number"
      ? {
          durationInFrames: arg1,
          fps: arg2,
          wordTimestamps: arg3,
          ...(arg4 ?? {}),
        }
      : arg1;

  const safeFps = Math.max(1, Number.isFinite(opts.fps ?? 30) ? (opts.fps ?? 30) : 30);
  const safeDurationFrames = Math.max(
    1,
    Math.round(Number.isFinite(opts.durationInFrames) ? opts.durationInFrames : safeFps * 3)
  );
  const baseFrame = Math.max(0, Math.round(opts.startFrame ?? 0));
  const durationSec = safeDurationFrames / safeFps;
  const thresholdSec = opts.thresholdSec ?? 3.2;
  const normWords = normalizeWordsToBeat(opts.wordTimestamps, durationSec, opts.beatStartSec);

  const exitDur =
    opts.exitDurationFrames ??
    (safeDurationFrames >= 24 ? Math.min(12, Math.floor(safeDurationFrames / 6)) : 0);

  // Short beats (<= 3.2s): clean single-entry hold + optional exit (zero mid-beat clutter)
  if (durationSec <= thresholdSec) {
    const enterDur = Math.min(12, Math.max(1, Math.floor(safeDurationFrames * 0.35)));
    const enterAnchor = normWords[0]?.word;
    const microBeats: SubBeatMicroCue[] = [
      {
        index: 0,
        phase: "enter",
        stage: "enter",
        normalizedRatio: 0,
        startFrame: baseFrame,
        durationFrames: enterDur,
        endFrame: baseFrame + enterDur,
        ...(enterAnchor ? { anchorWord: enterAnchor } : {}),
        syncedToWord: Boolean(enterAnchor),
        motionHint: opts.enterMotion ?? "blur-snap",
      },
    ];

    const lifecycle: LayerLifecyclePlan = {
      enterFrame: baseFrame,
      enterDuration: enterDur,
      initial: { x: 0, y: 18, scale: 0.96, opacity: 0 },
      entered: { x: 0, y: 0, scale: 1, opacity: 1 },
      ...(exitDur > 0
        ? {
            exitFrame: Math.max(baseFrame + enterDur, baseFrame + safeDurationFrames - exitDur),
            exitDuration: exitDur,
          }
        : {}),
    };

    return {
      isSubdivided: false,
      durationSec,
      durationInFrames: safeDurationFrames,
      fps: safeFps,
      microBeats,
      lifecycle,
    };
  }

  // Extended beats (> 3.2s): 4-phase progressive disclosure (0.00, 0.28, 0.55, 0.85)
  const enterDur = Math.min(12, Math.max(6, Math.floor(safeDurationFrames * 0.12)));
  const focusDur = Math.min(14, Math.max(8, Math.floor(safeDurationFrames * 0.11)));
  const highlightDur = Math.min(18, Math.max(10, Math.floor(safeDurationFrames * 0.14)));
  const dockDur = Math.min(14, Math.max(8, Math.floor(safeDurationFrames * 0.10)));

  const focusSnap = snapRatioToWord(0.28, 0.09, normWords, 0.18, 0.40);
  const highlightSnap = snapRatioToWord(
    0.55,
    0.10,
    normWords,
    Math.max(0.44, focusSnap.ratio + 0.14),
    0.70
  );
  const settleSnap = snapRatioToWord(
    0.85,
    0.07,
    normWords,
    Math.max(0.76, highlightSnap.ratio + 0.14),
    0.91
  );

  const enterStart = baseFrame;
  const enterEnd = enterStart + enterDur;

  const focusStart = Math.max(
    enterEnd + 2,
    baseFrame + Math.round(focusSnap.ratio * safeDurationFrames)
  );
  const focusEnd = focusStart + focusDur;

  const highlightStart = Math.max(
    focusEnd + 2,
    baseFrame + Math.round(highlightSnap.ratio * safeDurationFrames)
  );
  const highlightEnd = highlightStart + highlightDur;

  const maxSettleStart = Math.max(
    highlightEnd + 2,
    baseFrame + safeDurationFrames - exitDur - dockDur - 2
  );
  const settleStart = Math.min(
    maxSettleStart,
    Math.max(highlightEnd + 2, baseFrame + Math.round(settleSnap.ratio * safeDurationFrames))
  );
  const settleEnd = Math.min(baseFrame + safeDurationFrames, settleStart + dockDur);

  const enterAnchor = normWords[0]?.word;
  const microBeats: SubBeatMicroCue[] = [
    {
      index: 0,
      phase: "enter",
      stage: "enter",
      normalizedRatio: 0.0,
      startFrame: enterStart,
      durationFrames: enterDur,
      endFrame: enterEnd,
      ...(enterAnchor ? { anchorWord: enterAnchor } : {}),
      syncedToWord: Boolean(enterAnchor),
      motionHint: opts.enterMotion ?? "slide-up",
    },
    {
      index: 1,
      phase: "camera-focus",
      stage: "focus",
      normalizedRatio: Number(((focusStart - baseFrame) / safeDurationFrames).toFixed(4)),
      startFrame: focusStart,
      durationFrames: focusDur,
      endFrame: focusEnd,
      ...(focusSnap.anchorWord ? { anchorWord: focusSnap.anchorWord } : {}),
      syncedToWord: focusSnap.synced,
      motionHint: opts.cameraFocusMotion ?? "camera-dolly-in",
    },
    {
      index: 2,
      phase: "highlight-secondary",
      stage: "highlight",
      normalizedRatio: Number(((highlightStart - baseFrame) / safeDurationFrames).toFixed(4)),
      startFrame: highlightStart,
      durationFrames: highlightDur,
      endFrame: highlightEnd,
      ...(highlightSnap.anchorWord ? { anchorWord: highlightSnap.anchorWord } : {}),
      syncedToWord: highlightSnap.synced,
      motionHint: opts.secondaryMotion ?? "highlight-sweep",
    },
    {
      index: 3,
      phase: "settle-dock",
      stage: "dock",
      normalizedRatio: Number(((settleStart - baseFrame) / safeDurationFrames).toFixed(4)),
      startFrame: settleStart,
      durationFrames: Math.max(1, settleEnd - settleStart),
      endFrame: settleEnd,
      ...(settleSnap.anchorWord ? { anchorWord: settleSnap.anchorWord } : {}),
      syncedToWord: settleSnap.synced,
      motionHint: "archive-page-breath",
    },
  ];

  const dockMode = opts.dockMode ?? "subtle-settle";
  const defaultDockTarget =
    dockMode === "side-dock"
      ? { x: 0, y: 72, scale: 0.92, opacity: 0.98 }
      : dockMode === "bar-settle"
        ? { x: 0, y: 6, scale: 0.98, opacity: 1.0 }
        : { x: 0, y: 0, scale: 1.0, opacity: 1.0 };

  const dockState = {
    ...defaultDockTarget,
    ...(opts.dockTarget ?? {}),
  };

  const lifecycle: LayerLifecyclePlan = {
    enterFrame: enterStart,
    enterDuration: enterDur,
    focusFrame: focusStart,
    focusDuration: focusDur,
    highlightFrame: highlightStart,
    highlightDuration: highlightDur,
    dockFrame: settleStart,
    dockDuration: Math.max(1, settleEnd - settleStart),
    initial: { x: 0, y: 20, scale: 0.96, opacity: 0 },
    entered: { x: 0, y: 0, scale: 1.0, opacity: 1.0 },
    focused: { x: 0, y: -2, scale: 1.028, opacity: 1.0, focusGlow: 0.85 },
    docked: {
      x: dockState.x,
      y: dockState.y,
      scale: dockState.scale,
      opacity: dockState.opacity,
      highlightProgress: 1.0,
      focusGlow: 0.15,
    },
  };

  if (opts.includeNudgeOnSalience && highlightSnap.synced) {
    lifecycle.nudgeFrame = highlightStart + 2;
    lifecycle.nudgeDuration = 8;
  }

  if (exitDur > 0 && baseFrame + safeDurationFrames - exitDur > settleEnd) {
    lifecycle.exitFrame = baseFrame + safeDurationFrames - exitDur;
    lifecycle.exitDuration = exitDur;
  }

  return {
    isSubdivided: true,
    durationSec,
    durationInFrames: safeDurationFrames,
    fps: safeFps,
    microBeats,
    lifecycle,
  };
}
