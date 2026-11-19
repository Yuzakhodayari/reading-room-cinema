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
import {
  PropVaultRenderer,
  searchPropsBySemanticTags,
} from "../registry/props";
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
  blueprint: SceneBlueprint;
  siblingRenderedPropIds: Readonly<Record<string, boolean>>;
  theme: BlueprintSurfaceTheme;
  frame: number;
  fps: number;
  totalFrames: number;
  progress: number;
  compact: boolean;
  physics: EvaluatedBlueprintPhysics;
}

function buildEditorialCardStyle(
  theme: BlueprintSurfaceTheme,
  accentColor: string,
  compact: boolean
): React.CSSProperties {
  return {
    width: "100%",
    height: "100%",
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    borderTop: `4px solid ${accentColor}`,
    borderRadius: "10px",
    padding: compact ? "12px 14px" : "20px 22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: compact ? "8px" : "14px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    boxShadow: theme.isDark
      ? "0 18px 40px -12px rgba(8, 14, 22, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)"
      : "0 18px 40px -12px rgba(28, 43, 58, 0.14), 0 4px 14px rgba(28, 43, 58, 0.05)",
  };
}

const CardOxfordHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeSolid?: boolean;
  accentColor: string;
  theme: BlueprintSurfaceTheme;
  compact: boolean;
  titleFontSize?: number;
}> = ({
  eyebrow,
  title,
  subtitle,
  badgeText,
  badgeSolid = false,
  accentColor,
  theme,
  compact,
  titleFontSize,
}) => {
  const fSize = titleFontSize ?? (compact ? 16.5 : 21);
  return (
    <div style={{ flexShrink: 0 }}>
      {(eyebrow || badgeText) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: compact ? "9.5px" : "10.5px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: theme.eyebrowInk,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {eyebrow ?? ""}
          </span>
          {badgeText && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: compact ? "9.5px" : "10px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: badgeSolid ? "3px 9px" : "2px 7px",
                borderRadius: "4px",
                backgroundColor: badgeSolid ? theme.inkPrimary : theme.cardWellBg,
                color: badgeSolid ? theme.cardBg : accentColor,
                border: badgeSolid ? "none" : `1px solid ${theme.cardBorder}`,
                whiteSpace: "nowrap",
                flexShrink: 0,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          fontFamily: FONTS.serif,
          fontSize: `${fSize}px`,
          fontWeight: 700,
          lineHeight: 1.16,
          letterSpacing: "-0.01em",
          color: theme.inkPrimary,
          textShadow: theme.textShadow,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: "3px",
            fontFamily: FONTS.sans,
            fontSize: compact ? "11px" : "12px",
            lineHeight: 1.3,
            color: theme.inkSecondary,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          marginTop: compact ? "7px" : "10px",
          borderTop: `2px solid ${theme.cardOxfordRule}`,
          borderBottom: `1px solid ${theme.cardBorder}`,
          height: "3px",
        }}
      />
    </div>
  );
};

function wrapTextToLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number = 2
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!cur) {
      cur = w;
    } else if ((cur + " " + w).length <= maxCharsPerLine) {
      cur = cur + " " + w;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) {
        const rest = [cur, ...words.slice(i + 1)].join(" ");
        lines.push(
          rest.length > maxCharsPerLine
            ? `${rest.slice(0, Math.max(1, maxCharsPerLine - 1))}…`
            : rest
        );
        return lines;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

function resolveMetricCounterPropId(
  actor: BlueprintActor,
  blueprint: SceneBlueprint,
  siblingRenderedPropIds: Readonly<Record<string, boolean>>
): string {
  if (
    blueprint.id === "sp01-shoe-labor-vaporizer" &&
    actor.id === "retail-price-counter"
  ) {
    return "hero-running-shoe-exploded-stack";
  }

  const mc = actor.metricCounter;
  const query = [
    blueprint.title,
    mc?.label ?? "",
    mc?.eyebrow ?? "",
    mc?.sublabel ?? "",
  ]
    .join(" ")
    .trim();

  const hits = searchPropsBySemanticTags(query, { limit: 8 });
  for (let i = 0; i < hits.length; i++) {
    if (!siblingRenderedPropIds[hits[i].id]) {
      return hits[i].id;
    }
  }
  return hits[0]?.id ?? "hero-running-shoe-exploded-stack";
}

function computeFitted43Size(
  availW: number,
  availH: number
): { width: number; height: number } {
  const safeW = Math.max(110, availW);
  const safeH = Math.max(82, availH);
  const targetRatio = 4 / 3;
  if (safeW / safeH > targetRatio) {
    return { width: Math.round(safeH * targetRatio), height: Math.round(safeH) };
  }
  return { width: Math.round(safeW), height: Math.round(safeW / targetRatio) };
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

    const fitted = computeFitted43Size(
      layout.rect.width - 48,
      layout.rect.height - (compact ? 116 : 196)
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
            ...buildEditorialCardStyle(
              theme,
              showingBack ? theme.liabilityInk : accentColor,
              compact
            ),
            backgroundColor: showingBack ? theme.cardWellBg : theme.cardBg,
            border: showingBack
              ? `2px solid ${theme.liabilityInk}`
              : `1px solid ${theme.cardBorder}`,
            borderTop: `4px solid ${showingBack ? theme.liabilityInk : accentColor}`,
            transform: `rotateY(${displayRotY.toFixed(2)}deg)`,
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
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: theme.liabilityInk,
                  opacity: 0.78,
                }}
              />
            ))}

          <CardOxfordHeader
            eyebrow={
              showingBack
                ? data.backEyebrow ?? "CAST-IRON LIABILITY"
                : data.eyebrow ?? "ABUNDANCE MODEL"
            }
            title={
              showingBack
                ? data.backHeadline ?? "30-Year Fixed Loan Contract"
                : data.headline
            }
            badgeText={data.statusBadge}
            accentColor={showingBack ? theme.liabilityInk : theme.solventInk}
            theme={theme}
            compact={compact}
            titleFontSize={compact ? 17 : 23}
          />

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
              backgroundColor: theme.cardWellBg,
              borderRadius: "8px",
              border: `1px solid ${theme.cardBorder}`,
              padding: "6px",
            }}
          >
            <PropVaultRenderer
              propId={
                showingBack ? "hero-mortgage-deed-30yr-iron" : resolvedPropId
              }
              width={fitted.width}
              height={fitted.height}
              frame={frame}
              progress={progress}
              paletteMode={theme.isDark ? "over-footage" : "page"}
              showAnnotations={false}
            />
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${theme.cardBorder}`,
              paddingTop: "10px",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: compact ? "11.5px" : "12.5px",
                lineHeight: 1.3,
                color: theme.inkSecondary,
              }}
            >
              {showingBack ? data.backSublabel ?? data.sublabel : data.sublabel}
            </span>
            {(showingBack ? data.backMetricText ?? data.metricText : data.metricText) && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: compact ? "12px" : "14px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor: showingBack ? theme.riskWash : theme.tealWash,
                  color: showingBack ? theme.liabilityInk : accentColor,
                  whiteSpace: "nowrap",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {showingBack
                  ? data.backMetricText ?? data.metricText
                  : data.metricText}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Exploded Gravity & Bounce BOM Vaporizer Stack Mode
  if (data.slices && data.slices.length > 0) {
    const showTelemetryStrip = !compact && layout.rect.height >= 420;
    const chromeOverhead = compact ? 116 : showTelemetryStrip ? 250 : 148;
    const stackArenaH = Math.max(150, layout.rect.height - chromeOverhead);
    const scaleFactor = vaporizer
      ? Math.min(1.62, (stackArenaH - 28) / Math.max(1, vaporizer.totalInitialHeightPx))
      : 1;

    const totalShare = data.slices.reduce((a, s) => a + s.sharePct, 0) || 100;
    const survivingShare = data.slices
      .filter((s) => !s.vaporizable)
      .reduce((a, s) => a + s.sharePct, 0);
    const vaporizedPctNow = vaporizer
      ? Math.round(vaporizer.vaporizedShareRatio * (100 - survivingShare))
      : 0;
    const floorPlinthHeight = vaporizer?.slices[0]
      ? vaporizer.slices[0].baseHeightPx * scaleFactor
      : 42;
    const floorDatumBottom = 10 + floorPlinthHeight + 2;

    // Live top of highest visible slice for architectural elevation caliper
    let stackTopPx = 10;
    if (vaporizer) {
      for (let idx = 0; idx < vaporizer.slices.length; idx++) {
        const ps = vaporizer.slices[idx];
        if (ps.opacity > 0.02 && ps.currentHeightPx > 0.5) {
          const topPx = 10 + (ps.bottomOffsetPx + ps.currentHeightPx) * scaleFactor;
          if (topPx > stackTopPx) stackTopPx = topPx;
        }
      }
    }

    return (
      <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
        <CardOxfordHeader
          eyebrow={data.eyebrow}
          title={data.headline}
          badgeText={data.metricText ?? data.statusBadge}
          badgeSolid={false}
          accentColor={accentColor}
          theme={theme}
          compact={compact}
          titleFontSize={compact ? 17 : 22}
        />

        {/* Forensic Layer Composition Telemetry Strip */}
        {showTelemetryStrip && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  backgroundColor: theme.cardWellBg,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: theme.inkMuted,
                  }}
                >
                  TOTAL LAYERS
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontFamily: FONTS.mono,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: theme.inkPrimary,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {data.slices.length} SLICES · {totalShare}%
                </div>
              </div>

              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  backgroundColor: theme.riskWash,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: theme.liabilityInk,
                  }}
                >
                  VAPORIZED LABOR
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontFamily: FONTS.mono,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: theme.liabilityInk,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  -{vaporizedPctNow}% STRIPPED
                </div>
              </div>

              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  backgroundColor: theme.tealWash,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: theme.solventInk,
                  }}
                >
                  PHYSICAL FLOOR
                </div>
                <div
                  style={{
                    marginTop: "2px",
                    fontFamily: FONTS.mono,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: theme.solventInk,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {survivingShare}% INTACT
                </div>
              </div>
            </div>

            {/* Live Horizontal Composition Bar */}
            <div
              style={{
                height: "7px",
                borderRadius: "3px",
                backgroundColor: theme.cardWellBg,
                border: `1px solid ${theme.cardBorder}`,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${survivingShare}%`,
                  height: "100%",
                  backgroundColor: theme.solventInk,
                }}
              />
              <div
                style={{
                  width: `${Math.max(0, 100 - survivingShare - vaporizedPctNow)}%`,
                  height: "100%",
                  backgroundColor: theme.liabilityInk,
                  opacity: 0.78,
                }}
              />
            </div>
          </div>
        )}

        {/* Interactive Gravity + Damped-Bounce BOM Stack */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: "140px",
            backgroundColor: theme.cardWellBg,
            borderRadius: "8px",
            border: `1px solid ${theme.cardBorder}`,
            overflow: "hidden",
          }}
        >
          {/* Left Architectural Elevation Caliper Rail */}
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "10px",
              bottom: "10px",
              width: "18px",
              borderRight: `1px dashed ${theme.cardBorder}`,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-2px",
                bottom: "0",
                height: `${Math.max(0, stackTopPx - 10).toFixed(1)}px`,
                width: "3px",
                borderRadius: "2px",
                backgroundColor: theme.inkPrimary,
                opacity: 0.45,
              }}
            />
          </div>

          {/* Physical Plinth Floor Datum Line */}
          <div
            style={{
              position: "absolute",
              left: "36px",
              right: "14px",
              bottom: `${floorDatumBottom.toFixed(1)}px`,
              borderTop: `1px dashed ${theme.solventInk}`,
              opacity: 0.45,
              pointerEvents: "none",
            }}
          />

          {data.slices.map((slice, idx) => {
            const physSlice = vaporizer?.slices[idx];
            const hPx = Math.max(
              0,
              (physSlice ? physSlice.currentHeightPx : (slice.sharePct / 100) * 240) *
                scaleFactor
            );
            const bottomPx =
              10 +
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
            const textAlpha = clamp01((hPx - 11) / 13);
            const isVaporizingNow =
              Boolean(slice.vaporizable) && (physSlice?.vaporizeProgress ?? 0) > 0.02;

            return (
              <React.Fragment key={slice.id}>
                {opacity > 0.02 && hPx > 0.8 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "40px",
                      right: "16px",
                      bottom: `${bottomPx.toFixed(1)}px`,
                      height: `${hPx.toFixed(1)}px`,
                      opacity,
                      transform: `translate3d(${driftX.toFixed(1)}px, 0, 0) scale(${sqX.toFixed(
                        3
                      )}, ${sqY.toFixed(3)})`,
                      transformOrigin: "50% 100%",
                      backgroundColor: slice.vaporizable
                        ? theme.riskWash
                        : theme.cardBg,
                      backgroundImage: slice.vaporizable
                        ? `repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(163, 64, 46, 0.055) 7px, rgba(163, 64, 46, 0.055) 14px)`
                        : undefined,
                      border: `1.5px solid ${sliceTone}`,
                      borderLeft: `5px solid ${sliceTone}`,
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 12px",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      gap: "10px",
                    }}
                  >
                    {/* Bottom proportional share bar inside layer */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        height: "2.5px",
                        width: `${Math.min(100, slice.sharePct * 2.5)}%`,
                        backgroundColor: sliceTone,
                        opacity: 0.48,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        minWidth: 0,
                        flex: 1,
                        opacity: textAlpha,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: "9.5px",
                          fontWeight: 700,
                          color: sliceTone,
                          padding: "1px 5px",
                          borderRadius: "3px",
                          backgroundColor: theme.cardWellBg,
                          border: `1px solid ${theme.cardBorder}`,
                          flexShrink: 0,
                          ...TABULAR_NUM_STYLE,
                        }}
                      >
                        L{idx + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: theme.inkPrimary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {slice.label}
                      </span>
                      {hPx >= 36 && (
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            padding: "1px 6px",
                            borderRadius: "3px",
                            backgroundColor: isVaporizingNow
                              ? sliceTone
                              : theme.cardWellBg,
                            color: isVaporizingNow ? theme.cardBg : sliceTone,
                            border: `1px solid ${sliceTone}`,
                            flexShrink: 0,
                          }}
                        >
                          {isVaporizingNow
                            ? "VAPORIZING"
                            : slice.vaporizable
                              ? "LABOR"
                              : "FIXED FLOOR"}
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: sliceTone,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        opacity: textAlpha,
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {slice.costText} ({slice.sharePct}%)
                    </span>
                  </div>
                )}

                {/* Deterministic Vapor Embers Strictly Confined Inside Dissolving Row Gap */}
                {physSlice &&
                  hPx > 1.5 &&
                  physSlice.embers.map((emb, eIdx) => {
                    const emberBottom =
                      bottomPx + hPx * 0.5 + emb.dy * scaleFactor;
                    return (
                      <div
                        key={`${slice.id}-emb-${eIdx}`}
                        style={{
                          position: "absolute",
                          left: `calc(50% + ${(
                            emb.dx * Math.min(1.2, scaleFactor)
                          ).toFixed(1)}px)`,
                          bottom: `${emberBottom.toFixed(1)}px`,
                          width: `${(emb.radiusPx * 2).toFixed(1)}px`,
                          height: `${(emb.radiusPx * 2).toFixed(1)}px`,
                          borderRadius: "50%",
                          backgroundColor: theme.liabilityInk,
                          opacity: emb.opacity,
                          pointerEvents: "none",
                        }}
                      />
                    );
                  })}
              </React.Fragment>
            );
          })}
        </div>

        {(data.sublabel || data.statusBadge) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${theme.cardBorder}`,
              paddingTop: "8px",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "12px",
                color: theme.inkSecondary,
              }}
            >
              {data.sublabel ?? ""}
            </span>
            {data.statusBadge && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "4px",
                  backgroundColor: theme.riskWash,
                  color: accentColor,
                  border: `1px solid ${accentColor}`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {data.statusBadge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // 3. Standard PropVaultRenderer Delegation (+ Bespoke Vector Crest Fallback)
  const fitted = computeFitted43Size(
    layout.rect.width - 48,
    layout.rect.height - (compact ? 114 : 184)
  );

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.headline}
        badgeText={data.statusBadge}
        accentColor={accentColor}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 17 : 21}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          backgroundColor: theme.cardWellBg,
          borderRadius: "8px",
          border: `1px solid ${theme.cardBorder}`,
          padding: "8px",
        }}
      >
        {resolvedPropId ? (
          <PropVaultRenderer
            propId={resolvedPropId}
            width={fitted.width}
            height={fitted.height}
            frame={frame}
            progress={progress}
            paletteMode={theme.isDark ? "over-footage" : "page"}
            showAnnotations={false}
          />
        ) : (
          <BespokeMechanismFallbackSvg
            width={fitted.width}
            height={fitted.height}
            ink={theme.inkPrimary}
            accent={accentColor}
            frame={frame}
          />
        )}
      </div>

      {(data.sublabel || data.metricText) && (
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${theme.cardBorder}`,
            paddingTop: "10px",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: compact ? "11.5px" : "12.5px",
              lineHeight: 1.32,
              color: theme.inkSecondary,
            }}
          >
            {data.sublabel ?? ""}
          </span>
          {data.metricText && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: compact ? "12px" : "13.5px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor:
                  layout.actor.tone === "teal"
                    ? theme.tealWash
                    : layout.actor.tone === "crimson"
                      ? theme.riskWash
                      : theme.cardWellBg,
                color: accentColor,
                border: `1px solid ${theme.cardBorder}`,
                whiteSpace: "nowrap",
                flexShrink: 0,
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
  blueprint,
  siblingRenderedPropIds,
  theme,
  frame,
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
  const formattedFrom = formatCounterNumber(
    data.fromValue,
    data.decimals ?? 0,
    data.prefix ?? "",
    data.suffix ?? ""
  );
  const formattedTo = formatCounterNumber(
    data.toValue,
    data.decimals ?? 0,
    data.prefix ?? "",
    data.suffix ?? ""
  );

  const chiselProg = interpolate(progress, [endP - 0.1, endP + 0.14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isShallowBanner = layout.rect.height < 260;
  const showSpecimenWell = !compact && layout.rect.height >= 490;
  const showDeltaBars = !isShallowBanner && layout.rect.height >= 280;

  const figFontSize = compact
    ? 34
    : isShallowBanner
      ? 38
      : layout.rect.width < 440
        ? 48
        : 54;

  const maxAbs = Math.max(Math.abs(data.fromValue), Math.abs(data.toValue), 1);
  const fromBarPct = clamp01(Math.abs(data.fromValue) / maxAbs) * 100;
  const liveBarPct = clamp01(Math.abs(liveValue) / maxAbs) * 100;
  const liveDeltaPct =
    Math.abs(data.fromValue) > 0.01
      ? Math.round(((liveValue - data.fromValue) / Math.abs(data.fromValue)) * 100)
      : Math.round((liveValue - data.fromValue) * 10) / 10;
  const netDeltaLabel =
    Math.abs(data.fromValue) > 0.01
      ? `${liveDeltaPct > 0 ? "+" : ""}${liveDeltaPct}%`
      : data.deltaBadge ?? `${formattedTo}`;

  const specimenPropId = showSpecimenWell
    ? resolveMetricCounterPropId(layout.actor, blueprint, siblingRenderedPropIds)
    : undefined;
  const specimenAvailH = Math.max(120, layout.rect.height - 438);
  const fittedSpecimen = computeFitted43Size(
    layout.rect.width - 64,
    Math.min(240, specimenAvailH)
  );

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.label}
        badgeText={isShallowBanner ? data.deltaBadge : "LIVE TELEMETRY"}
        badgeSolid={!isShallowBanner}
        accentColor={accentColor}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16 : 20}
      />

      {/* Forensic Hero Odometer & Comparative Delta Bars */}
      <div
        style={{
          padding: compact ? "10px 12px" : "14px 16px",
          borderRadius: "8px",
          backgroundColor: theme.cardWellBg,
          border: `1px solid ${theme.cardBorder}`,
          display: "flex",
          flexDirection: isShallowBanner ? "row" : "column",
          alignItems: isShallowBanner ? "center" : "stretch",
          justifyContent: isShallowBanner ? "space-between" : "flex-start",
          gap: isShallowBanner ? "16px" : "12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
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
                  width={Math.min(
                    layout.rect.width - 76,
                    formattedFigure.length * figFontSize * 0.58
                  )}
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
                lineHeight: 1.0,
                letterSpacing: "-0.025em",
                color: accentColor,
                textShadow: theme.textShadow,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {formattedFigure}
            </div>
          </div>

          {data.deltaBadge && !isShallowBanner && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor:
                  layout.actor.tone === "teal" ? theme.tealWash : theme.riskWash,
                color: accentColor,
                border: `1px solid ${accentColor}`,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {data.deltaBadge}
            </span>
          )}
        </div>

        {/* Live Comparative Baseline vs. Target Delta Bars */}
        {showDeltaBars && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              paddingTop: "8px",
              borderTop: `1px solid ${theme.cardBorder}`,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: theme.inkMuted,
                  marginBottom: "3px",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                <span>START BASELINE</span>
                <span>{formattedFrom}</span>
              </div>
              <div
                style={{
                  height: "8px",
                  borderRadius: "3px",
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(4, fromBarPct).toFixed(1)}%`,
                    height: "100%",
                    backgroundColor: theme.inkMuted,
                    opacity: 0.45,
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: "3px",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                <span>LIVE READING</span>
                <span>
                  {formattedFigure} ({netDeltaLabel})
                </span>
              </div>
              <div
                style={{
                  height: "10px",
                  borderRadius: "3px",
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(4, liveBarPct).toFixed(1)}%`,
                    height: "100%",
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contextual PropVault Technical Specimen Illustration */}
      {showSpecimenWell && specimenPropId && (
        <div
          style={{
            flex: 1,
            minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.cardWellBg,
            borderRadius: "8px",
            border: `1px solid ${theme.cardBorder}`,
            padding: "8px 10px",
            position: "relative",
          }}
        >
          <PropVaultRenderer
            propId={specimenPropId}
            width={fittedSpecimen.width}
            height={fittedSpecimen.height}
            frame={frame}
            progress={progress}
            paletteMode={theme.isDark ? "over-footage" : "page"}
            showAnnotations={true}
          />
        </div>
      )}

      {/* Unit Breakdown Pills & Sublabel Footer */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {!compact && !isShallowBanner && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "6px",
            }}
          >
            {[
              { k: "BEFORE", v: formattedFrom, c: theme.inkSecondary },
              { k: "NOW", v: formattedFigure, c: accentColor },
              { k: "TARGET", v: formattedTo, c: theme.solventInk },
            ].map((cell) => (
              <div
                key={cell.k}
                style={{
                  padding: "6px 8px",
                  borderRadius: "5px",
                  backgroundColor: theme.cardWellBg,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: theme.inkMuted,
                  }}
                >
                  {cell.k}
                </div>
                <div
                  style={{
                    marginTop: "1px",
                    fontFamily: FONTS.mono,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: cell.c,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {cell.v}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.sublabel && (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: compact ? "11.5px" : "12.5px",
              lineHeight: 1.35,
              color: theme.inkSecondary,
              borderTop: `1px solid ${theme.cardBorder}`,
              paddingTop: "8px",
            }}
          >
            {data.sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentCardActorView: React.FC<SharedActorViewProps> = ({
  layout,
  blueprint,
  siblingRenderedPropIds,
  theme,
  frame,
  progress,
  compact,
}) => {
  const data = layout.actor.documentCard ?? {
    title: layout.actor.id,
    rows: [],
  };
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const isWideBanner =
    layout.rect.width > layout.rect.height * 2.4 && layout.rect.height < 280;

  // Estimate remaining vertical room for optional forensic chart / specimen well in tall columns
  const estHeaderH = compact ? 74 : 112;
  const estRowsH = data.rows.length * (compact ? 38 : 52) + 30;
  const estFooterH = data.footerNote || data.sealText ? 86 : 10;
  const spareVerticalH = layout.rect.height - estHeaderH - estRowsH - estFooterH - 44;
  const showAuditSpecimen =
    !compact && !isWideBanner && spareVerticalH >= 155;

  const contextualAuditPropId = showAuditSpecimen
    ? (() => {
        const hits = searchPropsBySemanticTags(
          `${blueprint.title} ${data.title} ${data.eyebrow ?? ""}`,
          { limit: 6 }
        );
        for (let i = 0; i < hits.length; i++) {
          if (!siblingRenderedPropIds[hits[i].id]) return hits[i].id;
        }
        return hits[0]?.id;
      })()
    : undefined;

  const fittedAuditProp = computeFitted43Size(
    layout.rect.width - 68,
    Math.min(200, Math.max(120, spareVerticalH - 22))
  );

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.subtitle}
        badgeText={data.docCode}
        badgeSolid={Boolean(data.docCode)}
        accentColor={accentColor}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16.5 : 21}
      />

      {isWideBanner ? (
        /* Horizontal Multi-Column Ledger Strip for Shallow Wide Banners (e.g. SP22 bottom-ledger) */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, data.rows.length))}, minmax(0, 1fr))`,
            gap: "12px",
            alignItems: "stretch",
            flex: 1,
            minHeight: 0,
          }}
        >
          {data.rows.map((row, idx) => {
            const rowTone = resolveToneColor(row.tone ?? "navy", theme);
            return (
              <div
                key={`${row.label}-${idx}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: row.highlight
                    ? row.tone === "teal"
                      ? theme.tealWash
                      : theme.riskWash
                    : theme.cardWellBg,
                  border: row.highlight
                    ? `1px solid ${rowTone}`
                    : `1px solid ${theme.cardBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: theme.inkMuted,
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: rowTone,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* TreasuryTable9Scene-Caliber Tight Hairline Rows */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: "12px",
              fontFamily: FONTS.mono,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: theme.inkMuted,
              borderBottom: `1px solid ${theme.cardBorder}`,
              padding: "0 6px 6px",
            }}
          >
            <span>LINE CLASSIFICATION</span>
            <span style={{ textAlign: "right" }}>AUDIT FIGURE</span>
          </div>

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
            const highlightSweepP = row.highlight
              ? interpolate(progress, [0.46, 0.72], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0;

            return (
              <div
                key={`${row.label}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  alignItems: "center",
                  padding: compact ? "6px 6px" : "10px 8px",
                  borderBottom: `1px solid ${theme.cardBorder}`,
                  backgroundColor: row.highlight
                    ? row.tone === "teal"
                      ? theme.tealWash
                      : theme.riskWash
                    : "transparent",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: compact ? "12px" : "13.5px",
                      fontWeight: row.highlight ? 700 : 600,
                      color: theme.inkPrimary,
                      lineHeight: 1.25,
                    }}
                  >
                    {row.label}
                  </div>
                  {!compact && (
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "9.5px",
                        color: theme.inkMuted,
                        letterSpacing: "0.04em",
                        marginTop: "1px",
                      }}
                    >
                      LINE {String(idx + 1).padStart(2, "0")}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "6px",
                    padding: "2px 4px",
                  }}
                >
                  {row.highlight && highlightSweepP > 0.01 && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        bottom: "1px",
                        height: "18px",
                        width: `${(highlightSweepP * 100).toFixed(1)}%`,
                        backgroundColor:
                          theme.registerPalette.accent.highlighterWash,
                        borderRadius: "3px",
                        zIndex: 0,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontFamily: FONTS.mono,
                      fontSize: compact ? "11.5px" : "13.5px",
                      fontWeight: 700,
                      color: rowTone,
                      opacity: strikeP > 0.6 ? 0.65 : 1,
                      textAlign: "right",
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {row.value}
                  </span>
                  {row.delta && (
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        fontFamily: FONTS.mono,
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        backgroundColor: theme.riskWash,
                        color: theme.liabilityInk,
                        border: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      {row.delta}
                    </span>
                  )}
                  {strikeP > 0.01 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "-3px",
                        right: "-3px",
                        top: "50%",
                        height: "2.4px",
                        backgroundColor: theme.liabilityInk,
                        transform: `scaleX(${strikeP.toFixed(3)}) rotate(-2deg)`,
                        transformOrigin: "0% 50%",
                        zIndex: 2,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional Supporting Archival Specimen Well When Tall Column Leaves Headroom */}
      {showAuditSpecimen && contextualAuditPropId && (
        <div
          style={{
            flex: 1,
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.cardWellBg,
            borderRadius: "8px",
            border: `1px solid ${theme.cardBorder}`,
            padding: "8px",
          }}
        >
          <PropVaultRenderer
            propId={contextualAuditPropId}
            width={fittedAuditProp.width}
            height={fittedAuditProp.height}
            frame={frame}
            progress={progress}
            paletteMode={theme.isDark ? "over-footage" : "page"}
            showAnnotations={true}
          />
        </div>
      )}

      {(data.footerNote || data.sealText) && !isWideBanner && (
        <div
          style={{
            marginTop: "auto",
            backgroundColor:
              layout.actor.tone === "crimson" ? theme.riskWash : theme.cardWellBg,
            border: `1px solid ${theme.cardBorder}`,
            borderLeft: `4px solid ${accentColor}`,
            borderRadius: "6px",
            padding: compact ? "8px 10px" : "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: accentColor,
                marginBottom: "2px",
              }}
            >
              STRUCTURAL AUDIT NOTE
            </div>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: compact ? "11.5px" : "12.5px",
                fontWeight: 600,
                lineHeight: 1.32,
                color: theme.inkPrimary,
              }}
            >
              {data.footerNote ?? "Verified primary-source docket filing"}
            </div>
          </div>
          {data.sealText && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "4px 8px",
                border: `1.5px solid ${accentColor}`,
                borderRadius: "4px",
                color: accentColor,
                backgroundColor: theme.cardBg,
                transform: "rotate(-2.2deg)",
                whiteSpace: "nowrap",
                flexShrink: 0,
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
  const wSvg = Math.max(180, Math.round(layout.rect.width - (compact ? 32 : 48)));
  const hSvg = Math.max(
    90,
    Math.round(layout.rect.height - (compact ? 116 : 206))
  );
  const ySurface = hSvg * (1 - clampedFill);
  const amp = clampedFill > 0.02 && clampedFill < 0.99 ? 3.5 : 0;
  const wavePath = [
    `M 0 ${hSvg}`,
    `L 0 ${(ySurface + Math.sin(wavePhase) * amp).toFixed(1)}`,
    `Q ${(wSvg * 0.25).toFixed(1)} ${(ySurface - Math.cos(wavePhase) * amp * 1.4).toFixed(1)} ${(wSvg * 0.5).toFixed(1)} ${(
      ySurface + Math.sin(wavePhase + 1.5) * amp
    ).toFixed(1)}`,
    `T ${wSvg} ${(ySurface - Math.sin(wavePhase) * amp).toFixed(1)}`,
    `L ${wSvg} ${hSvg}`,
    "Z",
  ].join(" ");

  return (
    <div style={buildEditorialCardStyle(theme, liquidTone, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.capacityLabel}
        badgeText={`${Math.round(clampedFill * 100)}% FULL`}
        badgeSolid={false}
        accentColor={liquidTone}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16.5 : 20}
      />

      {/* Graduated Hydraulic Chamber (True 1:1 Pixel Aspect Ratio) */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: "90px",
          borderRadius: "8px",
          border: `1.8px solid ${theme.inkPrimary}`,
          backgroundColor: theme.cardWellBg,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${wSvg} ${hSvg}`}
          style={{ display: "block" }}
        >
          {/* Subtle Horizontal Reservoir Datum Grid */}
          {[0.25, 0.5, 0.75].map((tick) => {
            const yTick = hSvg * (1 - tick);
            return (
              <g key={tick}>
                <line
                  x1="0"
                  y1={yTick}
                  x2={wSvg}
                  y2={yTick}
                  stroke={theme.cardBorder}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <line
                  x1="0"
                  y1={yTick}
                  x2="16"
                  y2={yTick}
                  stroke={theme.inkMuted}
                  strokeWidth="1.4"
                />
                <text
                  x="20"
                  y={yTick + 3.5}
                  fill={theme.inkMuted}
                  fontFamily={FONTS.mono}
                  fontSize="9.5"
                  fontWeight="700"
                >
                  {Math.round(tick * 100)}%
                </text>
              </g>
            );
          })}

          {data.overflowThreshold !== undefined && (
            <g>
              <line
                x1="0"
                y1={hSvg * (1 - data.overflowThreshold)}
                x2={wSvg}
                y2={hSvg * (1 - data.overflowThreshold)}
                stroke={theme.liabilityInk}
                strokeWidth="1.4"
                strokeDasharray="6 4"
              />
              <text
                x={wSvg - 8}
                y={Math.max(12, hSvg * (1 - data.overflowThreshold) - 5)}
                textAnchor="end"
                fill={theme.liabilityInk}
                fontFamily={FONTS.mono}
                fontSize="9"
                fontWeight="700"
              >
                SPILL LIMIT
              </text>
            </g>
          )}

          <path d={wavePath} fill={liquidTone} opacity={0.34} />
          <line
            x1="0"
            y1={ySurface}
            x2={wSvg}
            y2={ySurface}
            stroke={liquidTone}
            strokeWidth="2.4"
          />

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
              fontSize: "9.5px",
              fontWeight: 700,
              padding: "3px 8px",
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

      {/* Telemetry Status Footer */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${theme.cardBorder}`,
          paddingTop: "8px",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: liquidTone,
          }}
        >
          {data.statusText ?? "ACTIVE BASIN"}
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "10.5px",
            fontWeight: 700,
            color: theme.inkMuted,
            ...TABULAR_NUM_STYLE,
          }}
        >
          START {Math.round(data.initialFill * 100)}% → {Math.round(clampedFill * 100)}%
        </span>
      </div>
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
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const torque = physics.torqueByActorId[layout.id];
  const tiltDeg = torque ? torque.tiltDeg : 0;
  const rad = (tiltDeg * Math.PI) / 180;
  const cx = 210;
  const fulcrumY = 74;
  const halfBeam = 122;
  const leftTipX = cx - Math.cos(rad) * halfBeam;
  const leftTipY = fulcrumY - Math.sin(rad) * halfBeam;
  const rightTipX = cx + Math.cos(rad) * halfBeam;
  const rightTipY = fulcrumY + Math.sin(rad) * halfBeam;

  const leftLines = wrapTextToLines(data.leftLabel, 19, 2);
  const rightLines = wrapTextToLines(data.rightLabel, 19, 2);
  const maxW = Math.max(data.leftWeight, data.rightWeight, 1);
  const leftBarPct = Math.max(4, (data.leftWeight / maxW) * 100);
  const rightBarPct = Math.max(4, (data.rightWeight / maxW) * 100);
  const showComparativeLedger = !compact && layout.rect.height >= 430;

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.title}
        badgeText={data.ratioBadge}
        badgeSolid={false}
        accentColor={theme.liabilityInk}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16.5 : 21}
      />

      {/* Torque Fulcrum & Plumb-Suspended Pans */}
      <div
        style={{
          flex: 1,
          minHeight: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.cardWellBg,
          borderRadius: "8px",
          border: `1px solid ${theme.cardBorder}`,
          padding: "6px",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 420 245">
          {/* Base & Fulcrum Pillar */}
          <line x1="146" y1="226" x2="274" y2="226" stroke={theme.inkPrimary} strokeWidth="3.2" />
          <polygon
            points="198,226 222,226 215,74 205,74"
            fill={theme.cardBg}
            stroke={theme.inkPrimary}
            strokeWidth="2"
          />
          <path
            d="M 180 74 A 30 30 0 0 1 240 74"
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
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={fulcrumY} r="6.5" fill={theme.liabilityInk} />

          {/* Left Plumb Pan */}
          <line
            x1={leftTipX.toFixed(1)}
            y1={leftTipY.toFixed(1)}
            x2={(leftTipX - 42).toFixed(1)}
            y2={(leftTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <line
            x1={leftTipX.toFixed(1)}
            y1={leftTipY.toFixed(1)}
            x2={(leftTipX + 42).toFixed(1)}
            y2={(leftTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <rect
            x={(leftTipX - 72).toFixed(1)}
            y={(leftTipY + 46).toFixed(1)}
            width="144"
            height="54"
            rx="6"
            fill={theme.cardBg}
            stroke={
              torque?.heavierSide === "left" ? theme.liabilityInk : theme.inkPrimary
            }
            strokeWidth="2"
          />
          <text
            x={leftTipX.toFixed(1)}
            y={(leftTipY + 65).toFixed(1)}
            textAnchor="middle"
            fill={theme.liabilityInk}
            fontFamily={FONTS.mono}
            fontSize="11.5"
            fontWeight="700"
          >
            {data.leftValueText}
          </text>
          {leftLines.map((ln, lIdx) => (
            <text
              key={lIdx}
              x={leftTipX.toFixed(1)}
              y={(leftTipY + 80 + lIdx * 11).toFixed(1)}
              textAnchor="middle"
              fill={theme.inkSecondary}
              fontFamily={FONTS.sans}
              fontSize="9.5"
              fontWeight="600"
            >
              {ln}
            </text>
          ))}

          {/* Right Plumb Pan */}
          <line
            x1={rightTipX.toFixed(1)}
            y1={rightTipY.toFixed(1)}
            x2={(rightTipX - 42).toFixed(1)}
            y2={(rightTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <line
            x1={rightTipX.toFixed(1)}
            y1={rightTipY.toFixed(1)}
            x2={(rightTipX + 42).toFixed(1)}
            y2={(rightTipY + 46).toFixed(1)}
            stroke={theme.inkMuted}
            strokeWidth="1.4"
          />
          <rect
            x={(rightTipX - 72).toFixed(1)}
            y={(rightTipY + 46).toFixed(1)}
            width="144"
            height="54"
            rx="6"
            fill={theme.cardBg}
            stroke={
              torque?.heavierSide === "right" ? theme.solventInk : theme.inkPrimary
            }
            strokeWidth="2"
          />
          <text
            x={rightTipX.toFixed(1)}
            y={(rightTipY + 65).toFixed(1)}
            textAnchor="middle"
            fill={theme.solventInk}
            fontFamily={FONTS.mono}
            fontSize="11.5"
            fontWeight="700"
          >
            {data.rightValueText}
          </text>
          {rightLines.map((ln, lIdx) => (
            <text
              key={lIdx}
              x={rightTipX.toFixed(1)}
              y={(rightTipY + 80 + lIdx * 11).toFixed(1)}
              textAnchor="middle"
              fill={theme.inkSecondary}
              fontFamily={FONTS.sans}
              fontSize="9.5"
              fontWeight="600"
            >
              {ln}
            </text>
          ))}
        </svg>
      </div>

      {/* Comparative Weight Ledger Strip (Zero Truncation + TreasuryTable9 Bars) */}
      {showComparativeLedger && (
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            borderTop: `1px solid ${theme.cardBorder}`,
            paddingTop: "10px",
            flexShrink: 0,
          }}
        >
          {[
            {
              lbl: data.leftLabel,
              val: data.leftValueText,
              pct: leftBarPct,
              color: theme.liabilityInk,
            },
            {
              lbl: data.rightLabel,
              val: data.rightValueText,
              pct: rightBarPct,
              color: theme.solventInk,
            },
          ].map((side) => (
            <div key={side.lbl}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "10px",
                  marginBottom: "3px",
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
                  {side.lbl}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: side.color,
                    whiteSpace: "nowrap",
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {side.val}
                </span>
              </div>
              <div
                style={{
                  height: "7px",
                  borderRadius: "3px",
                  backgroundColor: theme.cardWellBg,
                  border: `1px solid ${theme.cardBorder}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${side.pct.toFixed(1)}%`,
                    height: "100%",
                    backgroundColor: side.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
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
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const speed = data.speedMultiplier ?? 1.2;
  const gateRatio = data.gateAtRatio ?? 0.62;
  const itemCount = Math.max(1, data.items.length);
  const beltPhase = ((frame / Math.max(1, fps)) * 0.24 * speed) % 1;
  const rollerDeg = (frame * 4.5 * speed) % 360;

  const arenaInnerW = Math.max(200, layout.rect.width - (compact ? 32 : 48));
  const slotPx = (arenaInnerW * 0.94) / itemCount;
  const itemBoxW = Math.min(116, Math.max(76, Math.floor(slotPx - 10)));
  const showManifestTable = !compact && layout.rect.height >= 430;

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.title}
        badgeText={data.gateLabel ? `GATE: ${data.gateLabel}` : undefined}
        accentColor={theme.liabilityInk}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16.5 : 20}
      />

      {/* Motorized Roller Track & Gate */}
      <div
        style={{
          position: "relative",
          flex: showManifestTable ? "0 0 180px" : 1,
          minHeight: "108px",
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
          const centerX = 12 + u * (arenaInnerW - 24);
          const leftPx = centerX - itemBoxW * 0.5;

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${leftPx.toFixed(1)}px`,
                bottom: "36px",
                width: `${itemBoxW}px`,
                padding: "6px 8px",
                borderRadius: "6px",
                backgroundColor: theme.cardBg,
                border: `1.5px solid ${itemTone}`,
                opacity: vapAlpha,
                transform: `scale(${(0.88 + vapAlpha * 0.12).toFixed(3)})`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "10px",
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
                    fontSize: "10px",
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
                left: "-42px",
                width: "84px",
                textAlign: "center",
                fontFamily: FONTS.mono,
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 4px",
                borderRadius: "4px",
                backgroundColor: theme.riskWash,
                color: theme.liabilityInk,
                border: `1px solid ${theme.liabilityInk}`,
                whiteSpace: "nowrap",
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

      {/* Tight Hairline Throughput Manifest Table in Tall Columns */}
      {showManifestTable && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 0,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              fontFamily: FONTS.mono,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: theme.inkMuted,
              borderBottom: `1px solid ${theme.cardBorder}`,
              padding: "0 4px 5px",
            }}
          >
            <span>QUEUED LOAD</span>
            <span>THROUGHPUT</span>
          </div>
          {data.items.map((item, idx) => {
            const itemTone = resolveToneColor(item.tone ?? "navy", theme);
            return (
              <div
                key={`row-${item.id}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  alignItems: "center",
                  padding: "9px 4px",
                  borderBottom: `1px solid ${theme.cardBorder}`,
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: theme.inkPrimary,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: itemTone,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {item.value ?? (item.vaporizeAtGate ? "CAPPED" : "ACTIVE")}
                </span>
              </div>
            );
          })}
        </div>
      )}
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
  const accentColor = resolveToneColor(layout.actor.tone ?? "navy", theme);
  const ramp = interpolate(progress, [0.08, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const primaryFill = (data.progressTo ?? 0.85) * ramp;
  const secondaryFill = data.secondaryLane
    ? clamp01(data.secondaryLane.progressTo * Math.min(1, ramp * 1.9))
    : 0;

  // Use vertical milestone spine ladder in tall narrow columns (e.g. SP12 center-hero)
  const useVerticalLadder =
    !compact && layout.rect.width < 780 && layout.rect.height >= 340;

  return (
    <div style={buildEditorialCardStyle(theme, accentColor, compact)}>
      <CardOxfordHeader
        eyebrow={data.eyebrow}
        title={data.title}
        badgeText={
          data.progressTo !== undefined
            ? `${Math.round(primaryFill * 100)}% COMPLETE`
            : undefined
        }
        accentColor={accentColor}
        theme={theme}
        compact={compact}
        titleFontSize={compact ? 16 : 20}
      />

      {/* Optional Secondary Fast-Deployment Lane (e.g. 6-Mo Coding Agent vs 10-Yr Grid) */}
      {data.secondaryLane && (
        <div
          style={{
            padding: compact ? "7px 10px" : "10px 14px",
            borderRadius: "8px",
            backgroundColor: theme.cardWellBg,
            border: `1px solid ${theme.cardBorder}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: compact ? "11.5px" : "12.5px",
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
                  whiteSpace: "nowrap",
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
              border: `1px solid ${theme.cardBorder}`,
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
      {useVerticalLadder ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "10px",
            minHeight: 0,
          }}
        >
          <div
            style={{
              height: "7px",
              borderRadius: "4px",
              backgroundColor: theme.cardWellBg,
              border: `1px solid ${theme.cardBorder}`,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${(primaryFill * 100).toFixed(1)}%`,
                height: "100%",
                backgroundColor: accentColor,
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "8px",
              paddingLeft: "10px",
              borderLeft: `2px solid ${theme.cardBorder}`,
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: theme.cardWellBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderLeft: `4px solid ${dotColor}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: dotColor,
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {ms.tick}
                    </div>
                    <div
                      style={{
                        marginTop: "2px",
                        fontFamily: FONTS.sans,
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: theme.inkPrimary,
                      }}
                    >
                      {ms.label}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: theme.cardBg,
                      color: dotColor,
                      border: `1px solid ${theme.cardBorder}`,
                      whiteSpace: "nowrap",
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {ms.metric ?? (ms.status ?? "OK").toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            paddingTop: "4px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              height: "6px",
              borderRadius: "3px",
              backgroundColor: theme.cardWellBg,
              border: `1px solid ${theme.cardBorder}`,
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: `${(primaryFill * 100).toFixed(1)}%`,
                height: "100%",
                backgroundColor: accentColor,
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, data.milestones.length)}, minmax(0, 1fr))`,
              gap: "10px",
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
                <div key={`${ms.tick}-${idx}`} style={{ minWidth: 0 }}>
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
                      fontSize: compact ? "10.5px" : "12px",
                      fontWeight: 600,
                      lineHeight: 1.22,
                      color: theme.inkPrimary,
                    }}
                  >
                    {ms.label}
                  </div>
                  {ms.metric && (
                    <div
                      style={{
                        marginTop: "2px",
                        fontFamily: FONTS.mono,
                        fontSize: "10px",
                        fontWeight: 600,
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
      )}
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

  const stampFontSize = compact
    ? 20
    : data.stampText.length > 28
      ? 24
      : layout.rect.width < 460
        ? 25
        : 30;

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
          padding: compact ? "10px 14px" : "16px 24px",
          borderRadius: "8px",
          backgroundColor: theme.cardBg,
          border: `3px solid ${inkColor}`,
          boxShadow: `inset 0 0 0 3px ${theme.cardBg}, inset 0 0 0 4.5px ${inkColor}, 0 14px 32px rgba(15, 25, 35, 0.22)`,
          textAlign: "center",
          boxSizing: "border-box",
          overflow: "hidden",
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
            fontSize: `${stampFontSize}px`,
            fontWeight: 700,
            letterSpacing: "0.05em",
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
              fontSize: compact ? "11px" : "12px",
              fontWeight: 500,
              lineHeight: 1.3,
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

function computeEndpointArrowPoints(
  tipX: number,
  tipY: number,
  fromX: number,
  fromY: number,
  lengthPx: number = 9,
  halfWidthPx: number = 4.6
): { poly: string; shaftEndX: number; shaftEndY: number } {
  const dx = tipX - fromX;
  const dy = tipY - fromY;
  const dist = Math.max(0.001, Math.hypot(dx, dy));
  const ux = dx / dist;
  const uy = dy / dist;
  const nx = -uy;
  const ny = ux;
  const baseX = tipX - ux * lengthPx;
  const baseY = tipY - uy * lengthPx;
  const p1x = baseX + nx * halfWidthPx;
  const p1y = baseY + ny * halfWidthPx;
  const p2x = baseX - nx * halfWidthPx;
  const p2y = baseY - ny * halfWidthPx;
  return {
    poly: `${tipX.toFixed(1)},${tipY.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(
      1
    )} ${p2x.toFixed(1)},${p2y.toFixed(1)}`,
    shaftEndX: baseX,
    shaftEndY: baseY,
  };
}

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

  // 3. Dimension-Line (Architectural Drafting Witness Caliper With Crisp Edge Arrowheads)
  if (conn.kind === "dimension-line") {
    const drawP = interpolate(progress, [0.06, 0.34], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    // Inset 3px inside the inter-card air so witness ticks sit cleanly adjacent to card edges
    const inset = Math.min(3, len * 0.08);
    const sX = startPoint.x + ux * inset;
    const sY = startPoint.y + uy * inset;
    const eX = endPoint.x - ux * inset;
    const eY = endPoint.y - uy * inset;
    const curX = sX + (eX - sX) * drawP;
    const curY = sY + (eY - sY) * drawP;
    const arrowLeft = computeEndpointArrowPoints(sX, sY, eX, eY, 7.5, 3.8);
    const arrowRight = computeEndpointArrowPoints(eX, eY, sX, sY, 7.5, 3.8);

    return (
      <g opacity={0.9}>
        <line
          x1={(sX - nx * 7).toFixed(1)}
          y1={(sY - ny * 7).toFixed(1)}
          x2={(sX + nx * 7).toFixed(1)}
          y2={(sY + ny * 7).toFixed(1)}
          stroke={strokeColor}
          strokeWidth={1.8}
        />
        <line
          x1={arrowLeft.shaftEndX.toFixed(1)}
          y1={arrowLeft.shaftEndY.toFixed(1)}
          x2={drawP > 0.94 ? arrowRight.shaftEndX.toFixed(1) : curX.toFixed(1)}
          y2={drawP > 0.94 ? arrowRight.shaftEndY.toFixed(1) : curY.toFixed(1)}
          stroke={strokeColor}
          strokeWidth={1.7}
        />
        <polygon points={arrowLeft.poly} fill={strokeColor} />
        {drawP > 0.94 && (
          <>
            <polygon points={arrowRight.poly} fill={strokeColor} />
            <line
              x1={(eX - nx * 7).toFixed(1)}
              y1={(eY - ny * 7).toFixed(1)}
              x2={(eX + nx * 7).toFixed(1)}
              y2={(eY + ny * 7).toFixed(1)}
              stroke={strokeColor}
              strokeWidth={1.8}
            />
          </>
        )}
      </g>
    );
  }

  // 4. Laser-Scan (Precision Telemetry Beam + Clean Edge-Landing Arrowhead)
  if (conn.kind === "laser-scan") {
    const active = progress >= (conn.triggerAtProgress ?? 0.12);
    const ended =
      conn.endAtProgress !== undefined && progress > conn.endAtProgress;
    const pulseU = 0.14 + (((frame / Math.max(1, fps)) * 1.15) % 1) * 0.7;
    const pulseSample = samplePointAlongWaypoints(waypoints, pulseU);
    const prevSample = samplePointAlongWaypoints(
      waypoints,
      Math.max(0, pulseU - 0.08)
    );

    const prevWp =
      waypoints.length >= 2
        ? waypoints[waypoints.length - 2]
        : startPoint;
    const arrow = computeEndpointArrowPoints(
      endPoint.x,
      endPoint.y,
      prevWp.x,
      prevWp.y,
      9,
      4.5
    );
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const beamStartX = startPoint.x + ux * 2;
    const beamStartY = startPoint.y + uy * 2;
    const dashOffset = -((frame * 2.2) % 24);

    return (
      <g opacity={ended ? 0.32 : active ? 0.95 : 0.28}>
        {/* Soft optical casing */}
        <line
          x1={beamStartX.toFixed(1)}
          y1={beamStartY.toFixed(1)}
          x2={arrow.shaftEndX.toFixed(1)}
          y2={arrow.shaftEndY.toFixed(1)}
          stroke={strokeColor}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.14}
        />
        {/* Crisp animated dashed scan line */}
        <line
          x1={beamStartX.toFixed(1)}
          y1={beamStartY.toFixed(1)}
          x2={arrow.shaftEndX.toFixed(1)}
          y2={arrow.shaftEndY.toFixed(1)}
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeDashoffset={active && !ended ? dashOffset : 0}
        />
        {/* Origin emitter tick flush against source card edge */}
        <line
          x1={(beamStartX - nx * 5).toFixed(1)}
          y1={(beamStartY - ny * 5).toFixed(1)}
          x2={(beamStartX + nx * 5).toFixed(1)}
          y2={(beamStartY + ny * 5).toFixed(1)}
          stroke={strokeColor}
          strokeWidth={2.2}
        />
        {/* Crisp arrowhead landing squarely on target card outer edge */}
        <polygon points={arrow.poly} fill={strokeColor} />
        {/* Traveling pulse packet strictly between origin and arrowhead */}
        {active && !ended && (
          <line
            x1={prevSample.point.x.toFixed(1)}
            y1={prevSample.point.y.toFixed(1)}
            x2={pulseSample.point.x.toFixed(1)}
            y2={pulseSample.point.y.toFixed(1)}
            stroke={strokeColor}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
        )}
      </g>
    );
  }

  // 5. Flow-Pipe, Guillotine-Cut & Geodesic-Arc (With Directional Arrowhead & Contained Particles)
  const isSevered =
    (conn.severFlowOnTrigger || conn.kind === "guillotine-cut") &&
    progress >= trigStart;
  const count = conn.particleCount ?? (conn.kind === "geodesic-arc" ? 8 : 16);
  const speed = conn.particleSpeed ?? 1.0;
  const prng = mulberry32(hashStringSeed(conn.id));

  const particles: Array<{ x: number; y: number; r: number; alpha: number }> = [];
  for (let i = 0; i < count; i++) {
    const seedPhase = prng();
    const jitter = (prng() * 2 - 1) * 1.8;
    const r = 2.4 + prng() * 1.3;
    const rawU = (seedPhase + (frame / Math.max(1, fps)) * 0.44 * speed) % 1;
    const u = 0.06 + rawU * 0.84;
    if (isSevered && u > 0.48) {
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

  const prevWp =
    waypoints.length >= 2
      ? waypoints[waypoints.length - 2]
      : startPoint;
  const endArrow = computeEndpointArrowPoints(
    endPoint.x,
    endPoint.y,
    prevWp.x,
    prevWp.y,
    9,
    4.6
  );

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
        strokeWidth={conn.kind === "geodesic-arc" ? 3.2 : 6}
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
        opacity={0.78}
      />

      {/* Crisp Terminal Arrowhead Landing on Target Card Edge */}
      <polygon
        points={endArrow.poly}
        fill={strokeColor}
        opacity={isSevered ? 0.35 : 0.92}
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
            x="-11"
            y="-20"
            width="22"
            height="40"
            rx="3"
            fill={theme.cardBg}
            stroke={theme.liabilityInk}
            strokeWidth="1.8"
          />
          <polygon
            points={`-8,${(-16 + bladeSp * 18).toFixed(1)} 8,${(
              -10 +
              bladeSp * 18
            ).toFixed(1)} 8,${(-20 + bladeSp * 18).toFixed(1)} -8,${(
              -20 +
              bladeSp * 18
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

      {/* Non-Colliding Multi-Line Channel-Clamped Connector Callout Pills */}
      {visibleConnectors.map((connLayout) => {
        const text =
          connLayout.connector.metricBadge ?? connLayout.connector.label;
        const box = connLayout.badgeRect;
        if (!text || !box) return null;
        const badgeTone = resolveToneColor(
          connLayout.connector.tone ?? "navy",
          theme
        );
        const lines = connLayout.badgeLines ?? [text];

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
              border: `1.5px solid ${badgeTone}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px 6px",
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 18,
              boxShadow: "0 4px 12px rgba(15, 25, 35, 0.14)",
            }}
          >
            {lines.map((ln, lIdx) => (
              <span
                key={lIdx}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "9.5px",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "0.04em",
                  color: badgeTone,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {ln}
              </span>
            ))}
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
  blueprint: SceneBlueprint;
  siblingRenderedPropIds: Readonly<Record<string, boolean>>;
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
  blueprint,
  siblingRenderedPropIds,
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
    blueprint,
    siblingRenderedPropIds,
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

  const siblingRenderedPropIds = useMemo(() => {
    const used: Record<string, boolean> = {};
    for (let i = 0; i < resolvedBlueprint.actors.length; i++) {
      const act = resolvedBlueprint.actors[i];
      if (act.kind === "prop-rig" && act.propRig && !(act.propRig.slices && act.propRig.slices.length > 0)) {
        const pid =
          act.propRig.propId ??
          ARCHETYPE_TO_PROP_ID[act.propRig.archetype] ??
          "hero-w2-withholding-guillotine";
        used[pid] = true;
      }
    }
    return used;
  }, [resolvedBlueprint]);

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
                blueprint={resolvedBlueprint}
                siblingRenderedPropIds={siblingRenderedPropIds}
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
                blueprint={resolvedBlueprint}
                siblingRenderedPropIds={siblingRenderedPropIds}
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
              blueprint={resolvedBlueprint}
              siblingRenderedPropIds={siblingRenderedPropIds}
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
          blueprint={resolvedBlueprint}
          siblingRenderedPropIds={siblingRenderedPropIds}
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
