import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Layers, Scissors, Wrench } from "lucide-react";
import { FONTS } from "../design/fonts";
import { COLORS, OVER_FOOTAGE_PALETTE, PAGE_PALETTE, SPRINGS } from "../design/tokens";

const TABULAR_NUMS: React.CSSProperties = {
  fontVariantNumeric: "tabular-nums lining-nums",
};

const ELASTIC_POP = {
  damping: 16,
  mass: 0.7,
  stiffness: 170,
  overshootClamping: false,
} as const;

export type DiagramDisplayMode = "card" | "page" | "over-footage";

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

  const stickerNode = (
    <div
      className={className}
      style={{
        display: "inline-block",
        transform: `translate3d(0, ${driftY.toFixed(2)}px, 0) scale(${popSpring.toFixed(4)}) rotate(${rotation}deg)`,
        padding: `${outlineWidth}px`,
        backgroundColor: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.paperLight,
        color: PAGE_PALETTE.navy,
        borderRadius: "18px",
        border: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
        boxShadow: "0 20px 42px -10px rgba(28, 43, 58, 0.20)",
        userSelect: "none",
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: PAGE_PALETTE.paper,
          border: `1px solid ${PAGE_PALETTE.paperBorder}`,
        }}
      >
        {children ?? (
          <div style={{ padding: "28px 34px", maxWidth: "460px" }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: PAGE_PALETTE.brickRed,
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
                color: PAGE_PALETTE.navy,
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
        backgroundColor: PAGE_PALETTE.paperLight,
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
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
            color: PAGE_PALETTE.brickRed,
          }}
        >
          <Scissors size={16} color={PAGE_PALETTE.brickRed} />
          <span>{eyebrow}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "60px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: PAGE_PALETTE.navy,
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
              color: PAGE_PALETTE.muted,
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
              borderTop: `1px solid ${PAGE_PALETTE.paperBorder}`,
              fontFamily: FONTS.mono,
              fontSize: "14px",
              color: PAGE_PALETTE.muted,
              ...TABULAR_NUMS,
            }}
          >
            {footnote}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
  accentColor = COLORS.brickRed,
  width = 380,
  height = 480,
  mode = "card",
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

  const isOverFootage = mode === "over-footage";
  const strokeInk = isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy;
  const headFill = isOverFootage ? OVER_FOOTAGE_PALETTE.glassDarkWell : PAGE_PALETTE.paper;

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
              stroke={accentColor}
              strokeWidth="3"
            />
            <text
              x="115"
              y="47"
              fill={PAGE_PALETTE.paperLight}
              fontFamily={FONTS.mono}
              fontSize="16"
              fontWeight="700"
              textAnchor="middle"
              style={TABULAR_NUMS}
            >
              {resolvedSlabLabel}
            </text>
          </g>
        )}

        {pose === "holding-umbrella" && (
          <g>
            <path
              d="M 110 72 Q 195 14 285 72 Z"
              fill={PAGE_PALETTE.navy}
              stroke={accentColor}
              strokeWidth="3"
            />
            <line x1="232" y1="52" x2="232" y2="148" stroke={strokeInk} strokeWidth="5" />
          </g>
        )}

        {pose === "pulling-lever" && (
          <g>
            <rect x="275" y="190" width="54" height="210" rx="6" fill={PAGE_PALETTE.paper} stroke={strokeInk} strokeWidth="4" />
            <line x1="302" y1="190" x2="268" y2="146" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="268" cy="146" r="10" fill={accentColor} />
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
            <rect width="58" height="42" rx="5" fill={PAGE_PALETTE.navy} stroke={accentColor} strokeWidth="2.5" />
            <path d="M 18 0 L 18 -9 L 40 -9 L 40 0" fill="none" stroke={strokeInk} strokeWidth="3" />
          </g>
        )}

        <line x1="40" y1="400" x2="340" y2="400" stroke={PAGE_PALETTE.muted} strokeWidth="3" strokeLinecap="round" />
      </svg>

      {caption && (
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: "15px",
            fontWeight: 700,
            color: isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_PALETTE.navy,
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
    return figureSvg;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
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
            linear-gradient(to right, ${COLORS.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${COLORS.gridLine} 1px, transparent 1px)
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
            color: accentColor,
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
            color: PAGE_PALETTE.navy,
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
              color: PAGE_PALETTE.muted,
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
              backgroundColor: PAGE_PALETTE.paper,
              border: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
              borderLeft: `5px solid ${accentColor}`,
              borderRadius: "10px",
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "44px",
                fontWeight: 700,
                color: PAGE_PALETTE.navy,
                ...TABULAR_NUMS,
              }}
            >
              {metricValue}
            </span>
            {metricLabel && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: PAGE_PALETTE.muted,
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
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "18px",
          padding: "44px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 24px 48px rgba(28, 43, 58, 0.12)",
        }}
      >
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
    return (
      <div
        style={{
          display: "inline-block",
          width: "580px",
          backgroundColor: PAGE_PALETTE.paperLight,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "10px",
          padding: "28px 34px",
          boxShadow: "0 18px 38px rgba(28, 43, 58, 0.14)",
          transform: `scale(${(0.92 + 0.08 * enter).toFixed(4)})`,
          opacity: enter,
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${PAGE_PALETTE.navy}`,
            paddingBottom: "14px",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: PAGE_PALETTE.navy,
                color: PAGE_PALETTE.paperLight,
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
                fontSize: "20px",
                fontWeight: 800,
                color: PAGE_PALETTE.navy,
              }}
            >
              {title}
            </span>
          </div>

          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "12px",
              color: PAGE_PALETTE.muted,
              fontWeight: 700,
              ...TABULAR_NUMS,
            }}
          >
            {resolvedPartsCount}
          </span>
        </div>

        <svg width="512" height="142" viewBox="0 0 512 142">
          <rect
            x="16"
            y="30"
            width="174"
            height="74"
            rx="5"
            fill={PAGE_PALETTE.paper}
            stroke={PAGE_PALETTE.navy}
            strokeWidth="2.5"
          />
          <text
            x="103"
            y="67"
            fontFamily={FONTS.mono}
            fontSize="13.5"
            fontWeight="700"
            fill={PAGE_PALETTE.navy}
            textAnchor="middle"
            dominantBaseline="central"
            style={TABULAR_NUMS}
          >
            {leftLabel}
          </text>
          <rect
            x="322"
            y="30"
            width="174"
            height="74"
            rx="5"
            fill={PAGE_PALETTE.highlightSweep}
            stroke={PAGE_PALETTE.navy}
            strokeWidth="2.5"
          />
          <text
            x="409"
            y="67"
            fontFamily={FONTS.mono}
            fontSize="13.5"
            fontWeight="700"
            fill={PAGE_PALETTE.navy}
            textAnchor="middle"
            dominantBaseline="central"
            style={TABULAR_NUMS}
          >
            {rightLabel}
          </text>
          <line
            x1="190"
            y1="67"
            x2="322"
            y2="67"
            stroke={PAGE_PALETTE.navy}
            strokeWidth="2.2"
            strokeDasharray="6 6"
          />
          <polygon points="314,61 326,67 314,73" fill={PAGE_PALETTE.navy} />
          <text
            x="256"
            y="54"
            fontFamily={FONTS.mono}
            fontSize="11"
            fontWeight="700"
            fill={PAGE_PALETTE.muted}
            textAnchor="middle"
          >
            {linkLabel}
          </text>
        </svg>
      </div>
    );
  }

  // Full 1920x1080 Technical Manual Sheet
  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
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
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `3px solid ${PAGE_PALETTE.navy}`,
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
              color: PAGE_PALETTE.brickRed,
              textTransform: "uppercase",
            }}
          >
            <Wrench size={16} color={PAGE_PALETTE.brickRed} />
            <span>{eyebrow}</span>
          </div>
          <h1
            style={{
              margin: "10px 0 0 0",
              fontFamily: FONTS.serif,
              fontSize: "54px",
              fontWeight: 700,
              color: PAGE_PALETTE.navy,
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
                color: PAGE_PALETTE.muted,
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
            border: `2px solid ${PAGE_PALETTE.navy}`,
            borderRadius: "8px",
            backgroundColor: PAGE_PALETTE.paper,
            fontFamily: FONTS.mono,
            fontSize: "15px",
            fontWeight: 700,
            color: PAGE_PALETTE.navy,
            ...TABULAR_NUMS,
          }}
        >
          {resolvedPartsCount}
        </div>
      </div>

      <div
        style={{
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
                backgroundColor: PAGE_PALETTE.paper,
                border: `2px solid ${PAGE_PALETTE.navy}`,
                borderRadius: "12px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: cardProgress,
                transform: `translate3d(0, ${(1 - cardProgress) * 24}px, 0)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: PAGE_PALETTE.navy,
                    color: PAGE_PALETTE.paperLight,
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
                    color: PAGE_PALETTE.navy,
                  }}
                >
                  {st.label}
                </div>
              </div>

              <svg width="100%" height="220" viewBox="0 0 460 220" style={{ margin: "20px 0" }}>
                <rect
                  x="16"
                  y="52"
                  width="164"
                  height="112"
                  rx="8"
                  fill={PAGE_PALETTE.paperLight}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="2.5"
                />
                <text
                  x="98"
                  y="108"
                  fontFamily={FONTS.mono}
                  fontSize="15"
                  fontWeight="700"
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={TABULAR_NUMS}
                >
                  {st.fromLabel}
                </text>

                <line
                  x1="184"
                  y1="108"
                  x2="274"
                  y2="108"
                  stroke={PAGE_PALETTE.brickRed}
                  strokeWidth="3"
                  strokeDasharray="7 5"
                />
                <polygon points="266,100 280,108 266,116" fill={PAGE_PALETTE.brickRed} />
                {st.note && (
                  <text
                    x="230"
                    y="90"
                    fontFamily={FONTS.mono}
                    fontSize="12"
                    fontWeight="700"
                    fill={PAGE_PALETTE.brickRed}
                    textAnchor="middle"
                  >
                    {st.note}
                  </text>
                )}

                <rect
                  x="280"
                  y="52"
                  width="164"
                  height="112"
                  rx="8"
                  fill={PAGE_PALETTE.highlightSweep}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="2.5"
                />
                <text
                  x="362"
                  y="108"
                  fontFamily={FONTS.mono}
                  fontSize="15"
                  fontWeight="700"
                  fill={PAGE_PALETTE.navy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={TABULAR_NUMS}
                >
                  {st.toLabel}
                </text>
              </svg>

              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "13px",
                  color: PAGE_PALETTE.muted,
                  borderTop: `1px solid ${PAGE_PALETTE.paperBorder}`,
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
          paddingTop: "16px",
          fontFamily: FONTS.mono,
          fontSize: "14px",
          color: PAGE_PALETTE.muted,
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

  const cutoutCard = (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width,
        height,
        transform: `translate3d(${jitterX}px, ${jitterY}px, 0) rotate(${rotation}deg) scale(${enter.toFixed(4)})`,
        opacity: enter > 0.01 ? 1 : 0,
        backgroundColor: PAGE_PALETTE.paperLight,
        padding: "14px",
        borderRadius: "4px",
        border: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
        boxShadow: "0 18px 40px rgba(28, 43, 58, 0.18)",
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
          backgroundColor: "rgba(242, 240, 234, 0.86)",
          border: `1px solid ${PAGE_PALETTE.paperBorder}`,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: PAGE_PALETTE.paper,
          border: `1px dashed ${PAGE_PALETTE.navy}`,
        }}
      >
        {children ?? (
          <div style={{ padding: "26px 32px", maxWidth: "520px" }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: PAGE_PALETTE.brickRed,
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
                color: PAGE_PALETTE.navy,
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
                  color: PAGE_PALETTE.muted,
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
        backgroundColor: PAGE_PALETTE.paper,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "88px 108px",
        boxSizing: "border-box",
        gap: "72px",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            padding: "6px 14px",
            border: `2px solid ${PAGE_PALETTE.brickRed}`,
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.navy,
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
              color: PAGE_PALETTE.muted,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
}

export const IsometricScene: React.FC<IsometricSceneProps> = ({
  children,
  eyebrow,
  title,
  subtitle,
  gridSpacing = 72,
  showAxes = true,
  footnote,
}) => {
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
        backgroundColor: PAGE_PALETTE.paperLight,
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
            stroke={COLORS.gridLine}
            strokeWidth="1.15"
          />
        ))}
        {showAxes && (
          <g opacity={0.45}>
            <line x1="96" y1="984" x2="240" y2="900" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
            <line x1="96" y1="984" x2="240" y2="1068" stroke={PAGE_PALETTE.navy} strokeWidth="2" />
            <line x1="96" y1="984" x2="96" y2="830" stroke={PAGE_PALETTE.brickRed} strokeWidth="2" />
            <text x="106" y="844" fontFamily={FONTS.mono} fontSize="12" fontWeight="700" fill={PAGE_PALETTE.brickRed}>
              Z-ELEV
            </text>
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
                color: PAGE_PALETTE.brickRed,
              }}
            >
              <Layers size={15} color={PAGE_PALETTE.brickRed} />
              <span>{eyebrow}</span>
            </div>
          )}
          {title && (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "44px",
                fontWeight: 700,
                color: PAGE_PALETTE.navy,
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
                color: PAGE_PALETTE.muted,
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
            color: PAGE_PALETTE.muted,
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

  const gapY = 74 + spread * 48;

  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        padding: "72px 96px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "0.95fr 1.05fr",
        gap: "64px",
        alignItems: "center",
        border: `16px solid ${PAGE_PALETTE.paper}`,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.navy,
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
            color: PAGE_PALETTE.muted,
          }}
        >
          {subtitle}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
          {parts.map((pt) => (
            <div
              key={pt.refNumber}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto",
                alignItems: "center",
                padding: "16px 20px",
                backgroundColor: PAGE_PALETTE.paper,
                border: `1.5px solid ${PAGE_PALETTE.navy}`,
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.brickRed,
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
                  color: PAGE_PALETTE.navy,
                }}
              >
                {pt.partName}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.chartSecondary,
                  ...TABULAR_NUMS,
                }}
              >
                {pt.specValue}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          height: "840px",
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="820" height="760" viewBox="0 0 820 760">
          <line
            x1="380"
            y1="90"
            x2="380"
            y2="670"
            stroke={PAGE_PALETTE.muted}
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          {parts.slice(0, 3).map((pt, idx) => {
            const cy = 220 + idx * gapY * 1.35;
            const fillTop =
              idx === 0
                ? PAGE_PALETTE.riskFill
                : idx === 1
                ? PAGE_PALETTE.paperLight
                : PAGE_PALETTE.navy;
            const textColor = idx === 2 ? PAGE_PALETTE.paperLight : PAGE_PALETTE.navy;
            return (
              <g key={`layer-${pt.refNumber}`} transform={`translate(0, ${cy.toFixed(1)})`}>
                <polygon
                  points="380,0 560,68 380,136 200,68"
                  fill={fillTop}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="3"
                />
                <polygon
                  points="200,68 380,136 380,174 200,106"
                  fill={PAGE_PALETTE.paperBorder}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="3"
                />
                <polygon
                  points="560,68 380,136 380,174 560,106"
                  fill={PAGE_PALETTE.gold}
                  stroke={PAGE_PALETTE.navy}
                  strokeWidth="3"
                />
                <text
                  x="380"
                  y="74"
                  textAnchor="middle"
                  fontFamily={FONTS.mono}
                  fontSize="16"
                  fontWeight="700"
                  fill={textColor}
                >
                  {pt.partName.toUpperCase()}
                </text>
                <line x1="560" y1="68" x2="650" y2="42" stroke={PAGE_PALETTE.brickRed} strokeWidth="2.2" />
                <circle cx="560" cy="68" r="5" fill={PAGE_PALETTE.brickRed} />
                <text
                  x="660"
                  y="47"
                  fontFamily={FONTS.mono}
                  fontSize="18"
                  fontWeight="700"
                  fill={PAGE_PALETTE.brickRed}
                  style={TABULAR_NUMS}
                >
                  [{pt.refNumber}]
                </text>
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
