import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fitAndBalanceText } from "../../design/fitText";
import { FONTS, TABULAR_NUM_STYLE } from "../../design/fonts";
import { CINEMA_SPRINGS, OVER_FOOTAGE_PALETTE } from "../../design/tokens";
import {
  GlassTint,
  LiquidGlassObject,
  LiquidGlassObjectProps,
} from "./LiquidGlassObject";

export type GlassPresetBaseProps = Omit<LiquidGlassObjectProps, "children">;

function pickGlassProps(props: GlassPresetBaseProps): GlassPresetBaseProps {
  return {
    id: props.id,
    width: props.width,
    height: props.height,
    borderRadius: props.borderRadius,
    tint: props.tint,
    style: props.style,
    className: props.className,
    lifecycle: props.lifecycle,
    enableOpticalRefraction: props.enableOpticalRefraction ?? true,
    enableSpecularSweep: props.enableSpecularSweep ?? true,
    enableSfx: props.enableSfx ?? true,
    sfxEnterCue: props.sfxEnterCue,
    sfxDockCue: props.sfxDockCue,
    sfxExitCue: props.sfxExitCue,
    displacementScale: props.displacementScale,
    roughness: props.roughness,
    blurAmount: props.blurAmount,
    bevelWidth: props.bevelWidth,
    specularTrackingDeg: props.specularTrackingDeg,
    causticIntensity: props.causticIntensity,
  };
}

function getSurfacePalette(tint: GlassTint) {
  const isRisk = tint === "warning";

  return {
    isRisk,
    title: OVER_FOOTAGE_PALETTE.textHeadline,
    body: OVER_FOOTAGE_PALETTE.textBody,
    muted: OVER_FOOTAGE_PALETTE.textMuted,
    textShadow: OVER_FOOTAGE_PALETTE.textShadow,
    divider: isRisk
      ? OVER_FOOTAGE_PALETTE.riskBorder
      : OVER_FOOTAGE_PALETTE.glassInnerHairline,
    subBg: isRisk
      ? OVER_FOOTAGE_PALETTE.riskFill
      : OVER_FOOTAGE_PALETTE.glassDarkWell,
    subBorder: isRisk
      ? OVER_FOOTAGE_PALETTE.riskBorder
      : OVER_FOOTAGE_PALETTE.glassInnerHairline,
    subBgActive: "rgba(15, 25, 35, 0.50)",
    subBorderActive: OVER_FOOTAGE_PALETTE.accentPrimary,
    accentText: OVER_FOOTAGE_PALETTE.accentWarm,
    accentWarm: OVER_FOOTAGE_PALETTE.accentWarm,
    secondaryMetric: OVER_FOOTAGE_PALETTE.chartSecondary,
    riskText: OVER_FOOTAGE_PALETTE.brickRedText,
    riskChipBg: OVER_FOOTAGE_PALETTE.brickRedFill,
    riskChipText: OVER_FOOTAGE_PALETTE.textHeadline,
    riskBg: OVER_FOOTAGE_PALETTE.riskFill,
    riskBorder: OVER_FOOTAGE_PALETTE.riskBorder,
    vsBg: "rgba(15, 25, 35, 0.54)",
    vsBorder: "rgba(255, 255, 255, 0.36)",
  };
}

function sanitizeDockText(raw: string | undefined): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.toUpperCase() === "LIQUID-G" || cleaned.toUpperCase() === "LIQUID-GL") {
    return "Glass Overlay";
  }
  if (cleaned.length <= 28) return cleaned;
  const cut = cleaned.slice(0, 28);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 10 ? cut.slice(0, lastSpace) : cut).trim();
}

function hashSeedString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildChannelSparkline(ch: GlassTelemetryChannel, idx: number): number[] {
  if (ch.sparkline && ch.sparkline.length >= 2) {
    return [...ch.sparkline];
  }
  const seed = hashSeedString(`${ch.id ?? ""}|${ch.label}|${ch.value}|${idx}`);
  const deltaText = (ch.delta ?? "").trim();
  const isNegativeTrend =
    deltaText.startsWith("-") ||
    (Boolean(ch.isRisk) &&
      !deltaText.startsWith("+") &&
      /(?:share|wage|drop|cut|fall|erosion|shrink|ratio)/i.test(ch.label));
  const isSurgeTrend =
    deltaText.startsWith("+") ||
    (Boolean(ch.isRisk) && !isNegativeTrend);

  const count = 7;
  const phase = ((seed % 360) * Math.PI) / 180;
  const freq = 1.15 + ((seed >> 4) % 7) * 0.22;
  const amp = 0.08 + ((seed >> 8) % 5) * 0.02;
  const pts: number[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const wave = Math.sin(t * Math.PI * freq + phase) * amp;
    let base: number;
    if (isNegativeTrend) {
      base = 0.84 - Math.pow(t, 1.15) * 0.58;
    } else if (isSurgeTrend) {
      base = 0.22 + Math.pow(t, 1.45) * 0.68;
    } else if (idx % 2 === 0) {
      base = 0.34 + t * 0.44;
    } else {
      base = 0.56 + Math.cos(t * Math.PI * 1.1 + phase * 0.5) * 0.22;
    }
    pts.push(Math.max(0.08, Math.min(0.96, Number((base + wave).toFixed(3)))));
  }
  return pts;
}

function resolveMagnifierHeaderTags(
  clauseCode: string,
  zoomFactor: number
): { leftTag: string; zoomPill: string } {
  const hasOpticalOrLoupe = /\b(?:optical|loupe)\b/i.test(clauseCode);
  const cleaned = clauseCode
    .replace(/\b(?:optical|loupe|\d+(?:\.\d+)?x)\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/^[·/|:—\-\s]+|[·/|:—\-\s]+$/g, "")
    .trim();

  const leftTag = hasOpticalOrLoupe ? cleaned || "FILING EXCERPT" : clauseCode;
  return {
    leftTag,
    zoomPill: `OPTICAL ${zoomFactor.toFixed(2)}x`,
  };
}

// ============================================================================
// 1. GlassCard — Crystal smoked-navy glass card with header tag, metric & citation
// ============================================================================
export interface GlassCardProps extends GlassPresetBaseProps {
  title: string;
  badge?: string;
  badgeTone?: "gold" | "warning" | "highlight" | "neutral";
  subtitle?: string;
  body?: React.ReactNode;
  metric?: {
    value: string;
    label?: string;
    delta?: string;
    deltaPositive?: boolean;
  };
  citation?: string;
  children?: React.ReactNode;
}

function resolveBadgeTone(badgeTone: NonNullable<GlassCardProps["badgeTone"]>) {
  if (badgeTone === "warning") {
    return {
      bg: OVER_FOOTAGE_PALETTE.brickRedFill,
      border: OVER_FOOTAGE_PALETTE.riskBorder,
      color: OVER_FOOTAGE_PALETTE.textHeadline,
    };
  }
  if (badgeTone === "gold" || badgeTone === "highlight") {
    return {
      bg: "rgba(28, 43, 58, 0.92)",
      border: "rgba(191, 214, 234, 0.42)",
      color: OVER_FOOTAGE_PALETTE.textHeadline,
    };
  }
  return {
    bg: OVER_FOOTAGE_PALETTE.glassDarkWell,
    border: OVER_FOOTAGE_PALETTE.glassInnerHairline,
    color: OVER_FOOTAGE_PALETTE.textBody,
  };
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  badge = "Notes",
  badgeTone = "gold",
  subtitle,
  body,
  metric,
  citation,
  children,
  width = 580,
  borderRadius = 26,
  tint = "navy-glass",
  ...glassProps
}) => {
  const surface = getSurfacePalette(tint);
  const tone = resolveBadgeTone(badgeTone);
  const isWarningCard = badgeTone === "warning" || surface.isRisk;
  const numericWidth = typeof width === "number" ? width : 580;
  const cleanMetricValue = metric?.value ? metric.value.replace(/\s+/g, " ").trim() : "";
  const fittedMetric =
    cleanMetricValue.length > 0
      ? fitAndBalanceText({
          text: cleanMetricValue,
          fontFamily: "mono",
          fontWeight: 800,
          maxWidth: Math.max(160, numericWidth - 220),
          maxHeight: 68,
          maxLines: cleanMetricValue.length > 14 ? 2 : 1,
          minFontSize: 18,
          maxFontSize: 38,
          lineHeight: 1.08,
        })
      : null;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "32px 36px", userSelect: "none" }}>
        {/* Header Badge Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            paddingBottom: "14px",
            marginBottom: "18px",
            borderBottom: `1px solid ${surface.divider}`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tone.color,
              backgroundColor: tone.bg,
              border: `1px solid ${tone.border}`,
              borderRadius: "8px",
              padding: "4px 10px",
              textShadow: surface.textShadow,
              whiteSpace: "nowrap",
              flexShrink: 0,
              maxWidth: "220px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {badge}
          </span>
          {subtitle && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11.5px",
                fontWeight: 600,
                color: surface.body,
                letterSpacing: "0.04em",
                textShadow: surface.textShadow,
                minWidth: 0,
                flex: "0 1 auto",
                textAlign: "right",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: "26px",
            fontWeight: 800,
            lineHeight: 1.24,
            letterSpacing: "-0.015em",
            color: surface.title,
            textShadow: surface.textShadow,
          }}
        >
          {title}
        </h3>

        {/* Optional Headline Metric */}
        {metric && cleanMetricValue.length > 0 && fittedMetric && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: cleanMetricValue.length > 16 ? "wrap" : "nowrap",
              gap: "16px",
              marginTop: "18px",
              padding: "16px 20px",
              borderRadius: "16px",
              backgroundColor: isWarningCard ? surface.riskBg : surface.subBg,
              border: `1px solid ${isWarningCard ? surface.riskBorder : surface.subBorder}`,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: `${fittedMetric.fontSize}px`,
                fontWeight: 800,
                color: isWarningCard ? surface.riskText : surface.title,
                textShadow: surface.textShadow,
                lineHeight: 1.08,
                maxWidth: "100%",
                minWidth: 0,
                overflowWrap: "anywhere",
                flexShrink: cleanMetricValue.length <= 16 ? 0 : 1,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {cleanMetricValue}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
              {metric.label && (
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 500,
                    color: surface.muted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textShadow: surface.textShadow,
                  }}
                >
                  {metric.label}
                </span>
              )}
              {metric.delta && (
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: metric.deltaPositive
                      ? surface.secondaryMetric
                      : surface.riskText,
                    textShadow: surface.textShadow,
                  }}
                >
                  {metric.delta}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Body Content */}
        {body && (
          <div
            style={{
              marginTop: "16px",
              fontFamily: FONTS.sans,
              fontSize: "15.5px",
              fontWeight: 500,
              lineHeight: 1.58,
              color: surface.body,
              textShadow: surface.textShadow,
            }}
          >
            {body}
          </div>
        )}

        {children && <div style={{ marginTop: "16px" }}>{children}</div>}

        {/* Optional Footer Citation */}
        {citation && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: `1px solid ${surface.divider}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "14px",
                borderRadius: "2px",
                backgroundColor: isWarningCard
                  ? surface.riskText
                  : surface.accentText,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 500,
                color: surface.muted,
                letterSpacing: "0.03em",
                textShadow: surface.textShadow,
              }}
            >
              {citation}
            </span>
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 2. GlassCornerPill — Compact docked status/metric pill for corners
// ============================================================================
export interface GlassCornerPillProps extends GlassPresetBaseProps {
  label: string;
  value?: string;
  badge?: string;
  statusColor?: string;
  pulseDot?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const GlassCornerPill: React.FC<GlassCornerPillProps> = ({
  label,
  value,
  badge,
  statusColor,
  pulseDot = true,
  icon,
  children,
  borderRadius = 999,
  tint = "navy-glass",
  blurAmount = 12,
  displacementScale = 18,
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const surface = getSurfacePalette(tint);
  const dotColor =
    statusColor ??
    (tint === "warning" ? surface.riskText : surface.accentText);
  const dotScale = pulseDot ? 0.9 + Math.sin(frame * 0.14) * 0.12 : 1;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      borderRadius={borderRadius}
      tint={tint}
      blurAmount={blurAmount}
      displacementScale={displacementScale}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 22px",
          userSelect: "none",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {icon ? (
          <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            {icon}
          </span>
        ) : (
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: dotColor,
              boxShadow: `0 0 10px ${dotColor}88`,
              transform: `scale(${dotScale})`,
            }}
          />
        )}

        {badge && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: OVER_FOOTAGE_PALETTE.textHeadline,
              backgroundColor:
                tint === "warning"
                  ? surface.riskChipBg
                  : "rgba(28, 43, 58, 0.92)",
              border:
                tint === "warning"
                  ? `1px solid ${surface.riskBorder}`
                  : `1px solid ${surface.subBorderActive}`,
              padding: "3px 10px",
              borderRadius: "999px",
              textShadow: surface.textShadow,
              flexShrink: 0,
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        )}

        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: "14px",
            fontWeight: 600,
            color: surface.body,
            letterSpacing: "0.01em",
            textShadow: surface.textShadow,
            minWidth: 0,
            flex: "0 1 auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        {value && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "16px",
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              color: tint === "warning" ? surface.riskText : surface.title,
              paddingLeft: "10px",
              borderLeft: `1px solid ${surface.divider}`,
              textShadow: surface.textShadow,
              flexShrink: 0,
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </span>
        )}

        {children}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 3. GlassBottomDock — Clean horizontal dock holding 2–4 stats or chapters
// ============================================================================
export interface GlassDockItem {
  id?: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
  active?: boolean;
  accentColor?: string;
}

export interface GlassBottomDockProps extends GlassPresetBaseProps {
  items: GlassDockItem[];
  activeIndex?: number;
  caption?: string;
}

export const GlassBottomDock: React.FC<GlassBottomDockProps> = ({
  items,
  activeIndex,
  caption,
  borderRadius = 28,
  tint = "navy-glass",
  blurAmount = 12,
  ...glassProps
}) => {
  const surface = getSurfacePalette(tint);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      borderRadius={borderRadius}
      tint={tint}
      blurAmount={blurAmount}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 20px",
          userSelect: "none",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {caption && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: surface.isRisk ? surface.riskChipText : surface.accentWarm,
              backgroundColor: surface.isRisk
                ? surface.riskChipBg
                : surface.subBg,
              border: `1px solid ${
                surface.isRisk ? surface.riskBorder : surface.accentText
              }`,
              borderRadius: "10px",
              padding: "6px 12px",
              flexShrink: 0,
              maxWidth: "210px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: surface.textShadow,
            }}
          >
            {sanitizeDockText(caption)}
          </div>
        )}

        {items.slice(0, 4).map((item, idx) => {
          const isActive = item.active ?? activeIndex === idx;
          const accent = item.accentColor ?? surface.accentText;
          const safeValue = sanitizeDockText(item.value);
          const safeLabel = sanitizeDockText(item.label);

          return (
            <div
              key={item.id ?? `${safeLabel}-${idx}`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 18px",
                borderRadius: "18px",
                backgroundColor: isActive ? surface.subBgActive : surface.subBg,
                border: isActive
                  ? `1.5px solid ${accent}`
                  : `1px solid ${surface.subBorder}`,
                minWidth: "152px",
                maxWidth: "280px",
                flex: "0 1 auto",
                overflow: "hidden",
              }}
            >
              {item.icon && (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: isActive
                      ? "rgba(143, 180, 217, 0.28)"
                      : "rgba(15, 25, 35, 0.45)",
                    border: `1px solid ${isActive ? accent : surface.subBorder}`,
                    color: surface.title,
                    fontFamily: FONTS.mono,
                    fontWeight: 700,
                    fontSize: "13px",
                    textShadow: surface.textShadow,
                  }}
                >
                  {item.icon}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  minWidth: 0,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {safeValue && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "17px",
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      color: isActive ? surface.accentWarm : surface.title,
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textShadow: surface.textShadow,
                    }}
                  >
                    {safeValue}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: isActive ? surface.title : surface.muted,
                    letterSpacing: "0.01em",
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textShadow: surface.textShadow,
                  }}
                >
                  {safeLabel}
                </span>
              </div>

              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "22px",
                    height: "3px",
                    borderRadius: "999px",
                    backgroundColor: accent,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 4. GlassFloatingToolbar — Compact action / chapter switcher bar
// ============================================================================
export interface GlassToolbarItem {
  id?: string;
  label: string;
  tag?: string;
  icon?: React.ReactNode;
}

export interface GlassFloatingToolbarProps extends GlassPresetBaseProps {
  items: GlassToolbarItem[];
  activeIndex?: number;
  autoCycleFrames?: number;
  prefix?: string;
  rightSlot?: React.ReactNode;
}

export const GlassFloatingToolbar: React.FC<GlassFloatingToolbarProps> = ({
  items,
  activeIndex,
  autoCycleFrames,
  prefix,
  rightSlot,
  borderRadius = 20,
  tint = "navy-glass",
  blurAmount = 12,
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const surface = getSurfacePalette(tint);
  const safeCount = Math.max(1, items.length);
  const resolvedActive =
    activeIndex !== undefined
      ? activeIndex
      : autoCycleFrames && autoCycleFrames > 0
      ? Math.floor(frame / autoCycleFrames) % safeCount
      : 0;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      borderRadius={borderRadius}
      tint={tint}
      blurAmount={blurAmount}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          userSelect: "none",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {prefix && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: surface.isRisk ? surface.riskText : surface.accentWarm,
              textTransform: "uppercase",
              padding: "0 10px 0 6px",
              flexShrink: 0,
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: surface.textShadow,
            }}
          >
            {prefix}
          </span>
        )}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px",
            borderRadius: "14px",
            backgroundColor: surface.subBg,
            border: `1px solid ${surface.subBorder}`,
            minWidth: 0,
            flex: "0 1 auto",
            overflow: "hidden",
          }}
        >
          {items.map((item, idx) => {
            const isActive = idx === resolvedActive;
            return (
              <div
                key={item.id ?? `${item.label}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "10px",
                  minWidth: 0,
                  maxWidth: "240px",
                  overflow: "hidden",
                  backgroundColor: isActive
                    ? "rgba(28, 43, 58, 0.88)"
                    : "transparent",
                  border: isActive
                    ? `1px solid ${surface.subBorderActive}`
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(15, 25, 35, 0.28)"
                    : "none",
                }}
              >
                {item.icon && (
                  <span
                    style={{
                      display: "inline-flex",
                      flexShrink: 0,
                      color: isActive ? surface.accentWarm : surface.muted,
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                {item.tag && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "10px",
                      fontWeight: 700,
                      flexShrink: 0,
                      color: isActive ? surface.accentText : surface.muted,
                      textShadow: surface.textShadow,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? surface.title : surface.muted,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textShadow: surface.textShadow,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {rightSlot && (
          <div
            style={{
              paddingLeft: "10px",
              borderLeft: `1px solid ${surface.divider}`,
              fontFamily: FONTS.mono,
              fontSize: "13px",
              fontWeight: 700,
              color: surface.title,
              flexShrink: 0,
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: surface.textShadow,
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 5. GlassToastAlert — Editorial notification & risk callout toast
// ============================================================================
export interface GlassToastAlertProps extends GlassPresetBaseProps {
  title: string;
  message: React.ReactNode;
  variant?: "info" | "warning" | "success" | "joke";
  tag?: string;
  timestamp?: string;
  icon?: React.ReactNode;
}

const TOAST_VARIANTS = {
  info: {
    defaultTint: "navy-glass" as const,
    accent: OVER_FOOTAGE_PALETTE.accentPrimary,
    defaultTag: "Note",
    glyph: "i",
  },
  warning: {
    defaultTint: "warning" as const,
    accent: OVER_FOOTAGE_PALETTE.brickRedText,
    defaultTag: "Risk Flag",
    glyph: "!",
  },
  success: {
    defaultTint: "navy-glass" as const,
    accent: OVER_FOOTAGE_PALETTE.chartSecondary,
    defaultTag: "Verified",
    glyph: "✓",
  },
  joke: {
    defaultTint: "gold" as const,
    accent: OVER_FOOTAGE_PALETTE.accentWarm,
    defaultTag: "Aside",
    glyph: "★",
  },
} as const;

export const GlassToastAlert: React.FC<GlassToastAlertProps> = ({
  title,
  message,
  variant = "info",
  tag,
  timestamp,
  icon,
  width = 450,
  borderRadius = 22,
  tint,
  sfxEnterCue = "alert-ping",
  ...glassProps
}) => {
  const cfg = TOAST_VARIANTS[variant];
  const resolvedTint = tint ?? cfg.defaultTint;
  const surface = getSurfacePalette(resolvedTint);
  const isRisk = variant === "warning" || resolvedTint === "warning";
  const accentColor = isRisk ? surface.riskText : cfg.accent;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={resolvedTint}
      sfxEnterCue={sfxEnterCue}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          padding: "20px 24px",
          userSelect: "none",
        }}
      >
        {/* Icon Badge */}
        <div
          style={{
            flexShrink: 0,
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            backgroundColor: isRisk
              ? surface.riskChipBg
              : OVER_FOOTAGE_PALETTE.glassDarkWell,
            border: `1px solid ${
              isRisk ? surface.riskBorder : surface.accentText
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.mono,
            fontSize: "16px",
            fontWeight: 800,
            color: isRisk ? surface.riskChipText : accentColor,
            textShadow: surface.textShadow,
          }}
        >
          {icon ?? cfg.glyph}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: isRisk ? surface.riskChipText : accentColor,
                backgroundColor: isRisk ? surface.riskChipBg : "transparent",
                border: isRisk ? `1px solid ${surface.riskBorder}` : "none",
                borderRadius: isRisk ? "6px" : 0,
                padding: isRisk ? "2px 8px" : 0,
                textTransform: "uppercase",
                textShadow: surface.textShadow,
              }}
            >
              {tag ?? cfg.defaultTag}
            </span>
            {timestamp && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: surface.body,
                  textShadow: surface.textShadow,
                }}
              >
                {timestamp}
              </span>
            )}
          </div>

          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: "16.5px",
              fontWeight: 700,
              color: surface.title,
              lineHeight: 1.3,
              textShadow: surface.textShadow,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: "6px",
              fontFamily: FONTS.sans,
              fontSize: "13.5px",
              fontWeight: 500,
              lineHeight: 1.5,
              color: surface.body,
              textShadow: surface.textShadow,
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 6. GlassSplitModal — 2-column comparative smoked-navy glass sheet
// ============================================================================
export interface GlassSplitColumn {
  label: string;
  value: string;
  sublabel?: string;
  items?: Array<{ label: string; value: string }>;
  accentColor?: string;
  highlight?: boolean;
  isRisk?: boolean;
  children?: React.ReactNode;
}

export interface GlassSplitModalProps extends GlassPresetBaseProps {
  title: string;
  eyebrow?: string;
  left: GlassSplitColumn;
  right: GlassSplitColumn;
  vsLabel?: string;
  footer?: string;
}

const SplitColumnBody: React.FC<{
  col: GlassSplitColumn;
  defaultAccent: string;
  surface: ReturnType<typeof getSurfacePalette>;
}> = ({ col, defaultAccent, surface }) => {
  const accent = col.accentColor ?? defaultAccent;
  const isRiskCol = Boolean(col.isRisk);

  return (
    <div
      style={{
        flex: 1,
        padding: "22px 24px",
        borderRadius: "18px",
        background: isRiskCol
          ? "linear-gradient(135deg, rgba(163, 64, 46, 0.36) 0%, rgba(15, 25, 35, 0.40) 100%)"
          : col.highlight
          ? surface.subBgActive
          : surface.subBg,
        border: isRiskCol
          ? `1.5px solid ${surface.riskBorder}`
          : col.highlight
          ? `1.5px solid ${surface.accentText}`
          : `1px solid ${surface.subBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          width: "fit-content",
          color: isRiskCol ? surface.riskChipText : accent,
          backgroundColor: isRiskCol ? surface.riskChipBg : "transparent",
          border: isRiskCol ? `1px solid ${surface.riskBorder}` : "none",
          borderRadius: isRiskCol ? "6px" : 0,
          padding: isRiskCol ? "3px 9px" : 0,
          textShadow: surface.textShadow,
        }}
      >
        {col.label}
      </span>

      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: "36px",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: surface.title,
          lineHeight: 1.08,
          textShadow: surface.textShadow,
        }}
      >
        {col.value}
      </div>

      {col.sublabel && (
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1.45,
            color: isRiskCol ? surface.body : surface.muted,
            textShadow: surface.textShadow,
          }}
        >
          {col.sublabel}
        </span>
      )}

      {col.items && col.items.length > 0 && (
        <div
          style={{
            marginTop: "6px",
            paddingTop: "10px",
            borderTop: `1px solid ${
              isRiskCol ? surface.riskBorder : surface.divider
            }`,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {col.items.map((row, idx) => (
            <div
              key={`${row.label}-${idx}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.sans,
                  color: surface.body,
                  textShadow: surface.textShadow,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: isRiskCol ? surface.riskText : surface.title,
                  textShadow: surface.textShadow,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {col.children}
    </div>
  );
};

export const GlassSplitModal: React.FC<GlassSplitModalProps> = ({
  title,
  eyebrow = "Comparison",
  left,
  right,
  vsLabel = "VS",
  footer,
  width = 780,
  borderRadius = 28,
  tint = "navy-glass",
  ...glassProps
}) => {
  const surface = getSurfacePalette(tint);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "32px 36px", userSelect: "none" }}>
        {/* Header */}
        <div style={{ marginBottom: "22px" }}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: surface.title,
              textTransform: "uppercase",
              marginBottom: "6px",
              textShadow: surface.textShadow,
            }}
          >
            {eyebrow}
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: "26px",
              fontWeight: 800,
              color: surface.title,
              lineHeight: 1.24,
              textShadow: surface.textShadow,
            }}
          >
            {title}
          </h3>
        </div>

        {/* 2-Column Comparison Grid */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            gap: "16px",
          }}
        >
          <SplitColumnBody
            col={left}
            defaultAccent={surface.accentText}
            surface={surface}
          />

          {/* Center Divider Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: surface.title,
                backgroundColor: surface.vsBg,
                border: `1px solid ${surface.vsBorder}`,
                borderRadius: "999px",
                padding: "6px 10px",
                textShadow: surface.textShadow,
              }}
            >
              {vsLabel}
            </div>
          </div>

          <SplitColumnBody
            col={right}
            defaultAccent={
              right.isRisk ? surface.riskText : surface.secondaryMetric
            }
            surface={surface}
          />
        </div>

        {/* Optional Footer */}
        {footer && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: `1px solid ${surface.divider}`,
              fontFamily: FONTS.mono,
              fontSize: "12px",
              fontWeight: 600,
              color: surface.title,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textShadow: surface.textShadow,
            }}
          >
            <span style={{ color: surface.accentWarm }}>▸</span>
            <span>{footer}</span>
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 7. GlassDossierStack — Cascading archival/SEC filing stack with active top sheet
// ============================================================================
export interface GlassDossierSheet {
  id?: string;
  exhibitCode: string;
  title: string;
  excerpt: string;
  metricValue?: string;
  metricLabel?: string;
  stamp?: string;
  isRisk?: boolean;
}

export interface GlassDossierStackProps extends GlassPresetBaseProps {
  heading?: string;
  sheets: GlassDossierSheet[];
  activeIndex?: number;
  citation?: string;
}

export const GlassDossierStack: React.FC<GlassDossierStackProps> = ({
  heading = "Archival Dossier",
  sheets,
  activeIndex = 0,
  citation,
  width = 580,
  borderRadius = 26,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);
  const safeSheets: GlassDossierSheet[] =
    sheets.length > 0
      ? sheets.slice(0, 4)
      : [
          {
            exhibitCode: "EX-01",
            title: "Primary Ledger Filing",
            excerpt: "Verified statutory balance sheet entry.",
          },
        ];
  const clampedActive = Math.max(0, Math.min(safeSheets.length - 1, activeIndex));
  const topSheet = safeSheets[clampedActive];
  const settle = spring({ frame, fps, config: CINEMA_SPRINGS.archivalSettle });
  const backingSheets = safeSheets
    .map((s, idx) => ({ s, idx, depth: Math.abs(idx - clampedActive) }))
    .filter((item) => item.idx !== clampedActive)
    .slice(0, 2);
  const maxDepth = backingSheets.reduce((acc, item) => Math.max(acc, item.depth), 0);
  const stackTopPad = maxDepth * 7;

  return (
    <div style={{ position: "relative", width, paddingTop: `${stackTopPad}px` }}>
      {/* Concentric Symmetrically-Aligned Backing Dossier Tabs */}
      {backingSheets.map(({ s, idx, depth }) => {
        const offsetY = -depth * 7 * settle;
        const scaleBack = 1 - depth * 0.032;
        const backRadius = Math.max(12, borderRadius - depth * 2);
        return (
          <div
            key={s.id ?? `${s.exhibitCode}-${idx}`}
            style={{
              position: "absolute",
              inset: `${stackTopPad}px 0 0 0`,
              borderRadius: backRadius,
              background: `rgba(19, 30, 43, ${(0.76 - depth * 0.14).toFixed(2)})`,
              border: `1px solid rgba(191, 214, 234, ${(0.28 - depth * 0.06).toFixed(2)})`,
              boxShadow: "inset 0 1px 0 rgba(255, 250, 240, 0.18)",
              transform: `translate3d(0, ${offsetY.toFixed(1)}px, 0) scale(${scaleBack.toFixed(3)})`,
              transformOrigin: "top center",
              pointerEvents: "none",
              zIndex: Math.max(0, 4 - depth),
            }}
          />
        );
      })}

      <div style={{ position: "relative", zIndex: 10 }}>
        <LiquidGlassObject
          {...pickGlassProps(glassProps)}
          width={width}
          borderRadius={borderRadius}
          tint={topSheet.isRisk ? "warning" : tint}
        >
        <div style={{ padding: "28px 32px", userSelect: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              paddingBottom: "12px",
              marginBottom: "16px",
              borderBottom: `1px solid ${surface.divider}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  backgroundColor: topSheet.isRisk
                    ? surface.riskChipBg
                    : "rgba(28, 43, 58, 0.9)",
                  border: `1px solid ${
                    topSheet.isRisk ? surface.riskBorder : surface.subBorderActive
                  }`,
                  color: surface.title,
                  textShadow: surface.textShadow,
                }}
              >
                {topSheet.exhibitCode}
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: surface.muted,
                  textShadow: surface.textShadow,
                }}
              >
                {heading}
              </span>
            </div>

            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                color: surface.muted,
                textShadow: surface.textShadow,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {clampedActive + 1} / {safeSheets.length}
            </span>
          </div>

          <h4
            style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontSize: "24px",
              fontWeight: 600,
              lineHeight: 1.24,
              color: surface.title,
              textShadow: surface.textShadow,
            }}
          >
            {topSheet.title}
          </h4>

          <p
            style={{
              margin: "12px 0 0 0",
              fontFamily: FONTS.sans,
              fontSize: "14.5px",
              lineHeight: 1.54,
              color: surface.body,
              textShadow: surface.textShadow,
            }}
          >
            {topSheet.excerpt}
          </p>

          {(topSheet.metricValue || topSheet.stamp) && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "14px",
                backgroundColor: topSheet.isRisk ? surface.riskBg : surface.subBg,
                border: `1px solid ${
                  topSheet.isRisk ? surface.riskBorder : surface.subBorder
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {topSheet.metricValue ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "26px",
                      fontWeight: 700,
                      color: topSheet.isRisk ? surface.riskText : surface.title,
                      textShadow: surface.textShadow,
                      ...TABULAR_NUM_STYLE,
                    }}
                  >
                    {topSheet.metricValue}
                  </span>
                  {topSheet.metricLabel && (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: surface.muted,
                        textShadow: surface.textShadow,
                      }}
                    >
                      {topSheet.metricLabel}
                    </span>
                  )}
                </div>
              ) : (
                <span />
              )}

              {topSheet.stamp && (
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: `1.5px solid ${
                      topSheet.isRisk ? surface.riskText : surface.accentText
                    }`,
                    color: topSheet.isRisk ? surface.riskText : surface.accentWarm,
                    textShadow: surface.textShadow,
                  }}
                >
                  {topSheet.stamp}
                </span>
              )}
            </div>
          )}

          {citation && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: `1px solid ${surface.divider}`,
                fontFamily: FONTS.mono,
                fontSize: "11px",
                color: surface.muted,
                textShadow: surface.textShadow,
              }}
            >
              § {citation}
            </div>
          )}
        </div>
      </LiquidGlassObject>
      </div>
    </div>
  );
};

// ============================================================================
// 8. GlassEvidenceRail — Right-third vertical chain-of-evidence rail
// ============================================================================
export interface GlassEvidenceNode {
  id?: string;
  code: string;
  label: string;
  value?: string;
  detail?: string;
  status?: "verified" | "risk" | "pending";
}

export interface GlassEvidenceRailProps extends GlassPresetBaseProps {
  title: string;
  eyebrow?: string;
  nodes: GlassEvidenceNode[];
  activeNodeIndex?: number;
}

export const GlassEvidenceRail: React.FC<GlassEvidenceRailProps> = ({
  title,
  eyebrow = "Evidence Chain",
  nodes,
  activeNodeIndex = 0,
  width = 480,
  borderRadius = 26,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);
  const spineSweep = spring({ frame, fps, config: CINEMA_SPRINGS.inkSweep });

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "26px 28px", userSelect: "none" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: surface.accentWarm,
            textShadow: surface.textShadow,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: "4px",
            marginBottom: "18px",
            fontFamily: FONTS.sans,
            fontSize: "21px",
            fontWeight: 800,
            color: surface.title,
            textShadow: surface.textShadow,
          }}
        >
          {title}
        </div>

        <div style={{ position: "relative", paddingLeft: "22px" }}>
          <div
            style={{
              position: "absolute",
              left: "6px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              backgroundColor: surface.subBorderActive,
              transform: `scaleY(${Math.max(0, Math.min(1, spineSweep)).toFixed(3)})`,
              transformOrigin: "top center",
              opacity: 0.65,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {nodes.slice(0, 5).map((node, idx) => {
              const isActive = idx === activeNodeIndex;
              const isRisk = node.status === "risk";
              const dotHex = isRisk
                ? surface.riskText
                : node.status === "verified"
                ? surface.secondaryMetric
                : surface.accentText;

              return (
                <div
                  key={node.id ?? `${node.code}-${idx}`}
                  style={{
                    position: "relative",
                    padding: "11px 14px",
                    borderRadius: "14px",
                    backgroundColor: isRisk
                      ? surface.riskBg
                      : isActive
                      ? surface.subBgActive
                      : surface.subBg,
                    border: `1px solid ${
                      isRisk
                        ? surface.riskBorder
                        : isActive
                        ? surface.subBorderActive
                        : surface.subBorder
                    }`,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "-20px",
                      top: "16px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: dotHex,
                      boxShadow: isActive ? `0 0 8px ${dotHex}` : "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: surface.title,
                        textShadow: surface.textShadow,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: "11px",
                          color: dotHex,
                          marginRight: "8px",
                        }}
                      >
                        {node.code}
                      </span>
                      {node.label}
                    </span>

                    {node.value && (
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isRisk ? surface.riskText : surface.title,
                          textShadow: surface.textShadow,
                          ...TABULAR_NUM_STYLE,
                        }}
                      >
                        {node.value}
                      </span>
                    )}
                  </div>

                  {node.detail && (
                    <div
                      style={{
                        marginTop: "4px",
                        fontFamily: FONTS.sans,
                        fontSize: "12.5px",
                        color: surface.muted,
                        lineHeight: 1.4,
                        textShadow: surface.textShadow,
                      }}
                    >
                      {node.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 9. GlassMagnifierCard — Optical 2.0x loupe inspection card for clauses & ledgers
// ============================================================================
export interface GlassMagnifierCardProps extends GlassPresetBaseProps {
  title: string;
  clauseCode?: string;
  focusedSnippet: string;
  contextLineBefore?: string;
  contextLineAfter?: string;
  zoomFactor?: number;
  annotation?: string;
  citation?: string;
}

export const GlassMagnifierCard: React.FC<GlassMagnifierCardProps> = ({
  title,
  clauseCode = "SEC FILING ZOOM",
  focusedSnippet,
  contextLineBefore,
  contextLineAfter,
  zoomFactor = 2.05,
  annotation,
  citation,
  width = 600,
  borderRadius = 28,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);
  const lensLock = spring({ frame, fps, config: CINEMA_SPRINGS.editorialSnap });
  const lensScale = interpolate(lensLock, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { leftTag, zoomPill } = resolveMagnifierHeaderTags(clauseCode, zoomFactor);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "28px 32px", userSelect: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: surface.accentWarm,
              textShadow: surface.textShadow,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {leftTag}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "999px",
              backgroundColor: "rgba(28, 43, 58, 0.85)",
              border: `1px solid ${surface.subBorderActive}`,
              color: surface.title,
              flexShrink: 0,
              whiteSpace: "nowrap",
              ...TABULAR_NUM_STYLE,
            }}
          >
            {zoomPill}
          </span>
        </div>

        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: "20px",
            fontWeight: 800,
            color: surface.title,
            marginBottom: "16px",
            textShadow: surface.textShadow,
          }}
        >
          {title}
        </div>

        {/* Precision Rim-Lit Archival Lens Well */}
        <div
          style={{
            position: "relative",
            padding: "20px 22px",
            borderRadius: "20px",
            background:
              "linear-gradient(148deg, rgba(16, 26, 38, 0.86) 0%, rgba(11, 18, 28, 0.92) 100%)",
            border: "1.5px solid rgba(191, 214, 234, 0.58)",
            boxShadow:
              "inset 0 1px 0 rgba(255, 250, 240, 0.30), inset 0 0 28px rgba(191, 214, 234, 0.12), 0 12px 28px rgba(8, 14, 22, 0.42)",
            transform: `scale(${lensScale.toFixed(4)})`,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {contextLineBefore && (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "12.5px",
                color: surface.muted,
                opacity: 0.62,
                marginBottom: "6px",
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contextLineBefore}
            </div>
          )}

          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: "21px",
              fontWeight: 600,
              fontStyle: "italic",
              lineHeight: 1.35,
              color: OVER_FOOTAGE_PALETTE.textHeadline,
              padding: "10px 14px",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, rgba(62, 106, 148, 0.34) 0%, rgba(47, 143, 139, 0.16) 100%)",
              border: "1px solid rgba(191, 214, 234, 0.34)",
              borderLeft: `3.5px solid ${surface.accentWarm}`,
              boxShadow: "inset 0 1px 0 rgba(255, 250, 240, 0.22)",
              textShadow: surface.textShadow,
            }}
          >
            “{focusedSnippet}”
          </div>

          {contextLineAfter && (
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "12.5px",
                color: surface.muted,
                opacity: 0.62,
                marginTop: "6px",
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contextLineAfter}
            </div>
          )}
        </div>

        {(annotation || citation) && (
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            {annotation && (
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: surface.body,
                  textShadow: surface.textShadow,
                }}
              >
                {annotation}
              </span>
            )}
            {citation && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  color: surface.muted,
                  textShadow: surface.textShadow,
                }}
              >
                § {citation}
              </span>
            )}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 10. GlassTelemetryStrip — Multi-channel live telemetry ribbon with sparklines
// ============================================================================
export interface GlassTelemetryChannel {
  id?: string;
  label: string;
  value: string;
  delta?: string;
  isRisk?: boolean;
  sparkline?: readonly number[];
}

export interface GlassTelemetryStripProps extends GlassPresetBaseProps {
  tag?: string;
  channels: GlassTelemetryChannel[];
  sourceTag?: string;
}

export const GlassTelemetryStrip: React.FC<GlassTelemetryStripProps> = ({
  tag = "LIVE TELEMETRY",
  channels,
  sourceTag,
  width = 1120,
  borderRadius = 22,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);
  const sweep = spring({ frame, fps, config: CINEMA_SPRINGS.inkSweep });
  const visibleChannels = channels.slice(0, 4);
  const isDense = visibleChannels.length >= 4;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isDense ? "12px" : "18px",
          padding: isDense ? "14px 20px" : "14px 24px",
          userSelect: "none",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            padding: "6px 12px",
            borderRadius: "10px",
            backgroundColor: surface.subBgActive,
            border: `1px solid ${surface.subBorderActive}`,
            color: surface.accentWarm,
            flexShrink: 0,
            maxWidth: isDense ? "165px" : "190px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textShadow: surface.textShadow,
          }}
        >
          {tag}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isDense ? "12px" : "18px",
            overflow: "hidden",
          }}
        >
          {visibleChannels.map((ch, idx) => {
            const pts = buildChannelSparkline(ch, idx);
            const minV = Math.min(...pts);
            const maxV = Math.max(...pts);
            const span = Math.max(1e-6, maxV - minV);
            const poly = pts
              .map((v, i) => {
                const px = 2 + (i / (pts.length - 1)) * 56;
                const py = 20 - ((v - minV) / span) * 16;
                return `${px.toFixed(1)},${py.toFixed(1)}`;
              })
              .join(" ");
            const strokeHex = ch.isRisk ? surface.riskText : surface.secondaryMetric;

            return (
              <div
                key={ch.id ?? `${ch.label}-${idx}`}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: isDense ? "8px" : "12px",
                  paddingLeft: idx > 0 ? (isDense ? "12px" : "18px") : 0,
                  borderLeft: idx > 0 ? `1px solid ${surface.divider}` : "none",
                  overflow: "hidden",
                }}
              >
                <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "10.5px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: surface.muted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textShadow: surface.textShadow,
                    }}
                  >
                    {ch.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: isDense ? "6px" : "8px",
                      marginTop: "2px",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "18px",
                        fontWeight: 800,
                        color: ch.isRisk ? surface.riskText : surface.title,
                        textShadow: surface.textShadow,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        ...TABULAR_NUM_STYLE,
                      }}
                    >
                      {ch.value}
                    </span>
                    {ch.delta && (
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: "11.5px",
                          fontWeight: 700,
                          color: strokeHex,
                          textShadow: surface.textShadow,
                          minWidth: 0,
                          flex: "0 1 auto",
                          maxWidth: "88px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          ...TABULAR_NUM_STYLE,
                        }}
                      >
                        {ch.delta}
                      </span>
                    )}
                  </div>
                </div>

                <svg
                  width={isDense ? 52 : 60}
                  height={24}
                  viewBox="0 0 60 24"
                  style={{ flexShrink: 0 }}
                >
                  <polyline
                    points={poly}
                    fill="none"
                    stroke={strokeHex}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={Math.max(0.2, Math.min(1, sweep))}
                  />
                </svg>
              </div>
            );
          })}
        </div>

        {sourceTag && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: surface.muted,
              flexShrink: 0,
              maxWidth: isDense ? "210px" : "240px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: surface.textShadow,
            }}
          >
            § {sourceTag}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 11. GlassVerdictSeal — Heavy-stamp judicial/statutory verdict seal card
// ============================================================================
export interface GlassVerdictSealProps extends GlassPresetBaseProps {
  stampLabel: string;
  headline: string;
  docketOrStatute?: string;
  impactFigure?: string;
  impactSubtext?: string;
  isAdverse?: boolean;
  stampFrame?: number;
}

export const GlassVerdictSeal: React.FC<GlassVerdictSealProps> = ({
  stampLabel,
  headline,
  docketOrStatute,
  impactFigure,
  impactSubtext,
  isAdverse = true,
  stampFrame = 6,
  width = 540,
  borderRadius = 26,
  tint,
  sfxEnterCue = "warning-thud",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const resolvedTint = tint ?? (isAdverse ? "warning" : "navy-glass");
  const surface = getSurfacePalette(resolvedTint);

  const stampHit = spring({
    frame: frame - stampFrame,
    fps,
    config: CINEMA_SPRINGS.heavyStamp,
  });
  const sealScale = interpolate(stampHit, [0, 1], [1.3, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sealOpacity = interpolate(frame - stampFrame, [-2, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sealColor = isAdverse ? surface.riskText : surface.secondaryMetric;
  const numericWidth = typeof width === "number" ? width : 540;
  const cleanImpactFigure = impactFigure ? impactFigure.replace(/\s+/g, " ").trim() : "";
  const fittedImpact =
    cleanImpactFigure.length > 0
      ? fitAndBalanceText({
          text: cleanImpactFigure,
          fontFamily: "mono",
          fontWeight: 800,
          maxWidth: impactSubtext
            ? Math.max(180, Math.round(numericWidth * 0.44))
            : Math.max(220, numericWidth - 64),
          maxHeight: 68,
          maxLines: cleanImpactFigure.length > 16 ? 2 : 1,
          minFontSize: 16,
          maxFontSize: 32,
          lineHeight: 1.15,
        })
      : null;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={resolvedTint}
      sfxEnterCue={sfxEnterCue}
    >
      <div style={{ padding: "28px 32px", position: "relative", userSelect: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {docketOrStatute && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: surface.muted,
                  marginBottom: "8px",
                  textShadow: surface.textShadow,
                }}
              >
                {docketOrStatute}
              </div>
            )}
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "25px",
                fontWeight: 600,
                lineHeight: 1.24,
                color: surface.title,
                textShadow: surface.textShadow,
              }}
            >
              {headline}
            </div>
          </div>

          {/* Heavy-Stamped Verdict Seal */}
          <div
            style={{
              opacity: sealOpacity,
              transform: `scale(${sealScale.toFixed(4)}) rotate(-6deg)`,
              transformOrigin: "center center",
              padding: "8px 14px",
              borderRadius: "10px",
              border: `2.5px solid ${sealColor}`,
              boxShadow: `inset 0 0 0 2px rgba(255, 250, 240, 0.14)`,
              backgroundColor: isAdverse
                ? "rgba(163, 64, 46, 0.34)"
                : "rgba(15, 25, 35, 0.56)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: surface.title,
                textShadow: surface.textShadow,
              }}
            >
              {stampLabel}
            </span>
          </div>
        </div>

        {cleanImpactFigure.length > 0 && fittedImpact && (
          <div
            style={{
              marginTop: "18px",
              paddingTop: "14px",
              borderTop: `1px solid ${surface.divider}`,
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "12px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: `${fittedImpact.fontSize}px`,
                fontWeight: 800,
                lineHeight: 1.15,
                color: sealColor,
                textShadow: surface.textShadow,
                maxWidth: "100%",
                minWidth: 0,
                overflowWrap: "anywhere",
                flexShrink: cleanImpactFigure.length <= 18 && impactSubtext ? 0 : 1,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {cleanImpactFigure}
            </span>
            {impactSubtext && (
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "13.5px",
                  lineHeight: 1.38,
                  color: surface.body,
                  textShadow: surface.textShadow,
                  minWidth: 0,
                  flex: "1 1 180px",
                }}
              >
                {impactSubtext}
              </span>
            )}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 12. GlassCompareScale — Precision two-pan comparative balance scale on glass
// ============================================================================
export interface GlassScalePan {
  label: string;
  displayValue: string;
  weight: number;
  sublabel?: string;
  isRisk?: boolean;
}

export interface GlassCompareScaleProps extends GlassPresetBaseProps {
  title: string;
  eyebrow?: string;
  leftPan: GlassScalePan;
  rightPan: GlassScalePan;
  fulcrumLabel?: string;
}

export const GlassCompareScale: React.FC<GlassCompareScaleProps> = ({
  title,
  eyebrow = "Asymmetric Ratio",
  leftPan,
  rightPan,
  fulcrumLabel,
  width = 660,
  borderRadius = 28,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);

  const totalW = Math.max(1e-6, Math.abs(leftPan.weight) + Math.abs(rightPan.weight));
  const imbalance = (rightPan.weight - leftPan.weight) / totalW; // [-1..+1]
  const settle = spring({ frame, fps, config: CINEMA_SPRINGS.archivalSettle });
  const beamTiltDeg = imbalance * 11.5 * settle;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "28px 32px", userSelect: "none" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: surface.accentWarm,
            textShadow: surface.textShadow,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: "4px",
            marginBottom: "18px",
            fontFamily: FONTS.sans,
            fontSize: "22px",
            fontWeight: 800,
            color: surface.title,
            textShadow: surface.textShadow,
          }}
        >
          {title}
        </div>

        {/* Precision Mechanical Beam SVG */}
        <svg
          width="100%"
          height={86}
          viewBox="0 0 560 86"
          style={{ display: "block", marginBottom: "12px" }}
        >
          <g
            transform={`rotate(${beamTiltDeg.toFixed(2)} 280 34)`}
          >
            <line
              x1={76}
              y1={34}
              x2={484}
              y2={34}
              stroke={OVER_FOOTAGE_PALETTE.accentPrimary}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={76} cy={34} r={4.5} fill={OVER_FOOTAGE_PALETTE.textHeadline} />
            <circle cx={484} cy={34} r={4.5} fill={OVER_FOOTAGE_PALETTE.textHeadline} />
            <line
              x1={76}
              y1={34}
              x2={76}
              y2={64}
              stroke={OVER_FOOTAGE_PALETTE.glassBorder}
              strokeWidth={1.5}
            />
            <line
              x1={484}
              y1={34}
              x2={484}
              y2={64}
              stroke={OVER_FOOTAGE_PALETTE.glassBorder}
              strokeWidth={1.5}
            />
            <line
              x1={40}
              y1={64}
              x2={112}
              y2={64}
              stroke={OVER_FOOTAGE_PALETTE.accentWarm}
              strokeWidth={3}
            />
            <line
              x1={448}
              y1={64}
              x2={520}
              y2={64}
              stroke={
                rightPan.isRisk
                  ? OVER_FOOTAGE_PALETTE.brickRedText
                  : OVER_FOOTAGE_PALETTE.chartSecondary
              }
              strokeWidth={3}
            />
          </g>
          {/* Central Fulcrum Pedestal */}
          <polygon
            points="280,34 266,76 294,76"
            fill="rgba(191, 214, 234, 0.28)"
            stroke={OVER_FOOTAGE_PALETTE.accentPrimary}
            strokeWidth={1.5}
          />
        </svg>

        <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
          {[leftPan, rightPan].map((pan, idx) => {
            const isRisk = Boolean(pan.isRisk);
            return (
              <div
                key={`${pan.label}-${idx}`}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "16px",
                  backgroundColor: isRisk ? surface.riskBg : surface.subBg,
                  border: `1px solid ${
                    isRisk ? surface.riskBorder : surface.subBorder
                  }`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: isRisk ? surface.riskText : surface.accentWarm,
                    textShadow: surface.textShadow,
                  }}
                >
                  {pan.label}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontFamily: FONTS.mono,
                    fontSize: "28px",
                    fontWeight: 800,
                    color: isRisk ? surface.riskText : surface.title,
                    textShadow: surface.textShadow,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {pan.displayValue}
                </div>
                {pan.sublabel && (
                  <div
                    style={{
                      marginTop: "4px",
                      fontFamily: FONTS.sans,
                      fontSize: "12.5px",
                      color: surface.muted,
                      textShadow: surface.textShadow,
                    }}
                  >
                    {pan.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {fulcrumLabel && (
          <div
            style={{
              marginTop: "12px",
              textAlign: "center",
              fontFamily: FONTS.mono,
              fontSize: "11.5px",
              color: surface.muted,
              textShadow: surface.textShadow,
            }}
          >
            {fulcrumLabel}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 13. GlassTimelineScrubber — Multi-year / decade horizontal scrub bar
// ============================================================================
export interface GlassTimelineMilestone {
  year: string | number;
  label: string;
  value?: string;
  isRisk?: boolean;
}

export interface GlassTimelineScrubberProps extends GlassPresetBaseProps {
  title?: string;
  milestones: GlassTimelineMilestone[];
  activeIndex?: number;
  /** Optional normalized scrub progress [0..1] overriding activeIndex */
  scrubProgress?: number;
}

export const GlassTimelineScrubber: React.FC<GlassTimelineScrubberProps> = ({
  title = "CHRONOLOGY",
  milestones,
  activeIndex,
  scrubProgress,
  width = 960,
  borderRadius = 24,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const surface = getSurfacePalette(tint);

  const count = Math.max(1, milestones.length);
  const autoProgress = interpolate(
    frame,
    [0, Math.max(1, Math.round(durationInFrames * 0.75))],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const resolvedProgress =
    scrubProgress !== undefined
      ? Math.max(0, Math.min(1, scrubProgress))
      : activeIndex !== undefined && count > 1
      ? Math.max(0, Math.min(1, activeIndex / (count - 1)))
      : autoProgress;

  const smoothP =
    resolvedProgress *
    spring({ frame, fps, config: CINEMA_SPRINGS.inkSweep });
  const nearestIdx =
    activeIndex !== undefined
      ? Math.max(0, Math.min(count - 1, activeIndex))
      : Math.min(count - 1, Math.round(smoothP * (count - 1)));

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "20px 28px", userSelect: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: surface.accentWarm,
              textShadow: surface.textShadow,
            }}
          >
            {title}
          </span>
          {milestones[nearestIdx] && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12.5px",
                fontWeight: 700,
                color: milestones[nearestIdx].isRisk
                  ? surface.riskText
                  : surface.title,
                textShadow: surface.textShadow,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {milestones[nearestIdx].year} · {milestones[nearestIdx].label}
              {milestones[nearestIdx].value
                ? ` (${milestones[nearestIdx].value})`
                : ""}
            </span>
          )}
        </div>

        {/* Scrub Track */}
        <div
          style={{
            position: "relative",
            height: "6px",
            borderRadius: "999px",
            backgroundColor: "rgba(255, 255, 255, 0.14)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${(smoothP * 100).toFixed(2)}%`,
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${OVER_FOOTAGE_PALETTE.accentPrimary} 0%, ${OVER_FOOTAGE_PALETTE.chartSecondary} 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${(smoothP * 100).toFixed(2)}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: surface.title,
              border: `2px solid ${OVER_FOOTAGE_PALETTE.accentPrimary}`,
              boxShadow: "0 2px 8px rgba(8, 14, 22, 0.65)",
            }}
          />
        </div>

        {/* Milestone Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {milestones.map((ms, idx) => {
            const isCurrent = idx === nearestIdx;
            return (
              <div
                key={`${ms.year}-${idx}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    idx === 0
                      ? "flex-start"
                      : idx === count - 1
                      ? "flex-end"
                      : "center",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "13px",
                    fontWeight: isCurrent ? 800 : 600,
                    color: ms.isRisk
                      ? surface.riskText
                      : isCurrent
                      ? surface.title
                      : surface.muted,
                    textShadow: surface.textShadow,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {ms.year}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "11.5px",
                    color: isCurrent ? surface.body : surface.muted,
                    textShadow: surface.textShadow,
                  }}
                >
                  {ms.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 14. GlassReceiptTicker — Itemized ledger / cost-breakdown receipt ticker
// ============================================================================
export interface GlassReceiptLine {
  id?: string;
  label: string;
  amount: string;
  note?: string;
  isDeduction?: boolean;
  highlight?: boolean;
}

export interface GlassReceiptTickerProps extends GlassPresetBaseProps {
  headerTitle: string;
  serialCode?: string;
  lines: GlassReceiptLine[];
  totalLabel?: string;
  totalAmount?: string;
  totalIsRisk?: boolean;
}

export const GlassReceiptTicker: React.FC<GlassReceiptTickerProps> = ({
  headerTitle,
  serialCode = "LEDGER // ITEMIZED",
  lines,
  totalLabel = "NET BALANCE",
  totalAmount,
  totalIsRisk = false,
  width = 500,
  borderRadius = 24,
  tint = "navy-glass",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = getSurfacePalette(tint);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "26px 30px", userSelect: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: "12px",
            marginBottom: "14px",
            borderBottom: `1px dashed ${surface.divider}`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: "18px",
              fontWeight: 800,
              color: surface.title,
              textShadow: surface.textShadow,
            }}
          >
            {headerTitle}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              letterSpacing: "0.08em",
              color: surface.muted,
              textShadow: surface.textShadow,
            }}
          >
            {serialCode}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {lines.slice(0, 7).map((line, idx) => {
            const rowReveal = spring({
              frame: frame - idx * 3,
              fps,
              config: CINEMA_SPRINGS.editorialSnap,
            });
            const rowOpacity = interpolate(frame - idx * 3, [0, 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={line.id ?? `${line.label}-${idx}`}
                style={{
                  opacity: rowOpacity,
                  transform: `translate3d(0, ${((1 - rowReveal) * 8).toFixed(
                    1
                  )}px, 0)`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                  padding: line.highlight ? "6px 10px" : "2px 0",
                  borderRadius: line.highlight ? "8px" : 0,
                  backgroundColor: line.highlight
                    ? OVER_FOOTAGE_PALETTE.highlightSweep
                    : "transparent",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: "14px",
                      fontWeight: line.highlight ? 700 : 500,
                      color: surface.body,
                      textShadow: surface.textShadow,
                    }}
                  >
                    {line.label}
                  </span>
                  {line.note && (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: "10.5px",
                        color: surface.muted,
                      }}
                    >
                      {line.note}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "15.5px",
                    fontWeight: 700,
                    color: line.isDeduction ? surface.riskText : surface.title,
                    textShadow: surface.textShadow,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {line.amount}
                </span>
              </div>
            );
          })}
        </div>

        {totalAmount && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: `1.5px solid ${surface.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: surface.accentWarm,
                textShadow: surface.textShadow,
              }}
            >
              {totalLabel}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "26px",
                fontWeight: 800,
                color: totalIsRisk ? surface.riskText : surface.title,
                textShadow: surface.textShadow,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {totalAmount}
            </span>
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 15. GlassTerminalConsole — Institutional macro/orderbook console on glass
// ============================================================================
export interface GlassTerminalRow {
  tickerOrKey: string;
  field: string;
  value: string;
  status?: "nominal" | "alert" | "muted";
}

export interface GlassTerminalConsoleProps extends GlassPresetBaseProps {
  sessionHeader?: string;
  commandLine?: string;
  rows: GlassTerminalRow[];
  footerStatus?: string;
}

export const GlassTerminalConsole: React.FC<GlassTerminalConsoleProps> = ({
  sessionHeader = "INSTITUTIONAL FEED // DESK-01",
  commandLine,
  rows,
  footerStatus,
  width = 600,
  borderRadius = 22,
  tint = "navy-glass",
  sfxEnterCue = "type-click",
  ...glassProps
}) => {
  const frame = useCurrentFrame();
  const surface = getSurfacePalette(tint);
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
      sfxEnterCue={sfxEnterCue}
    >
      <div style={{ padding: "22px 26px", userSelect: "none" }}>
        {/* Clean Institutional Titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "12px",
            marginBottom: "14px",
            borderBottom: `1px solid ${surface.divider}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: OVER_FOOTAGE_PALETTE.brickRedText,
              }}
            />
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: OVER_FOOTAGE_PALETTE.accentWarm,
              }}
            />
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: OVER_FOOTAGE_PALETTE.chartSecondary,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: surface.muted,
              textShadow: surface.textShadow,
            }}
          >
            {sessionHeader}
          </span>
        </div>

        {commandLine && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(11, 18, 26, 0.58)",
              border: `1px solid ${surface.subBorder}`,
              fontFamily: FONTS.mono,
              fontSize: "12.5px",
              color: surface.accentWarm,
              textShadow: surface.textShadow,
            }}
          >
            <span style={{ color: surface.secondaryMetric, marginRight: "8px" }}>
              ›
            </span>
            {commandLine}
            <span style={{ opacity: cursorVisible ? 0.9 : 0 }}>_</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {rows.slice(0, 6).map((row, idx) => {
            const valColor =
              row.status === "alert"
                ? surface.riskText
                : row.status === "nominal"
                ? surface.secondaryMetric
                : surface.title;

            return (
              <div
                key={`${row.tickerOrKey}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr auto",
                  alignItems: "center",
                  gap: "12px",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  backgroundColor:
                    row.status === "alert"
                      ? surface.riskBg
                      : idx % 2 === 0
                      ? surface.subBg
                      : "transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: surface.title,
                    textShadow: surface.textShadow,
                  }}
                >
                  {row.tickerOrKey}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "12.5px",
                    color: surface.muted,
                    textShadow: surface.textShadow,
                  }}
                >
                  {row.field}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: valColor,
                    textShadow: surface.textShadow,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>

        {footerStatus && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: `1px solid ${surface.divider}`,
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: surface.muted,
              textShadow: surface.textShadow,
            }}
          >
            {footerStatus}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 16. GlassMapCallout — Geographic coordinate & chokepoint glass callout
// ============================================================================
export interface GlassMapCalloutProps extends GlassPresetBaseProps {
  locationName: string;
  coordinates?: string;
  corridorTag?: string;
  primaryMetric: string;
  metricLabel?: string;
  summary?: string;
  isChokepointAlert?: boolean;
}

export const GlassMapCallout: React.FC<GlassMapCalloutProps> = ({
  locationName,
  coordinates = "38.90° N · 77.04° W",
  corridorTag = "GEO SECTOR",
  primaryMetric,
  metricLabel,
  summary,
  isChokepointAlert = false,
  width = 460,
  borderRadius = 24,
  tint,
  sfxEnterCue = "map-whoosh",
  ...glassProps
}) => {
  const resolvedTint = tint ?? (isChokepointAlert ? "warning" : "navy-glass");
  const surface = getSurfacePalette(resolvedTint);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={resolvedTint}
      sfxEnterCue={sfxEnterCue}
    >
      <div style={{ padding: "24px 28px", userSelect: "none" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "6px",
              backgroundColor: isChokepointAlert
                ? surface.riskChipBg
                : surface.subBgActive,
              border: `1px solid ${
                isChokepointAlert ? surface.riskBorder : surface.subBorderActive
              }`,
              color: surface.title,
              textShadow: surface.textShadow,
            }}
          >
            {corridorTag}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: surface.muted,
              textShadow: surface.textShadow,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {coordinates}
          </span>
        </div>

        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: "22px",
            fontWeight: 800,
            color: surface.title,
            textShadow: surface.textShadow,
          }}
        >
          {locationName}
        </div>

        <div
          style={{
            marginTop: "14px",
            padding: "12px 16px",
            borderRadius: "14px",
            backgroundColor: isChokepointAlert ? surface.riskBg : surface.subBg,
            border: `1px solid ${
              isChokepointAlert ? surface.riskBorder : surface.subBorder
            }`,
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "30px",
              fontWeight: 800,
              color: isChokepointAlert ? surface.riskText : surface.title,
              textShadow: surface.textShadow,
              ...TABULAR_NUM_STYLE,
            }}
          >
            {primaryMetric}
          </span>
          {metricLabel && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: surface.muted,
                textShadow: surface.textShadow,
              }}
            >
              {metricLabel}
            </span>
          )}
        </div>

        {summary && (
          <div
            style={{
              marginTop: "12px",
              fontFamily: FONTS.sans,
              fontSize: "13.5px",
              lineHeight: 1.48,
              color: surface.body,
              textShadow: surface.textShadow,
            }}
          >
            {summary}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 17. GlassStatTriptych — Balanced 3-column synchronized live metric triptych
// ============================================================================
export interface GlassTriptychStat {
  label: string;
  value: string;
  delta?: string;
  isRisk?: boolean;
}

export interface GlassStatTriptychProps extends GlassPresetBaseProps {
  eyebrow?: string;
  title?: string;
  stats: readonly [
    GlassTriptychStat,
    GlassTriptychStat,
    GlassTriptychStat,
    ...GlassTriptychStat[]
  ] | GlassTriptychStat[];
  citation?: string;
}

export const GlassStatTriptych: React.FC<GlassStatTriptychProps> = ({
  eyebrow,
  title,
  stats,
  citation,
  width = 860,
  borderRadius = 28,
  tint = "navy-glass",
  ...glassProps
}) => {
  const surface = getSurfacePalette(tint);
  const columns = stats.slice(0, 3);

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "26px 32px", userSelect: "none" }}>
        {(eyebrow || title) && (
          <div style={{ marginBottom: "18px" }}>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: surface.accentWarm,
                  marginBottom: "4px",
                  textShadow: surface.textShadow,
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "21px",
                  fontWeight: 800,
                  color: surface.title,
                  textShadow: surface.textShadow,
                }}
              >
                {title}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, 1fr)`,
            gap: "14px",
          }}
        >
          {columns.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              style={{
                padding: "16px 18px",
                borderRadius: "16px",
                backgroundColor: item.isRisk ? surface.riskBg : surface.subBg,
                border: `1px solid ${
                  item.isRisk ? surface.riskBorder : surface.subBorder
                }`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: surface.muted,
                  textShadow: surface.textShadow,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontFamily: FONTS.mono,
                  fontSize: "32px",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: item.isRisk ? surface.riskText : surface.title,
                  textShadow: surface.textShadow,
                  ...TABULAR_NUM_STYLE,
                }}
              >
                {item.value}
              </div>
              {item.delta && (
                <div
                  style={{
                    marginTop: "6px",
                    fontFamily: FONTS.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: item.isRisk
                      ? surface.riskText
                      : surface.secondaryMetric,
                    textShadow: surface.textShadow,
                    ...TABULAR_NUM_STYLE,
                  }}
                >
                  {item.delta}
                </div>
              )}
            </div>
          ))}
        </div>

        {citation && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: `1px solid ${surface.divider}`,
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: surface.muted,
              textShadow: surface.textShadow,
            }}
          >
            § {citation}
          </div>
        )}
      </div>
    </LiquidGlassObject>
  );
};

// ============================================================================
// 18. GlassQuoteCitation — Editorial primary-source / court excerpt plate
// ============================================================================
export interface GlassQuoteCitationProps extends GlassPresetBaseProps {
  quote: string;
  author: string;
  roleOrSource?: string;
  dateOrYear?: string;
  highlightPhrase?: string;
}

export const GlassQuoteCitation: React.FC<GlassQuoteCitationProps> = ({
  quote,
  author,
  roleOrSource,
  dateOrYear,
  highlightPhrase,
  width = 620,
  borderRadius = 26,
  tint = "navy-glass",
  ...glassProps
}) => {
  const surface = getSurfacePalette(tint);

  let renderedQuote: React.ReactNode = quote;
  if (highlightPhrase && quote.indexOf(highlightPhrase) !== -1) {
    const idx = quote.indexOf(highlightPhrase);
    const before = quote.slice(0, idx);
    const after = quote.slice(idx + highlightPhrase.length);
    renderedQuote = (
      <>
        {before}
        <span
          style={{
            backgroundColor: OVER_FOOTAGE_PALETTE.highlightSweep,
            padding: "1px 6px",
            borderRadius: "4px",
            color: surface.title,
          }}
        >
          {highlightPhrase}
        </span>
        {after}
      </>
    );
  }

  return (
    <LiquidGlassObject
      {...pickGlassProps(glassProps)}
      width={width}
      borderRadius={borderRadius}
      tint={tint}
    >
      <div style={{ padding: "30px 34px", userSelect: "none" }}>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: "23px",
            fontStyle: "italic",
            fontWeight: 500,
            lineHeight: 1.4,
            color: surface.title,
            paddingLeft: "18px",
            borderLeft: `3px solid ${surface.accentWarm}`,
            textShadow: surface.textShadow,
          }}
        >
          “{renderedQuote}”
        </div>

        <div
          style={{
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: `1px solid ${surface.divider}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "14.5px",
                fontWeight: 700,
                color: surface.title,
                textShadow: surface.textShadow,
              }}
            >
              — {author}
            </div>
            {roleOrSource && (
              <div
                style={{
                  marginTop: "2px",
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  color: surface.muted,
                  textShadow: surface.textShadow,
                }}
              >
                § {roleOrSource}
              </div>
            )}
          </div>

          {dateOrYear && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: surface.accentWarm,
                textShadow: surface.textShadow,
                ...TABULAR_NUM_STYLE,
              }}
            >
              {dateOrYear}
            </span>
          )}
        </div>
      </div>
    </LiquidGlassObject>
  );
};

// Spec compatibility aliases
export const GlassMetricTriptych = GlassStatTriptych;
export const GlassFootnoteLoupe = GlassMagnifierCard;
export const GlassLedgerRibbon = GlassTelemetryStrip;

// ============================================================================
// GLASS_PRESET_REGISTRY — Unified Index of All 18 Smoked-Navy Optical Presets
// ============================================================================

export const GLASS_PRESET_IDS = [
  "card",
  "corner-pill",
  "bottom-dock",
  "floating-toolbar",
  "toast-alert",
  "split-modal",
  "dossier-stack",
  "evidence-rail",
  "magnifier-card",
  "telemetry-strip",
  "verdict-seal",
  "compare-scale",
  "timeline-scrubber",
  "receipt-ticker",
  "terminal-console",
  "map-callout",
  "stat-triptych",
  "quote-citation",
] as const;

export type GlassPresetId = (typeof GLASS_PRESET_IDS)[number];

export type GlassPresetRegistryEntry = StrictGlassPresetRegistryEntry;

// Note: zero `any` enforced — typed via generic React.ComponentType<never> union
export interface TypedGlassPresetRegistryEntry<P = unknown> {
  id: GlassPresetId;
  componentName: string;
  displayName: string;
  safePlacement: "right-third" | "bottom-dock" | "top-bar";
  defaultWidth: number;
  category: "core" | "forensic" | "telemetry" | "editorial";
  component: React.FC<P>;
}

export type AnyGlassPresetComponent =
  | React.FC<GlassCardProps>
  | React.FC<GlassCornerPillProps>
  | React.FC<GlassBottomDockProps>
  | React.FC<GlassFloatingToolbarProps>
  | React.FC<GlassToastAlertProps>
  | React.FC<GlassSplitModalProps>
  | React.FC<GlassDossierStackProps>
  | React.FC<GlassEvidenceRailProps>
  | React.FC<GlassMagnifierCardProps>
  | React.FC<GlassTelemetryStripProps>
  | React.FC<GlassVerdictSealProps>
  | React.FC<GlassCompareScaleProps>
  | React.FC<GlassTimelineScrubberProps>
  | React.FC<GlassReceiptTickerProps>
  | React.FC<GlassTerminalConsoleProps>
  | React.FC<GlassMapCalloutProps>
  | React.FC<GlassStatTriptychProps>
  | React.FC<GlassQuoteCitationProps>;

export interface StrictGlassPresetRegistryEntry {
  id: GlassPresetId;
  componentName: string;
  displayName: string;
  safePlacement: "right-third" | "bottom-dock" | "top-bar";
  defaultWidth: number;
  category: "core" | "forensic" | "telemetry" | "editorial";
  component: AnyGlassPresetComponent;
}

export const GLASS_PRESET_REGISTRY: Readonly<
  Record<GlassPresetId, StrictGlassPresetRegistryEntry>
> = {
  card: {
    id: "card",
    componentName: "GlassCard",
    displayName: "Smoked-Navy Editorial Card",
    safePlacement: "right-third",
    defaultWidth: 580,
    category: "core",
    component: GlassCard,
  },
  "corner-pill": {
    id: "corner-pill",
    componentName: "GlassCornerPill",
    displayName: "Corner Metric Status Pill",
    safePlacement: "top-bar",
    defaultWidth: 320,
    category: "core",
    component: GlassCornerPill,
  },
  "bottom-dock": {
    id: "bottom-dock",
    componentName: "GlassBottomDock",
    displayName: "Horizontal Chapter & Metric Dock",
    safePlacement: "bottom-dock",
    defaultWidth: 980,
    category: "core",
    component: GlassBottomDock,
  },
  "floating-toolbar": {
    id: "floating-toolbar",
    componentName: "GlassFloatingToolbar",
    displayName: "Floating Mode & Chapter Switcher",
    safePlacement: "top-bar",
    defaultWidth: 680,
    category: "core",
    component: GlassFloatingToolbar,
  },
  "toast-alert": {
    id: "toast-alert",
    componentName: "GlassToastAlert",
    displayName: "Risk Flag & Editorial Toast",
    safePlacement: "right-third",
    defaultWidth: 450,
    category: "core",
    component: GlassToastAlert,
  },
  "split-modal": {
    id: "split-modal",
    componentName: "GlassSplitModal",
    displayName: "Two-Column Comparative Glass Sheet",
    safePlacement: "right-third",
    defaultWidth: 780,
    category: "core",
    component: GlassSplitModal,
  },
  "dossier-stack": {
    id: "dossier-stack",
    componentName: "GlassDossierStack",
    displayName: "Cascading Archival Dossier Stack",
    safePlacement: "right-third",
    defaultWidth: 580,
    category: "forensic",
    component: GlassDossierStack,
  },
  "evidence-rail": {
    id: "evidence-rail",
    componentName: "GlassEvidenceRail",
    displayName: "Vertical Chain-of-Evidence Rail",
    safePlacement: "right-third",
    defaultWidth: 480,
    category: "forensic",
    component: GlassEvidenceRail,
  },
  "magnifier-card": {
    id: "magnifier-card",
    componentName: "GlassMagnifierCard",
    displayName: "Optical 2.0x Clause Magnifier Card",
    safePlacement: "right-third",
    defaultWidth: 600,
    category: "forensic",
    component: GlassMagnifierCard,
  },
  "telemetry-strip": {
    id: "telemetry-strip",
    componentName: "GlassTelemetryStrip",
    displayName: "Live Multi-Channel Telemetry Ribbon",
    safePlacement: "bottom-dock",
    defaultWidth: 1120,
    category: "telemetry",
    component: GlassTelemetryStrip,
  },
  "verdict-seal": {
    id: "verdict-seal",
    componentName: "GlassVerdictSeal",
    displayName: "Heavy-Stamp Judicial Verdict Seal",
    safePlacement: "right-third",
    defaultWidth: 540,
    category: "forensic",
    component: GlassVerdictSeal,
  },
  "compare-scale": {
    id: "compare-scale",
    componentName: "GlassCompareScale",
    displayName: "Two-Pan Precision Balance Scale",
    safePlacement: "right-third",
    defaultWidth: 660,
    category: "telemetry",
    component: GlassCompareScale,
  },
  "timeline-scrubber": {
    id: "timeline-scrubber",
    componentName: "GlassTimelineScrubber",
    displayName: "Decade & Milestone Scrubber",
    safePlacement: "bottom-dock",
    defaultWidth: 960,
    category: "telemetry",
    component: GlassTimelineScrubber,
  },
  "receipt-ticker": {
    id: "receipt-ticker",
    componentName: "GlassReceiptTicker",
    displayName: "Itemized Ledger Receipt Ticker",
    safePlacement: "right-third",
    defaultWidth: 500,
    category: "forensic",
    component: GlassReceiptTicker,
  },
  "terminal-console": {
    id: "terminal-console",
    componentName: "GlassTerminalConsole",
    displayName: "Institutional Macro Feed Console",
    safePlacement: "right-third",
    defaultWidth: 600,
    category: "telemetry",
    component: GlassTerminalConsole,
  },
  "map-callout": {
    id: "map-callout",
    componentName: "GlassMapCallout",
    displayName: "Chokepoint & Coordinate Callout",
    safePlacement: "right-third",
    defaultWidth: 460,
    category: "telemetry",
    component: GlassMapCallout,
  },
  "stat-triptych": {
    id: "stat-triptych",
    componentName: "GlassStatTriptych",
    displayName: "Three-Column Live Metric Triptych",
    safePlacement: "bottom-dock",
    defaultWidth: 860,
    category: "editorial",
    component: GlassStatTriptych,
  },
  "quote-citation": {
    id: "quote-citation",
    componentName: "GlassQuoteCitation",
    displayName: "Primary-Source Excerpt Citation Plate",
    safePlacement: "right-third",
    defaultWidth: 620,
    category: "editorial",
    component: GlassQuoteCitation,
  },
};

const GLASS_PRESET_ALIASES: Readonly<Record<string, GlassPresetId>> = {
  card: "card",
  glasscard: "card",
  pill: "corner-pill",
  "corner-pill": "corner-pill",
  glasscornerpill: "corner-pill",
  dock: "bottom-dock",
  "bottom-dock": "bottom-dock",
  glassbottomdock: "bottom-dock",
  toolbar: "floating-toolbar",
  "floating-toolbar": "floating-toolbar",
  glassfloatingtoolbar: "floating-toolbar",
  toast: "toast-alert",
  "toast-alert": "toast-alert",
  glasstoastalert: "toast-alert",
  split: "split-modal",
  "split-modal": "split-modal",
  glasssplitmodal: "split-modal",
  "dossier-stack": "dossier-stack",
  glassdossierstack: "dossier-stack",
  "evidence-rail": "evidence-rail",
  glassevidencerail: "evidence-rail",
  "magnifier-card": "magnifier-card",
  glassmagnifiercard: "magnifier-card",
  glassfootnoteloupe: "magnifier-card",
  "telemetry-strip": "telemetry-strip",
  glasstelemetrystrip: "telemetry-strip",
  glassledgerribbon: "telemetry-strip",
  "verdict-seal": "verdict-seal",
  glassverdictseal: "verdict-seal",
  "compare-scale": "compare-scale",
  glasscomparescale: "compare-scale",
  "timeline-scrubber": "timeline-scrubber",
  glasstimelinescrubber: "timeline-scrubber",
  "receipt-ticker": "receipt-ticker",
  glassreceiptticker: "receipt-ticker",
  "terminal-console": "terminal-console",
  glassterminalconsole: "terminal-console",
  "map-callout": "map-callout",
  glassmapcallout: "map-callout",
  "stat-triptych": "stat-triptych",
  glassstattriptych: "stat-triptych",
  glassmetrictriptych: "stat-triptych",
  "quote-citation": "quote-citation",
  glassquotecitation: "quote-citation",
};

export function resolveGlassPreset(
  rawId?: string
): StrictGlassPresetRegistryEntry {
  if (!rawId) return GLASS_PRESET_REGISTRY.card;
  const key = rawId.trim().toLowerCase();
  const resolved = GLASS_PRESET_ALIASES[key];
  return resolved ? GLASS_PRESET_REGISTRY[resolved] : GLASS_PRESET_REGISTRY.card;
}
