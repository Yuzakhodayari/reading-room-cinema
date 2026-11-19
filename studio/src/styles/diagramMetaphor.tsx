import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Layers, Scissors, Wrench } from "lucide-react";
import { FONTS, TABULAR_NUM_STYLE } from "../design/fonts";
import { fitSvgTextToWidth, wrapSvgTextLines } from "../design/fitText";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  REGISTERS,
  RegisterId,
  RegisterPalette,
  SPRINGS,
} from "../design/tokens";

const TABULAR_NUMS: React.CSSProperties = TABULAR_NUM_STYLE;

const ELASTIC_POP = {
  damping: 16,
  mass: 0.7,
  stiffness: 170,
  overshootClamping: false,
} as const;

export type DiagramDisplayMode = "card" | "page" | "over-footage";

function resolveDiagramRegister(register?: RegisterId): RegisterPalette {
  return REGISTERS[register ?? "page_editorial"];
}

function getEditorialShadow(isDark: boolean): string {
  return isDark
    ? "0 24px 52px -14px rgba(3, 9, 18, 0.54), 0 4px 16px rgba(3, 9, 18, 0.30)"
    : "0 24px 52px -14px rgba(28, 43, 58, 0.16), 0 4px 16px rgba(28, 43, 58, 0.06)";
}

interface FittedSvgTextProps {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize?: number;
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  dominantBaseline?: "auto" | "central" | "hanging";
  style?: React.CSSProperties;
}

const FittedSvgText: React.FC<FittedSvgTextProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "start",
  dominantBaseline,
  style,
}) => {
  const fitted = fitSvgTextToWidth(
    text,
    maxWidth,
    fontSize,
    minFontSize ?? Math.max(9.5, fontSize * 0.68),
    fontFamily,
    { fontWeight }
  );
  return (
    <text
      x={x}
      y={y}
      fontFamily={fontFamily}
      fontSize={fitted.fontSize}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline={dominantBaseline}
      style={style}
    >
      {fitted.text}
    </text>
  );
};

interface WrappedSvgTextProps {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize?: number;
  maxLines?: number;
  lineHeight?: number;
  fontFamily: string;
  fontWeight?: number | string;
  fill: string;
  textAnchor?: "start" | "middle" | "end";
  verticalCenter?: boolean;
  style?: React.CSSProperties;
}

const WrappedSvgText: React.FC<WrappedSvgTextProps> = ({
  text,
  x,
  y,
  maxWidth,
  fontSize,
  minFontSize,
  maxLines = 2,
  lineHeight = 1.18,
  fontFamily,
  fontWeight = 700,
  fill,
  textAnchor = "middle",
  verticalCenter = false,
  style,
}) => {
  const wrapped = wrapSvgTextLines(text, maxWidth, fontSize, fontFamily, maxLines, {
    minFontSize: minFontSize ?? Math.max(9.5, fontSize * 0.68),
    lineHeight,
    fontWeight,
  });
  if (wrapped.lines.length === 0) return null;
  const totalHeight = (wrapped.lines.length - 1) * wrapped.lineHeightPx;
  const startY = verticalCenter ? y - totalHeight * 0.5 : y;

  return (
    <text
      x={x}
      y={startY}
      fontFamily={fontFamily}
      fontSize={wrapped.fontSize}
      fontWeight={fontWeight}
      fill={fill}
      textAnchor={textAnchor}
      dominantBaseline={verticalCenter ? "central" : undefined}
      style={style}
    >
      {wrapped.lines.map((line, idx) => (
        <tspan key={`wsl-${idx}`} x={x} dy={idx === 0 ? 0 : wrapped.lineHeightPx}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

// ============================================================================
// 1. StickerCutout (10px warm-milk outline + soft shadow + deterministic pop)
// ============================================================================
export interface StickerCutoutProps {
  children?: React.ReactNode;
  outlineWidth?: number;
  rotation?: number;
  atFrame?: number;
  className?: string;
  style?: React.CSSProperties;
  mode?: DiagramDisplayMode;
  register?: RegisterId;
  eyebrow?: string;
  title?: string;
  caption?: string;
  footnote?: string;
}

export const StickerCutout: React.FC<StickerCutoutProps> = ({
  children,
  outlineWidth = 10,
  rotation = 2.5,
  atFrame = 0,
  className,
  style,
  mode = "card",
  register,
  eyebrow = "EDITORIAL CUTOUT",
  title,
  caption,
  footnote,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const popSpring = spring({
    frame: elapsed,
    fps,
    config: ELASTIC_POP,
    durationInFrames: 16,
  });

  const driftY = Math.sin(frame * 0.04) * 3.5;
  const isOverFootage = mode === "over-footage";
  const reg = resolveDiagramRegister(register);
  const accentColor = isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability;

  const stickerNode = (
    <div
      className={className}
      style={{
        display: "inline-block",
        transform: `translate3d(0, ${driftY.toFixed(2)}px, 0) scale(${popSpring.toFixed(4)}) rotate(${rotation}deg)`,
        padding: `${outlineWidth}px`,
        backgroundColor: isOverFootage ? "rgba(15, 25, 35, 0.72)" : reg.bg.elevated,
        backdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
        WebkitBackdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
        color: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary,
        borderRadius: "18px",
        border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
        boxShadow: getEditorialShadow(isOverFootage || reg.isDark),
        userSelect: "none",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed,
          border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : reg.isDark ? reg.accent.statutory : reg.rule.oxford,
          }}
        />
        {children ?? (
          <div style={{ padding: "30px 34px 28px 34px", maxWidth: "460px" }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "30px",
                fontWeight: 700,
                color: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary,
                marginTop: "8px",
                lineHeight: 1.2,
              }}
            >
              {title ?? "Physical Constraint Exhibit"}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (mode !== "page") {
    return stickerNode;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        alignItems: "center",
        padding: "88px 104px",
        boxSizing: "border-box",
        gap: "72px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: reg.accent.liability,
          }}
        >
          <Scissors size={16} color={reg.accent.liability} />
          <span>{eyebrow}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "60px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: reg.ink.primary,
          }}
        >
          {title ?? "Tactile Cutout Exhibit"}
        </h1>
        {caption && (
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: "24px",
              lineHeight: 1.48,
              color: reg.ink.muted,
              maxWidth: "680px",
            }}
          >
            {caption}
          </p>
        )}
        {footnote && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: `1px solid ${reg.rule.hairline}`,
              fontFamily: FONTS.mono,
              fontSize: "14px",
              color: reg.ink.muted,
              ...TABULAR_NUMS,
            }}
          >
            {footnote}
          </div>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {stickerNode}
      </div>
    </div>
  );
};

// ============================================================================
// 2. StickFigureStage (Articulated SVG Stick Figure with 9 Poses + Full Grid)
// ============================================================================
export type StickPose =
  | "idle"
  | "shocked"
  | "walking"
  | "pointing"
  | "crushed-by-debt"
  | "carrying-briefcase"
  | "holding-umbrella"
  | "pulling-lever"
  | "shrugging";

export interface StickFigureStageProps {
  pose?: StickPose;
  caption?: string;
  slabLabel?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  metricValue?: string;
  metricLabel?: string;
  accentColor?: string;
  width?: number;
  height?: number;
  mode?: DiagramDisplayMode;
  register?: RegisterId;
  atFrame?: number;
}

export const StickFigureStage: React.FC<StickFigureStageProps> = ({
  pose = "idle",
  caption,
  slabLabel,
  eyebrow = "BEHAVIORAL MECHANICS",
  title,
  subtitle,
  metricValue,
  metricLabel,
  accentColor,
  width = 380,
  height = 480,
  mode = "card",
  register,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const enter = spring({
    frame: elapsed,
    fps,
    config: SPRINGS.documentSnap,
  });
  const sweepPct = interpolate(elapsed, [10, 42], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const reg = resolveDiagramRegister(register);
  const isOverFootage = mode === "over-footage";
  const resolvedAccent = accentColor ?? (isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability);
  const strokeInk = isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary;
  const headFill = isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed;

  let headY = 82;
  let spinePath = "M 190 115 L 190 260";
  let leftArm = "M 190 145 Q 150 190 130 230";
  let rightArm = "M 190 145 Q 230 190 250 230";
  let leftLeg = "M 190 260 Q 170 330 150 400";
  let rightLeg = "M 190 260 Q 210 330 230 400";
  let weightBoxY = -220;

  if (pose === "shocked") {
    headY = 72 + Math.sin(frame * 0.45) * 3;
    leftArm = "M 190 145 Q 120 120 112 78";
    rightArm = "M 190 145 Q 260 120 268 78";
  } else if (pose === "walking") {
    const walkCycle = Math.sin(frame * 0.22);
    leftLeg = `M 190 260 Q ${(170 - walkCycle * 25).toFixed(1)} 330 ${(150 - walkCycle * 40).toFixed(1)} 400`;
    rightLeg = `M 190 260 Q ${(210 + walkCycle * 25).toFixed(1)} 330 ${(230 + walkCycle * 40).toFixed(1)} 400`;
    leftArm = `M 190 145 Q ${(150 + walkCycle * 25).toFixed(1)} 190 ${(130 + walkCycle * 35).toFixed(1)} 230`;
    rightArm = `M 190 145 Q ${(230 - walkCycle * 25).toFixed(1)} 190 ${(250 - walkCycle * 35).toFixed(1)} 230`;
  } else if (pose === "pointing") {
    leftArm = "M 190 145 Q 160 200 148 240";
    rightArm = "M 190 145 L 304 128";
  } else if (pose === "crushed-by-debt") {
    headY = 176;
    spinePath = "M 190 210 Q 190 242 190 282";
    leftArm = "M 190 215 Q 132 180 142 140";
    rightArm = "M 190 215 Q 248 180 238 140";
    leftLeg = "M 190 282 Q 140 332 132 388";
    rightLeg = "M 190 282 Q 240 332 248 388";
    weightBoxY = 60 + Math.sin(frame * 0.06) * 3.5;
  } else if (pose === "carrying-briefcase") {
    leftArm = "M 190 145 Q 156 192 148 236";
    rightArm = "M 190 145 Q 232 192 242 238";
  } else if (pose === "holding-umbrella") {
    leftArm = "M 190 145 Q 154 195 144 235";
    rightArm = "M 190 145 Q 225 140 232 110";
  } else if (pose === "pulling-lever") {
    const pull = interpolate(elapsed, [0, 28], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    rightArm = `M 190 145 L ${(278 - pull * 18).toFixed(1)} ${(122 + pull * 54).toFixed(1)}`;
  } else if (pose === "shrugging") {
    leftArm = "M 190 148 L 142 168 L 116 128";
    rightArm = "M 190 148 L 238 168 L 264 128";
  }

  const resolvedSlabLabel =
    slabLabel && slabLabel.trim().length > 0
      ? slabLabel.trim()
      : metricValue && metricValue.trim().length > 0
      ? metricValue.trim()
      : caption && caption.trim().length > 0 && caption.trim().length <= 22
      ? caption.trim().toUpperCase()
      : "FIXED OBLIGATION";

  const figureSvg = (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: enter,
        transform: `translate3d(0, ${(1 - enter) * 18}px, 0)`,
        userSelect: "none",
      }}
    >
      <svg width={width} height={height} viewBox="0 0 380 480">
        {pose === "crushed-by-debt" && (
          <g transform={`translate(75, ${weightBoxY.toFixed(2)})`}>
            <rect
              width="230"
              height="82"
              rx="8"
              fill={PAGE_PALETTE.navy}
              stroke={resolvedAccent}
              strokeWidth="3"
            />
            <WrappedSvgText
              text={resolvedSlabLabel}
              x={115}
              y={41}
              maxWidth={204}
              fontSize={16}
              minFontSize={11}
              maxLines={2}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={OVER_FOOTAGE_PALETTE.textHeadline}
              textAnchor="middle"
              verticalCenter
              style={TABULAR_NUMS}
            />
          </g>
        )}

        {pose === "holding-umbrella" && (
          <g>
            <path
              d="M 110 72 Q 195 14 285 72 Z"
              fill={PAGE_PALETTE.navy}
              stroke={resolvedAccent}
              strokeWidth="3"
            />
            <line x1="232" y1="52" x2="232" y2="148" stroke={strokeInk} strokeWidth="5" />
          </g>
        )}

        {pose === "pulling-lever" && (
          <g>
            <rect x="275" y="190" width="54" height="210" rx="6" fill={reg.bg.recessed} stroke={strokeInk} strokeWidth="4" />
            <line x1="302" y1="190" x2="268" y2="146" stroke={resolvedAccent} strokeWidth="6" strokeLinecap="round" />
            <circle cx="268" cy="146" r="10" fill={resolvedAccent} />
          </g>
        )}

        <circle
          cx="190"
          cy={headY}
          r="30"
          fill={headFill}
          stroke={strokeInk}
          strokeWidth="8"
        />
        <path d={spinePath} fill="none" stroke={strokeInk} strokeWidth="8" strokeLinecap="round" />
        <path d={leftArm} fill="none" stroke={strokeInk} strokeWidth="8" strokeLinecap="round" />
        <path d={rightArm} fill="none" stroke={strokeInk} strokeWidth="8" strokeLinecap="round" />
        <path d={leftLeg} fill="none" stroke={strokeInk} strokeWidth="8" strokeLinecap="round" />
        <path d={rightLeg} fill="none" stroke={strokeInk} strokeWidth="8" strokeLinecap="round" />

        {pose === "carrying-briefcase" && (
          <g transform="translate(220, 238)">
            <rect width="58" height="42" rx="5" fill={PAGE_PALETTE.navy} stroke={resolvedAccent} strokeWidth="2.5" />
            <path d="M 18 0 L 18 -9 L 40 -9 L 40 0" fill="none" stroke={strokeInk} strokeWidth="3" />
          </g>
        )}

        <line x1="40" y1="400" x2="340" y2="400" stroke={reg.ink.muted} strokeWidth="3" strokeLinecap="round" />
      </svg>

      {caption && (
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: "15px",
            fontWeight: 700,
            color: isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : reg.ink.primary,
            marginTop: "8px",
            textAlign: "center",
            maxWidth: `${width}px`,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );

  if (mode !== "page") {
    if (isOverFootage) {
      return (
        <div
          style={{
            position: "relative",
            width: "440px",
            background: OVER_FOOTAGE_PALETTE.glassPrimary,
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            border: `1px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`,
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 22px 48px rgba(15, 25, 35, 0.48)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {figureSvg}
        </div>
      );
    }
    return figureSvg;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        display: "grid",
        gridTemplateColumns: "1.08fr 0.92fr",
        alignItems: "center",
        padding: "84px 108px",
        boxSizing: "border-box",
        gap: "72px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: resolvedAccent,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "62px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: reg.ink.primary,
          }}
        >
          {title ?? caption ?? "Household Balance-Sheet Pressure"}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: "24px",
              lineHeight: 1.48,
              color: reg.ink.muted,
              maxWidth: "740px",
            }}
          >
            {subtitle}
          </p>
        )}

        {metricValue && (
          <div
            style={{
              marginTop: "12px",
              display: "inline-flex",
              flexDirection: "column",
              gap: "6px",
              padding: "22px 28px",
              backgroundColor: reg.bg.elevated,
              border: `1px solid ${reg.rule.hairline}`,
              borderLeft: `4px solid ${resolvedAccent}`,
              borderRadius: "10px",
              alignSelf: "flex-start",
              boxShadow: getEditorialShadow(reg.isDark),
            }}
          >
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "fit-content" }}>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "4px",
                  height: "24px",
                  width: `${sweepPct}%`,
                  backgroundColor: reg.accent.highlighterWash,
                  borderRadius: "3px",
                  zIndex: 1,
                }}
              />
              <span
                style={{
                  position: "relative",
                  zIndex: 2,
                  fontFamily: FONTS.mono,
                  fontSize: "44px",
                  fontWeight: 700,
                  color: reg.ink.primary,
                  ...TABULAR_NUMS,
                }}
              >
                {metricValue}
              </span>
            </div>
            {metricLabel && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: reg.ink.muted,
                }}
              >
                {metricLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: reg.bg.elevated,
          border: `1px solid ${reg.rule.hairline}`,
          borderRadius: "12px",
          padding: "44px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: getEditorialShadow(reg.isDark),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: reg.isDark ? reg.accent.statutory : reg.rule.oxford,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />
        {figureSvg}
      </div>
    </div>
  );
};

// ============================================================================
// 3. InstructionManualCard (Technical Line-Art Step Sequence, Zero Hardcoded Tax)
// ============================================================================
export interface ManualStepItem {
  stepNumber: number;
  label: string;
  fromLabel: string;
  toLabel: string;
  note?: string;
}

export interface InstructionManualCardProps {
  stepNumber?: number;
  title: string;
  partsCount?: string;
  leftLabel?: string;
  rightLabel?: string;
  linkLabel?: string;
  steps?: ManualStepItem[];
  eyebrow?: string;
  subtitle?: string;
  footnote?: string;
  mode?: DiagramDisplayMode;
  register?: RegisterId;
  atFrame?: number;
}

export const InstructionManualCard: React.FC<InstructionManualCardProps> = ({
  stepNumber = 1,
  title,
  partsCount,
  leftLabel = "INPUT STATE",
  rightLabel = "RESULT STATE",
  linkLabel = "MECHANISM",
  steps,
  eyebrow = "TECHNICAL ASSEMBLY MANUAL",
  subtitle,
  footnote,
  mode = "card",
  register,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < atFrame) return null;
  const elapsed = frame - atFrame;
  const enter = spring({
    frame: elapsed,
    fps,
    config: SPRINGS.documentSnap,
  });

  const reg = resolveDiagramRegister(register);
  const isOverFootage = mode === "over-footage";
  const resolvedSteps: ManualStepItem[] =
    steps && steps.length > 0
      ? steps
      : [
          {
            stepNumber,
            label: title,
            fromLabel: leftLabel,
            toLabel: rightLabel,
            note: linkLabel,
          },
        ];

  const resolvedPartsCount =
    partsCount ?? `SPEC · ${String(resolvedSteps.length).padStart(2, "0")} ${resolvedSteps.length === 1 ? "STAGE" : "STAGES"}`;

  if (mode !== "page") {
    const cardInk = isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary;
    const cardMuted = isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : reg.ink.muted;
    const cardStroke = isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : reg.isDark ? reg.accent.statutory : reg.rule.oxford;
    const boxLeftBg = isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed;
    const boxRightBg = isOverFootage ? "rgba(79, 179, 174, 0.22)" : reg.accent.highlighterWash;

    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "580px",
          background: isOverFootage ? OVER_FOOTAGE_PALETTE.glassPrimary : reg.bg.elevated,
          backdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
          border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
          borderRadius: "12px",
          padding: "28px 34px",
          boxSizing: "border-box",
          boxShadow: getEditorialShadow(isOverFootage || reg.isDark),
          transform: `scale(${(0.92 + 0.08 * enter).toFixed(4)})`,
          opacity: enter,
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : cardStroke,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1.5px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
            paddingBottom: "14px",
            marginBottom: "16px",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                flexShrink: 0,
                borderRadius: "50%",
                backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : cardStroke,
                color: isOverFootage ? PAGE_PALETTE.navyDeep : reg.bg.elevated,
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...TABULAR_NUMS,
              }}
            >
              {stepNumber}
            </div>
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "19px",
                fontWeight: 800,
                color: cardInk,
                lineHeight: 1.2,
              }}
            >
              {title}
            </span>
          </div>

          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "12px",
              color: cardMuted,
              fontWeight: 700,
              flexShrink: 0,
              ...TABULAR_NUMS,
            }}
          >
            {resolvedPartsCount}
          </span>
        </div>

        <svg width="512" height="150" viewBox="0 0 512 150">
          <rect
            x="14"
            y="26"
            width="178"
            height="86"
            rx="6"
            fill={boxLeftBg}
            stroke={cardStroke}
            strokeWidth="2.2"
          />
          <WrappedSvgText
            text={leftLabel}
            x={103}
            y={69}
            maxWidth={152}
            fontSize={15}
            minFontSize={12}
            maxLines={2}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={cardInk}
            textAnchor="middle"
            verticalCenter
            style={TABULAR_NUMS}
          />
          <rect
            x="320"
            y="26"
            width="178"
            height="86"
            rx="6"
            fill={boxRightBg}
            stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : cardStroke}
            strokeWidth="2.2"
          />
          <WrappedSvgText
            text={rightLabel}
            x={409}
            y={69}
            maxWidth={152}
            fontSize={15}
            minFontSize={12}
            maxLines={2}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={cardInk}
            textAnchor="middle"
            verticalCenter
            style={TABULAR_NUMS}
          />
          <line
            x1="192"
            y1="69"
            x2="314"
            y2="69"
            stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability}
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />
          <polygon
            points="310,62 322,69 310,76"
            fill={isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability}
          />
          <FittedSvgText
            text={linkLabel}
            x={256}
            y={52}
            maxWidth={118}
            fontSize={13}
            minFontSize={10.5}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={cardMuted}
            textAnchor="middle"
          />
        </svg>
      </div>
    );
  }

  // Full 1920x1080 Technical Manual Sheet
  const topBarColor = reg.isDark ? reg.accent.statutory : reg.rule.oxford;
  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        padding: "68px 92px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `2.5px solid ${topBarColor}`,
          paddingBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: FONTS.mono,
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: reg.accent.liability,
              textTransform: "uppercase",
            }}
          >
            <Wrench size={16} color={reg.accent.liability} />
            <span>{eyebrow}</span>
          </div>
          <h1
            style={{
              margin: "10px 0 0 0",
              fontFamily: FONTS.serif,
              fontSize: "54px",
              fontWeight: 700,
              color: reg.ink.primary,
              lineHeight: 1.08,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin: "10px 0 0 0",
                fontFamily: FONTS.sans,
                fontSize: "21px",
                color: reg.ink.muted,
                maxWidth: "1080px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            padding: "12px 20px",
            border: `1px solid ${reg.rule.hairline}`,
            borderLeft: `4px solid ${topBarColor}`,
            borderRadius: "8px",
            backgroundColor: reg.bg.elevated,
            fontFamily: FONTS.mono,
            fontSize: "15px",
            fontWeight: 700,
            color: reg.ink.primary,
            boxShadow: getEditorialShadow(reg.isDark),
            ...TABULAR_NUMS,
          }}
        >
          {resolvedPartsCount}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, resolvedSteps.length))}, 1fr)`,
          gap: "32px",
          flex: 1,
          alignItems: "stretch",
          margin: "36px 0",
        }}
      >
        {resolvedSteps.map((st, idx) => {
          const cardProgress = spring({
            frame: Math.max(0, elapsed - idx * 8),
            fps,
            config: SPRINGS.documentSnap,
          });
          return (
            <div
              key={`manual-step-${st.stepNumber}-${idx}`}
              style={{
                position: "relative",
                backgroundColor: reg.bg.elevated,
                border: `1px solid ${reg.rule.hairline}`,
                borderRadius: "10px",
                padding: "36px 32px 28px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: getEditorialShadow(reg.isDark),
                opacity: cardProgress,
                transform: `translate3d(0, ${(1 - cardProgress) * 24}px, 0)`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  backgroundColor: topBarColor,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    backgroundColor: topBarColor,
                    color: reg.bg.elevated,
                    fontFamily: FONTS.mono,
                    fontSize: "22px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...TABULAR_NUMS,
                  }}
                >
                  {st.stepNumber}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "24px",
                    fontWeight: 800,
                    color: reg.ink.primary,
                    lineHeight: 1.2,
                  }}
                >
                  {st.label}
                </div>
              </div>

              <svg width="100%" height="220" viewBox="0 0 460 220" style={{ margin: "20px 0" }}>
                <rect
                  x="14"
                  y="48"
                  width="168"
                  height="120"
                  rx="8"
                  fill={reg.bg.recessed}
                  stroke={topBarColor}
                  strokeWidth="2.2"
                />
                <WrappedSvgText
                  text={st.fromLabel}
                  x={98}
                  y={108}
                  maxWidth={144}
                  fontSize={15}
                  minFontSize={11}
                  maxLines={3}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={reg.ink.primary}
                  textAnchor="middle"
                  verticalCenter
                  style={TABULAR_NUMS}
                />

                <line
                  x1="186"
                  y1="108"
                  x2="270"
                  y2="108"
                  stroke={reg.accent.liability}
                  strokeWidth="3"
                  strokeDasharray="7 5"
                />
                <polygon points="264,100 278,108 264,116" fill={reg.accent.liability} />
                {st.note && (
                  <FittedSvgText
                    text={st.note}
                    x={230}
                    y={88}
                    maxWidth={84}
                    fontSize={12.5}
                    minFontSize={9.5}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fill={reg.accent.liability}
                    textAnchor="middle"
                  />
                )}

                <rect
                  x="278"
                  y="48"
                  width="168"
                  height="120"
                  rx="8"
                  fill={reg.accent.highlighterWash}
                  stroke={topBarColor}
                  strokeWidth="2.2"
                />
                <WrappedSvgText
                  text={st.toLabel}
                  x={362}
                  y={108}
                  maxWidth={144}
                  fontSize={15}
                  minFontSize={11}
                  maxLines={3}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={reg.ink.primary}
                  textAnchor="middle"
                  verticalCenter
                  style={TABULAR_NUMS}
                />
              </svg>

              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  color: reg.ink.muted,
                  borderTop: `1px solid ${reg.rule.hairline}`,
                  paddingTop: "12px",
                  ...TABULAR_NUMS,
                }}
              >
                FIG. {st.stepNumber}A · VERIFIED SEQUENCE
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${reg.rule.hairline}`,
          paddingTop: "16px",
          fontFamily: FONTS.mono,
          fontSize: "14px",
          color: reg.ink.muted,
          ...TABULAR_NUMS,
        }}
      >
        <span>{footnote ?? "READING ROOM TECHNICAL SPECIFICATION · DETERMINISTIC LINE DRAWING"}</span>
        <span>SCALE 1:1 · TOLERANCE ±0.0%</span>
      </div>
    </div>
  );
};

// ============================================================================
// 4. CollageCutout (Deckled Paper Scissor Cutout + Deterministic 12fps Stop-Motion)
// ============================================================================
export interface CollageCutoutProps {
  children?: React.ReactNode;
  rotation?: number;
  width?: number | string;
  height?: number | string;
  atFrame?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stampText?: string;
  mode?: DiagramDisplayMode;
  register?: RegisterId;
}

export const CollageCutout: React.FC<CollageCutoutProps> = ({
  children,
  rotation = -3,
  width,
  height,
  atFrame = 0,
  eyebrow = "ARCHIVAL CLIPPING",
  title,
  subtitle,
  stampText = "EXHIBIT A",
  mode = "card",
  register,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepSize = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(rawFrame / stepSize) * stepSize;
  const elapsed = Math.max(0, steppedFrame - atFrame);

  const jitterX = ((steppedFrame * 13) % 5) - 2;
  const jitterY = ((steppedFrame * 17) % 5) - 2;

  const enter = spring({
    frame: elapsed,
    fps,
    config: SPRINGS.documentSnap,
  });

  const reg = resolveDiagramRegister(register);
  const isOverFootage = mode === "over-footage";
  const topBarColor = isOverFootage
    ? OVER_FOOTAGE_PALETTE.chartSecondary
    : reg.isDark
    ? reg.accent.statutory
    : reg.rule.oxford;

  const cutoutCard = (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width,
        height,
        transform: `translate3d(${jitterX}px, ${jitterY}px, 0) rotate(${rotation}deg) scale(${enter.toFixed(4)})`,
        opacity: enter > 0.01 ? 1 : 0,
        background: isOverFootage ? OVER_FOOTAGE_PALETTE.glassPrimary : reg.bg.elevated,
        backdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
        WebkitBackdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
        padding: "14px",
        borderRadius: "8px",
        border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
        boxShadow: getEditorialShadow(isOverFootage || reg.isDark),
        userSelect: "none",
      }}
    >
      {/* Masking tape strip */}
      <div
        style={{
          position: "absolute",
          top: "-12px",
          left: "50%",
          width: "110px",
          height: "24px",
          transform: "translateX(-50%) rotate(-2deg)",
          backgroundColor: isOverFootage ? "rgba(191, 214, 234, 0.35)" : "rgba(242, 240, 234, 0.86)",
          border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed,
          border: `1px dashed ${isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : reg.rule.oxford}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: topBarColor,
          }}
        />
        {children ?? (
          <div style={{ padding: "28px 32px 26px 32px", maxWidth: "520px" }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "30px",
                fontWeight: 700,
                color: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary,
                marginTop: "8px",
                lineHeight: 1.2,
              }}
            >
              {title ?? "Primary Document Cutout"}
            </div>
            {subtitle && (
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "17px",
                  color: isOverFootage ? OVER_FOOTAGE_PALETTE.textBody : reg.ink.muted,
                  marginTop: "10px",
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (mode !== "page") {
    return cutoutCard;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "88px 108px",
        boxSizing: "border-box",
        gap: "72px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            padding: "6px 14px",
            border: `2px solid ${reg.accent.liability}`,
            color: reg.accent.liability,
            fontFamily: FONTS.mono,
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            transform: "rotate(-2deg)",
          }}
        >
          {stampText}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "60px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: reg.ink.primary,
          }}
        >
          {title ?? "Archival Press & Ledger Evidence"}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: "23px",
              lineHeight: 1.48,
              color: reg.ink.muted,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {cutoutCard}
      </div>
    </div>
  );
};

// ============================================================================
// 5. IsometricScene (Warm Milk Isometric Drafting Stage with True SVG Grid)
// ============================================================================
export interface IsometricSceneProps {
  children?: React.ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  gridSpacing?: number;
  showAxes?: boolean;
  footnote?: string;
  register?: RegisterId;
}

export const IsometricScene: React.FC<IsometricSceneProps> = ({
  children,
  eyebrow,
  title,
  subtitle,
  gridSpacing = 72,
  showAxes = true,
  footnote,
  register,
}) => {
  const reg = resolveDiagramRegister(register);
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = -16; i <= 28; i++) {
    const offset = i * gridSpacing;
    lines.push({ x1: offset, y1: 0, x2: offset + 1870, y2: 1080 });
    lines.push({ x1: offset, y1: 1080, x2: offset + 1870, y2: 0 });
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: reg.bg.canvas,
        overflow: "hidden",
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {lines.map((ln, idx) => (
          <line
            key={`iso-ln-${idx}`}
            x1={ln.x1}
            y1={ln.y1}
            x2={ln.x2}
            y2={ln.y2}
            stroke={reg.isDark ? "rgba(191, 211, 230, 0.08)" : COLORS.gridLine}
            strokeWidth="1.15"
          />
        ))}
        {showAxes && (
          <g opacity={0.55}>
            <line x1="96" y1="984" x2="240" y2="900" stroke={reg.ink.primary} strokeWidth="2" />
            <line x1="96" y1="984" x2="240" y2="1068" stroke={reg.ink.primary} strokeWidth="2" />
            <line x1="96" y1="984" x2="96" y2="830" stroke={reg.accent.liability} strokeWidth="2" />
            <FittedSvgText
              text="Z-ELEV"
              x={106}
              y={844}
              maxWidth={88}
              fontSize={12}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fill={reg.accent.liability}
            />
          </g>
        )}
      </svg>

      {(eyebrow || title) && (
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "84px",
            zIndex: 2,
            maxWidth: "780px",
          }}
        >
          {eyebrow && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: reg.accent.liability,
              }}
            >
              <Layers size={15} color={reg.accent.liability} />
              <span>{eyebrow}</span>
            </div>
          )}
          {title && (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "44px",
                fontWeight: 700,
                color: reg.ink.primary,
                marginTop: "6px",
              }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "19px",
                color: reg.ink.muted,
                marginTop: "6px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>

      {footnote && (
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "84px",
            zIndex: 2,
            fontFamily: FONTS.mono,
            fontSize: "13px",
            color: reg.ink.muted,
            ...TABULAR_NUMS,
          }}
        >
          {footnote}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. PatentExplodedDiagram (U.S. Patent Blueprint Line-Art Exploded Assembly)
// ============================================================================
export interface PatentCalloutPart {
  refNumber: number;
  partName: string;
  specValue: string;
}

export interface PatentExplodedDiagramProps {
  patentNumber?: string;
  title?: string;
  subtitle?: string;
  parts?: PatentCalloutPart[];
  mode?: DiagramDisplayMode;
  register?: RegisterId;
  atFrame?: number;
}

export const PatentExplodedDiagram: React.FC<PatentExplodedDiagramProps> = ({
  patentNumber = "DOC. SPEC 2026-0419",
  title = "Exploded System Architecture",
  subtitle = "Three-layer mechanical separation between physical energy base, compute logic, and contractual claims.",
  parts = [
    { refNumber: 101, partName: "Upper Claim Layer", specValue: "Nominal Debt" },
    { refNumber: 102, partName: "Logic & Routing Core", specValue: "Silicon / Switching" },
    { refNumber: 103, partName: "Baseload Plinth", specValue: "24/7 Firm Megawatts" },
  ],
  mode = "page",
  register,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const spread = spring({
    frame: elapsed,
    fps,
    config: SPRINGS.smoothFocus,
  });
  const sweepPct = interpolate(elapsed, [8, 38], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const reg = resolveDiagramRegister(register);
  const topBarColor = reg.isDark ? reg.accent.statutory : reg.rule.oxford;
  const visibleParts = parts.slice(0, 3);

  // Guaranteed non-overlapping vertical step: slab total height = 142px (top diamond 112 + side wall 30).
  // Even at spread = 0, step is 172px (>= 142px + 30px clear air), expanding smoothly to 210px!
  const stepY = 172 + spread * 38;

  if (mode !== "page") {
    const isOverFootage = mode === "over-footage";
    const cardInk = isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary;
    const cardMuted = isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : reg.ink.muted;
    const cardAccent = isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : reg.accent.liability;
    return (
      <div
        style={{
          position: "relative",
          width: "600px",
          background: isOverFootage ? OVER_FOOTAGE_PALETTE.glassPrimary : reg.bg.elevated,
          backdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px) saturate(160%)" : undefined,
          border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : reg.rule.hairline}`,
          borderRadius: "14px",
          padding: "24px 26px",
          boxSizing: "border-box",
          boxShadow: getEditorialShadow(isOverFootage || reg.isDark),
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : topBarColor,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: cardAccent,
            ...TABULAR_NUMS,
          }}
        >
          {patentNumber} · FIG. 1A
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: "24px",
            fontWeight: 700,
            color: cardInk,
            marginTop: "6px",
            marginBottom: "14px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {visibleParts.map((pt) => (
            <div
              key={`pat-c-${pt.refNumber}`}
              style={{
                display: "grid",
                gridTemplateColumns: "62px 1fr auto",
                gap: "10px",
                alignItems: "center",
                padding: "10px 14px",
                backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : reg.bg.recessed,
                border: `1px solid ${isOverFootage ? OVER_FOOTAGE_PALETTE.glassInnerHairline : reg.rule.hairline}`,
                borderRadius: "8px",
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: "15px", fontWeight: 700, color: cardAccent, ...TABULAR_NUMS }}>
                [{pt.refNumber}]
              </span>
              <span style={{ fontFamily: FONTS.sans, fontSize: "15px", fontWeight: 700, color: cardInk }}>
                {pt.partName}
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: "14px", fontWeight: 700, color: cardMuted, ...TABULAR_NUMS }}>
                {pt.specValue}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: reg.bg.canvas,
        padding: "72px 96px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "0.95fr 1.05fr",
        gap: "64px",
        alignItems: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${reg.isDark ? "rgba(191, 211, 230, 0.06)" : COLORS.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: reg.accent.liability,
            ...TABULAR_NUMS,
          }}
        >
          {patentNumber} · FIG. 1A EXPLODED VIEW
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "56px",
            lineHeight: 1.08,
            color: reg.ink.primary,
            fontWeight: 700,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: "22px",
            lineHeight: 1.48,
            color: reg.ink.muted,
          }}
        >
          {subtitle}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
          {parts.map((pt, idx) => (
            <div
              key={pt.refNumber}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "76px 1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "16px 20px",
                backgroundColor: reg.bg.elevated,
                border: `1px solid ${reg.rule.hairline}`,
                borderLeft: `4px solid ${idx === 0 ? reg.accent.liability : topBarColor}`,
                borderRadius: "8px",
                boxShadow: getEditorialShadow(reg.isDark),
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: reg.accent.liability,
                  ...TABULAR_NUMS,
                }}
              >
                [{pt.refNumber}]
              </span>
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "19px",
                  fontWeight: 700,
                  color: reg.ink.primary,
                }}
              >
                {pt.partName}
              </span>
              <span
                style={{
                  position: "relative",
                  padding: "2px 8px",
                  fontFamily: FONTS.mono,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: reg.accent.solvent,
                  ...TABULAR_NUMS,
                }}
              >
                {idx === 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: "2px",
                      height: "18px",
                      width: `${sweepPct}%`,
                      backgroundColor: reg.accent.highlighterWash,
                      borderRadius: "3px",
                      zIndex: 0,
                    }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{pt.specValue}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "840px",
          backgroundColor: reg.bg.elevated,
          border: `1px solid ${reg.rule.hairline}`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: getEditorialShadow(reg.isDark),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: topBarColor,
          }}
        />
        <svg width="820" height="760" viewBox="0 0 820 760">
          <line
            x1="380"
            y1="44"
            x2="380"
            y2="716"
            stroke={reg.ink.muted}
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          <FittedSvgText
            text="EXPLODED ASSEMBLY AXIS"
            x={380}
            y={30}
            maxWidth={280}
            fontSize={12}
            fontFamily={FONTS.mono}
            fontWeight={700}
            fill={reg.ink.muted}
            textAnchor="middle"
          />
          {visibleParts.map((pt, idx) => {
            const cy = 62 + idx * stepY;
            const fillTop =
              idx === 0
                ? reg.isDark
                  ? "#3D2222"
                  : PAGE_PALETTE.riskFill
                : idx === 1
                ? reg.bg.recessed
                : PAGE_PALETTE.navy;
            const fillLeft =
              idx === 2
                ? PAGE_PALETTE.navyDeep
                : reg.isDark
                ? "#1E344D"
                : PAGE_PALETTE.paperBorder;
            const fillRight =
              idx === 0
                ? reg.accent.liability
                : idx === 1
                ? reg.accent.statutory
                : reg.accent.solvent;
            const textColor =
              idx === 2 ? OVER_FOOTAGE_PALETTE.textHeadline : reg.ink.primary;
            const strokeColor = reg.isDark ? reg.accent.statutory : PAGE_PALETTE.navy;

            return (
              <g key={`layer-${pt.refNumber}`} transform={`translate(0, ${cy.toFixed(1)})`}>
                <polygon
                  points="380,0 572,56 380,112 188,56"
                  fill={fillTop}
                  stroke={strokeColor}
                  strokeWidth="2.8"
                />
                <polygon
                  points="188,56 380,112 380,142 188,86"
                  fill={fillLeft}
                  stroke={strokeColor}
                  strokeWidth="2.8"
                />
                <polygon
                  points="572,56 380,112 380,142 572,86"
                  fill={fillRight}
                  stroke={strokeColor}
                  strokeWidth="2.8"
                />
                <WrappedSvgText
                  text={pt.partName.toUpperCase()}
                  x={380}
                  y={56}
                  maxWidth={228}
                  fontSize={15}
                  minFontSize={11}
                  maxLines={2}
                  lineHeight={1.14}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={textColor}
                  textAnchor="middle"
                  verticalCenter
                />
                <line
                  x1="572"
                  y1="56"
                  x2="650"
                  y2="34"
                  stroke={reg.accent.liability}
                  strokeWidth="2.2"
                />
                <circle cx="572" cy="56" r="5" fill={reg.accent.liability} />
                <FittedSvgText
                  text={`[${pt.refNumber}]`}
                  x={660}
                  y={39}
                  maxWidth={118}
                  fontSize={18}
                  minFontSize={13}
                  fontFamily={FONTS.mono}
                  fontWeight={700}
                  fill={reg.accent.liability}
                  style={TABULAR_NUMS}
                />
                <FittedSvgText
                  text={pt.specValue}
                  x={660}
                  y={61}
                  maxWidth={142}
                  fontSize={13}
                  minFontSize={10}
                  fontFamily={FONTS.sans}
                  fontWeight={600}
                  fill={reg.ink.muted}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export interface DiagramMetaphorRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

export const DIAGRAM_METAPHOR_STYLES: readonly DiagramMetaphorRecipe[] = [
  {
    id: "sticker-cutout",
    name: "Tactile Die-Cut Sticker Cutout",
    componentName: "StickerCutout",
    defaultFraming: "over-footage",
    description: "Warm-milk die-cut outline with deterministic spring pop and optional full-page exhibit.",
  },
  {
    id: "stick-figure-stage",
    name: "Articulated Stick-Figure Mechanics Stage",
    componentName: "StickFigureStage",
    defaultFraming: "fullscreen-cutaway",
    description: "Nine-pose articulated stick figure with dynamic obligation slab and full 1920x1080 thesis layout.",
  },
  {
    id: "instruction-manual-card",
    name: "Technical Assembly Manual Sequence",
    componentName: "InstructionManualCard",
    defaultFraming: "fullscreen-cutaway",
    description: "Multi-stage IKEA/specification line-art schematic with dynamic step inputs and outputs.",
  },
  {
    id: "collage-cutout",
    name: "12fps Archival Paper Collage Cutout",
    componentName: "CollageCutout",
    defaultFraming: "over-footage",
    description: "Stepped 12fps stop-motion archival clipping with masking tape and torn-rule framing.",
  },
  {
    id: "isometric-scene",
    name: "Isometric Architectural Drafting Stage",
    componentName: "IsometricScene",
    defaultFraming: "fullscreen-cutaway",
    description: "True SVG isometric drafting grid with elevation axes on warm milk parchment.",
  },
  {
    id: "patent-exploded-diagram",
    name: "U.S. Patent Exploded Layer Diagram",
    componentName: "PatentExplodedDiagram",
    defaultFraming: "fullscreen-cutaway",
    description: "Exploded isometric three-tier patent blueprint with numbered reference callouts.",
  },
] as const;
