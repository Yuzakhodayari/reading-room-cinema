import React, { useId } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  LayerKeyframe,
  LayerLifecyclePlan,
  LayerState,
  resolveLayerLifecycle,
} from "../../design/choreography";
import { OVER_FOOTAGE_PALETTE } from "../../design/tokens";
import { SfxCue, SfxName } from "../SfxCue";

export type GlassTint =
  | "navy-glass"
  | "navy"
  | "dark"
  | "warning"
  | "gold"
  | "light"
  | "neutral";

export interface LiquidGlassObjectProps {
  id?: string;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  tint?: GlassTint;
  style?: React.CSSProperties;
  className?: string;
  lifecycle?: LayerKeyframe[] | LayerLifecyclePlan;
  enableOpticalRefraction?: boolean;
  enableSpecularSweep?: boolean;
  enableSfx?: boolean;
  sfxEnterCue?: SfxName;
  sfxDockCue?: SfxName;
  sfxExitCue?: SfxName;
  displacementScale?: number;
  roughness?: number;
  blurAmount?: number;
  /** Perimeter curved optical bevel ring thickness in px (default 10) */
  bevelWidth?: number;
  /** Optional explicit specular rim light angle in degrees */
  specularTrackingDeg?: number;
  /** Specular caustic edge multiplier in [0, 2] (default 1.0) */
  causticIntensity?: number;
}

const NAVY_GLASS_BASE = {
  bg: OVER_FOOTAGE_PALETTE.glassPrimary,
  border: OVER_FOOTAGE_PALETTE.glassBorder,
  innerHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
  glow: "rgba(143, 180, 217, 0.42)",
  isDark: true,
};

const TINT_STYLES: Record<
  GlassTint,
  {
    bg: string;
    border: string;
    innerHairline: string;
    glow: string;
    isDark: boolean;
  }
> = {
  "navy-glass": NAVY_GLASS_BASE,
  navy: NAVY_GLASS_BASE,
  dark: NAVY_GLASS_BASE,
  light: {
    bg: "linear-gradient(135deg, rgba(28, 43, 58, 0.58) 0%, rgba(15, 25, 35, 0.54) 55%, rgba(28, 43, 58, 0.60) 100%)",
    border: OVER_FOOTAGE_PALETTE.glassBorder,
    innerHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
    glow: "rgba(191, 214, 234, 0.34)",
    isDark: true,
  },
  neutral: {
    bg: "linear-gradient(135deg, rgba(28, 43, 58, 0.58) 0%, rgba(15, 25, 35, 0.54) 55%, rgba(28, 43, 58, 0.60) 100%)",
    border: OVER_FOOTAGE_PALETTE.glassBorder,
    innerHairline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
    glow: "rgba(191, 214, 234, 0.34)",
    isDark: true,
  },
  warning: {
    bg: "linear-gradient(135deg, rgba(22, 34, 48, 0.64) 0%, rgba(15, 25, 35, 0.60) 55%, rgba(128, 42, 30, 0.58) 100%)",
    border: OVER_FOOTAGE_PALETTE.riskBorder,
    innerHairline: "rgba(255, 200, 185, 0.22)",
    glow: "rgba(226, 115, 88, 0.38)",
    isDark: true,
  },
  gold: {
    bg: OVER_FOOTAGE_PALETTE.glassPrimary,
    border: "rgba(191, 214, 234, 0.62)",
    innerHairline: "rgba(255, 255, 255, 0.18)",
    glow: "rgba(242, 223, 190, 0.34)",
    isDark: true,
  },
};

const STEADY_DEFAULT_STATE: LayerState = {
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

/**
 * Apple Liquid Glass Object (Over Footage — Silky Smoked-Navy Optical Crystal)
 * - Smooth optical blur(12px) saturate(165%) brightness(0.66)
 * - Multi-stop perimeter curved glass bevel, top-edge silk highlight & 1px specular caustic rim
 */
export const LiquidGlassObject: React.FC<LiquidGlassObjectProps> = ({
  id: propId,
  children,
  width,
  height,
  borderRadius = 26,
  tint = "navy-glass",
  style,
  className,
  lifecycle,
  enableOpticalRefraction = true,
  enableSpecularSweep = true,
  enableSfx = true,
  sfxEnterCue = "glass-enter",
  sfxDockCue = "glass-dock",
  sfxExitCue = "glass-exit",
  displacementScale: _displacementScale = 18,
  roughness: _roughness = 0.006,
  blurAmount = 12,
  bevelWidth = 10,
  specularTrackingDeg,
  causticIntensity = 1.0,
}) => {
  void _displacementScale;
  void _roughness;
  const reactId = useId().replace(/:/g, "_");
  const glassId = propId ?? `liquid-glass-${reactId}`;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Resolve dynamic motion lifecycle
  const state = lifecycle
    ? resolveLayerLifecycle(frame, fps, lifecycle)
    : STEADY_DEFAULT_STATE;

  if (state.opacity <= 0.001) {
    return null;
  }

  const tintConfig = TINT_STYLES[tint];

  // Specular rim light angle tracking + smooth diagonal glint sweep
  const motionAngleBias = (state.x * 0.08 + state.rotateY * 1.4) % 45;
  const specularAngle =
    specularTrackingDeg ?? 128 + Math.sin(frame * 0.035) * 26 + motionAngleBias;
  const clampedCaustic = Math.max(0, Math.min(2, causticIntensity));
  const specularIntensity = (0.45 + state.focusGlow * 0.4) * clampedCaustic;
  const glintCycle = (frame % 90) / 90;
  const glintSweepX =
    state.highlightProgress > 0
      ? interpolate(state.highlightProgress, [0, 1], [-65, 165], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(glintCycle, [0, 1], [-70, 170], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  let enterFrame: number | undefined;
  let dockFrame: number | undefined;
  let exitFrame: number | undefined;

  if (lifecycle && !Array.isArray(lifecycle)) {
    enterFrame = lifecycle.enterFrame;
    dockFrame = lifecycle.dockFrame;
    exitFrame = lifecycle.exitFrame;
  }

  const has3DRot =
    Math.abs(state.rotateX) > 0.01 || Math.abs(state.rotateY) > 0.01;
  const transformParts: string[] = [];
  if (has3DRot) transformParts.push("perspective(1200px)");
  transformParts.push(
    `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0)`
  );
  transformParts.push(`scale(${state.scale.toFixed(4)})`);
  if (Math.abs(state.rotate) > 0.01) {
    transformParts.push(`rotate(${state.rotate.toFixed(2)}deg)`);
  }
  if (Math.abs(state.rotateX) > 0.01) {
    transformParts.push(`rotateX(${state.rotateX.toFixed(2)}deg)`);
  }
  if (Math.abs(state.rotateY) > 0.01) {
    transformParts.push(`rotateY(${state.rotateY.toFixed(2)}deg)`);
  }
  if (Math.abs(state.skewX) > 0.01) {
    transformParts.push(`skewX(${state.skewX.toFixed(2)}deg)`);
  }

  const hasClip =
    state.clipInsetTop > 0.05 ||
    state.clipInsetRight > 0.05 ||
    state.clipInsetBottom > 0.05 ||
    state.clipInsetLeft > 0.05;

  const rimAlphaPrimary = Math.min(0.95, 0.78 * clampedCaustic).toFixed(2);
  const rimAlphaSecondary = Math.min(0.9, 0.62 * clampedCaustic).toFixed(2);

  return (
    <>
      {/* 1. Synced Procedural SFX Audio Cues */}
      {enableSfx && (
        <>
          {enterFrame !== undefined && (
            <SfxCue cue={sfxEnterCue} atFrame={enterFrame} volume={0.65} />
          )}
          {dockFrame !== undefined && (
            <SfxCue cue={sfxDockCue} atFrame={dockFrame} volume={0.55} />
          )}
          {exitFrame !== undefined && (
            <SfxCue cue={sfxExitCue} atFrame={exitFrame} volume={0.5} />
          )}
        </>
      )}

      {/* 2. Outer Transforming Container */}
      <div
        id={glassId}
        className={className}
        style={{
          position: "relative",
          width,
          height,
          transform: transformParts.join(" "),
          opacity: state.opacity,
          filter: state.blurPx > 0.15 ? `blur(${state.blurPx.toFixed(2)}px)` : undefined,
          clipPath: hasClip
            ? `inset(${state.clipInsetTop.toFixed(1)}% ${state.clipInsetRight.toFixed(
                1
              )}% ${state.clipInsetBottom.toFixed(1)}% ${state.clipInsetLeft.toFixed(
                1
              )}% round ${borderRadius}px)`
            : undefined,
          transformOrigin: "center center",
          ...style,
        }}
      >
        {/* 3. Glass Body Shell */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius,
            boxShadow: `
              0 22px 48px -12px rgba(15, 25, 35, 0.46),
              0 8px 20px -6px rgba(15, 25, 35, 0.28),
              inset 0 1.5px 2px rgba(255, 250, 240, 0.52),
              inset 0 -2px 5px rgba(169, 196, 222, 0.22),
              inset 0 0 0 1px ${tintConfig.innerHairline}
            `,
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {/* 4. Silky Smoked-Navy Optical Glass Layer (blur 12px + saturate 165% + brightness 0.66) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius,
              background: tintConfig.bg,
              backdropFilter: `blur(${blurAmount}px) saturate(165%) brightness(0.66)`,
              WebkitBackdropFilter: `blur(${blurAmount}px) saturate(165%) brightness(0.66)`,
              border: `1.25px solid ${tintConfig.border}`,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* 4b. Multi-Stop Curved Bevel Ring (perimeter-only optical edge depth, flat clear interior) */}
          {enableOpticalRefraction && bevelWidth > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius,
                padding: `${Math.max(2, bevelWidth)}px`,
                background: `linear-gradient(${(specularAngle + 22).toFixed(
                  1
                )}deg, rgba(255, 250, 240, 0.18) 0%, rgba(169, 196, 222, 0.07) 45%, rgba(15, 25, 35, 0.14) 100%)`,
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          )}

          {/* 5. Refined Top-Edge Silk Highlight + Subtle Bottom Ice Bounce */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius,
              background:
                "linear-gradient(180deg, rgba(255, 250, 240, 0.10) 0%, rgba(255, 250, 240, 0.02) 14%, transparent 42%, rgba(169, 196, 222, 0.08) 100%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* 6. Crisp 1px Caustic Rim & Gentle Specular Sweep */}
          {enableSpecularSweep && (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius,
                  padding: "1px",
                  background: `linear-gradient(${specularAngle.toFixed(
                    1
                  )}deg, rgba(255, 250, 240, ${rimAlphaPrimary}) 0%, rgba(169, 196, 222, 0.22) 48%, rgba(255, 250, 240, ${rimAlphaSecondary}) 100%)`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius,
                  background: `linear-gradient(115deg, transparent 34%, rgba(255, 250, 240, ${(
                    0.1 * specularIntensity
                  ).toFixed(3)}) 50%, transparent 66%)`,
                  transform: `translate3d(${glintSweepX.toFixed(2)}%, 0, 0)`,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
            </>
          )}

          {/* 7. Focus Glow Overlay */}
          {state.focusGlow > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius,
                boxShadow: `inset 0 0 28px ${tintConfig.glow}`,
                opacity: state.focusGlow,
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
          )}

          {/* 8. Glass Interior Content */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              width: "100%",
              height: "100%",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
