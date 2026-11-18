import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  LayerKeyframe,
  LayerLifecyclePlan,
  LayerState,
  resolveLayerLifecycle,
} from "../../design/choreography";
import { LAYOUT } from "../../design/tokens";

export type SafePlacementSlot =
  | "right-third"
  | "bottom-dock"
  | "top-bar"
  | "left-shoulder-wing"
  | "right-shoulder-wing"
  | "full-balanced";

export interface LayerPositionSpec {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
}

export interface ObjectLayerItem {
  id: string;
  content: React.ReactNode;
  lifecycle?: LayerKeyframe[] | LayerLifecyclePlan;
  position?: LayerPositionSpec;
  safePlacement?: SafePlacementSlot;
  zIndex?: number;
  style?: React.CSSProperties;
  className?: string;
}

export interface ObjectLayerProps {
  id: string;
  children: React.ReactNode;
  lifecycle?: LayerKeyframe[] | LayerLifecyclePlan;
  position?: LayerPositionSpec;
  safePlacement?: SafePlacementSlot;
  zIndex?: number;
  style?: React.CSSProperties;
  className?: string;
}

const STEADY_LAYER_STATE: LayerState = {
  stage: "enter",
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

export function resolveSafePlacementPosition(
  slot?: SafePlacementSlot
): LayerPositionSpec | undefined {
  if (!slot) return undefined;
  if (slot === "right-third") {
    return {
      left: LAYOUT.overFootageSafeZones.rightThird.left,
      top: LAYOUT.overFootageSafeZones.rightThird.top,
    };
  }
  if (slot === "bottom-dock") {
    return {
      left: LAYOUT.overFootageSafeZones.bottomDock.left,
      bottom: LAYOUT.overFootageSafeZones.bottomDock.bottom,
    };
  }
  if (slot === "top-bar") {
    return {
      left: LAYOUT.overFootageSafeZones.topBar.left,
      top: LAYOUT.overFootageSafeZones.topBar.top,
    };
  }
  if (slot === "left-shoulder-wing") {
    return {
      left: LAYOUT.overFootageSafeZones.leftShoulderWing.left,
      top: LAYOUT.overFootageSafeZones.leftShoulderWing.top,
    };
  }
  if (slot === "right-shoulder-wing") {
    return {
      right: LAYOUT.overFootageSafeZones.rightShoulderWing.right,
      top: LAYOUT.overFootageSafeZones.rightShoulderWing.top,
    };
  }
  return {
    left: LAYOUT.contentStage.x,
    top: LAYOUT.contentStage.y,
  };
}

/**
 * Individual layer wrapper resolving 2D/3D lifecycle transforms & safe-zone docking for its child.
 */
export const ObjectLayer: React.FC<ObjectLayerProps> = ({
  id,
  children,
  lifecycle,
  position,
  safePlacement,
  zIndex = 10,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const state = lifecycle
    ? resolveLayerLifecycle(frame, fps, lifecycle)
    : STEADY_LAYER_STATE;

  if (state.opacity <= 0.001) {
    return null;
  }

  const resolvedPos = position ?? resolveSafePlacementPosition(safePlacement);

  const has3D =
    Math.abs(state.rotateX) > 0.01 || Math.abs(state.rotateY) > 0.01;
  const transforms: string[] = [];
  if (has3D) transforms.push("perspective(1200px)");
  transforms.push(
    `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
  );
  transforms.push(`scale(${state.scale.toFixed(4)})`);
  if (Math.abs(state.rotate) > 0.01) {
    transforms.push(`rotate(${state.rotate.toFixed(2)}deg)`);
  }
  if (Math.abs(state.rotateX) > 0.01) {
    transforms.push(`rotateX(${state.rotateX.toFixed(2)}deg)`);
  }
  if (Math.abs(state.rotateY) > 0.01) {
    transforms.push(`rotateY(${state.rotateY.toFixed(2)}deg)`);
  }
  if (Math.abs(state.skewX) > 0.01) {
    transforms.push(`skewX(${state.skewX.toFixed(2)}deg)`);
  }

  const hasClip =
    state.clipInsetTop > 0.05 ||
    state.clipInsetRight > 0.05 ||
    state.clipInsetBottom > 0.05 ||
    state.clipInsetLeft > 0.05;

  return (
    <div
      id={`layer-${id}`}
      className={className}
      style={{
        position: "absolute",
        left: resolvedPos?.left,
        top: resolvedPos?.top,
        right: resolvedPos?.right,
        bottom: resolvedPos?.bottom,
        transform: transforms.join(" "),
        opacity: state.opacity,
        filter:
          state.blurPx > 0.15 ? `blur(${state.blurPx.toFixed(2)}px)` : undefined,
        clipPath: hasClip
          ? `inset(${state.clipInsetTop.toFixed(1)}% ${state.clipInsetRight.toFixed(
              1
            )}% ${state.clipInsetBottom.toFixed(1)}% ${state.clipInsetLeft.toFixed(1)}%)`
          : undefined,
        transformOrigin: "center center",
        zIndex,
        pointerEvents: "none",
        ...style,
      }}
    >
      <div style={{ pointerEvents: "auto" }}>{children}</div>
    </div>
  );
};

export interface ObjectLayerStageProps {
  layers?: ObjectLayerItem[];
  children?: React.ReactNode;
  width?: number;
  height?: number;
  /** Optional balanced 1920x1080 inner safe container flag for full-page compositions */
  balancedFullFrame?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * ObjectLayerStage orchestrates multiple independent floating objects
 * (cards, pills, markers, pointers, stickers) across a continuous video timeline.
 */
export const ObjectLayerStage: React.FC<ObjectLayerStageProps> = ({
  layers,
  children,
  width,
  height,
  balancedFullFrame = false,
  style,
  className,
}) => {
  return (
    <AbsoluteFill
      className={className}
      style={{
        width,
        height,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 1. Explicit layers passed via array */}
      {layers?.map((layer) => (
        <ObjectLayer
          key={layer.id}
          id={layer.id}
          lifecycle={layer.lifecycle}
          position={layer.position}
          safePlacement={layer.safePlacement}
          zIndex={layer.zIndex}
          style={layer.style}
          className={layer.className}
        >
          {layer.content}
        </ObjectLayer>
      ))}

      {/* 2. Declarative children layers */}
      {balancedFullFrame ? (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.contentStage.x,
            top: LAYOUT.contentStage.y,
            width: LAYOUT.contentStage.width,
            height: LAYOUT.contentStage.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </AbsoluteFill>
  );
};
