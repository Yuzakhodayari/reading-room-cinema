import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fitAndBalanceText } from "../design/fitText";
import { FONTS, TABULAR_NUM_STYLE, getOpticalTracking } from "../design/fonts";
import {
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  studioSpring,
} from "../design/tokens";
import {
  CinemaMapStage,
  CorridorId,
  GeoQueryTarget,
  MapArcSpec,
  MapPinSpec,
  MapTone,
  MapVisualRegister,
  resolveGeoQuery,
} from "../maps";
import type { ScreenObstacleRect } from "../maps/CinemaMapStage";

export type DataMapsDisplayMode = "card" | "page" | "over-footage";

export interface DataMaps3DRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
}

const PAGE_INK_SECONDARY = "#3D4C5C"; // >= 8.2:1 AAA on #FAF8F3 and #F2F0EA
const PAGE_ACCENT_BRICK_AAA = "#8A2C1D"; // >= 8.0:1 AAA on #FAF8F3
const PAGE_ACCENT_TEAL_AAA = "#19615E"; // >= 7.1:1 AAA on #FAF8F3

function clampVal(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ============================================================================
// 1. MapExplainer (Wired to ../maps CinemaMapStage & Offline 211-Country Atlas)
// ============================================================================
export interface MapExplainerProps {
  /** Backward-compatible single US state FIPS or ISO numeric string (e.g. "48") */
  highlightStateFips?: string;
  /** Array of US state FIPS or World country ISO numeric IDs */
  highlightStatesFips?: string[];
  /** Region hint ("us" | "usa" | "world") */
  region?: "us" | "usa" | "world";
  /** Primary display label or place query (never silently falls back to Texas for foreign names) */
  highlightLabel?: string;
  /** Free-text geographic search query or sentence */
  query?: string;
  /** Explicit named corridor ID (24 geopolitical/grid corridors) */
  corridorId?: CorridorId;
  /** Optional title, subtitle, eyebrow, spoken narration & source citation */
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  spokenText?: string;
  sourceCitation?: string;
  /** Optional metric callout badge rendered in top-right dock */
  metricValue?: string;
  metricLabel?: string;
  /** Route & callout accent tone */
  routeTone?: MapTone;
  /** Smooth camera fly-in toggle */
  zoomState?: boolean;
  /** Custom coordinate pins & geodesic arcs */
  pins?: MapPinSpec[];
  arcs?: MapArcSpec[];
  /** Visual register or dual-palette mode */
  register?: MapVisualRegister;
  paletteMode?: "page" | "over-footage";
  compactCard?: boolean;
  /** Beat-local start frame */
  atFrame?: number;
}

export const MapExplainer: React.FC<MapExplainerProps> = ({
  highlightStateFips = "48",
  highlightStatesFips,
  region = "us",
  highlightLabel = "Austin, Texas",
  query,
  corridorId,
  title,
  subtitle,
  eyebrow,
  spokenText,
  sourceCitation,
  metricValue,
  metricLabel,
  routeTone = "secondary",
  zoomState = true,
  pins,
  arcs,
  register,
  paletteMode = "page",
  compactCard = false,
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const resolvedScene = useMemo(() => {
    const target: GeoQueryTarget = {
      corridorId,
      query: query ?? highlightLabel,
      label: highlightLabel,
      title,
      subtitle,
      spokenText,
      region,
      register:
        register ??
        (paletteMode === "over-footage" ? "over-footage-glass" : "page-editorial"),
      routeTone,
      highlightStateFips,
      highlightStatesFips,
      pins,
      arcs,
      sourceNote: sourceCitation,
    };
    return resolveGeoQuery(target);
  }, [
    corridorId,
    query,
    highlightLabel,
    title,
    subtitle,
    spokenText,
    region,
    register,
    paletteMode,
    routeTone,
    highlightStateFips,
    highlightStatesFips,
    pins,
    arcs,
    sourceCitation,
  ]);

  const elapsed = Math.max(0, frame - atFrame);
  const badgeProgress = studioSpring(elapsed, fps, "editorialSnap", 10);

  const isOverFootage =
    paletteMode === "over-footage" || resolvedScene.register === "over-footage-glass";
  const isDarkRegister =
    isOverFootage ||
    resolvedScene.register === "midnight-telemetry" ||
    resolvedScene.register === "drafting-blueprint";

  const derivedMetric = useMemo(() => {
    if (metricValue && metricValue.trim().length > 0) {
      return {
        value: metricValue.trim(),
        label:
          metricLabel && metricLabel.trim().length > 0
            ? metricLabel.trim()
            : resolvedScene.scope === "usa"
            ? "Regional Telemetry"
            : "Corridor Telemetry",
      };
    }
    for (let i = 0; i < resolvedScene.pins.length; i++) {
      const p = resolvedScene.pins[i];
      if (p.metric && p.metric.trim().length > 0) {
        return {
          value: p.metric.trim(),
          label: p.label,
        };
      }
    }
    return null;
  }, [metricValue, metricLabel, resolvedScene]);

  const fittedMetricValue = useMemo(() => {
    if (!derivedMetric) return null;
    return fitAndBalanceText({
      text: derivedMetric.value,
      fontFamily: "mono",
      fontWeight: 700,
      maxWidth: 372,
      maxHeight: 54,
      maxLines: 1,
      minFontSize: 15,
      maxFontSize: 28,
      lineHeight: 1.15,
    });
  }, [derivedMetric]);

  const accentColor =
    routeTone === "alert"
      ? isDarkRegister
        ? OVER_FOOTAGE_PALETTE.brickRedText
        : PAGE_ACCENT_BRICK_AAA
      : isDarkRegister
      ? OVER_FOOTAGE_PALETTE.chartSecondary
      : PAGE_ACCENT_TEAL_AAA;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <CinemaMapStage
        scene={resolvedScene}
        register={register}
        paletteMode={paletteMode}
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        sourceCitation={sourceCitation}
        routeTone={routeTone}
        enableCameraFlyIn={zoomState}
        atFrame={atFrame}
        compactCard={compactCard}
        showChrome={true}
      />

      {derivedMetric && !compactCard && (
        <div
          style={{
            position: "absolute",
            top: "44px",
            right: "64px",
            background: isOverFootage
              ? OVER_FOOTAGE_PALETTE.glassPrimary
              : isDarkRegister
              ? "rgba(20, 27, 36, 0.95)"
              : "rgba(250, 248, 243, 0.98)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${
              isDarkRegister
                ? OVER_FOOTAGE_PALETTE.glassBorder
                : "#D7D2C6"
            }`,
            borderTop: `4px solid ${accentColor}`,
            borderRadius: "12px",
            padding: "16px 24px",
            minWidth: "220px",
            maxWidth: "420px",
            overflow: "hidden",
            boxSizing: "border-box",
            boxShadow: isDarkRegister
              ? "0 20px 44px rgba(15, 25, 35, 0.48)"
              : "0 16px 36px rgba(28, 43, 58, 0.13)",
            opacity: interpolate(badgeProgress, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translate3d(0, ${interpolate(
              badgeProgress,
              [0, 1],
              [-12, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            ).toFixed(1)}px, 0)`,
            zIndex: 24,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: getOpticalTracking(11, "mono"),
              textTransform: "uppercase",
              color: accentColor,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {derivedMetric.label}
          </div>
          <div
            style={{
              ...TABULAR_NUM_STYLE,
              fontFamily: FONTS.mono,
              fontSize: `${fittedMetricValue ? fittedMetricValue.fontSize : 28}px`,
              fontWeight: 700,
              color: isDarkRegister
                ? OVER_FOOTAGE_PALETTE.textHeadline
                : PAGE_PALETTE.navy,
              marginTop: "6px",
              lineHeight: 1.15,
              maxWidth: "420px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {derivedMetric.value}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. DataPhysicalCard (Deterministic Isometric 3D Comparison Blocks)
// ============================================================================
export interface PhysicalColumnSpec {
  label: string;
  value: number;
  tone?: "navy" | "brick" | "teal" | "slate";
}

export interface DataPhysicalCardProps {
  label1?: string;
  value1?: number;
  label2?: string;
  value2?: number;
  blocks?: PhysicalColumnSpec[];
  unitSuffix?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  sourceCitation?: string;
  mode?: DataMapsDisplayMode;
  atFrame?: number;
}

interface IsoShade {
  front: string;
  top: string;
  right: string;
  edge: string;
  text: string;
}

function getIsoShade(
  tone: "navy" | "brick" | "teal" | "slate" | "paper",
  isOverFootage: boolean
): IsoShade {
  if (tone === "brick") {
    return {
      front: PAGE_PALETTE.brickRed,
      top: "#C76250",
      right: "#74291C",
      edge: isOverFootage ? "rgba(255, 246, 229, 0.36)" : "#5C1E14",
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA,
    };
  }
  if (tone === "teal") {
    return {
      front: PAGE_PALETTE.chartSecondary,
      top: "#4FB3AE",
      right: "#1E6360",
      edge: isOverFootage ? "rgba(191, 214, 234, 0.36)" : "#154644",
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.chartSecondary : PAGE_ACCENT_TEAL_AAA,
    };
  }
  if (tone === "slate") {
    return {
      front: PAGE_PALETTE.gold,
      top: "#5A89B6",
      right: "#284866",
      edge: isOverFootage ? "rgba(191, 214, 234, 0.36)" : "#1C354D",
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : "#1D4A75",
    };
  }
  if (tone === "paper") {
    return {
      front: PAGE_PALETTE.paper,
      top: PAGE_PALETTE.paperLight,
      right: PAGE_PALETTE.paperBorder,
      edge: PAGE_PALETTE.navy,
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.textBody : PAGE_PALETTE.navy,
    };
  }
  return {
    front: isOverFootage ? "#2D4761" : PAGE_PALETTE.navy,
    top: isOverFootage ? "#46688A" : "#2E4357",
    right: PAGE_PALETTE.navyDeep,
    edge: isOverFootage ? "rgba(191, 214, 234, 0.38)" : PAGE_PALETTE.navyDeep,
    text: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
  };
}

export const DataPhysicalCard: React.FC<DataPhysicalCardProps> = ({
  label1 = "Individual Payroll & Income",
  value1 = 84,
  label2 = "Corporate Income Tax",
  value2 = 7,
  blocks,
  unitSuffix = "%",
  eyebrow = "Receipts Breakdown",
  title = "Structural Revenue Composition",
  subtitle = "Physical volume comparison scaled linearly by share of federal receipts.",
  sourceCitation = "SOURCE: U.S. TREASURY / OMB HISTORICAL TABLES",
  mode = "card",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - atFrame);
  const isOverFootage = mode === "over-footage";
  const isPage = mode === "page";

  const columns: PhysicalColumnSpec[] = useMemo(() => {
    if (blocks && blocks.length > 0) return blocks;
    return [
      { label: label1, value: value1, tone: "navy" },
      { label: label2, value: value2, tone: "brick" },
    ];
  }, [blocks, label1, value1, label2, value2]);

  const maxVal = useMemo(() => {
    let m = 1;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].value > m) m = columns[i].value;
    }
    return m;
  }, [columns]);

  const ratioCallout = useMemo(() => {
    if (columns.length !== 2) return null;
    const hi = Math.max(columns[0].value, columns[1].value);
    const lo = Math.min(columns[0].value, columns[1].value);
    if (lo <= 0) return null;
    return `${(hi / lo).toFixed(1)}x SCALE RATIO`;
  }, [columns]);

  const colCount = columns.length;
  const barW = isPage ? (colCount > 2 ? 112 : 142) : colCount > 2 ? 84 : 108;
  const isoDx = isPage ? 22 : 16;
  const isoDy = isPage ? 16 : 12;
  const maxBarH = isPage ? 340 : 196;
  const gapPx = isPage ? (colCount > 2 ? 52 : 84) : colCount > 2 ? 32 : 54;
  const stageHeightPx = maxBarH + isoDy + (isPage ? 72 : 58);

  const ruleStroke = isOverFootage
    ? "rgba(191, 214, 234, 0.14)"
    : "rgba(28, 43, 58, 0.10)";
  const datumStroke = isOverFootage
    ? "rgba(191, 214, 234, 0.42)"
    : PAGE_PALETTE.navy;
  const tickInk = isOverFootage
    ? OVER_FOOTAGE_PALETTE.textMuted
    : PAGE_INK_SECONDARY;

  const renderColumns = () => {
    const ticks = [1, 0.5, 0];
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Calibrated Isometric Stage with Horizontal Gridlines & Shared Datum Plinth */}
        <div
          style={{
            position: "relative",
            height: `${stageHeightPx}px`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingLeft: isPage ? "58px" : "44px",
            paddingRight: isPage ? "24px" : "14px",
            boxSizing: "border-box",
          }}
        >
          {/* Calibrated Reference Gridlines & Left Numeric Ticks */}
          {ticks.map((frac) => {
            const bottomPx = Math.round(frac * maxBarH);
            const tickVal = Math.round(frac * maxVal);
            return (
              <div
                key={`grid-tick-${frac}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${bottomPx}px`,
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    ...TABULAR_NUM_STYLE,
                    fontFamily: FONTS.mono,
                    fontSize: isPage ? "12px" : "10px",
                    fontWeight: 600,
                    color: tickInk,
                    width: isPage ? "48px" : "36px",
                    textAlign: "right",
                    paddingRight: "8px",
                    boxSizing: "border-box",
                  }}
                >
                  {tickVal}
                  {unitSuffix}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: frac === 0 ? "2px" : "1px",
                    borderTop:
                      frac === 0
                        ? `2px solid ${datumStroke}`
                        : `1px dashed ${ruleStroke}`,
                  }}
                />
              </div>
            );
          })}

          {/* 3D Extruded Columns Resting Flush on the Datum Baseline */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: `${gapPx}px`,
              zIndex: 2,
            }}
          >
            {columns.map((col, idx) => {
              const grow = studioSpring(elapsed, fps, "editorialSnap", idx * 5);
              const clampedGrow = interpolate(grow, [0, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const shade = getIsoShade(
                col.tone ?? (idx === 0 ? "navy" : "brick"),
                isOverFootage
              );
              const targetH = Math.max(14, (col.value / maxVal) * maxBarH);
              const heightPx = Math.max(12, targetH * clampedGrow);
              const svgW = barW + isoDx + 8;
              const svgH = heightPx + isoDy;

              return (
                <div
                  key={`phys-col-${idx}-${col.label}`}
                  style={{
                    width: `${Math.max(barW + isoDx, isPage ? 190 : 148)}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      ...TABULAR_NUM_STYLE,
                      fontFamily: FONTS.mono,
                      fontSize: isPage ? "42px" : "32px",
                      fontWeight: 700,
                      lineHeight: 1.05,
                      color: shade.text,
                      marginBottom: "8px",
                    }}
                  >
                    {Math.round(col.value * clampedGrow)}
                    {unitSuffix}
                  </span>
                  <svg
                    width={svgW}
                    height={svgH}
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    style={{ display: "block", overflow: "visible" }}
                  >
                    <polygon
                      points={`4,${svgH} ${barW + 4},${svgH} ${barW + isoDx + 8},${svgH - 7} ${isoDx + 6},${svgH - 7}`}
                      fill={isOverFootage ? "rgba(7, 13, 20, 0.34)" : "rgba(28, 43, 58, 0.14)"}
                    />
                    <polygon
                      points={`0,${isoDy} ${isoDx},0 ${barW + isoDx},0 ${barW},${isoDy}`}
                      fill={shade.top}
                      stroke={shade.edge}
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={`${barW},${isoDy} ${barW + isoDx},0 ${barW + isoDx},${heightPx} ${barW},${svgH}`}
                      fill={shade.right}
                      stroke={shade.edge}
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                    <rect
                      x={0}
                      y={isoDy}
                      width={barW}
                      height={heightPx}
                      fill={shade.front}
                      stroke={shade.edge}
                      strokeWidth="1"
                    />
                    <line
                      x1={0.5}
                      y1={isoDy + 0.5}
                      x2={barW - 0.5}
                      y2={isoDy + 0.5}
                      stroke="rgba(255, 246, 229, 0.28)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aligned Label Footer Row (Independent of Bar Baseline) */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: `${gapPx}px`,
            paddingLeft: isPage ? "58px" : "44px",
            paddingRight: isPage ? "24px" : "14px",
            paddingTop: isPage ? "16px" : "12px",
            boxSizing: "border-box",
          }}
        >
          {columns.map((col, idx) => (
            <div
              key={`phys-lbl-${idx}-${col.label}`}
              style={{
                width: `${Math.max(barW + isoDx, isPage ? 190 : 148)}px`,
                textAlign: "center",
                fontFamily: FONTS.sans,
                fontSize: isPage ? "16px" : "13px",
                lineHeight: 1.32,
                color: isOverFootage
                  ? OVER_FOOTAGE_PALETTE.textBody
                  : idx === 0
                  ? PAGE_PALETTE.navy
                  : PAGE_INK_SECONDARY,
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isPage) {
    return (
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          minWidth: columns.length > 2 ? "560px" : "430px",
          padding: "24px 30px 22px",
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : PAGE_PALETTE.paperLight,
          backdropFilter: isOverFootage ? "blur(14px)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px)" : undefined,
          border: `1px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : "#D7D2C6"
          }`,
          borderTop: `4px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA
          }`,
          borderRadius: "16px",
          boxShadow: isOverFootage
            ? "0 22px 48px rgba(15, 25, 35, 0.46)"
            : "0 20px 44px rgba(28, 43, 58, 0.13)",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11.5px",
              color: isOverFootage
                ? OVER_FOOTAGE_PALETTE.brickRedText
                : PAGE_ACCENT_BRICK_AAA,
              fontWeight: 700,
              letterSpacing: getOpticalTracking(11.5, "mono"),
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
          {ratioCallout && (
            <span
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: "10.5px",
                fontWeight: 700,
                color: isOverFootage
                  ? OVER_FOOTAGE_PALETTE.textHeadline
                  : PAGE_PALETTE.navy,
                backgroundColor: isOverFootage
                  ? OVER_FOOTAGE_PALETTE.glassDarkWell
                  : PAGE_PALETTE.paper,
                border: `1px solid ${
                  isOverFootage ? OVER_FOOTAGE_PALETTE.glassInnerHairline : PAGE_PALETTE.paperBorder
                }`,
                borderRadius: "5px",
                padding: "3px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {ratioCallout}
            </span>
          )}
        </div>
        {renderColumns()}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        display: "grid",
        gridTemplateColumns: "0.92fr 1.08fr",
        alignItems: "center",
        padding: "84px 104px",
        boxSizing: "border-box",
        gap: "72px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: PAGE_ACCENT_BRICK_AAA,
          }}
        >
          {eyebrow}
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
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: "23px",
            lineHeight: 1.48,
            color: PAGE_INK_SECONDARY,
          }}
        >
          {subtitle}
        </p>
        {ratioCallout && (
          <div
            style={{
              ...TABULAR_NUM_STYLE,
              alignSelf: "flex-start",
              fontFamily: FONTS.mono,
              fontSize: "15px",
              fontWeight: 700,
              color: PAGE_PALETTE.navy,
              backgroundColor: PAGE_PALETTE.paper,
              border: `1.5px solid ${PAGE_PALETTE.navy}`,
              borderRadius: "8px",
              padding: "8px 14px",
            }}
          >
            {ratioCallout}
          </div>
        )}
        <div
          style={{
            marginTop: "14px",
            paddingTop: "16px",
            borderTop: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
            fontFamily: FONTS.mono,
            fontSize: "13px",
            color: PAGE_INK_SECONDARY,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {sourceCitation}
        </div>
      </div>

      <div
        style={{
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "18px",
          padding: "44px 48px",
          boxShadow: "0 24px 48px rgba(28, 43, 58, 0.12)",
          boxSizing: "border-box",
        }}
      >
        {renderColumns()}
      </div>
    </div>
  );
};

// ============================================================================
// 3. WhiteModel3D (Memory-Safe Parametric Isometric 3D Architectural Stage)
// ============================================================================
export interface IsometricModelBlock {
  id: string;
  label: string;
  valueLabel?: string;
  /** Grid X coordinate on plinth (-4.5 .. +4.5) */
  gx: number;
  /** Grid Y coordinate on plinth (-4.5 .. +4.5) */
  gy: number;
  /** Footprint width in grid units */
  gw: number;
  /** Footprint depth in grid units */
  gd: number;
  /** Extrusion height in architectural elevation units */
  heightUnits: number;
  tone?: "navy" | "paper" | "brick" | "teal" | "slate";
}

export interface WhiteModel3DProps {
  width?: number;
  height?: number;
  blocks?: IsometricModelBlock[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  datumLabel?: string;
  showElevationLines?: boolean;
  orbitAmplitudeDeg?: number;
  mode?: DataMapsDisplayMode;
  atFrame?: number;
}

const DEFAULT_WHITE_MODEL_BLOCKS: readonly IsometricModelBlock[] = [
  {
    id: "baseload-plinth",
    label: "Baseload Core",
    valueLabel: "84% FIRM",
    gx: -2.6,
    gy: -2.0,
    gw: 2.6,
    gd: 2.6,
    heightUnits: 5.2,
    tone: "navy",
  },
  {
    id: "peak-tower",
    label: "Constraint Spire",
    valueLabel: "6.5x PEAK",
    gx: 0.7,
    gy: -2.4,
    gw: 2.0,
    gd: 2.0,
    heightUnits: 6.7,
    tone: "brick",
  },
  {
    id: "aux-annex",
    label: "Reserve Annex",
    valueLabel: "3.0 GW",
    gx: 1.0,
    gy: 0.8,
    gw: 2.4,
    gd: 2.2,
    heightUnits: 3.1,
    tone: "paper",
  },
  {
    id: "switchyard-hall",
    label: "Substation Yard",
    valueLabel: "765 kV",
    gx: -2.5,
    gy: 1.1,
    gw: 2.7,
    gd: 1.9,
    heightUnits: 2.2,
    tone: "teal",
  },
];

interface IsoBlockPalette {
  top: string;
  left: string;
  right: string;
  stroke: string;
  tagInk: string;
}

function getArchitecturalFaces(
  tone: IsometricModelBlock["tone"],
  isOverFootage: boolean
): IsoBlockPalette {
  if (tone === "brick") {
    return {
      top: "#C86452",
      left: PAGE_PALETTE.brickRed,
      right: "#752A1D",
      stroke: isOverFootage ? "#FFF6E5" : PAGE_PALETTE.navyDeep,
      tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA,
    };
  }
  if (tone === "teal") {
    return {
      top: "#55B7B2",
      left: PAGE_PALETTE.chartSecondary,
      right: "#1E625F",
      stroke: isOverFootage ? "#BFD6EA" : PAGE_PALETTE.navy,
      tagInk: isOverFootage
        ? OVER_FOOTAGE_PALETTE.chartSecondary
        : PAGE_ACCENT_TEAL_AAA,
    };
  }
  if (tone === "slate") {
    return {
      top: "#6390BC",
      left: PAGE_PALETTE.gold,
      right: "#274766",
      stroke: isOverFootage ? "#BFD6EA" : PAGE_PALETTE.navy,
      tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : "#1D4A75",
    };
  }
  if (tone === "paper") {
    return {
      top: PAGE_PALETTE.paperLight,
      left: "#E9E5DC",
      right: "#D4CFC3",
      stroke: PAGE_PALETTE.navy,
      tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
    };
  }
  return {
    top: "#334C66",
    left: PAGE_PALETTE.navy,
    right: PAGE_PALETTE.navyDeep,
    stroke: isOverFootage ? "#BFD6EA" : PAGE_PALETTE.navyDeep,
    tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.textHeadline : PAGE_PALETTE.navy,
  };
}

function ptsToAttr(pts: ReadonlyArray<readonly [number, number]>): string {
  const parts: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    parts.push(`${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`);
  }
  return parts.join(" ");
}

export const WhiteModel3D: React.FC<WhiteModel3DProps> = ({
  width = 640,
  height = 420,
  blocks,
  eyebrow = "ISOMETRIC MASSING MODEL",
  title = "Parametric Physical Capacity Model",
  subtitle = "Orthographic architectural massing with calibrated elevation datum lines and cast shadows.",
  datumLabel = "DATUM ±0.0m · ORTHOGRAPHIC 30°",
  showElevationLines = true,
  orbitAmplitudeDeg = 7,
  mode = "card",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - atFrame);
  const isOverFootage = mode === "over-footage";
  const isPage = mode === "page";
  const stageW = isPage ? 960 : width;
  const stageH = isPage ? 720 : height;

  const modelBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_WHITE_MODEL_BLOCKS;

  // Deterministic subtle yaw oscillation (zero WebGL, zero canvas leak)
  const yawRad =
    Math.sin(elapsed * 0.022) * ((orbitAmplitudeDeg * Math.PI) / 180);
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);

  const plinthHalf = 5.2;
  const plinthDepth = 0.42;
  const innerHalf = 4.3;
  const innerHeight = 0.18;

  // Calibrated auto-fit projection so plinth & tallest spire tags NEVER clip at any aspect
  const { unitScale, zScale, originX, originY, maxElevUnits } = useMemo(() => {
    let maxH = 4;
    for (let i = 0; i < modelBlocks.length; i++) {
      if (modelBlocks[i].heightUnits > maxH) maxH = modelBlocks[i].heightUnits;
    }

    const maxYaw = (Math.abs(orbitAmplitudeDeg) * Math.PI) / 180;
    const angles = [0, maxYaw, -maxYaw];
    let minNx = Infinity;
    let maxNx = -Infinity;
    let minNy = Infinity;
    let maxNy = -Infinity;

    const samplePt = (wx: number, wy: number, wz: number, a: number) => {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const rx = wx * ca - wy * sa;
      const ry = wx * sa + wy * ca;
      const nx = (rx - ry) * 0.866;
      const ny = (rx + ry) * 0.5 - wz * 0.92;
      if (nx < minNx) minNx = nx;
      if (nx > maxNx) maxNx = nx;
      if (ny < minNy) minNy = ny;
      if (ny > maxNy) maxNy = ny;
    };

    for (let ai = 0; ai < angles.length; ai++) {
      const a = angles[ai];
      const corners: Array<[number, number, number]> = [
        [-plinthHalf, -plinthHalf, -plinthDepth - 0.15],
        [plinthHalf, -plinthHalf, -plinthDepth - 0.15],
        [plinthHalf, plinthHalf, -plinthDepth - 0.15],
        [-plinthHalf, plinthHalf, -plinthDepth - 0.15],
        [-plinthHalf, -plinthHalf, 0],
        [plinthHalf, -plinthHalf, 0],
        [plinthHalf, plinthHalf, 0],
        [-plinthHalf, plinthHalf, 0],
      ];
      for (let ci = 0; ci < corners.length; ci++) {
        samplePt(corners[ci][0], corners[ci][1], corners[ci][2], a);
      }
      for (let bi = 0; bi < modelBlocks.length; bi++) {
        const b = modelBlocks[bi];
        const zTop = innerHeight + b.heightUnits;
        samplePt(b.gx, b.gy, zTop, a);
        samplePt(b.gx + b.gw, b.gy, zTop, a);
        samplePt(b.gx + b.gw, b.gy + b.gd, zTop, a);
        samplePt(b.gx, b.gy + b.gd, zTop, a);
      }
    }

    const topReserve = isPage ? 74 : 66;
    const bottomReserve = isPage ? 42 : 34;
    const sideReserve = isPage ? 56 : 36;
    const availW = Math.max(120, stageW - sideReserve * 2);
    const availH = Math.max(120, stageH - topReserve - bottomReserve);

    const spanX = Math.max(1, maxNx - minNx);
    const spanY = Math.max(1, maxNy - minNy);
    const uScale = Math.min(availW / spanX, availH / spanY);

    return {
      unitScale: uScale,
      zScale: uScale * 0.92,
      originX: stageW * 0.5 - ((minNx + maxNx) * 0.5) * uScale,
      originY: topReserve + (availH - spanY * uScale) * 0.5 - minNy * uScale,
      maxElevUnits: Math.ceil(maxH),
    };
  }, [modelBlocks, orbitAmplitudeDeg, stageW, stageH, isPage]);

  const projectIso = React.useCallback(
    (wx: number, wy: number, wz: number): [number, number] => {
      const rx = wx * cosY - wy * sinY;
      const ry = wx * sinY + wy * cosY;
      const sx = originX + (rx - ry) * unitScale * 0.866;
      const sy = originY + (rx + ry) * unitScale * 0.5 - wz * zScale;
      return [sx, sy];
    },
    [cosY, sinY, originX, originY, unitScale, zScale]
  );

  // Sort blocks back-to-front in rotated camera space using (rx + ry)
  const sortedBlocks = useMemo(() => {
    const copy = modelBlocks.slice();
    copy.sort((a, b) => {
      const acx = a.gx + a.gw * 0.5;
      const acy = a.gy + a.gd * 0.5;
      const bcx = b.gx + b.gw * 0.5;
      const bcy = b.gy + b.gd * 0.5;
      const da = acx * sinY + acy * cosY + (acx * cosY - acy * sinY);
      const db = bcx * sinY + bcy * cosY + (bcx * cosY - bcy * sinY);
      return da - db;
    });
    return copy;
  }, [modelBlocks, cosY, sinY]);

  const pTop = [
    projectIso(-plinthHalf, -plinthHalf, 0),
    projectIso(plinthHalf, -plinthHalf, 0),
    projectIso(plinthHalf, plinthHalf, 0),
    projectIso(-plinthHalf, plinthHalf, 0),
  ];
  const pLeft = [
    projectIso(-plinthHalf, plinthHalf, 0),
    projectIso(plinthHalf, plinthHalf, 0),
    projectIso(plinthHalf, plinthHalf, -plinthDepth),
    projectIso(-plinthHalf, plinthHalf, -plinthDepth),
  ];
  const pRight = [
    projectIso(plinthHalf, -plinthHalf, 0),
    projectIso(plinthHalf, plinthHalf, 0),
    projectIso(plinthHalf, plinthHalf, -plinthDepth),
    projectIso(plinthHalf, -plinthHalf, -plinthDepth),
  ];

  const iTop = [
    projectIso(-innerHalf, -innerHalf, innerHeight),
    projectIso(innerHalf, -innerHalf, innerHeight),
    projectIso(innerHalf, innerHalf, innerHeight),
    projectIso(-innerHalf, innerHalf, innerHeight),
  ];

  const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> = [];
  for (let g = -5; g <= 5; g++) {
    const major = g % 2 === 0;
    const a1 = projectIso(g, -plinthHalf, 0.01);
    const a2 = projectIso(g, plinthHalf, 0.01);
    gridLines.push({ x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1], major });
    const b1 = projectIso(-plinthHalf, g, 0.01);
    const b2 = projectIso(plinthHalf, g, 0.01);
    gridLines.push({ x1: b1[0], y1: b1[1], x2: b2[0], y2: b2[1], major });
  }

  // Plinth coordinate numeric ticks along front-left edge
  const plinthAxisTicks: Array<{ x: number; y: number; tx: number; ty: number; label: string }> = [];
  for (let g = -4; g <= 4; g += 2) {
    const pEdge = projectIso(g, plinthHalf, 0);
    const pOut = projectIso(g, plinthHalf + 0.28, 0);
    plinthAxisTicks.push({
      x: pEdge[0],
      y: pEdge[1],
      tx: pOut[0],
      ty: pOut[1],
      label: g === 0 ? "0" : `${g > 0 ? "+" : ""}${g}`,
    });
  }

  // Calibrated vertical elevation datum mast on back-left plinth corner
  const mastBase = projectIso(-plinthHalf + 0.25, -plinthHalf + 0.25, innerHeight);
  const mastTopZ = innerHeight + Math.max(6, maxElevUnits);
  const mastTop = projectIso(-plinthHalf + 0.25, -plinthHalf + 0.25, mastTopZ);
  const elevStep = maxElevUnits >= 6 ? 2 : 1;
  const elevTicks: Array<{ x: number; y: number; label: string }> = [];
  for (let z = 0; z <= maxElevUnits; z += elevStep) {
    const pt = projectIso(-plinthHalf + 0.25, -plinthHalf + 0.25, innerHeight + z);
    elevTicks.push({ x: pt[0], y: pt[1], label: `+${z.toFixed(0)}u` });
  }

  // Precompute non-overlapping roof callout tag positions in screen space
  const solvedTags = useMemo(() => {
    const raw = sortedBlocks.map((b, idx) => {
      const extrude = interpolate(
        studioSpring(elapsed, fps, "editorialSnap", idx * 4),
        [0, 1],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const z1 = innerHeight + Math.max(0.15, b.heightUnits * extrude);
      const rc = projectIso(b.gx + b.gw * 0.5, b.gy + b.gd * 0.5, z1);
      const text = b.valueLabel ? b.valueLabel : b.label;
      const tagW = clampVal(Math.round(text.length * 7.1 + 18), 72, 138);
      const tagH = 22;
      const sideDir = rc[0] >= stageW * 0.5 ? 1 : -1;
      const boxX = clampVal(
        rc[0] + sideDir * 14 - tagW * 0.5,
        10,
        stageW - tagW - 10
      );
      const boxY = clampVal(
        rc[1] - 34,
        isPage ? 16 : 36,
        stageH - 36 - tagH
      );
      return {
        id: b.id,
        roofX: rc[0],
        roofY: rc[1],
        boxX,
        boxY,
        tagW,
        tagH,
        text,
        extrude,
        tone: b.tone,
      };
    });

    // Deterministic 24-pass AABB separation for roof callout badges
    const minTagGap = 8;
    const minY = isPage ? 14 : 34;
    const maxY = stageH - 34;
    for (let iter = 0; iter < 24; iter++) {
      for (let i = 0; i < raw.length; i++) {
        for (let j = i + 1; j < raw.length; j++) {
          const a = raw[i];
          const b = raw[j];
          const acx = a.boxX + a.tagW * 0.5;
          const acy = a.boxY + a.tagH * 0.5;
          const bcx = b.boxX + b.tagW * 0.5;
          const bcy = b.boxY + b.tagH * 0.5;
          const dx = bcx - acx;
          const dy = bcy - acy;
          const reqX = (a.tagW + b.tagW) * 0.5 + minTagGap;
          const reqY = (a.tagH + b.tagH) * 0.5 + minTagGap;
          const penX = reqX - Math.abs(dx);
          const penY = reqY - Math.abs(dy);
          if (penX > 0 && penY > 0) {
            if (penY <= penX) {
              const dir = Math.abs(dy) > 0.5 ? Math.sign(dy) : i < j ? 1 : -1;
              const s = penY * 0.52 * dir;
              a.boxY -= s;
              b.boxY += s;
            } else {
              const dir = Math.abs(dx) > 0.5 ? Math.sign(dx) : i < j ? -1 : 1;
              const s = penX * 0.52 * dir;
              a.boxX -= s;
              b.boxX += s;
            }
          }
        }
      }
      for (let i = 0; i < raw.length; i++) {
        raw[i].boxX = clampVal(raw[i].boxX, 10, stageW - raw[i].tagW - 10);
        raw[i].boxY = clampVal(raw[i].boxY, minY, maxY - raw[i].tagH);
      }
    }
    return raw;
  }, [sortedBlocks, elapsed, fps, stageW, stageH, isPage, projectIso]);

  const tagById = useMemo(() => {
    const map = new Map<string, (typeof solvedTags)[number]>();
    for (let i = 0; i < solvedTags.length; i++) {
      map.set(solvedTags[i].id, solvedTags[i]);
    }
    return map;
  }, [solvedTags]);

  const gridStrokeMinor = isOverFootage
    ? "rgba(191, 214, 234, 0.08)"
    : "rgba(28, 43, 58, 0.07)";
  const gridStrokeMajor = isOverFootage
    ? "rgba(191, 214, 234, 0.17)"
    : "rgba(28, 43, 58, 0.15)";
  const axisTickColor = isOverFootage
    ? OVER_FOOTAGE_PALETTE.textMuted
    : PAGE_INK_SECONDARY;

  const renderSvgStage = () => (
    <svg
      width={stageW}
      height={stageH}
      viewBox={`0 0 ${stageW} ${stageH}`}
      style={{ display: "block", width: stageW, height: stageH }}
    >
      {/* Plinth drop shadow */}
      <polygon
        points={ptsToAttr([
          projectIso(-plinthHalf + 0.35, -plinthHalf + 0.35, -plinthDepth - 0.12),
          projectIso(plinthHalf + 0.55, -plinthHalf + 0.35, -plinthDepth - 0.12),
          projectIso(plinthHalf + 0.55, plinthHalf + 0.55, -plinthDepth - 0.12),
          projectIso(-plinthHalf + 0.35, plinthHalf + 0.55, -plinthDepth - 0.12),
        ])}
        fill="rgba(15, 25, 35, 0.16)"
      />

      {/* Base Plinth Left, Right, Top Faces */}
      <polygon
        points={ptsToAttr(pLeft)}
        fill={isOverFootage ? "#1A2B3D" : "#DFDBD0"}
        stroke={isOverFootage ? "rgba(191,214,234,0.34)" : PAGE_PALETTE.paperBorder}
        strokeWidth="1.2"
      />
      <polygon
        points={ptsToAttr(pRight)}
        fill={isOverFootage ? "#121E2B" : "#CFCCC0"}
        stroke={isOverFootage ? "rgba(191,214,234,0.34)" : PAGE_PALETTE.paperBorder}
        strokeWidth="1.2"
      />
      <polygon
        points={ptsToAttr(pTop)}
        fill={isOverFootage ? "rgba(28, 43, 58, 0.85)" : PAGE_PALETTE.paper}
        stroke={isOverFootage ? "rgba(191,214,234,0.42)" : PAGE_PALETTE.navy}
        strokeWidth="1.4"
      />

      {/* Calibrated Isometric Plinth Grid */}
      {gridLines.map((ln, idx) => (
        <line
          key={`plinth-grid-${idx}`}
          x1={ln.x1}
          y1={ln.y1}
          x2={ln.x2}
          y2={ln.y2}
          stroke={ln.major ? gridStrokeMajor : gridStrokeMinor}
          strokeWidth={ln.major ? "1.05" : "0.75"}
        />
      ))}

      {/* Plinth Perimeter Coordinate Ticks */}
      {plinthAxisTicks.map((tk, idx) => (
        <g key={`plinth-tk-${idx}`}>
          <line
            x1={tk.x}
            y1={tk.y}
            x2={tk.tx}
            y2={tk.ty}
            stroke={axisTickColor}
            strokeWidth="1.1"
          />
          <text
            x={tk.tx - 4}
            y={tk.ty + 10}
            textAnchor="middle"
            fontFamily={FONTS.mono}
            fontSize={isPage ? "10" : "8.5"}
            fontWeight="600"
            fill={axisTickColor}
            style={TABULAR_NUM_STYLE}
          >
            {tk.label}
          </text>
        </g>
      ))}

      {/* Inner Architectural Podium */}
      <polygon
        points={ptsToAttr(iTop)}
        fill={isOverFootage ? "rgba(37, 56, 76, 0.72)" : PAGE_PALETTE.paperLight}
        stroke={isOverFootage ? "rgba(191,214,234,0.28)" : PAGE_PALETTE.paperBorder}
        strokeWidth="1.1"
      />

      {/* Vertical Elevation Scale Mast & Numeric Height Ticks */}
      <g>
        <line
          x1={mastBase[0]}
          y1={mastBase[1]}
          x2={mastTop[0]}
          y2={mastTop[1]}
          stroke={isOverFootage ? "rgba(191, 214, 234, 0.45)" : "rgba(28, 43, 58, 0.45)"}
          strokeWidth="1.15"
          strokeDasharray="3 3"
        />
        {elevTicks.map((et, idx) => (
          <g key={`elev-mast-tk-${idx}`}>
            <line
              x1={et.x - 5}
              y1={et.y}
              x2={et.x + 5}
              y2={et.y}
              stroke={axisTickColor}
              strokeWidth="1.2"
            />
            <text
              x={et.x - 9}
              y={et.y + 3}
              textAnchor="end"
              fontFamily={FONTS.mono}
              fontSize={isPage ? "10" : "8.5"}
              fontWeight="700"
              fill={axisTickColor}
              style={TABULAR_NUM_STYLE}
            >
              {et.label}
            </text>
          </g>
        ))}
      </g>

      {/* Oblique Ground Cast Shadows */}
      {sortedBlocks.map((b, idx) => {
        const extrude = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", idx * 4),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const h = Math.max(0.15, b.heightUnits * extrude);
        const shDx = h * 0.32;
        const shDy = h * 0.22;
        const x0 = b.gx;
        const x1 = b.gx + b.gw;
        const y0 = b.gy;
        const y1 = b.gy + b.gd;
        const shadowPoly = [
          projectIso(x0 + shDx, y0 + shDy, innerHeight + 0.01),
          projectIso(x1 + shDx, y0 + shDy, innerHeight + 0.01),
          projectIso(x1 + shDx, y1 + shDy, innerHeight + 0.01),
          projectIso(x0 + shDx, y1 + shDy, innerHeight + 0.01),
        ];
        return (
          <polygon
            key={`cast-sh-${b.id}`}
            points={ptsToAttr(shadowPoly)}
            fill={isOverFootage ? "rgba(8, 14, 22, 0.38)" : "rgba(28, 43, 58, 0.13)"}
          />
        );
      })}

      {/* Extruded 3D Massing Blocks */}
      {sortedBlocks.map((b, idx) => {
        const extrude = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", idx * 4),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const z0 = innerHeight;
        const z1 = innerHeight + Math.max(0.15, b.heightUnits * extrude);
        const x0 = b.gx;
        const x1 = b.gx + b.gw;
        const y0 = b.gy;
        const y1 = b.gy + b.gd;

        const faces = getArchitecturalFaces(b.tone, isOverFootage);

        const leftFace = [
          projectIso(x0, y1, z0),
          projectIso(x1, y1, z0),
          projectIso(x1, y1, z1),
          projectIso(x0, y1, z1),
        ];
        const rightFace = [
          projectIso(x1, y0, z0),
          projectIso(x1, y1, z0),
          projectIso(x1, y1, z1),
          projectIso(x1, y0, z1),
        ];
        const topFace = [
          projectIso(x0, y0, z1),
          projectIso(x1, y0, z1),
          projectIso(x1, y1, z1),
          projectIso(x0, y1, z1),
        ];

        const elevTop = projectIso(x1, y0, z1);
        const elevBase = projectIso(x1, y0, z0);
        const elevMidY = (elevTop[1] + elevBase[1]) * 0.5;
        const dimX = elevTop[0] + 18;

        return (
          <g key={`iso-blk-${b.id}`}>
            <polygon
              points={ptsToAttr(leftFace)}
              fill={faces.left}
              stroke={faces.stroke}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <polygon
              points={ptsToAttr(rightFace)}
              fill={faces.right}
              stroke={faces.stroke}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <polygon
              points={ptsToAttr(topFace)}
              fill={faces.top}
              stroke={faces.stroke}
              strokeWidth="1.25"
              strokeLinejoin="round"
            />

            {/* Architectural Story Datum Hairlines */}
            {b.heightUnits >= 3.5 && (
              <line
                x1={projectIso(x0, y1, z0 + (z1 - z0) * 0.5)[0]}
                y1={projectIso(x0, y1, z0 + (z1 - z0) * 0.5)[1]}
                x2={projectIso(x1, y1, z0 + (z1 - z0) * 0.5)[0]}
                y2={projectIso(x1, y1, z0 + (z1 - z0) * 0.5)[1]}
                stroke="rgba(250, 248, 243, 0.28)"
                strokeWidth="1"
              />
            )}

            {/* Calibrated Elevation Dimension Bracket & Numeric Tick */}
            {showElevationLines && b.heightUnits >= 4.5 && (
              <g opacity={extrude}>
                <line
                  x1={elevTop[0] + 6}
                  y1={elevTop[1]}
                  x2={dimX + 5}
                  y2={elevTop[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.15"
                />
                <line
                  x1={elevBase[0] + 6}
                  y1={elevBase[1]}
                  x2={dimX + 5}
                  y2={elevBase[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.15"
                />
                <line
                  x1={dimX}
                  y1={elevTop[1]}
                  x2={dimX}
                  y2={elevBase[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.15"
                  strokeDasharray="3 2.5"
                />
                <text
                  x={dimX + 5}
                  y={elevMidY + 3}
                  fontFamily={FONTS.mono}
                  fontSize={isPage ? "10" : "8.5"}
                  fontWeight="700"
                  fill={faces.tagInk}
                  style={TABULAR_NUM_STYLE}
                >
                  {(b.heightUnits * extrude).toFixed(1)}u
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* De-Collided Architectural Roof Callout Badges Rendered Above Geometry */}
      {sortedBlocks.map((b) => {
        const tag = tagById.get(b.id);
        if (!tag) return null;
        const faces = getArchitecturalFaces(b.tone, isOverFootage);
        const tagAnchorX = tag.boxX + tag.tagW * 0.5;
        const tagAnchorY = tag.boxY + tag.tagH;

        return (
          <g key={`iso-tag-${b.id}`} opacity={tag.extrude}>
            <polyline
              points={`${tag.roofX.toFixed(1)},${tag.roofY.toFixed(1)} ${tagAnchorX.toFixed(1)},${tagAnchorY.toFixed(1)}`}
              fill="none"
              stroke={faces.tagInk}
              strokeWidth="1.35"
            />
            <circle cx={tag.roofX} cy={tag.roofY} r="2.8" fill={faces.tagInk} />
            <rect
              x={tag.boxX}
              y={tag.boxY}
              width={tag.tagW}
              height={tag.tagH}
              rx={4.5}
              fill={
                isOverFootage
                  ? "rgba(15, 25, 35, 0.92)"
                  : "rgba(250, 248, 243, 0.96)"
              }
              stroke={
                isOverFootage
                  ? OVER_FOOTAGE_PALETTE.glassBorder
                  : "#D4CFC3"
              }
              strokeWidth="1"
            />
            <text
              x={tag.boxX + tag.tagW * 0.5}
              y={tag.boxY + 14.5}
              textAnchor="middle"
              fontFamily={FONTS.mono}
              fontSize={isPage ? "10.5" : "9.5"}
              fontWeight="700"
              fill={faces.tagInk}
              style={TABULAR_NUM_STYLE}
            >
              {tag.text}
            </text>
          </g>
        );
      })}

      {/* Bottom Corner Datum Footer */}
      <line
        x1={18}
        y1={stageH - 28}
        x2={stageW - 18}
        y2={stageH - 28}
        stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.glassInnerHairline : PAGE_PALETTE.paperBorder}
        strokeWidth="1"
      />
      <text
        x={20}
        y={stageH - 11}
        fontFamily={FONTS.mono}
        fontSize="10"
        fontWeight="600"
        fill={axisTickColor}
        style={TABULAR_NUM_STYLE}
      >
        {datumLabel}
      </text>
    </svg>
  );

  if (!isPage) {
    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : "#D7D2C6"
          }`,
          borderTop: `3.5px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA
          }`,
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : COLORS.paperLight,
          backdropFilter: isOverFootage ? "blur(14px)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px)" : undefined,
          boxShadow: isOverFootage
            ? "0 22px 48px rgba(15, 25, 35, 0.46)"
            : "0 20px 44px rgba(28, 43, 58, 0.13)",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "18px",
            right: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isOverFootage
                ? OVER_FOOTAGE_PALETTE.brickRedText
                : PAGE_ACCENT_BRICK_AAA,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              ...TABULAR_NUM_STYLE,
              fontFamily: FONTS.mono,
              fontSize: "9.5px",
              fontWeight: 600,
              color: axisTickColor,
            }}
          >
            {modelBlocks.length} MASSING VOLUMES
          </span>
        </div>
        {renderSvgStage()}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        display: "grid",
        gridTemplateColumns: "0.85fr 1.15fr",
        alignItems: "center",
        padding: "76px 96px",
        boxSizing: "border-box",
        gap: "60px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: PAGE_ACCENT_BRICK_AAA,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "58px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: PAGE_PALETTE.navy,
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
            color: PAGE_INK_SECONDARY,
          }}
        >
          {subtitle}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          {modelBlocks.map((blk) => (
            <div
              key={`legend-${blk.id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                padding: "12px 18px",
                backgroundColor: PAGE_PALETTE.paper,
                border: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.navy,
                  minWidth: 0,
                }}
              >
                {blk.label}
              </span>
              <span
                style={{
                  ...TABULAR_NUM_STYLE,
                  fontFamily: FONTS.mono,
                  fontSize: "16px",
                  fontWeight: 700,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  color:
                    blk.tone === "brick"
                      ? PAGE_ACCENT_BRICK_AAA
                      : PAGE_ACCENT_TEAL_AAA,
                }}
              >
                {blk.valueLabel ?? `${blk.heightUnits.toFixed(1)}u`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 24px 48px rgba(28, 43, 58, 0.12)",
          overflow: "hidden",
        }}
      >
        {renderSvgStage()}
      </div>
    </div>
  );
};

// ============================================================================
// 4. BlobSimulation (Deterministic Venturi Capacity Bottleneck Diagram)
// ============================================================================
export interface BlobSimulationProps {
  count?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  inflowLabel?: string;
  chokepointLabel?: string;
  outflowLabel?: string;
  throughputMetric?: string;
  mode?: DataMapsDisplayMode;
  atFrame?: number;
}

export const BlobSimulation: React.FC<BlobSimulationProps> = ({
  count = 48,
  eyebrow = "Capacity Bottleneck",
  title = "Physical Throughput Chokepoint",
  subtitle = "Unbounded upstream demand compressing into a single fixed-aperture physical bottleneck.",
  inflowLabel = "UPSTREAM QUEUE",
  chokepointLabel = "THROTTLE",
  outflowLabel = "METERED EXIT",
  throughputMetric = "18% CLEARANCE RATE",
  mode = "card",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - atFrame);
  const isOverFootage = mode === "over-footage";

  const particles = useMemo(() => {
    const list: Array<{ id: number; seed: number }> = [];
    for (let i = 0; i < count; i++) {
      list.push({ id: i, seed: i * 17 + 101 });
    }
    return list;
  }, [count]);

  const svgW = mode === "page" ? 920 : 580;
  const svgH = mode === "page" ? 390 : 230;
  const scaleX = svgW / 580;
  const scaleY = svgH / 230;

  const renderVenturiSvg = () => (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      <path
        d={`M ${60 * scaleX} ${45 * scaleY} L ${250 * scaleX} ${90 * scaleY} L ${
          330 * scaleX
        } ${90 * scaleY} L ${520 * scaleX} ${45 * scaleY}`}
        fill="none"
        stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_INK_SECONDARY}
        strokeWidth={2.2 * scaleX}
      />
      <path
        d={`M ${60 * scaleX} ${185 * scaleY} L ${250 * scaleX} ${140 * scaleY} L ${
          330 * scaleX
        } ${140 * scaleY} L ${520 * scaleX} ${185 * scaleY}`}
        fill="none"
        stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_INK_SECONDARY}
        strokeWidth={2.2 * scaleX}
      />
      <rect
        x={248 * scaleX}
        y={86 * scaleY}
        width={84 * scaleX}
        height={58 * scaleY}
        fill="none"
        stroke={
          isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA
        }
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      {particles.map((p) => {
        const cycle = (elapsed * 2.2 + p.seed * 9) % 480;
        const baseX = 50 + cycle;
        const spread = baseX > 180 && baseX < 400 ? 17 : 58;
        const baseY = 115 + Math.sin(p.seed * 43 + cycle * 0.05) * spread;
        const isChoked = baseX > 230 && baseX < 350;
        const fillColor = isChoked
          ? isOverFootage
            ? OVER_FOOTAGE_PALETTE.brickRedText
            : COLORS.brickRed
          : isOverFootage
          ? OVER_FOOTAGE_PALETTE.textHeadline
          : COLORS.navy;
        return (
          <circle
            key={p.id}
            cx={baseX * scaleX}
            cy={baseY * scaleY}
            r={(isChoked ? 4.6 : 3.6) * Math.sqrt(scaleX)}
            fill={fillColor}
            opacity={0.88}
          />
        );
      })}
      <text
        x={116 * scaleX}
        y={212 * scaleY}
        textAnchor="middle"
        fontFamily={FONTS.mono}
        fontSize={10 * scaleX}
        fontWeight="700"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_INK_SECONDARY}
      >
        {inflowLabel}
      </text>
      <text
        x={290 * scaleX}
        y={74 * scaleY}
        textAnchor="middle"
        fontFamily={FONTS.mono}
        fontSize={10 * scaleX}
        fontWeight="700"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_ACCENT_BRICK_AAA}
      >
        {chokepointLabel}
      </text>
      <text
        x={468 * scaleX}
        y={212 * scaleY}
        textAnchor="middle"
        fontFamily={FONTS.mono}
        fontSize={10 * scaleX}
        fontWeight="700"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_INK_SECONDARY}
      >
        {outflowLabel}
      </text>
    </svg>
  );

  if (mode !== "page") {
    return (
      <div
        style={{
          position: "relative",
          width: "580px",
          height: "230px",
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : COLORS.paperLight,
          backdropFilter: isOverFootage ? "blur(14px)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px)" : undefined,
          border: `1px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : COLORS.paperBorder
          }`,
          borderRadius: "16px",
          boxShadow: isOverFootage
            ? "0 20px 44px rgba(15, 25, 35, 0.46)"
            : "0 18px 38px rgba(28, 43, 58, 0.12)",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "20px",
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: isOverFootage
              ? OVER_FOOTAGE_PALETTE.brickRedText
              : PAGE_ACCENT_BRICK_AAA,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        {renderVenturiSvg()}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        display: "grid",
        gridTemplateColumns: "0.85fr 1.15fr",
        alignItems: "center",
        padding: "84px 100px",
        boxSizing: "border-box",
        gap: "64px",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: PAGE_ACCENT_BRICK_AAA,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "58px",
            lineHeight: 1.08,
            fontWeight: 700,
            color: PAGE_PALETTE.navy,
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
            color: PAGE_INK_SECONDARY,
          }}
        >
          {subtitle}
        </p>
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            padding: "16px 24px",
            backgroundColor: PAGE_PALETTE.riskFill,
            border: `1.5px solid ${PAGE_PALETTE.riskBorder}`,
            borderLeft: `5px solid ${PAGE_ACCENT_BRICK_AAA}`,
            borderRadius: "10px",
            fontFamily: FONTS.mono,
            fontSize: "24px",
            fontWeight: 700,
            color: PAGE_ACCENT_BRICK_AAA,
            ...TABULAR_NUM_STYLE,
          }}
        >
          {throughputMetric}
        </div>
      </div>
      <div
        style={{
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "18px",
          padding: "36px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderVenturiSvg()}
      </div>
    </div>
  );
};

// ============================================================================
// 5. CorridorArcMatrixCard (Chokepoint Atlas + Side Telemetry Ledger)
// ============================================================================
export interface CorridorLedgerMetric {
  label: string;
  value: string;
  delta?: string;
}

export interface CorridorArcMatrixCardProps {
  corridorId?: CorridorId;
  query?: string;
  eyebrow?: string;
  title?: string;
  metrics?: CorridorLedgerMetric[];
  paletteMode?: "page" | "over-footage";
  atFrame?: number;
}

export const CorridorArcMatrixCard: React.FC<CorridorArcMatrixCardProps> = ({
  corridorId = "TAIWAN_STRAIT_2NM",
  query,
  eyebrow = "STRATEGIC CORRIDOR MATRIX",
  title = "Geopolitical Chokepoint & Arc Telemetry",
  metrics = [
    { label: "Advanced Node Share", value: "92%", delta: "< 3nm Logic" },
    { label: "Daily Maritime Transit", value: "48%", delta: "Container Fleet" },
    { label: "Reroute Lead Penalty", value: "+14 DAYS", delta: "Luzon Bypass" },
  ],
  paletteMode = "page",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const enter = studioSpring(elapsed, fps, "editorialSnap", 4);
  const isOverFootage = paletteMode === "over-footage";

  // Inform CinemaMapStage about the docked ledger card so map callouts never hide behind it
  const reservedRects: ScreenObstacleRect[] = useMemo(() => {
    if (isOverFootage) {
      return [
        {
          x: 0,
          y: 468,
          width: 640,
          height: 152,
          label: "compact-exposure-dock",
        },
      ];
    }
    const estHeight = 110 + metrics.length * 72;
    return [
      {
        x: 1424,
        y: 36,
        width: 448,
        height: estHeight,
        label: "corridor-exposure-ledger",
      },
    ];
  }, [isOverFootage, metrics.length]);

  return (
    <div
      style={{
        position: "relative",
        width: isOverFootage ? "640px" : "1920px",
        height: isOverFootage ? "620px" : "1080px",
        background: isOverFootage
          ? OVER_FOOTAGE_PALETTE.glassPrimary
          : PAGE_PALETTE.paperLight,
        borderRadius: isOverFootage ? "18px" : "0px",
        border: isOverFootage
          ? `1px solid ${OVER_FOOTAGE_PALETTE.glassBorder}`
          : undefined,
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <CinemaMapStage
        target={query ? { query, corridorId } : corridorId}
        paletteMode={paletteMode}
        title={title}
        eyebrow={eyebrow}
        compactCard={isOverFootage}
        stageWidth={isOverFootage ? 640 : 1920}
        stageHeight={isOverFootage ? 620 : 1080}
        reservedRects={reservedRects}
        atFrame={atFrame}
      />

      {isOverFootage && metrics.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: "16px",
            right: "16px",
            bottom: "16px",
            backgroundColor: OVER_FOOTAGE_PALETTE.glassDarkWell,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
            borderTop: `2.5px solid ${OVER_FOOTAGE_PALETTE.brickRedText}`,
            borderRadius: "12px",
            padding: "12px 16px",
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(3, metrics.length)}, minmax(0, 1fr))`,
            gap: "12px",
            boxSizing: "border-box",
            opacity: interpolate(enter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            zIndex: 25,
          }}
        >
          {metrics.slice(0, 3).map((m, idx) => (
            <div
              key={`compact-corr-m-${idx}`}
              style={{
                minWidth: 0,
                borderLeft:
                  idx === 0
                    ? "none"
                    : `1px solid ${OVER_FOOTAGE_PALETTE.glassInnerHairline}`,
                paddingLeft: idx === 0 ? 0 : "12px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "11px",
                  fontWeight: 600,
                  color: OVER_FOOTAGE_PALETTE.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  ...TABULAR_NUM_STYLE,
                  fontFamily: FONTS.mono,
                  fontSize: "19px",
                  fontWeight: 700,
                  color: OVER_FOOTAGE_PALETTE.textHeadline,
                  marginTop: "3px",
                  whiteSpace: "nowrap",
                }}
              >
                {m.value}
              </div>
              {m.delta && (
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: "10px",
                    fontWeight: 600,
                    color: OVER_FOOTAGE_PALETTE.chartSecondary,
                    marginTop: "2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isOverFootage && (
        <div
          style={{
            position: "absolute",
            right: "64px",
            top: "44px",
            width: "412px",
            backgroundColor: "rgba(250, 248, 243, 0.97)",
            border: `1.5px solid ${PAGE_PALETTE.navy}`,
            borderTop: `4px solid ${PAGE_ACCENT_BRICK_AAA}`,
            borderRadius: "14px",
            padding: "22px 26px",
            boxSizing: "border-box",
            boxShadow: "0 20px 44px rgba(28, 43, 58, 0.14)",
            opacity: interpolate(enter, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            zIndex: 25,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: PAGE_ACCENT_BRICK_AAA,
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            CORRIDOR EXPOSURE LEDGER
          </div>
          {metrics.map((m, idx) => (
            <div
              key={`corr-m-${idx}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "16px",
                padding: "12px 0",
                borderTop:
                  idx === 0 ? "none" : `1px solid ${PAGE_PALETTE.paperBorder}`,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: PAGE_PALETTE.navy,
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  }}
                >
                  {m.label}
                </div>
                {m.delta && (
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "11.5px",
                      fontWeight: 500,
                      color: PAGE_INK_SECONDARY,
                      marginTop: "2px",
                    }}
                  >
                    {m.delta}
                  </div>
                )}
              </div>
              <div
                style={{
                  ...TABULAR_NUM_STYLE,
                  fontFamily: FONTS.mono,
                  fontSize: "23px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.navy,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. IsometricStrataCutaway3D (Multi-Tier Isometric Cross-Section Stack)
// ============================================================================
export interface StrataLayerSpec {
  label: string;
  share: string;
  note: string;
  tone: "navy" | "brick" | "teal" | "paper";
}

export interface IsometricStrataCutaway3DProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  layers?: StrataLayerSpec[];
  mode?: DataMapsDisplayMode;
  atFrame?: number;
}

export const IsometricStrataCutaway3D: React.FC<IsometricStrataCutaway3DProps> = ({
  eyebrow = "ISOMETRIC STRATA SECTION",
  title = "Four-Tier Infrastructure Stack",
  subtitle = "Cantilevered geological cutaway separating financial claims from firm electrons and mineral base.",
  layers = [
    { label: "Tier 4 · Contractual Claims", share: "$40.5T", note: "Nominal Paper Promises", tone: "brick" },
    { label: "Tier 3 · Frontier Silicon", share: "2nm EUV", note: "Logic & HBM Packaging", tone: "teal" },
    { label: "Tier 2 · 765kV Transmission", share: "8.5 YR", note: "Interconnection Queue", tone: "paper" },
    { label: "Tier 1 · Firm Baseload Plinth", share: "24/7 GW", note: "Nuclear / Hydro / Gas", tone: "navy" },
  ],
  mode = "page",
  atFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - atFrame);
  const isOverFootage = mode === "over-footage";

  const renderStackSvg = (svgW: number, svgH: number) => (
    <svg width={svgW} height={svgH} viewBox="0 0 820 620">
      {layers.map((ly, idx) => {
        const s = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", idx * 5),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const yBase = 104 + idx * 116;
        const slideX = (1 - s) * 34;
        const faces = getArchitecturalFaces(ly.tone, isOverFootage);
        return (
          <g
            key={`strata-${idx}`}
            transform={`translate(${slideX.toFixed(1)}, ${yBase.toFixed(1)})`}
            opacity={s}
          >
            <polygon
              points="340,0 560,64 340,128 120,64"
              fill={faces.top}
              stroke={faces.stroke}
              strokeWidth="2"
            />
            <polygon
              points="120,64 340,128 340,166 120,102"
              fill={faces.left}
              stroke={faces.stroke}
              strokeWidth="2"
            />
            <polygon
              points="560,64 340,128 340,166 560,102"
              fill={faces.right}
              stroke={faces.stroke}
              strokeWidth="2"
            />
            <text
              x="340"
              y="69"
              textAnchor="middle"
              fontFamily={FONTS.mono}
              fontSize="14"
              fontWeight="700"
              fill={
                ly.tone === "paper"
                  ? PAGE_PALETTE.navy
                  : OVER_FOOTAGE_PALETTE.textHeadline
              }
            >
              {ly.label.toUpperCase()}
            </text>
            <line
              x1="560"
              y1="64"
              x2="624"
              y2="64"
              stroke={faces.tagInk}
              strokeWidth="1.8"
            />
            <text
              x="634"
              y="69"
              fontFamily={FONTS.mono}
              fontSize="18"
              fontWeight="700"
              fill={faces.tagInk}
              style={TABULAR_NUM_STYLE}
            >
              {ly.share}
            </text>
          </g>
        );
      })}
    </svg>
  );

  if (mode !== "page") {
    return (
      <div
        style={{
          display: "inline-block",
          padding: "24px",
          borderRadius: "16px",
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : PAGE_PALETTE.paperLight,
          border: `1px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : PAGE_PALETTE.paperBorder
          }`,
        }}
      >
        {renderStackSvg(580, 470)}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: PAGE_PALETTE.paperLight,
        display: "grid",
        gridTemplateColumns: "0.88fr 1.12fr",
        alignItems: "center",
        padding: "80px 96px",
        boxSizing: "border-box",
        gap: "60px",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: PAGE_ACCENT_BRICK_AAA,
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.serif,
            fontSize: "58px",
            lineHeight: 1.08,
            color: PAGE_PALETTE.navy,
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
            color: PAGE_INK_SECONDARY,
          }}
        >
          {subtitle}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {layers.map((ly, i) => (
            <div
              key={`st-row-${i}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "16px",
                padding: "12px 18px",
                backgroundColor: PAGE_PALETTE.paper,
                border: `1px solid ${PAGE_PALETTE.paperBorder}`,
                borderRadius: "8px",
              }}
            >
              <span style={{ fontFamily: FONTS.sans, fontSize: "16px", fontWeight: 700, color: PAGE_PALETTE.navy, minWidth: 0 }}>
                {ly.label} · <span style={{ fontWeight: 500, color: PAGE_INK_SECONDARY }}>{ly.note}</span>
              </span>
              <span
                style={{
                  ...TABULAR_NUM_STYLE,
                  fontFamily: FONTS.mono,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: PAGE_ACCENT_BRICK_AAA,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {ly.share}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          backgroundColor: PAGE_PALETTE.paper,
          border: `2px solid ${PAGE_PALETTE.navy}`,
          borderRadius: "18px",
          padding: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderStackSvg(840, 680)}
      </div>
    </div>
  );
};

export const DATA_MAPS_3D_STYLES: readonly DataMaps3DRecipe[] = [
  {
    id: "map-explainer",
    name: "Offline 211-Country & 51-State Cartographic Atlas",
    componentName: "MapExplainer",
    defaultFraming: "fullscreen-cutaway",
    description:
      "D3 + TopoJSON cartographic stage wired to resolveGeoQuery for 211 countries, 51 US states/DC, and 24 corridors with metric callout card, pins, and geodesic arcs.",
  },
  {
    id: "data-physical-card",
    name: "Isometric Physical Volume Comparison Columns",
    componentName: "DataPhysicalCard",
    defaultFraming: "over-footage",
    description:
      "Deterministic 3-face isometric comparison blocks with spring extrusion and full-1920x1080 or glass framing.",
  },
  {
    id: "white-model-3d",
    name: "Parametric Isometric 3D Architectural Massing Model",
    componentName: "WhiteModel3D",
    defaultFraming: "over-footage",
    description:
      "Zero-WebGL deterministic SVG isometric architectural plinth with shaded faces, cast shadows, and elevation dimension lines.",
  },
  {
    id: "blob-simulation",
    name: "Venturi Capacity Bottleneck Particle Stream",
    componentName: "BlobSimulation",
    defaultFraming: "over-footage",
    description:
      "Deterministic particle stream compressing through a physical Venturi aperture with throttle telemetry.",
  },
  {
    id: "corridor-arc-matrix-card",
    name: "Geopolitical Chokepoint & Corridor Exposure Matrix",
    componentName: "CorridorArcMatrixCard",
    defaultFraming: "fullscreen-cutaway",
    description:
      "Full-bleed corridor map stage paired with a docked tabular exposure ledger for maritime, silicon, and grid chokepoints.",
  },
  {
    id: "isometric-strata-cutaway-3d",
    name: "Four-Tier Isometric Strata Cross-Section",
    componentName: "IsometricStrataCutaway3D",
    defaultFraming: "fullscreen-cutaway",
    description:
      "Cantilevered isometric cross-section separating contractual claims, silicon, transmission, and firm megawatts.",
  },
] as const;
