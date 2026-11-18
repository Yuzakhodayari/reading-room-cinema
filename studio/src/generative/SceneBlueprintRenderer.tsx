import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LiquidGlassObject } from "../components/glass/LiquidGlassObject";
import { PresenterDepthStage } from "../components/glass/PresenterDepthStage";
import { SourceBadge } from "../components/SourceBadge";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import {
  HighlighterStroke,
  ReadingRoomStage,
  ShakeImpactTrigger,
} from "../design/optics";
import {
  CINEMA_SPRINGS,
  OVER_FOOTAGE_PALETTE,
  RegisterId,
  RegisterPalette,
  REGISTERS,
} from "../design/tokens";
import { PropVaultRenderer } from "../registry/props";
import {
  BlueprintActor,
  BlueprintSurfaceMode,
  BlueprintThemeRegister,
  BlueprintTone,
  OverFootagePlacement,
  PropArchetype,
  resolvePhaseWindow,
  SceneBlueprint,
} from "./blueprintTypes";
import { IsometricDiorama3D } from "./IsometricDiorama3D";
import {
  BomVaporizerState,
  CarouselNodeState,
  CircularCarouselState,
  clamp01,
  evaluateMechanismAtFrame,
  evaluateTorqueScale,
  hashStringSeed,
  HydraulicSpillwayState,
  mulberry32,
  SandErosionState,
  TensionSnapState,
  TorqueScaleState,
} from "./physics2d";
import {
  resolveSetPieceBlueprint,
  SP01_SHOE_LABOR_VAPORIZER,
} from "./presetSetPieces";
import {
  samplePointAlongWaypoints,
  SolvedActorLayout,
  SolvedConnectorLayout,
  SolvedSceneLayout,
  solveSceneBlueprintLayout,
} from "./spatialSolver";

/**
 * Pillar #13 — Declarative SceneBlueprint Renderer (`SceneBlueprintRenderer.tsx`)
 *
 * Evaluates any `SceneBlueprint` through `spatialSolver.ts` and `physics2d.ts` at `(frame, fps)`
 * and renders all 9 actor kinds, all 6 connector kinds, masthead folio, chisel highlighter sweeps,
 * and archival source badge across all 5 `page` registers AND `over-footage` smoked-navy glass
 * or Behind-Presenter Depth Sandwich (`<PresenterDepthStage>`).
 */

export const ARCHETYPE_TO_PROP_ID: Readonly<Record<PropArchetype, string>> = {
  "running-shoe-bom": "hero-running-shoe-exploded-stack",
  "flip-whiteboard-iron": "hero-palo-alto-flip-whiteboard",
  "house-deed": "hero-claire-austin-house-rig",
  "port-crane": "hero-autonomous-port-gantry-2034",
  "scrip-wallet": "hero-closed-scrip-wallet-rig",
  "power-node": "hero-wattage-appliance-node",
  "jet-gate": "hero-empty-airline-gate-14a",
  "gpu-cluster": "hero-gpu-server-rack-tower",
  "roof-drone": "hero-roof-scan-insurance-drone",
  "transformer-coil": "hero-transformer-128-week-queue",
  "euv-lithography": "hero-asml-euv-kill-switch-rig",
  "naval-vls": "hero-carrier-vs-drone-exchange",
  "subsea-cable": "hero-subsea-cable-anchor-cut",
  "sovereign-bond": "hero-treasury-bond-vault",
  "vault-door": "hero-social-security-2032-dial",
  "generic-module": "hero-w2-withholding-guillotine",
};

export interface BlueprintSurfaceTheme {
  registerId: RegisterId;
  registerPalette: RegisterPalette;
  isDark: boolean;
  isOverFootage: boolean;
  cardBg: string;
  cardWellBg: string;
  cardBorder: string;
  cardOxfordRule: string;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  eyebrowInk: string;
  liabilityInk: string;
  solventInk: string;
  statutoryInk: string;
  capitalInk: string;
  riskWash: string;
  tealWash: string;
  textShadow?: string;
}

export function mapBlueprintRegisterToId(reg: BlueprintThemeRegister): RegisterId {
  if (reg === "paper_editorial" || reg === "page_editorial") {
    return "page_editorial";
  }
  return reg;
}

export function resolveBlueprintSurfaceTheme(
  themeRegister: BlueprintThemeRegister,
  surfaceMode: BlueprintSurfaceMode
): BlueprintSurfaceTheme {
  const regId = mapBlueprintRegisterToId(themeRegister);
  const reg = REGISTERS[regId];

  if (surfaceMode === "over-footage") {
    return {
      registerId: regId,
      registerPalette: reg,
      isDark: true,
      isOverFootage: true,
      cardBg: "rgba(15, 25, 35, 0.62)",
      cardWellBg: OVER_FOOTAGE_PALETTE.glassDarkWell,
      cardBorder: "rgba(255, 255, 255, 0.34)",
      cardOxfordRule: OVER_FOOTAGE_PALETTE.accentPrimary,
      inkPrimary: OVER_FOOTAGE_PALETTE.textHeadline,
      inkSecondary: OVER_FOOTAGE_PALETTE.textBody,
      inkMuted: OVER_FOOTAGE_PALETTE.textMuted,
      eyebrowInk: OVER_FOOTAGE_PALETTE.accentPrimary,
      liabilityInk: OVER_FOOTAGE_PALETTE.brickRedText,
      solventInk: OVER_FOOTAGE_PALETTE.chartSecondary,
      statutoryInk: OVER_FOOTAGE_PALETTE.accentPrimary,
      capitalInk: OVER_FOOTAGE_PALETTE.accentWarm,
      riskWash: OVER_FOOTAGE_PALETTE.riskFill,
      tealWash: "rgba(79, 179, 174, 0.20)",
      textShadow: OVER_FOOTAGE_PALETTE.textShadow,
    };
  }

  return {
    registerId: regId,
    registerPalette: reg,
    isDark: reg.isDark,
    isOverFootage: false,
    cardBg: reg.bg.elevated,
    cardWellBg: reg.bg.recessed,
    cardBorder: reg.rule.hairline,
    cardOxfordRule: reg.rule.oxford,
    inkPrimary: reg.ink.primary,
    inkSecondary: reg.ink.secondary,
    inkMuted: reg.ink.muted,
    eyebrowInk: reg.accent.liability,
    liabilityInk: reg.accent.liability,
    solventInk: reg.accent.solvent,
    statutoryInk: reg.accent.statutory,
    capitalInk: reg.accent.capital,
    riskWash: reg.isDark ? "rgba(224, 79, 51, 0.16)" : "rgba(163, 64, 46, 0.09)",
    tealWash: reg.isDark ? "rgba(108, 196, 161, 0.14)" : "rgba(47, 143, 139, 0.09)",
  };
}

export function resolveToneColor(
  tone: BlueprintTone | undefined,
  theme: BlueprintSurfaceTheme
): string {
  switch (tone) {
    case "crimson":
      return theme.liabilityInk;
    case "teal":
      return theme.solventInk;
    case "slate":
      return theme.statutoryInk;
    case "sand":
      return theme.capitalInk;
    case "muted":
      return theme.inkMuted;
    case "navy":
    default:
      return theme.inkPrimary;
  }
}

function formatCounterNumber(
  val: number,
  decimals: number = 0,
  prefix: string = "",
  suffix: string = ""
): string {
  const safeVal = Number.isFinite(val) ? val : 0;
  const absVal = Math.abs(safeVal);
  const fixed = absVal.toFixed(decimals);
  const parts = fixed.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedDigits = parts.join(".");

  if (safeVal < -0.00001) {
    if (prefix === "+") {
      return `-${formattedDigits}${suffix}`;
    }
    return `-${prefix}${formattedDigits}${suffix}`;
  }
  return `${prefix}${formattedDigits}${suffix}`;
}

export interface EvaluatedBlueprintPhysics {
  torqueByActorId: Record<string, TorqueScaleState>;
  spillwayByActorId: Record<
    string,
    { state: HydraulicSpillwayState; tierIndex: number }
  >;
  vaporizerByActorId: Record<string, BomVaporizerState>;
  erosionByActorId: Record<string, SandErosionState>;
  carouselNodeByActorId: Record<
    string,
    { state: CircularCarouselState; node: CarouselNodeState }
  >;
  carouselStates: CircularCarouselState[];
  tensionByConnectorId: Record<string, TensionSnapState>;
  activeTriggerProgressByTarget: Record<string, number>;
  shakeTriggers: ShakeImpactTrigger[];
}

export function evaluateBlueprintPhysics(
  blueprint: SceneBlueprint,
  frame: number,
  fps: number,
  totalFrames: number
): EvaluatedBlueprintPhysics {
  const torqueByActorId: Record<string, TorqueScaleState> = {};
  const spillwayByActorId: Record<
    string,
    { state: HydraulicSpillwayState; tierIndex: number }
  > = {};
  const vaporizerByActorId: Record<string, BomVaporizerState> = {};
  const erosionByActorId: Record<string, SandErosionState> = {};
  const carouselNodeByActorId: Record<
    string,
    { state: CircularCarouselState; node: CarouselNodeState }
  > = {};
  const carouselStates: CircularCarouselState[] = [];
  const tensionByConnectorId: Record<string, TensionSnapState> = {};

  const mechanisms = blueprint.mechanisms ?? [];
  for (let i = 0; i < mechanisms.length; i++) {
    const mech = mechanisms[i];
    const evaluated = evaluateMechanismAtFrame(mech, frame, fps, totalFrames);

    if (evaluated.kind === "torque-scale" && mech.kind === "torque-scale") {
      const targetId =
        mech.targetActorId ??
        blueprint.actors.find((a) => a.kind === "balance-scale")?.id;
      if (targetId) {
        torqueByActorId[targetId] = evaluated;
      }
    } else if (
      evaluated.kind === "hydraulic-spillway" &&
      mech.kind === "hydraulic-spillway"
    ) {
      const ids =
        mech.targetActorIds ??
        blueprint.actors
          .filter((a) => a.kind === "fluid-tank")
          .map((a) => a.id);
      for (let t = 0; t < ids.length; t++) {
        spillwayByActorId[ids[t]] = { state: evaluated, tierIndex: t };
      }
    } else if (
      evaluated.kind === "bom-vaporizer" &&
      mech.kind === "bom-vaporizer"
    ) {
      const targetId =
        mech.targetActorId ??
        blueprint.actors.find((a) => a.propRig?.slices !== undefined)?.id;
      if (targetId) {
        vaporizerByActorId[targetId] = evaluated;
      }
    } else if (
      evaluated.kind === "sand-erosion" &&
      mech.kind === "sand-erosion"
    ) {
      if (mech.targetActorId) {
        erosionByActorId[mech.targetActorId] = evaluated;
      }
    } else if (
      evaluated.kind === "circular-carousel" &&
      mech.kind === "circular-carousel"
    ) {
      carouselStates.push(evaluated);
      for (let n = 0; n < evaluated.nodes.length; n++) {
        const node = evaluated.nodes[n];
        carouselNodeByActorId[node.nodeId] = { state: evaluated, node };
      }
    } else if (
      evaluated.kind === "tension-snap" &&
      mech.kind === "tension-snap"
    ) {
      const connId =
        mech.targetConnectorId ??
        blueprint.connectors?.find((c) => c.severFlowOnTrigger)?.id ??
        blueprint.connectors?.[0]?.id;
      if (connId) {
        tensionByConnectorId[connId] = evaluated;
      }
    }
  }

  // Ensure every balance-scale actor has a deterministic torque state even on minimal LLM drafts
  for (let i = 0; i < blueprint.actors.length; i++) {
    const actor = blueprint.actors[i];
    if (
      actor.kind === "balance-scale" &&
      actor.balanceScale &&
      !torqueByActorId[actor.id]
    ) {
      torqueByActorId[actor.id] = evaluateTorqueScale(
        {
          id: `auto-torque-${actor.id}`,
          kind: "torque-scale",
          targetActorId: actor.id,
          leftWeight: actor.balanceScale.leftWeight,
          rightWeight: actor.balanceScale.rightWeight,
          releaseAtProgress: 0.14,
        },
        frame,
        fps,
        totalFrames
      );
    }
  }

  const activeTriggerProgressByTarget: Record<string, number> = {};
  const shakeTriggers: ShakeImpactTrigger[] = [];

  const triggers = blueprint.phaseTriggers ?? [];
  for (let i = 0; i < triggers.length; i++) {
    const trig = triggers[i];
    const win = resolvePhaseWindow(trig, totalFrames);
    const localP = clamp01(
      (frame - win.startFrame) / Math.max(1, win.durationFrames)
    );
    activeTriggerProgressByTarget[trig.targetId] = Math.max(
      activeTriggerProgressByTarget[trig.targetId] ?? 0,
      localP
    );
    if (trig.action === "slam-stamp" || trig.action === "cable-snap") {
      shakeTriggers.push({
        hitFrame: win.startFrame,
        intensity: trig.action === "slam-stamp" ? 0.85 : 0.7,
        wordCount: 4,
      });
    }
  }

  // Also register verdict-stamp actor slam frames for subtle anvil camera recoil
  for (let i = 0; i < blueprint.actors.length; i++) {
    const a = blueprint.actors[i];
    if (a.kind === "verdict-stamp" && a.verdictStamp && shakeTriggers.length === 0) {
      const hitFrame = Math.round(
        (a.verdictStamp.slamAtProgress ?? 0.62) * Math.max(30, totalFrames)
      );
      shakeTriggers.push({ hitFrame, intensity: 0.78, wordCount: 4 });
    }
  }

  return {
    torqueByActorId,
    spillwayByActorId,
    vaporizerByActorId,
    erosionByActorId,
    carouselNodeByActorId,
    carouselStates,
    tensionByConnectorId,
    activeTriggerProgressByTarget,
    shakeTriggers,
  };
}

// ============================================================================
// Actor Sub-Renderers (Part I: PropRig, MetricCounter, DocumentCard)
// ============================================================================

const BespokeMechanismFallbackSvg: React.FC<{
  width: number;
  height: number;
  ink: string;
  accent: string;
  frame: number;
}> = ({ width, height, ink, accent, frame }) => {
  const rot = (frame * 1.1) % 360;
  return (
    <svg width={width} height={height} viewBox="0 0 240 160">
      <rect
        x="18"
        y="16"
        width="204"
        height="128"
        rx="6"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        strokeDasharray="4 3"
        opacity="0.55"
      />
      <g transform={`translate(120, 80) rotate(${rot.toFixed(1)})`}>
        <circle cx="0" cy="0" r="34" fill="none" stroke={ink} strokeWidth="2.2" />
        <circle cx="0" cy="0" r="14" fill="none" stroke={accent} strokeWidth="2.2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={(Math.cos(rad) * 18).toFixed(1)}
              y1={(Math.sin(rad) * 18).toFixed(1)}
              x2={(Math.cos(rad) * 40).toFixed(1)}
              y2={(Math.sin(rad) * 40).toFixed(1)}
              stroke={ink}
              strokeWidth="2.4"
            />
          );
        })}
      </g>
    </svg>
  );
};

interface SharedActorViewProps {
  layout: SolvedActorLayout;
  theme: BlueprintSurfaceTheme;
  frame: number;
  fps: number;
  totalFrames: number;
  progress: number;
  compact: boolean;
  physics: EvaluatedBlueprintPhysics;
}

const PropRigActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  frame,
  fps,
  totalFrames,
  progress,
  compact,
  physics,
}) => {
  const data = layout.actor.propRig ?? {
    archetype: "generic-module" as PropArchetype,
    headline: layout.actor.id,
  };
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const resolvedPropId =
    data.propId ?? ARCHETYPE_TO_PROP_ID[data.archetype] ?? "hero-w2-withholding-guillotine";
  const vaporizer = physics.vaporizerByActorId[layout.id];

  // 1. 180-Degree 3D Whiteboard -> Cast-Iron Covenant Flip Mode
  if (
    data.archetype === "flip-whiteboard-iron" ||
    data.flipAtProgress !== undefined
  ) {
    const flipAt = data.flipAtProgress ?? 0.42;
    const flipFrame = Math.round(flipAt * totalFrames);
    const flipSp =
      frame >= flipFrame
        ? spring({
            frame: frame - flipFrame,
            fps,
            config: CINEMA_SPRINGS.editorialSnap,
          })
        : 0;
    const rotDeg = clamp01(flipSp) * 180;
    const showingBack = rotDeg >= 90;
    const displayRotY = showingBack ? rotDeg - 180 : rotDeg;

    const propW = Math.max(160, Math.round(layout.rect.width - 44));
    const propH = Math.max(
      96,
      Math.round(layout.rect.height - (compact ? 112 : 148))
    );

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          perspective: "1200px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "12px",
            backgroundColor: showingBack ? theme.cardWellBg : theme.cardBg,
            border: showingBack
              ? `2px solid ${theme.liabilityInk}`
              : `1px solid ${theme.cardBorder}`,
            padding: compact ? "14px 16px" : "18px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            transform: `rotateY(${displayRotY.toFixed(2)}deg)`,
            boxShadow: showingBack
              ? "0 16px 34px rgba(15, 25, 35, 0.24)"
              : "0 8px 22px rgba(15, 25, 35, 0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Cast-Iron Corner Rivets on Backface */}
          {showingBack &&
            [
              { top: 10, left: 10 },
              { top: 10, right: 10 },
              { bottom: 10, left: 10 },
              { bottom: 10, right: 10 },
            ].map((pos, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  ...pos,
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.liabilityInk,
                  opacity: 0.78,
                }}
              />
            ))}

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: showingBack ? theme.liabilityInk : theme.eyebrowInk,
                }}
              >
                {showingBack
                  ? data.backEyebrow ?? "CAST-IRON LIABILITY"
                  : data.eyebrow ?? "ABUNDANCE MODEL"}
              </span>
              {data.statusBadge && (
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backgroundColor: showingBack ? theme.riskWash : theme.tealWash,
                    color: showingBack ? theme.liabilityInk : theme.solventInk,
                    border: `1px solid ${showingBack ? theme.liabilityInk : theme.solventInk}`,
                  }}
                >
                  {data.statusBadge}
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: "6px",
                fontFamily: FONTS.serif,
                fontSize: compact ? "20px" : "25px",
                fontWeight: 700,
                lineHeight: 1.16,
                color: theme.inkPrimary,
                textShadow: theme.textShadow,
              }}
            >
              {showingBack
                ? data.backHeadline ?? "30-Year Fixed Loan Contract"
                : data.headline}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
              margin: "8px 0",
            }}
          >
            <PropVaultRenderer
              propId={
                showingBack ? "hero-mortgage-deed-30yr-iron" : resolvedPropId
              }
              width={propW}
              height={propH}
              frame={frame}
              progress={progress}
              paletteMode={theme.isDark ? "over-footage" : "page"}
              showAnnotations={false}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderTop: `1px solid ${theme.cardBorder}`,
              paddingTop: "8px",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "12.5px",
                color: theme.inkSecondary,
              }}
            >
              {showingBack ? data.backSublabel ?? data.sublabel : data.sublabel}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "15px",
                fontWeight: 700,
                color: showingBack ? theme.liabilityInk : accentColor,
                whiteSpace: "nowrap",
                ...TABULAR_NUM_STYLE,
              }}
            >
              {showingBack
                ? data.backMetricText ?? data.metricText
                : data.metricText}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Exploded Gravity & Bounce BOM Vaporizer Stack Mode
  if (data.slices && data.slices.length > 0) {
    const stackArenaH = Math.max(150, layout.rect.height - (compact ? 110 : 132));
    const scaleFactor = vaporizer
      ? Math.min(1, (stackArenaH - 18) / Math.max(1, vaporizer.totalInitialHeightPx))
      : 1;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: "12px",
          padding: compact ? "14px 16px" : "18px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {data.eyebrow && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: theme.eyebrowInk,
                }}
              >
                {data.eyebrow}
              </span>
            )}
            {data.metricText && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: accentColor,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {data.metricText}
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: "4px",
              fontFamily: FONTS.serif,
              fontSize: compact ? "19px" : "23px",
              fontWeight: 700,
              color: theme.inkPrimary,
              lineHeight: 1.15,
            }}
          >
            {data.headline}
          </div>
        </div>

        {/* Interactive Gravity + Damped-Bounce BOM Stack */}
        <div
          style={{
            position: "relative",
            flex: 1,
            margin: "10px 0",
            backgroundColor: theme.cardWellBg,
            borderRadius: "8px",
            border: `1px solid ${theme.cardBorder}`,
            overflow: "hidden",
          }}
        >
          {data.slices.map((slice, idx) => {
            const physSlice = vaporizer?.slices[idx];
            const hPx = Math.max(
              0,
              (physSlice ? physSlice.currentHeightPx : (slice.sharePct / 100) * 240) *
                scaleFactor
            );
            const bottomPx =
              8 +
              (physSlice
                ? physSlice.bottomOffsetPx * scaleFactor
                : idx * 34);
            const opacity = physSlice ? physSlice.opacity : 1;
            const driftX = physSlice ? physSlice.driftX : 0;
            const sqX = physSlice ? physSlice.squashScaleX : 1;
            const sqY = physSlice ? physSlice.squashScaleY : 1;
            const sliceTone = resolveToneColor(
              slice.tone ?? (slice.vaporizable ? "crimson" : "teal"),
              theme
            );

            return (
              <React.Fragment key={slice.id}>
                {opacity > 0.02 && hPx > 1.5 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "16px",
                      right: "16px",
                      bottom: `${bottomPx.toFixed(1)}px`,
                      height: `${Math.max(20, hPx - 3).toFixed(1)}px`,
                      opacity,
                      transform: `translate3d(${driftX.toFixed(1)}px, 0, 0) scale(${sqX.toFixed(
                        3
                      )}, ${sqY.toFixed(3)})`,
                      transformOrigin: "50% 100%",
                      backgroundColor: slice.vaporizable
                        ? theme.riskWash
                        : theme.cardBg,
                      border: `1.5px solid ${sliceTone}`,
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 12px",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: theme.inkPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {slice.label}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "12px",
                        fontWeight: 700,
                        color: sliceTone,
                        marginLeft: "8px",
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {slice.costText} ({slice.sharePct}%)
                    </span>
                  </div>
                )}

                {/* Deterministic Vapor Embers */}
                {physSlice &&
                  physSlice.embers.map((emb, eIdx) => (
                    <div
                      key={`${slice.id}-emb-${eIdx}`}
                      style={{
                        position: "absolute",
                        left: `calc(50% + ${emb.dx.toFixed(1)}px)`,
                        bottom: `${(bottomPx + 10 - emb.dy).toFixed(1)}px`,
                        width: `${(emb.radiusPx * 2).toFixed(1)}px`,
                        height: `${(emb.radiusPx * 2).toFixed(1)}px`,
                        borderRadius: "50%",
                        backgroundColor: theme.liabilityInk,
                        opacity: emb.opacity,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
              </React.Fragment>
            );
          })}
        </div>

        {data.sublabel && (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "12px",
              color: theme.inkSecondary,
            }}
          >
            {data.sublabel}
          </div>
        )}
      </div>
    );
  }

  // 3. Standard PropVaultRenderer Delegation (+ Bespoke Vector Crest Fallback)
  const propBoxW = Math.max(150, Math.round(layout.rect.width - 36));
  const propBoxH = Math.max(
    90,
    Math.round(layout.rect.height - (compact ? 104 : 138))
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {data.eyebrow && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.eyebrowInk,
              }}
            >
              {data.eyebrow}
            </span>
          )}
          {data.statusBadge && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "4px",
                backgroundColor: theme.cardWellBg,
                color: accentColor,
                border: `1px solid ${theme.cardBorder}`,
              }}
            >
              {data.statusBadge}
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: "5px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "21px",
            fontWeight: 700,
            lineHeight: 1.18,
            color: theme.inkPrimary,
            textShadow: theme.textShadow,
          }}
        >
          {data.headline}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          margin: "6px 0",
        }}
      >
        {resolvedPropId ? (
          <PropVaultRenderer
            propId={resolvedPropId}
            width={propBoxW}
            height={propBoxH}
            frame={frame}
            progress={progress}
            paletteMode={theme.isDark ? "over-footage" : "page"}
            showAnnotations={false}
          />
        ) : (
          <BespokeMechanismFallbackSvg
            width={propBoxW}
            height={propBoxH}
            ink={theme.inkPrimary}
            accent={accentColor}
            frame={frame}
          />
        )}
      </div>

      {(data.sublabel || data.metricText) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: `1px solid ${theme.cardBorder}`,
            paddingTop: "8px",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: "12px",
              lineHeight: 1.3,
              color: theme.inkSecondary,
            }}
          >
            {data.sublabel ?? ""}
          </span>
          {data.metricText && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "14px",
                fontWeight: 700,
                color: accentColor,
                whiteSpace: "nowrap",
                ...TABULAR_NUM_STYLE,
              }}
            >
              {data.metricText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const MetricCounterActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  progress,
  compact,
  physics,
}) => {
  const data = layout.actor.metricCounter ?? {
    label: layout.actor.id,
    fromValue: 0,
    toValue: 100,
  };
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const erosion = physics.erosionByActorId[layout.id];

  const startP = data.countStartProgress ?? 0.1;
  const endP = Math.max(startP + 0.08, data.countEndProgress ?? 0.72);
  const rawT = interpolate(progress, [startP, endP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const smoothT = rawT * rawT * (3 - 2 * rawT);

  const liveValue = erosion
    ? erosion.remainingUnits
    : data.fromValue + (data.toValue - data.fromValue) * smoothT;

  const formattedFigure = formatCounterNumber(
    liveValue,
    data.decimals ?? 0,
    data.prefix ?? "",
    data.suffix ?? ""
  );

  const chiselProg = interpolate(progress, [endP - 0.1, endP + 0.14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const figFontSize = compact
    ? 40
    : layout.rect.width < 460
      ? 52
      : 64;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: "12px",
        padding: compact ? "14px 18px" : "22px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div>
        {data.eyebrow && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: theme.eyebrowInk,
              marginBottom: "6px",
            }}
          >
            {data.eyebrow}
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "21px",
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.inkPrimary,
          }}
        >
          {data.label}
        </div>
      </div>

      {/* Hero Tabular Odometer Figure + Optional Chisel Highlighter Sweep */}
      <div style={{ position: "relative", margin: "8px 0" }}>
        {(layout.hasChiselHighlight || data.highlightChisel) && (
          <div
            style={{
              position: "absolute",
              left: "-4px",
              bottom: "2px",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <HighlighterStroke
              width={Math.min(layout.rect.width - 56, formattedFigure.length * figFontSize * 0.58)}
              height={Math.round(figFontSize * 0.44)}
              progress={chiselProg}
              register={theme.registerPalette}
              seed={hashStringSeed(layout.id) % 900}
            />
          </div>
        )}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: FONTS.mono,
            fontSize: `${figFontSize}px`,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            color: accentColor,
            textShadow: theme.textShadow,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {formattedFigure}
        </div>
      </div>

      <div>
        {data.deltaBadge && (
          <div
            style={{
              display: "inline-block",
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "4px 9px",
              borderRadius: "4px",
              backgroundColor:
                layout.actor.tone === "teal" ? theme.tealWash : theme.riskWash,
              color: accentColor,
              border: `1px solid ${accentColor}`,
              marginBottom: data.sublabel ? "8px" : "0",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {data.deltaBadge}
          </div>
        )}
        {data.sublabel && (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "12.5px",
              lineHeight: 1.35,
              color: theme.inkSecondary,
            }}
          >
            {data.sublabel}
          </div>
        )}

        {/* Crisp Progress Calibration Bar */}
        <div
          style={{
            marginTop: "10px",
            width: "100%",
            height: "4px",
            backgroundColor: theme.cardWellBg,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((erosion ? erosion.remainingRatio : smoothT) * 100).toFixed(1)}%`,
              height: "100%",
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const DocumentCardActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  progress,
  compact,
}) => {
  const data = layout.actor.documentCard ?? {
    title: layout.actor.id,
    rows: [],
  };
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "14px 16px" : "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {data.eyebrow && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.eyebrowInk,
              }}
            >
              {data.eyebrow}
            </span>
          )}
          {data.docCode && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                fontWeight: 600,
                color: theme.inkMuted,
                padding: "2px 7px",
                borderRadius: "4px",
                backgroundColor: theme.cardWellBg,
                border: `1px solid ${theme.cardBorder}`,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {data.docCode}
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "22px",
            fontWeight: 700,
            lineHeight: 1.18,
            color: theme.inkPrimary,
          }}
        >
          {data.title}
        </div>
        {data.subtitle && (
          <div
            style={{
              marginTop: "3px",
              fontFamily: FONTS.sans,
              fontSize: "12px",
              color: theme.inkSecondary,
            }}
          >
            {data.subtitle}
          </div>
        )}

        {/* Oxford Double Hairline Rule */}
        <div
          style={{
            marginTop: "10px",
            borderTop: `2px solid ${theme.cardOxfordRule}`,
            borderBottom: `1px solid ${theme.cardBorder}`,
            height: "3px",
          }}
        />
      </div>

      {/* Archival Ledger Rows */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          gap: "6px",
          margin: "8px 0",
        }}
      >
        {data.rows.map((row, idx) => {
          const rowTone = resolveToneColor(row.tone ?? "navy", theme);
          const strikeP = row.strike
            ? interpolate(
                progress,
                [
                  row.strikeAtProgress ?? 0.38,
                  (row.strikeAtProgress ?? 0.38) + 0.14,
                ],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            : 0;

          return (
            <div
              key={`${row.label}-${idx}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: compact ? "5px 8px" : "7px 10px",
                borderRadius: "6px",
                backgroundColor: row.highlight
                  ? row.tone === "teal"
                    ? theme.tealWash
                    : theme.riskWash
                  : theme.cardWellBg,
                border: row.highlight
                  ? `1px solid ${rowTone}`
                  : `1px solid transparent`,
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: compact ? "12px" : "13px",
                  fontWeight: 500,
                  color: theme.inkSecondary,
                }}
              >
                {row.label}
              </span>
              <div
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: compact ? "12px" : "13.5px",
                    fontWeight: 700,
                    color: rowTone,
                    opacity: strikeP > 0.6 ? 0.65 : 1,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {row.value}
                </span>
                {row.delta && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "3px",
                      backgroundColor: theme.riskWash,
                      color: theme.liabilityInk,
                    }}
                  >
                    {row.delta}
                  </span>
                )}
                {strikeP > 0.01 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "-4px",
                      right: "-4px",
                      top: "50%",
                      height: "2.4px",
                      backgroundColor: theme.liabilityInk,
                      transform: `scaleX(${strikeP.toFixed(3)}) rotate(-2deg)`,
                      transformOrigin: "0% 50%",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(data.footerNote || data.sealText) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${theme.cardBorder}`,
            paddingTop: "8px",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: "11.5px",
              fontStyle: "italic",
              color: theme.inkMuted,
            }}
          >
            {data.footerNote ?? ""}
          </span>
          {data.sealText && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "3px 8px",
                border: `1.5px solid ${accentColor}`,
                borderRadius: "4px",
                color: accentColor,
                transform: "rotate(-2.5deg)",
                whiteSpace: "nowrap",
              }}
            >
              {data.sealText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
// ============================================================================
// Actor Sub-Renderers (Part II: FluidTank, BalanceScale, Conveyor, Timeline, 3D, Stamp)
// ============================================================================

const FluidTankActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  frame,
  progress,
  compact,
  physics,
}) => {
  const data = layout.actor.fluidTank ?? {
    title: layout.actor.id,
    capacityLabel: "RESERVOIR",
    initialFill: 0.2,
    targetFill: 0.85,
  };
  const spill = physics.spillwayByActorId[layout.id];
  const erosion = physics.erosionByActorId[layout.id];
  const liquidTone = resolveToneColor(
    data.liquidTone ?? layout.actor.tone ?? "teal",
    theme
  );

  const smoothP = interpolate(progress, [0.06, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const easedP = smoothP * smoothP * (3 - 2 * smoothP);

  let fillRatio = data.initialFill + (data.targetFill - data.initialFill) * easedP;
  if (spill) {
    const idx = data.tierIndex ?? spill.tierIndex;
    if (spill.state.tierFills[idx] !== undefined) {
      fillRatio = spill.state.tierFills[idx];
    }
  } else if (erosion) {
    fillRatio = data.initialFill * erosion.remainingRatio;
  }
  const clampedFill = clamp01(fillRatio);

  const isOverflowing =
    (spill &&
      spill.state.tierOverflowing[data.tierIndex ?? spill.tierIndex]) ||
    (data.overflowThreshold !== undefined &&
      clampedFill >= data.overflowThreshold);

  const wavePhase = frame * 0.12;
  const wSvg = 260;
  const hSvg = 150;
  const ySurface = hSvg * (1 - clampedFill);
  const amp = clampedFill > 0.02 && clampedFill < 0.99 ? 3.5 : 0;
  const wavePath = [
    `M 0 ${hSvg}`,
    `L 0 ${(ySurface + Math.sin(wavePhase) * amp).toFixed(1)}`,
    `Q 65 ${(ySurface - Math.cos(wavePhase) * amp * 1.4).toFixed(1)} 130 ${(
      ySurface + Math.sin(wavePhase + 1.5) * amp
    ).toFixed(1)}`,
    `T ${wSvg} ${(ySurface - Math.sin(wavePhase) * amp).toFixed(1)}`,
    `L ${wSvg} ${hSvg}`,
    "Z",
  ].join(" ");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {data.eyebrow && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.eyebrowInk,
              }}
            >
              {data.eyebrow}
            </span>
          )}
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "14px",
              fontWeight: 700,
              color: liquidTone,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {Math.round(clampedFill * 100)}%
          </span>
        </div>
        <div
          style={{
            marginTop: "4px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "21px",
            fontWeight: 700,
            color: theme.inkPrimary,
            lineHeight: 1.18,
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10.5px",
            color: theme.inkMuted,
            marginTop: "2px",
            ...TABULAR_NUM_STYLE,
          }}
        >
          {data.capacityLabel}
        </div>
      </div>

      {/* Graduated Hydraulic Chamber */}
      <div
        style={{
          position: "relative",
          flex: 1,
          margin: "10px 0",
          borderRadius: "8px",
          border: `1.8px solid ${theme.inkPrimary}`,
          backgroundColor: theme.cardWellBg,
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${wSvg} ${hSvg}`}
          preserveAspectRatio="none"
          style={{ display: "block" }}
        >
          <path d={wavePath} fill={liquidTone} opacity={0.34} />
          <line
            x1="0"
            y1={ySurface}
            x2={wSvg}
            y2={ySurface}
            stroke={liquidTone}
            strokeWidth="2.2"
          />
          {[0.25, 0.5, 0.75].map((tick) => (
            <line
              key={tick}
              x1="0"
              y1={hSvg * (1 - tick)}
              x2="16"
              y2={hSvg * (1 - tick)}
              stroke={theme.inkMuted}
              strokeWidth="1.2"
            />
          ))}

          {/* Falling Sand / Drainage Grains */}
          {erosion &&
            erosion.streamActive &&
            erosion.grains.slice(0, 14).map((g) => (
              <circle
                key={g.index}
                cx={wSvg * 0.5 + g.lateralJitterPx * 2}
                cy={ySurface + g.fallProgress * Math.max(12, hSvg - ySurface)}
                r={g.radiusPx}
                fill={liquidTone}
                opacity={g.opacity}
              />
            ))}
        </svg>

        {isOverflowing && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              fontFamily: FONTS.mono,
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "4px",
              backgroundColor: theme.riskWash,
              color: theme.liabilityInk,
              border: `1px solid ${theme.liabilityInk}`,
            }}
          >
            SPILLWAY OVERFLOW
          </div>
        )}
      </div>

      {data.statusText && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: liquidTone,
            textAlign: "center",
          }}
        >
          {data.statusText}
        </div>
      )}
    </div>
  );
};

const BalanceScaleActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  compact,
  physics,
}) => {
  const data = layout.actor.balanceScale ?? {
    title: layout.actor.id,
    leftLabel: "Left",
    leftValueText: "100",
    leftWeight: 100,
    rightLabel: "Right",
    rightValueText: "100",
    rightWeight: 100,
  };
  const torque = physics.torqueByActorId[layout.id];
  const tiltDeg = torque ? torque.tiltDeg : 0;
  const rad = (tiltDeg * Math.PI) / 180;
  const halfBeam = 122;
  const leftTipX = 180 - Math.cos(rad) * halfBeam;
  const leftTipY = 74 - Math.sin(rad) * halfBeam;
  const rightTipX = 180 + Math.cos(rad) * halfBeam;
  const rightTipY = 74 + Math.sin(rad) * halfBeam;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {data.eyebrow && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.eyebrowInk,
              }}
            >
              {data.eyebrow}
            </span>
          )}
          {data.ratioBadge && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: theme.riskWash,
                color: theme.liabilityInk,
                border: `1px solid ${theme.liabilityInk}`,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {data.ratioBadge}
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: "4px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "21px",
            fontWeight: 700,
            color: theme.inkPrimary,
          }}
        >
          {data.title}
        </div>
      </div>

      {/* Torque Fulcrum & Plumb-Suspended Pans */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <svg width="100%" height="100%" viewBox="0 0 360 210">
          {/* Base & Fulcrum Pillar */}
          <line x1="126" y1="196" x2="234" y2="196" stroke={theme.inkPrimary} strokeWidth="3" />
          <polygon
            points="170,196 190,196 184,74 176,74"
            fill={theme.cardWellBg}
            stroke={theme.inkPrimary}
            strokeWidth="2"
          />
          <path
            d="M 152 74 A 28 28 0 0 1 208 74"
            fill="none"
            stroke={theme.inkMuted}
            strokeWidth="1.3"
            strokeDasharray="3 2"
          />

          {/* Tilting Steel Beam */}
          <line
            x1={leftTipX.toFixed(1)}
            y1={leftTipY.toFixed(1)}
            x2={rightTipX.toFixed(1)}
            y2={rightTipY.toFixed(1)}
            stroke={theme.inkPrimary}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="180" cy="74" r="6" fill={theme.liabilityInk} />

          {/* Left Plumb Pan */}
          <line
            x1={leftTipX.toFixed(1)}
            y1={leftTipY.toFixed(1)}
            x2={(leftTipX - 36).toFixed(1)}
            y2={(leftTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <line
            x1={leftTipX.toFixed(1)}
            y1={leftTipY.toFixed(1)}
            x2={(leftTipX + 36).toFixed(1)}
            y2={(leftTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <rect
            x={(leftTipX - 54).toFixed(1)}
            y={(leftTipY + 46).toFixed(1)}
            width="108"
            height="42"
            rx="5"
            fill={theme.cardWellBg}
            stroke={
              torque?.heavierSide === "left" ? theme.liabilityInk : theme.inkPrimary
            }
            strokeWidth="1.8"
          />
          <text
            x={leftTipX.toFixed(1)}
            y={(leftTipY + 64).toFixed(1)}
            textAnchor="middle"
            fill={theme.liabilityInk}
            fontFamily={FONTS.mono}
            fontSize="11"
            fontWeight="700"
          >
            {data.leftValueText}
          </text>
          <text
            x={leftTipX.toFixed(1)}
            y={(leftTipY + 79).toFixed(1)}
            textAnchor="middle"
            fill={theme.inkSecondary}
            fontFamily={FONTS.sans}
            fontSize="9.5"
          >
            {data.leftLabel.slice(0, 18)}
          </text>

          {/* Right Plumb Pan */}
          <line
            x1={rightTipX.toFixed(1)}
            y1={rightTipY.toFixed(1)}
            x2={(rightTipX - 36).toFixed(1)}
            y2={(rightTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <line
            x1={rightTipX.toFixed(1)}
            y1={rightTipY.toFixed(1)}
            x2={(rightTipX + 36).toFixed(1)}
            y2={(rightTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <rect
            x={(rightTipX - 54).toFixed(1)}
            y={(rightTipY + 46).toFixed(1)}
            width="108"
            height="42"
            rx="5"
            fill={theme.cardWellBg}
            stroke={
              torque?.heavierSide === "right" ? theme.solventInk : theme.inkPrimary
            }
            strokeWidth="1.8"
          />
          <text
            x={rightTipX.toFixed(1)}
            y={(rightTipY + 64).toFixed(1)}
            textAnchor="middle"
            fill={theme.solventInk}
            fontFamily={FONTS.mono}
            fontSize="11"
            fontWeight="700"
          >
            {data.rightValueText}
          </text>
          <text
            x={rightTipX.toFixed(1)}
            y={(rightTipY + 79).toFixed(1)}
            textAnchor="middle"
            fill={theme.inkSecondary}
            fontFamily={FONTS.sans}
            fontSize="9.5"
          >
            {data.rightLabel.slice(0, 18)}
          </text>
        </svg>
      </div>
    </div>
  );
};

const ConveyorBeltActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  frame,
  fps,
  compact,
}) => {
  const data = layout.actor.conveyorBelt ?? {
    title: layout.actor.id,
    items: [],
  };
  const speed = data.speedMultiplier ?? 1.2;
  const gateRatio = data.gateAtRatio ?? 0.62;
  const itemCount = Math.max(1, data.items.length);
  const beltPhase = ((frame / Math.max(1, fps)) * 0.24 * speed) % 1;
  const rollerDeg = (frame * 4.5 * speed) % 360;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div>
        {data.eyebrow && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.eyebrowInk,
            }}
          >
            {data.eyebrow}
          </div>
        )}
        <div
          style={{
            marginTop: "4px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "18px" : "21px",
            fontWeight: 700,
            color: theme.inkPrimary,
          }}
        >
          {data.title}
        </div>
      </div>

      {/* Motorized Roller Track & Gate */}
      <div
        style={{
          position: "relative",
          flex: 1,
          margin: "12px 0 4px",
          backgroundColor: theme.cardWellBg,
          borderRadius: "8px",
          border: `1px solid ${theme.cardBorder}`,
          overflow: "hidden",
        }}
      >
        {data.items.map((item, idx) => {
          const u = (beltPhase + idx / itemCount) % 1;
          const pastGate = u > gateRatio;
          const vapAlpha =
            item.vaporizeAtGate && pastGate
              ? clamp01(1 - (u - gateRatio) / Math.max(0.08, 1 - gateRatio))
              : 1;
          const itemTone = resolveToneColor(item.tone ?? "navy", theme);

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${(u * 88 - 8).toFixed(1)}%`,
                bottom: "36px",
                width: "118px",
                padding: "6px 8px",
                borderRadius: "6px",
                backgroundColor: theme.cardBg,
                border: `1.5px solid ${itemTone}`,
                opacity: vapAlpha,
                transform: `scale(${(0.86 + vapAlpha * 0.14).toFixed(3)})`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: theme.inkPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>
              {item.value && (
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: itemTone,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {item.value}
                </div>
              )}
            </div>
          );
        })}

        {/* Gate Arch */}
        {data.gateLabel && (
          <div
            style={{
              position: "absolute",
              left: `${(gateRatio * 100).toFixed(1)}%`,
              top: "8px",
              bottom: "28px",
              width: "2px",
              backgroundColor: theme.liabilityInk,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "0",
                left: "-36px",
                width: "74px",
                textAlign: "center",
                fontFamily: FONTS.mono,
                fontSize: "9.5px",
                fontWeight: 700,
                padding: "2px 4px",
                borderRadius: "4px",
                backgroundColor: theme.riskWash,
                color: theme.liabilityInk,
                border: `1px solid ${theme.liabilityInk}`,
              }}
            >
              {data.gateLabel}
            </span>
          </div>
        )}

        {/* Belt Rail & Rotating Sprockets */}
        <div
          style={{
            position: "absolute",
            left: "12px",
            right: "12px",
            bottom: "10px",
            height: "20px",
            borderRadius: "10px",
            border: `2px solid ${theme.inkPrimary}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 10px",
            boxSizing: "border-box",
          }}
        >
          {[0, 1, 2, 3, 4].map((rIdx) => (
            <div
              key={rIdx}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: `1.8px solid ${theme.inkPrimary}`,
                transform: `rotate(${rollerDeg.toFixed(1)}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TimelineTrackActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  progress,
  compact,
}) => {
  const data = layout.actor.timelineTrack ?? {
    title: layout.actor.id,
    milestones: [],
  };
  const ramp = interpolate(progress, [0.08, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const primaryFill = (data.progressTo ?? 0.85) * ramp;
  const secondaryFill = data.secondaryLane
    ? clamp01(data.secondaryLane.progressTo * Math.min(1, ramp * 1.9))
    : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: "12px",
        padding: compact ? "12px 16px" : "16px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div>
        {data.eyebrow && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.eyebrowInk,
            }}
          >
            {data.eyebrow}
          </div>
        )}
        <div
          style={{
            marginTop: "3px",
            fontFamily: FONTS.serif,
            fontSize: compact ? "17px" : "20px",
            fontWeight: 700,
            color: theme.inkPrimary,
          }}
        >
          {data.title}
        </div>
      </div>

      {/* Optional Secondary Fast-Deployment Lane (e.g. 6-Mo Coding Agent vs 10-Yr Grid) */}
      {data.secondaryLane && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: theme.cardWellBg,
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "12px",
                fontWeight: 600,
                color: theme.inkPrimary,
              }}
            >
              {data.secondaryLane.label}
            </span>
            {data.secondaryLane.metricText && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11.5px",
                  fontWeight: 700,
                  color: resolveToneColor(
                    data.secondaryLane.tone ?? "teal",
                    theme
                  ),
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {data.secondaryLane.metricText}
              </span>
            )}
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "4px",
              backgroundColor: theme.cardBg,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(secondaryFill * 100).toFixed(1)}%`,
                height: "100%",
                backgroundColor: resolveToneColor(
                  data.secondaryLane.tone ?? "teal",
                  theme
                ),
              }}
            />
          </div>
        </div>
      )}

      {/* Primary Milestone Axis */}
      <div style={{ position: "relative", paddingTop: "8px" }}>
        <div
          style={{
            height: "6px",
            borderRadius: "3px",
            backgroundColor: theme.cardWellBg,
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: `${(primaryFill * 100).toFixed(1)}%`,
              height: "100%",
              backgroundColor: resolveToneColor(layout.actor.tone ?? "navy", theme),
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {data.milestones.map((ms, idx) => {
            const dotColor =
              ms.status === "critical"
                ? theme.liabilityInk
                : ms.status === "warn"
                  ? theme.capitalInk
                  : theme.solventInk;
            return (
              <div
                key={`${ms.tick}-${idx}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: dotColor,
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {ms.tick}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontFamily: FONTS.sans,
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: theme.inkPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ms.label}
                </div>
                {ms.metric && (
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "10px",
                      color: theme.inkMuted,
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {ms.metric}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const IsometricTowerActorView: React.FC<
  SharedActorViewProps & { themeRegister: BlueprintThemeRegister }
> = ({ layout, theme, totalFrames, themeRegister }) => {
  const data = layout.actor.isometricTower;
  return (
    <IsometricDiorama3D
      width={Math.round(layout.rect.width)}
      height={Math.round(layout.rect.height)}
      eyebrow={data?.eyebrow}
      title={data?.title ?? layout.actor.id}
      subtitle={data?.subtitle}
      axisUnitLabel={data?.axisUnitLabel}
      blocks={data?.blocks}
      gridSpan={data?.gridSpan}
      azimuthDeg={data?.azimuthDeg}
      elevationDeg={data?.elevationDeg}
      themeRegister={themeRegister}
      overFootage={theme.isOverFootage}
      totalFrames={totalFrames}
      showFrameChrome={true}
    />
  );
};

const VerdictStampActorView: React.FC<SharedActorViewProps> = ({
  layout,
  theme,
  frame,
  fps,
  totalFrames,
  compact,
}) => {
  const data = layout.actor.verdictStamp ?? {
    stampText: layout.actor.id,
  };
  const slamFrame = Math.round((data.slamAtProgress ?? 0.6) * totalFrames);
  const hasSlammed = frame >= slamFrame;
  const slamSp = hasSlammed
    ? spring({
        frame: frame - slamFrame,
        fps,
        config: CINEMA_SPRINGS.heavyStamp,
      })
    : 0;

  const stampScale = hasSlammed
    ? interpolate(slamSp, [0, 1], [1.34, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1.34;
  const stampOpacity = hasSlammed
    ? interpolate(frame, [slamFrame, slamFrame + 4], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const inkColor =
    data.inkTone === "teal"
      ? theme.solventInk
      : data.inkTone === "navy"
        ? theme.inkPrimary
        : theme.liabilityInk;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: stampOpacity,
        transform: `scale(${stampScale.toFixed(4)}) rotate(${(
          data.angleDeg ?? -2.5
        ).toFixed(2)}deg)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: compact ? "12px 18px" : "16px 26px",
          borderRadius: "8px",
          backgroundColor: theme.cardBg,
          border: `3px solid ${inkColor}`,
          boxShadow: `inset 0 0 0 3px ${theme.cardBg}, inset 0 0 0 4.5px ${inkColor}, 0 14px 32px rgba(15, 25, 35, 0.22)`,
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {data.authorityLabel && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: inkColor,
              marginBottom: "4px",
            }}
          >
            {data.authorityLabel}
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.condensed,
            fontSize: compact ? "24px" : "30px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1.08,
            color: inkColor,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {data.stampText}
        </div>
        {data.subText && (
          <div
            style={{
              marginTop: "5px",
              fontFamily: FONTS.sans,
              fontSize: "12px",
              fontWeight: 500,
              color: theme.inkSecondary,
            }}
          >
            {data.subText}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Connector & Physics Overlay Layer (All 6 Connector Kinds + SPV Carousel)
// ============================================================================

const SingleConnectorSvg: React.FC<{
  connLayout: SolvedConnectorLayout;
  theme: BlueprintSurfaceTheme;
  frame: number;
  fps: number;
  totalFrames: number;
  progress: number;
  tension?: TensionSnapState;
}> = ({ connLayout, theme, frame, fps, totalFrames, progress, tension }) => {
  const { connector: conn, startPoint, endPoint, midPoint, waypoints, svgPath } =
    connLayout;
  const strokeColor = resolveToneColor(conn.tone ?? "navy", theme);
  const trigStart = conn.triggerAtProgress ?? 0.34;
  const trigEnd = Math.max(trigStart + 0.12, conn.endAtProgress ?? trigStart + 0.22);

  // 1. Tension-Snap Cable Special Path (Subsea Anchor Drag & Snap Recoil)
  if (tension) {
    if (!tension.isSnapped) {
      const ctrlX = (startPoint.x + endPoint.x) * 0.5;
      const ctrlY =
        (startPoint.y + endPoint.y) * 0.5 +
        tension.apexDeflectionY +
        tension.highStrainTremorPx;
      const strainedPath = `M ${startPoint.x.toFixed(1)} ${startPoint.y.toFixed(
        1
      )} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endPoint.x.toFixed(
        1
      )} ${endPoint.y.toFixed(1)}`;
      const wireColor =
        tension.tensionNormalized > 0.65 ? theme.liabilityInk : strokeColor;

      return (
        <g>
          <path
            d={strainedPath}
            fill="none"
            stroke={wireColor}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          {tension.phase === "stretching" && (
            <polygon
              points={`${ctrlX - 7},${ctrlY - 14} ${ctrlX + 7},${ctrlY - 14} ${ctrlX},${ctrlY + 4}`}
              fill={theme.liabilityInk}
            />
          )}
        </g>
      );
    }

    // Snapped: Two whipping recoiling cable ends + decaying spark burst
    const leftBreakX = midPoint.x - 18 + tension.leftEndRecoil.dx;
    const leftBreakY = midPoint.y + tension.leftEndRecoil.dy;
    const rightBreakX = midPoint.x + 18 + tension.rightEndRecoil.dx;
    const rightBreakY = midPoint.y + tension.rightEndRecoil.dy;

    return (
      <g>
        <path
          d={`M ${startPoint.x.toFixed(1)} ${startPoint.y.toFixed(1)} Q ${(
            (startPoint.x + leftBreakX) *
            0.5
          ).toFixed(1)} ${(leftBreakY + 18).toFixed(1)} ${leftBreakX.toFixed(
            1
          )} ${leftBreakY.toFixed(1)}`}
          fill="none"
          stroke={theme.liabilityInk}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={`M ${endPoint.x.toFixed(1)} ${endPoint.y.toFixed(1)} Q ${(
            (endPoint.x + rightBreakX) *
            0.5
          ).toFixed(1)} ${(rightBreakY - 16).toFixed(1)} ${rightBreakX.toFixed(
            1
          )} ${rightBreakY.toFixed(1)}`}
          fill="none"
          stroke={theme.liabilityInk}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {tension.sparkBurstAlpha > 0.02 &&
          [0, 60, 120, 180, 240, 300].map((deg) => {
            const r = (1 - tension.sparkBurstAlpha) * 28 + 6;
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={midPoint.x + Math.cos(rad) * r}
                cy={midPoint.y + Math.sin(rad) * r}
                r={3}
                fill={theme.liabilityInk}
                opacity={tension.sparkBurstAlpha}
              />
            );
          })}
      </g>
    );
  }

  // 2. Veto-Slash (Executive Fountain-Pen Crimson Ink Strike)
  if (conn.kind === "veto-slash") {
    const slashP = interpolate(progress, [trigStart, trigEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (slashP <= 0.01) return null;
    const curX = startPoint.x + (endPoint.x - startPoint.x) * slashP;
    const curY = startPoint.y + (endPoint.y - startPoint.y) * slashP;

    return (
      <g>
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={curX}
          y2={curY}
          stroke={theme.liabilityInk}
          strokeWidth={5.5}
          strokeLinecap="round"
          opacity={0.9}
        />
        <line
          x1={startPoint.x}
          y1={startPoint.y + 4}
          x2={curX}
          y2={curY + 4}
          stroke={theme.liabilityInk}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
    );
  }

  // 3. Dimension-Line (Architectural Drafting Witness Span)
  if (conn.kind === "dimension-line") {
    const drawP = interpolate(progress, [0.06, 0.34], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const curX = startPoint.x + (endPoint.x - startPoint.x) * drawP;
    const curY = startPoint.y + (endPoint.y - startPoint.y) * drawP;
    return (
      <g opacity={0.88}>
        <line
          x1={startPoint.x}
          y1={startPoint.y - 8}
          x2={startPoint.x}
          y2={startPoint.y + 8}
          stroke={strokeColor}
          strokeWidth={2}
        />
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={curX}
          y2={curY}
          stroke={strokeColor}
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        {drawP > 0.95 && (
          <line
            x1={endPoint.x}
            y1={endPoint.y - 8}
            x2={endPoint.x}
            y2={endPoint.y + 8}
            stroke={strokeColor}
            strokeWidth={2}
          />
        )}
      </g>
    );
  }

  // 4. Laser-Scan (Targeted LiDAR / EUV Beam + Traveling Wavefront)
  if (conn.kind === "laser-scan") {
    const active = progress >= (conn.triggerAtProgress ?? 0.12);
    const ended =
      conn.endAtProgress !== undefined && progress > conn.endAtProgress;
    const pulseU = ((frame / Math.max(1, fps)) * 1.35) % 1;
    const pulsePt = samplePointAlongWaypoints(waypoints, pulseU).point;

    return (
      <g opacity={ended ? 0.25 : active ? 0.92 : 0.2}>
        <path
          d={svgPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="6 4"
        />
        <circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={4.5}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.6}
        />
        <circle
          cx={endPoint.x}
          cy={endPoint.y}
          r={5.5}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.6}
        />
        {active && !ended && (
          <circle cx={pulsePt.x} cy={pulsePt.y} r={4.2} fill={strokeColor} />
        )}
      </g>
    );
  }

  // 5. Flow-Pipe, Guillotine-Cut & Geodesic-Arc (With Deterministic Moving Particles)
  const isSevered =
    (conn.severFlowOnTrigger || conn.kind === "guillotine-cut") &&
    progress >= trigStart;
  const count = conn.particleCount ?? (conn.kind === "geodesic-arc" ? 8 : 16);
  const speed = conn.particleSpeed ?? 1.0;
  const prng = mulberry32(hashStringSeed(conn.id));

  const particles: Array<{ x: number; y: number; r: number; alpha: number }> = [];
  for (let i = 0; i < count; i++) {
    const seedPhase = prng();
    const jitter = (prng() * 2 - 1) * 2.2;
    const r = 2.6 + prng() * 1.4;
    const u = (seedPhase + (frame / Math.max(1, fps)) * 0.44 * speed) % 1;
    if (isSevered && u > 0.5) {
      continue;
    }
    const sampled = samplePointAlongWaypoints(waypoints, u);
    particles.push({
      x: sampled.point.x + sampled.normal.x * jitter,
      y: sampled.point.y + sampled.normal.y * jitter,
      r,
      alpha: 0.88,
    });
  }

  const cutFrame = Math.round(trigStart * totalFrames);
  const bladeSp =
    conn.kind === "guillotine-cut" && frame >= cutFrame
      ? spring({
          frame: frame - cutFrame,
          fps,
          config: CINEMA_SPRINGS.heavyStamp,
        })
      : 0;

  return (
    <g>
      {/* Pipe / Arc Conduit Casing */}
      <path
        d={svgPath}
        fill="none"
        stroke={theme.cardBorder}
        strokeWidth={conn.kind === "geodesic-arc" ? 3.2 : 6.5}
        strokeLinecap="round"
        strokeDasharray={conn.dashed ? "7 5" : undefined}
      />
      <path
        d={svgPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={conn.kind === "geodesic-arc" ? 2.0 : 2.2}
        strokeLinecap="round"
        strokeDasharray={conn.dashed ? "7 5" : undefined}
        opacity={0.75}
      />

      {/* Deterministic Flow Particles */}
      {particles.map((pt, idx) => (
        <circle
          key={idx}
          cx={pt.x.toFixed(1)}
          cy={pt.y.toFixed(1)}
          r={pt.r}
          fill={strokeColor}
          opacity={pt.alpha}
        />
      ))}

      {/* Mechanical Guillotine Gate at Midpoint */}
      {conn.kind === "guillotine-cut" && (
        <g transform={`translate(${midPoint.x.toFixed(1)}, ${midPoint.y.toFixed(1)})`}>
          <rect
            x="-12"
            y="-22"
            width="24"
            height="44"
            rx="3"
            fill={theme.cardBg}
            stroke={theme.liabilityInk}
            strokeWidth="1.8"
          />
          <polygon
            points={`-9,${(-18 + bladeSp * 20).toFixed(1)} 9,${(
              -12 +
              bladeSp * 20
            ).toFixed(1)} 9,${(-22 + bladeSp * 20).toFixed(1)} -9,${(
              -22 +
              bladeSp * 20
            ).toFixed(1)}`}
            fill={theme.liabilityInk}
          />
        </g>
      )}
    </g>
  );
};

const BlueprintConnectorsSvgLayer: React.FC<{
  layout: SolvedSceneLayout;
  theme: BlueprintSurfaceTheme;
  frame: number;
  fps: number;
  totalFrames: number;
  progress: number;
  physics: EvaluatedBlueprintPhysics;
  filterActorIds?: Record<string, boolean>;
}> = ({
  layout,
  theme,
  frame,
  fps,
  totalFrames,
  progress,
  physics,
  filterActorIds,
}) => {
  const cxStage = layout.activeStageRect.x + layout.activeStageRect.width * 0.5;
  const cyStage = layout.activeStageRect.y + layout.activeStageRect.height * 0.5;

  const visibleConnectors = filterActorIds
    ? layout.connectors.filter(
        (c) =>
          Boolean(filterActorIds[c.connector.fromActorId]) ||
          Boolean(filterActorIds[c.connector.toActorId])
      )
    : layout.connectors;

  return (
    <>
      <svg
        width={layout.canvasRect.width}
        height={layout.canvasRect.height}
        viewBox={`0 0 ${layout.canvasRect.width} ${layout.canvasRect.height}`}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 12,
        }}
      >
        {/* Optional Circular SPV Accounting Orbit Ring & Pulses */}
        {physics.carouselStates.map((cs) => (
          <g key={cs.id} transform={`translate(${cxStage.toFixed(1)}, ${cyStage.toFixed(1)})`}>
            <ellipse
              cx="0"
              cy="0"
              rx={235}
              ry={98}
              fill="none"
              stroke={theme.solventInk}
              strokeWidth="1.4"
              strokeDasharray="6 5"
              opacity={0.42}
            />
            {cs.pulses.map((p) => (
              <circle
                key={p.index}
                cx={p.offsetX.toFixed(1)}
                cy={p.offsetY.toFixed(1)}
                r="4"
                fill={theme.liabilityInk}
                opacity={0.85}
              />
            ))}
          </g>
        ))}

        {visibleConnectors.map((connLayout) => (
          <SingleConnectorSvg
            key={connLayout.id}
            connLayout={connLayout}
            theme={theme}
            frame={frame}
            fps={fps}
            totalFrames={totalFrames}
            progress={progress}
            tension={physics.tensionByConnectorId[connLayout.id]}
          />
        ))}
      </svg>

      {/* Non-Colliding Connector Callout Pills */}
      {visibleConnectors.map((connLayout) => {
        const text =
          connLayout.connector.metricBadge ?? connLayout.connector.label;
        const box = connLayout.badgeRect;
        if (!text || !box) return null;
        const badgeTone = resolveToneColor(
          connLayout.connector.tone ?? "navy",
          theme
        );

        return (
          <div
            key={`badge-${connLayout.id}`}
            style={{
              position: "absolute",
              left: `${box.x.toFixed(1)}px`,
              top: `${box.y.toFixed(1)}px`,
              width: `${box.width.toFixed(1)}px`,
              height: `${box.height.toFixed(1)}px`,
              borderRadius: "6px",
              backgroundColor: theme.cardBg,
              border: `1px solid ${badgeTone}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 18,
              boxShadow: "0 4px 12px rgba(15, 25, 35, 0.12)",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: badgeTone,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                ...TABULAR_NUM_STYLE,
              }}
            >
              {text}
            </span>
          </div>
        );
      })}
    </>
  );
};

// ============================================================================
// Actor Box Wrapper, Masthead & Unified SceneBlueprintRenderer
// ============================================================================

function isForegroundDepthActor(actor: BlueprintActor): boolean {
  return actor.kind === "verdict-stamp" || actor.zone === "bottom-ledger";
}

const BlueprintActorBox: React.FC<{
  actorLayout: SolvedActorLayout;
  theme: BlueprintSurfaceTheme;
  themeRegister: BlueprintThemeRegister;
  frame: number;
  fps: number;
  totalFrames: number;
  progress: number;
  compact: boolean;
  physics: EvaluatedBlueprintPhysics;
}> = ({
  actorLayout,
  theme,
  themeRegister,
  frame,
  fps,
  totalFrames,
  progress,
  compact,
  physics,
}) => {
  const { rect, actor, enterDelayFrames } = actorLayout;
  const localFrame = Math.max(0, frame - enterDelayFrames);
  const enterSp = spring({
    frame: localFrame,
    fps,
    config: CINEMA_SPRINGS.editorialSnap,
  });
  const enterOpacity =
    actor.kind === "verdict-stamp"
      ? 1
      : interpolate(frame, [enterDelayFrames, enterDelayFrames + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const liftY = actor.kind === "verdict-stamp" ? 0 : (1 - enterSp) * 18;

  const carouselHit = physics.carouselNodeByActorId[actorLayout.id];
  const orbitDx = carouselHit ? carouselHit.node.offsetX * 0.06 : 0;
  const orbitDy = carouselHit ? carouselHit.node.offsetY * 0.08 : 0;
  const orbitScale = carouselHit
    ? 0.96 + (carouselHit.node.depthScale - 0.9) * 0.35
    : 1;

  const sharedProps: SharedActorViewProps = {
    layout: actorLayout,
    theme,
    frame,
    fps,
    totalFrames,
    progress,
    compact,
    physics,
  };

  let content: React.ReactNode = null;
  switch (actor.kind) {
    case "prop-rig":
      content = <PropRigActorView {...sharedProps} />;
      break;
    case "metric-counter":
      content = <MetricCounterActorView {...sharedProps} />;
      break;
    case "document-card":
      content = <DocumentCardActorView {...sharedProps} />;
      break;
    case "fluid-tank":
      content = <FluidTankActorView {...sharedProps} />;
      break;
    case "balance-scale":
      content = <BalanceScaleActorView {...sharedProps} />;
      break;
    case "conveyor-belt":
      content = <ConveyorBeltActorView {...sharedProps} />;
      break;
    case "timeline-track":
      content = <TimelineTrackActorView {...sharedProps} />;
      break;
    case "isometric-tower":
      content = (
        <IsometricTowerActorView {...sharedProps} themeRegister={themeRegister} />
      );
      break;
    case "verdict-stamp":
      content = <VerdictStampActorView {...sharedProps} />;
      break;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${rect.x.toFixed(1)}px`,
        top: `${rect.y.toFixed(1)}px`,
        width: `${rect.width.toFixed(1)}px`,
        height: `${rect.height.toFixed(1)}px`,
        opacity: enterOpacity,
        transform: `translate3d(${orbitDx.toFixed(2)}px, ${(
          liftY + orbitDy
        ).toFixed(2)}px, 0) scale(${orbitScale.toFixed(4)})`,
        zIndex:
          actor.kind === "verdict-stamp"
            ? 24
            : 14 + (carouselHit ? carouselHit.node.zIndexOffset : 0),
        boxSizing: "border-box",
      }}
    >
      {content}
    </div>
  );
};

const BlueprintMastheadBlock: React.FC<{
  layout: SolvedSceneLayout;
  theme: BlueprintSurfaceTheme;
  frame: number;
}> = ({ layout, theme, frame }) => {
  const mRect = layout.mastheadRect;
  if (!mRect) return null;

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${mRect.x.toFixed(1)}px`,
        top: `${mRect.y.toFixed(1)}px`,
        width: `${mRect.width.toFixed(1)}px`,
        height: `${mRect.height.toFixed(1)}px`,
        opacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {layout.compactMode && (
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.eyebrowInk,
            marginBottom: "3px",
          }}
        >
          {layout.polish.mastheadEyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.serif,
          fontSize: layout.compactMode ? "20px" : "32px",
          fontWeight: 700,
          lineHeight: 1.14,
          color: theme.inkPrimary,
          textShadow: theme.textShadow,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {layout.polish.mastheadTitle}
      </div>
      {!layout.compactMode && layout.polish.mastheadSubtitle && (
        <div
          style={{
            marginTop: "5px",
            fontFamily: FONTS.sans,
            fontSize: "14.5px",
            color: theme.inkSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {layout.polish.mastheadSubtitle}
        </div>
      )}
    </div>
  );
};

export interface SceneBlueprintRendererProps {
  blueprint?: SceneBlueprint | string;
  blueprintId?: string;
  surfaceMode?: BlueprintSurfaceMode;
  paletteMode?: BlueprintSurfaceMode;
  overFootagePlacement?: OverFootagePlacement;
  themeRegister?: BlueprintThemeRegister;
  cameraSrc?: string;
  presenterAlphaSrc?: string;
  personMaskSrc?: string;
  showMasthead?: boolean;
  showSourceBadge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SceneBlueprintRenderer: React.FC<SceneBlueprintRendererProps> = ({
  blueprint,
  blueprintId,
  surfaceMode: propSurfaceMode,
  paletteMode,
  overFootagePlacement: propPlacement,
  themeRegister: propRegister,
  cameraSrc,
  presenterAlphaSrc,
  personMaskSrc,
  showMasthead = true,
  showSourceBadge = true,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const resolvedBlueprint: SceneBlueprint = useMemo(() => {
    if (blueprint && typeof blueprint === "object") {
      return blueprint;
    }
    if (typeof blueprint === "string") {
      return resolveSetPieceBlueprint(blueprint);
    }
    if (blueprintId) {
      return resolveSetPieceBlueprint(blueprintId);
    }
    return SP01_SHOE_LABOR_VAPORIZER;
  }, [blueprint, blueprintId]);

  const effectiveSurfaceMode: BlueprintSurfaceMode =
    propSurfaceMode ??
    paletteMode ??
    resolvedBlueprint.surfaceMode ??
    "page";

  const effectivePlacement: OverFootagePlacement =
    propPlacement ??
    resolvedBlueprint.overFootagePlacement ??
    "right-third";

  const effectiveRegister: BlueprintThemeRegister =
    propRegister ?? resolvedBlueprint.themeRegister ?? "paper_editorial";

  const totalFrames = Math.max(
    30,
    durationInFrames || resolvedBlueprint.durationFrames || 180
  );
  const progress = clamp01(frame / totalFrames);

  const layout = useMemo(
    () =>
      solveSceneBlueprintLayout(resolvedBlueprint, {
        canvasWidth: width,
        canvasHeight: height,
        surfaceMode: effectiveSurfaceMode,
        overFootagePlacement: effectivePlacement,
      }),
    [
      resolvedBlueprint,
      width,
      height,
      effectiveSurfaceMode,
      effectivePlacement,
    ]
  );

  const theme = useMemo(
    () => resolveBlueprintSurfaceTheme(effectiveRegister, effectiveSurfaceMode),
    [effectiveRegister, effectiveSurfaceMode]
  );

  const physics = evaluateBlueprintPhysics(
    resolvedBlueprint,
    frame,
    fps,
    totalFrames
  );

  const citationText = layout.polish.sourceCitation;
  const docRefText = layout.polish.sourceDocRef;

  // 1. Over-Footage Behind-Presenter Depth Sandwich Mode
  if (
    effectiveSurfaceMode === "over-footage" &&
    effectivePlacement === "depth-sandwich"
  ) {
    const behindActors = layout.actors.filter(
      (a) => !isForegroundDepthActor(a.actor)
    );
    const frontActors = layout.actors.filter((a) =>
      isForegroundDepthActor(a.actor)
    );
    const behindMap: Record<string, boolean> = {};
    for (let i = 0; i < behindActors.length; i++) {
      behindMap[behindActors[i].id] = true;
    }

    return (
      <PresenterDepthStage
        mode={cameraSrc ? "masked-video" : "simulated-depth"}
        preset="colossus-prop-backdrop"
        cameraSrc={cameraSrc}
        presenterAlphaSrc={presenterAlphaSrc}
        personMaskSrc={personMaskSrc}
        className={className}
        style={style}
        behindPresenter={
          <AbsoluteFill>
            {showMasthead && (
              <BlueprintMastheadBlock
                layout={layout}
                theme={theme}
                frame={frame}
              />
            )}
            <BlueprintConnectorsSvgLayer
              layout={layout}
              theme={theme}
              frame={frame}
              fps={fps}
              totalFrames={totalFrames}
              progress={progress}
              physics={physics}
              filterActorIds={behindMap}
            />
            {behindActors.map((actorLayout) => (
              <BlueprintActorBox
                key={actorLayout.id}
                actorLayout={actorLayout}
                theme={theme}
                themeRegister={effectiveRegister}
                frame={frame}
                fps={fps}
                totalFrames={totalFrames}
                progress={progress}
                compact={layout.compactMode}
                physics={physics}
              />
            ))}
          </AbsoluteFill>
        }
        foregroundGlass={
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            {frontActors.map((actorLayout) => (
              <BlueprintActorBox
                key={actorLayout.id}
                actorLayout={actorLayout}
                theme={theme}
                themeRegister={effectiveRegister}
                frame={frame}
                fps={fps}
                totalFrames={totalFrames}
                progress={progress}
                compact={layout.compactMode}
                physics={physics}
              />
            ))}
            {showSourceBadge && citationText && (
              <SourceBadge
                sourceText={citationText}
                docRef={docRefText}
                paletteMode="over-footage"
              />
            )}
          </AbsoluteFill>
        }
      />
    );
  }

  // 2. Over-Footage Smoked-Navy Liquid Glass Mode (right-third, bottom-dock, top-bar)
  if (effectiveSurfaceMode === "over-footage") {
    const glassBox = layout.glassContainerRect;

    return (
      <AbsoluteFill className={className} style={style}>
        {glassBox && (
          <div
            style={{
              position: "absolute",
              left: `${glassBox.x.toFixed(1)}px`,
              top: `${glassBox.y.toFixed(1)}px`,
              width: `${glassBox.width.toFixed(1)}px`,
              height: `${glassBox.height.toFixed(1)}px`,
              zIndex: 6,
            }}
          >
            <LiquidGlassObject
              width={glassBox.width}
              height={glassBox.height}
              borderRadius={22}
              tint="navy-glass"
              enableSfx={false}
            />
          </div>
        )}

        <AbsoluteFill style={{ zIndex: 10, pointerEvents: "none" }}>
          {showMasthead && (
            <BlueprintMastheadBlock
              layout={layout}
              theme={theme}
              frame={frame}
            />
          )}
          <BlueprintConnectorsSvgLayer
            layout={layout}
            theme={theme}
            frame={frame}
            fps={fps}
            totalFrames={totalFrames}
            progress={progress}
            physics={physics}
          />
          {layout.actors.map((actorLayout) => (
            <BlueprintActorBox
              key={actorLayout.id}
              actorLayout={actorLayout}
              theme={theme}
              themeRegister={effectiveRegister}
              frame={frame}
              fps={fps}
              totalFrames={totalFrames}
              progress={progress}
              compact={layout.compactMode}
              physics={physics}
            />
          ))}
          {showSourceBadge && citationText && (
            <SourceBadge
              sourceText={citationText}
              docRef={docRefText}
              paletteMode="over-footage"
            />
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // 3. Full-Screen 1920x1080 Reading Room Page Mode (All 5 Registers)
  return (
    <ReadingRoomStage
      register={theme.registerPalette}
      chapterTitle={showMasthead ? layout.polish.mastheadEyebrow : undefined}
      folioLabel={showMasthead ? layout.polish.mastheadFolio : undefined}
      sourceCitation={undefined}
      cameraMove={{
        preset: layout.polish.enableCameraPush ? "dolly-creep" : "static",
        dollyRange: layout.polish.enableCameraPush
          ? [1.0, layout.polish.cameraPushScale]
          : [1.0, 1.0],
        shakeImpact: physics.shakeTriggers,
        seed: hashStringSeed(resolvedBlueprint.id) % 500,
      }}
      className={className}
      style={style}
    >
      {showMasthead && (
        <BlueprintMastheadBlock layout={layout} theme={theme} frame={frame} />
      )}
      <BlueprintConnectorsSvgLayer
        layout={layout}
        theme={theme}
        frame={frame}
        fps={fps}
        totalFrames={totalFrames}
        progress={progress}
        physics={physics}
      />
      {layout.actors.map((actorLayout) => (
        <BlueprintActorBox
          key={actorLayout.id}
          actorLayout={actorLayout}
          theme={theme}
          themeRegister={effectiveRegister}
          frame={frame}
          fps={fps}
          totalFrames={totalFrames}
          progress={progress}
          compact={layout.compactMode}
          physics={physics}
        />
      ))}
      {showSourceBadge && citationText && (
        <SourceBadge
          sourceText={citationText}
          docRef={docRefText}
          paletteMode={theme.isDark ? "over-footage" : "page"}
          style={{ bottom: "26px", left: "96px" }}
        />
      )}
    </ReadingRoomStage>
  );
};
