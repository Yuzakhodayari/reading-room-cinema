import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SfxCue, SfxName } from "../components/SfxCue";
import {
  buildSubBeatChoreography,
  LayerKeyframe,
  LayerLifecyclePlan,
  resolveLayerLifecycle,
  WordTimestamp,
} from "../design/choreography";
import {
  calcCameraMotion,
  calcEntryMotion,
  calcExitMotion,
  calcInPlaceMotion,
  CameraAction,
  clamp01,
  combineMotionStyles,
  compileMotionChannels,
  EntryAction,
  ExitAction,
  InPlaceAction,
  isCameraAction,
  isEntryAction,
  isExitAction,
  isInPlaceAction,
  MOTION_SPRINGS,
  MotionAction,
  MotionTransform,
  resolveMotionPrimitive,
  steppedHold,
  TrajectoryAction,
} from "./primitives";

export type {
  CameraAction,
  EntryAction,
  ExitAction,
  InPlaceAction,
  MotionAction,
  TrajectoryAction,
};

export interface ObjectAnimatorProps {
  children: React.ReactNode;
  // Primary action props (100% backward-compatible + fuzzy string alias support)
  enter?: EntryAction | (string & {});
  enterAction?: EntryAction | (string & {});
  enterDuration?: number;
  enterSpring?: keyof typeof MOTION_SPRINGS;
  exit?: ExitAction | (string & {});
  exitAction?: ExitAction | (string & {});
  exitDuration?: number;
  activeEffect?: InPlaceAction | (string & {});
  activeEffectStart?: number;
  activeEffectDuration?: number;
  loop?: InPlaceAction | (string & {});
  loopAction?: InPlaceAction | (string & {});
  camera?: CameraAction | (string & {});
  cameraAction?: CameraAction | (string & {});
  cameraStart?: number;
  cameraDuration?: number;
  // Timing & frame quantization
  atFrame?: number;
  duration?: number;
  durationFrames?: number;
  steppedFps?: number;
  // Multi-stage LayerLifecyclePlan (`enter -> focus -> highlight -> nudge -> dock -> exit`)
  lifecycle?: LayerKeyframe[] | LayerLifecyclePlan;
  autoSubdivideLongBeat?: boolean;
  wordTimestamps?: readonly WordTimestamp[];
  // 3D perspective & styling
  perspectivePx?: number;
  sfx?: SfxName;
  sfxExit?: SfxName;
  className?: string;
  style?: React.CSSProperties;
}

function coerceEntry(raw: string | undefined): EntryAction {
  if (!raw) return "pop-out";
  if (isEntryAction(raw)) return raw;
  const resolved = resolveMotionPrimitive(raw, "entry");
  return isEntryAction(resolved) ? resolved : "blur-snap";
}

function coerceExit(raw: string | undefined): ExitAction | undefined {
  if (!raw) return undefined;
  if (isExitAction(raw)) return raw;
  const resolved = resolveMotionPrimitive(raw, "exit");
  return isExitAction(resolved) ? resolved : "fade-blur-out";
}

function coerceInPlace(raw: string | undefined): InPlaceAction | undefined {
  if (!raw) return undefined;
  if (isInPlaceAction(raw)) return raw;
  const resolved = resolveMotionPrimitive(raw, "in-place");
  return isInPlaceAction(resolved) ? resolved : "highlight-sweep";
}

function coerceCamera(raw: string | undefined): CameraAction | undefined {
  if (!raw) return undefined;
  if (isCameraAction(raw)) return raw;
  const resolved = resolveMotionPrimitive(raw, "camera");
  return isCameraAction(resolved) ? resolved : "camera-dolly-in";
}

function splitShadowClauses(raw: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "(") depth++;
    else if (ch === ")" && depth > 0) depth--;
    else if (ch === "," && depth === 0) {
      const chunk = raw.slice(start, i).trim();
      if (chunk) parts.push(chunk);
      start = i + 1;
    }
  }
  const tail = raw.slice(start).trim();
  if (tail) parts.push(tail);
  return parts;
}

function convertBoxShadowToDropShadow(boxShadow: string, tintOverride?: string): string {
  const clauses = splitShadowClauses(boxShadow);
  const filters: string[] = [];
  for (const clause of clauses) {
    if (/\binset\b/i.test(clause)) continue;
    if (tintOverride) {
      const m = clause.match(/^(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+([\d.]+(?:px)?)/i);
      if (m) {
        const ox = m[1].endsWith("px") || m[1] === "0" ? m[1] : `${m[1]}px`;
        const oy = m[2].endsWith("px") || m[2] === "0" ? m[2] : `${m[2]}px`;
        const br = m[3].endsWith("px") ? m[3] : `${m[3]}px`;
        filters.push(`drop-shadow(${ox} ${oy} ${br} ${tintOverride})`);
        continue;
      }
    }
    filters.push(`drop-shadow(${clause})`);
  }
  return filters.join(" ");
}

function normalizeRimGlowTransform(
  mt: ReturnType<typeof calcInPlaceMotion> | undefined,
  action: InPlaceAction | undefined
): ReturnType<typeof calcInPlaceMotion> | undefined {
  if (!mt || !mt.boxShadow || action !== "glow-rim") return mt;
  const dropFilter = convertBoxShadowToDropShadow(mt.boxShadow, "rgba(191, 214, 234, 0.34)");
  const { boxShadow: _omitBoxShadow, ...rest } = mt;
  void _omitBoxShadow;
  return {
    ...rest,
    ...(dropFilter
      ? { filter: [mt.filter, dropFilter].filter(Boolean).join(" ") }
      : {}),
  };
}

/**
 * Unified Object Animator
 * Wraps any visual component with deterministic 2D/3D entry, exit, in-place mechanical/physics
 * loops, virtual camera trajectories, multi-stage `LayerLifecyclePlan` choreography,
 * 1100px perspective projection, polygon/inset `clipPath` wipes, optical blur, and SFX cues.
 */
export const ObjectAnimator: React.FC<ObjectAnimatorProps> = ({
  children,
  enter,
  enterAction,
  enterDuration = 12,
  enterSpring = "snappy",
  exit,
  exitAction,
  exitDuration = 12,
  activeEffect,
  activeEffectStart,
  activeEffectDuration = 24,
  loop,
  loopAction,
  camera,
  cameraAction,
  cameraStart,
  cameraDuration,
  atFrame = 0,
  duration,
  durationFrames,
  steppedFps,
  lifecycle,
  autoSubdivideLongBeat = false,
  wordTimestamps,
  perspectivePx = 1100,
  sfx,
  sfxExit,
  className,
  style,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frame = steppedFps ? steppedHold(rawFrame, steppedFps, fps) : rawFrame;
  const resolvedTotalDuration = duration ?? durationFrames;
  const safeEnterDur = Math.max(1, enterDuration);
  const safeExitDur = Math.max(1, exitDuration);

  const resolvedEnter = coerceEntry(enterAction ?? enter ?? (lifecycle ? undefined : "pop-out"));
  const hasExplicitEnter = Boolean(enterAction || enter || !lifecycle);
  const resolvedExit = coerceExit(exitAction ?? exit);
  const resolvedEffect = coerceInPlace(activeEffect);
  const resolvedLoop = coerceInPlace(loopAction ?? loop);
  const resolvedCamera = coerceCamera(cameraAction ?? camera);

  // Optional automatic sub-beat progressive disclosure for extended beats (> 3.2s)
  const effectiveLifecycle: LayerKeyframe[] | LayerLifecyclePlan | undefined =
    lifecycle ??
    (autoSubdivideLongBeat && resolvedTotalDuration !== undefined
      ? buildSubBeatChoreography({
          durationInFrames: resolvedTotalDuration,
          fps,
          startFrame: atFrame,
          wordTimestamps,
        }).lifecycle
      : undefined);

  const exitStartFrame =
    resolvedTotalDuration !== undefined
      ? atFrame + resolvedTotalDuration - safeExitDur
      : Infinity;

  // 1. Lifecycle boundary guards
  if (frame < atFrame) {
    return null;
  }
  if (resolvedTotalDuration !== undefined && frame >= atFrame + resolvedTotalDuration) {
    return null;
  }

  // 2. Multi-stage LayerLifecyclePlan (`enter -> focus -> highlight -> nudge -> dock -> exit`)
  let lifecycleTransform: MotionTransform | undefined;
  let lifecycleHighlight = 0;
  if (effectiveLifecycle) {
    const ls = resolveLayerLifecycle(frame, fps, effectiveLifecycle);
    if (ls.stage === "hidden" || ls.opacity <= 0.001) {
      return null;
    }
    const hasClip =
      ls.clipInsetTop > 0.01 ||
      ls.clipInsetRight > 0.01 ||
      ls.clipInsetBottom > 0.01 ||
      ls.clipInsetLeft > 0.01;
    const has3DRot = Math.abs(ls.rotateX) > 0.01 || Math.abs(ls.rotateY) > 0.01;
    lifecycleHighlight = ls.highlightProgress;
    const focusDropShadow =
      ls.focusGlow > 0.02
        ? `drop-shadow(0 14px 28px rgba(15, 25, 35, ${(0.22 * ls.focusGlow).toFixed(
            3
          )})) drop-shadow(0 0 ${(18 * ls.focusGlow).toFixed(1)}px rgba(143, 180, 217, ${(
            0.30 * ls.focusGlow
          ).toFixed(3)}))`
        : undefined;
    lifecycleTransform = compileMotionChannels({
      ...(Math.abs(ls.x) > 0.001 ? { translateX: ls.x } : {}),
      ...(Math.abs(ls.y) > 0.001 ? { translateY: ls.y } : {}),
      ...(Math.abs(ls.scale - 1) > 0.0005 ? { scale: ls.scale } : {}),
      ...(Math.abs(ls.rotate) > 0.01 ? { rotate: ls.rotate } : {}),
      ...(Math.abs(ls.rotateX) > 0.01 ? { rotateX: ls.rotateX } : {}),
      ...(Math.abs(ls.rotateY) > 0.01 ? { rotateY: ls.rotateY } : {}),
      ...(Math.abs(ls.skewX) > 0.01 ? { skewX: ls.skewX } : {}),
      ...(has3DRot ? { perspectivePx } : {}),
      ...(ls.blurPx > 0.01 ? { blurPx: ls.blurPx } : {}),
      ...(hasClip
        ? {
            clipInset: {
              top: ls.clipInsetTop,
              right: ls.clipInsetRight,
              bottom: ls.clipInsetBottom,
              left: ls.clipInsetLeft,
            },
          }
        : {}),
      opacity: ls.opacity,
      highlightProgress: ls.highlightProgress,
    });
    if (focusDropShadow) {
      lifecycleTransform = {
        ...lifecycleTransform,
        filter: [lifecycleTransform.filter, focusDropShadow].filter(Boolean).join(" "),
      };
    }
  }

  // 3. Entry animation progress
  let entryStyle: MotionTransform | undefined;
  if (hasExplicitEnter) {
    const enterElapsed = Math.max(0, frame - atFrame);
    const enterProgress = spring({
      frame: enterElapsed,
      fps,
      config: MOTION_SPRINGS[enterSpring] ?? MOTION_SPRINGS.snappy,
      durationInFrames: safeEnterDur,
    });
    entryStyle = calcEntryMotion(resolvedEnter, enterProgress);
  }

  // 4. Virtual camera / depth trajectory
  let cameraStyle: MotionTransform | undefined;
  if (resolvedCamera) {
    const camStart = cameraStart ?? atFrame;
    const camDur = cameraDuration ?? (resolvedTotalDuration ?? 60);
    cameraStyle = calcCameraMotion(resolvedCamera, frame, fps, camStart, camDur);
  }

  // 5. In-place active effect
  let inPlaceStyle: ReturnType<typeof calcInPlaceMotion> | undefined;
  if (resolvedEffect) {
    const effectStart = activeEffectStart ?? atFrame + safeEnterDur;
    inPlaceStyle = normalizeRimGlowTransform(
      calcInPlaceMotion(
        resolvedEffect,
        frame,
        fps,
        effectStart,
        activeEffectDuration
      ),
      resolvedEffect
    );
  }

  // 6. Continuous loop
  let loopStyle: ReturnType<typeof calcInPlaceMotion> | undefined;
  if (resolvedLoop) {
    loopStyle = normalizeRimGlowTransform(
      calcInPlaceMotion(resolvedLoop, frame, fps, atFrame, activeEffectDuration),
      resolvedLoop
    );
  }

  // 7. Exit animation progress
  let exitStyle: MotionTransform | undefined;
  if (resolvedExit && frame >= exitStartFrame) {
    const exitElapsed = Math.max(0, frame - exitStartFrame);
    const exitProgress = clamp01(exitElapsed / safeExitDur);
    exitStyle = calcExitMotion(resolvedExit, exitProgress);
  }

  const combinedStyles = combineMotionStyles(
    lifecycleTransform,
    entryStyle,
    cameraStyle,
    exitStyle,
    inPlaceStyle,
    loopStyle
  );

  // Convert any remaining unrounded wrapper boxShadow to silhouette-hugging drop-shadow
  // unless caller explicitly gave the wrapper its own rounded borderRadius.
  if (combinedStyles.boxShadow && !style?.borderRadius) {
    const converted = convertBoxShadowToDropShadow(combinedStyles.boxShadow);
    delete combinedStyles.boxShadow;
    if (converted) {
      combinedStyles.filter = [combinedStyles.filter, converted]
        .filter(Boolean)
        .join(" ");
    }
  }

  // Enforce 1100px perspective on any custom 3D rotateX/rotateY transform lacking perspective()
  if (
    combinedStyles.transform &&
    /rotate[XY]\(/.test(combinedStyles.transform) &&
    !/perspective\(/.test(combinedStyles.transform)
  ) {
    combinedStyles.transform = `perspective(${Math.round(perspectivePx)}px) ${combinedStyles.transform}`;
  }

  const showBorderTrace =
    resolvedEffect === "border-trace" || resolvedLoop === "border-trace";
  const borderProgress =
    resolvedEffect === "border-trace"
      ? (inPlaceStyle?.progress ?? 0)
      : (loopStyle?.progress ?? 0);

  const showSpotlight =
    resolvedEffect === "spotlight-vignette" || resolvedLoop === "spotlight-vignette";
  const spotlightProgress =
    resolvedEffect === "spotlight-vignette"
      ? (inPlaceStyle?.progress ?? 0)
      : (loopStyle?.progress ?? 0);

  const strikeOverlayActive =
    resolvedEffect === "red-pen-strike" ||
    resolvedEffect === "veto-ink-slash" ||
    resolvedLoop === "red-pen-strike" ||
    resolvedLoop === "veto-ink-slash";
  const strikeProgress = Math.max(
    inPlaceStyle?.highlightProgress ?? 0,
    loopStyle?.highlightProgress ?? 0,
    lifecycleHighlight > 0 && strikeOverlayActive ? lifecycleHighlight : 0
  );

  return (
    <>
      {sfx && atFrame !== undefined && (
        <SfxCue cue={sfx} atFrame={atFrame} volume={0.65} />
      )}
      {sfxExit && exitStartFrame !== Infinity && (
        <SfxCue cue={sfxExit} atFrame={exitStartFrame} volume={0.55} />
      )}

      <div
        className={className}
        style={{
          position: "relative",
          display: "inline-block",
          transformOrigin: combinedStyles.transformOrigin ?? "center center",
          backfaceVisibility: "hidden",
          ...combinedStyles,
          ...style,
        }}
      >
        {showSpotlight && spotlightProgress > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: "-32px",
              borderRadius: "36px",
              background:
                "radial-gradient(circle at 50% 50%, rgba(62, 106, 148, 0.24) 0%, rgba(250, 248, 243, 0.10) 45%, transparent 72%)",
              opacity: spotlightProgress,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
        )}

        {children}

        {strikeOverlayActive && strikeProgress > 0.01 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "4%",
              right: "4%",
              top: "50%",
              height: "3px",
              backgroundColor: "rgba(138, 44, 29, 0.82)",
              transform: `translateY(-50%) rotate(-2.2deg) scaleX(${clamp01(strikeProgress).toFixed(4)})`,
              transformOrigin: "left center",
              pointerEvents: "none",
              zIndex: 18,
            }}
          />
        )}

        {showBorderTrace && borderProgress > 0.01 && (
          <svg
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-2px",
              width: "calc(100% + 4px)",
              height: "calc(100% + 4px)",
              pointerEvents: "none",
              overflow: "visible",
              zIndex: 20,
            }}
          >
            <rect
              x="1"
              y="1"
              width="100%"
              height="100%"
              rx="20"
              ry="20"
              fill="none"
              stroke="rgba(143, 180, 217, 0.85)"
              strokeWidth="2.5"
              pathLength={100}
              strokeDasharray="36 64"
              strokeDashoffset={100 * (1 - borderProgress)}
            />
          </svg>
        )}
      </div>
    </>
  );
};
