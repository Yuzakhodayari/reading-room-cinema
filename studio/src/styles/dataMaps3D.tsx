import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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

export type DataMapsDisplayMode = "card" | "page" | "over-footage";

export interface DataMaps3DRecipe {
  id: string;
  name: string;
  componentName: string;
  defaultFraming: "fullscreen-cutaway" | "over-footage";
  description: string;
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

  const accentColor =
    routeTone === "alert"
      ? isDarkRegister
        ? OVER_FOOTAGE_PALETTE.brickRedText
        : PAGE_PALETTE.brickRed
      : isDarkRegister
      ? OVER_FOOTAGE_PALETTE.chartSecondary
      : PAGE_PALETTE.chartSecondary;

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
              ? "rgba(20, 27, 36, 0.92)"
              : "rgba(250, 248, 243, 0.96)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${
              isDarkRegister
                ? OVER_FOOTAGE_PALETTE.glassBorder
                : PAGE_PALETTE.paperBorder
            }`,
            borderTop: `4px solid ${accentColor}`,
            borderRadius: "12px",
            padding: "16px 24px",
            minWidth: "220px",
            boxShadow: isDarkRegister
              ? "0 20px 44px rgba(15, 25, 35, 0.48)"
              : "0 16px 36px rgba(28, 43, 58, 0.12)",
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
            }}
          >
            {derivedMetric.label}
          </div>
          <div
            style={{
              ...TABULAR_NUM_STYLE,
              fontFamily: FONTS.mono,
              fontSize: "28px",
              fontWeight: 700,
              color: isDarkRegister
                ? OVER_FOOTAGE_PALETTE.textHeadline
                : PAGE_PALETTE.navy,
              marginTop: "6px",
              lineHeight: 1.15,
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
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_PALETTE.brickRed,
    };
  }
  if (tone === "teal") {
    return {
      front: PAGE_PALETTE.chartSecondary,
      top: "#4FB3AE",
      right: "#1E6360",
      text: isOverFootage
        ? OVER_FOOTAGE_PALETTE.chartSecondary
        : PAGE_PALETTE.chartSecondary,
    };
  }
  if (tone === "slate") {
    return {
      front: PAGE_PALETTE.gold,
      top: "#5A89B6",
      right: "#284866",
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_PALETTE.gold,
    };
  }
  if (tone === "paper") {
    return {
      front: PAGE_PALETTE.paper,
      top: PAGE_PALETTE.paperLight,
      right: PAGE_PALETTE.paperBorder,
      text: isOverFootage ? OVER_FOOTAGE_PALETTE.textBody : PAGE_PALETTE.muted,
    };
  }
  return {
    front: isOverFootage ? "#2D4761" : PAGE_PALETTE.navy,
    top: isOverFootage ? "#46688A" : "#2E4357",
    right: PAGE_PALETTE.navyDeep,
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

  const barW = mode === "page" ? 138 : 108;
  const isoDx = mode === "page" ? 22 : 16;
  const isoDy = mode === "page" ? 18 : 14;
  const maxBarH = mode === "page" ? 360 : 210;

  const renderColumns = () => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: mode === "page" ? "76px" : "54px",
        height: mode === "page" ? "490px" : "336px",
        paddingTop: "24px",
      }}
    >
      {columns.map((col, idx) => {
        const grow = studioSpring(elapsed, fps, "editorialSnap", idx * 5);
        const clampedGrow = interpolate(grow, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const shade = getIsoShade(col.tone ?? (idx === 0 ? "navy" : "brick"), isOverFootage);
        const targetH = Math.max(14, (col.value / maxVal) * maxBarH);
        const heightPx = Math.max(12, targetH * clampedGrow);
        const svgW = barW + isoDx;
        const svgH = heightPx + isoDy;

        return (
          <div
            key={`phys-col-${idx}-${col.label}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                ...TABULAR_NUM_STYLE,
                fontFamily: FONTS.mono,
                fontSize: mode === "page" ? "44px" : "34px",
                fontWeight: 700,
                color: shade.text,
                marginBottom: "10px",
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
                points={`4,${svgH} ${barW + 4},${svgH} ${barW + isoDx + 10},${svgH - 8} ${isoDx + 10},${svgH - 8}`}
                fill="rgba(15, 25, 35, 0.14)"
              />
              <polygon
                points={`0,${isoDy} ${isoDx},0 ${barW + isoDx},0 ${barW},${isoDy}`}
                fill={shade.top}
              />
              <polygon
                points={`${barW},${isoDy} ${barW + isoDx},0 ${barW + isoDx},${heightPx} ${barW},${svgH}`}
                fill={shade.right}
              />
              <rect x={0} y={isoDy} width={barW} height={heightPx} fill={shade.front} />
            </svg>
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: mode === "page" ? "16px" : "13px",
                lineHeight: 1.32,
                color: isOverFootage
                  ? OVER_FOOTAGE_PALETTE.textBody
                  : idx === 0
                  ? PAGE_PALETTE.navy
                  : PAGE_PALETTE.muted,
                fontWeight: 700,
                marginTop: "18px",
                maxWidth: mode === "page" ? "210px" : "165px",
                textAlign: "center",
              }}
            >
              {col.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (mode !== "page") {
    return (
      <div
        style={{
          display: "inline-block",
          padding: "30px 38px",
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : PAGE_PALETTE.paperLight,
          backdropFilter: isOverFootage ? "blur(14px)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px)" : undefined,
          border: `1px solid ${
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : PAGE_PALETTE.paperBorder
          }`,
          borderRadius: "16px",
          boxShadow: isOverFootage
            ? "0 22px 48px rgba(15, 25, 35, 0.46)"
            : "0 20px 44px rgba(28, 43, 58, 0.12)",
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11.5px",
            color: isOverFootage
              ? OVER_FOOTAGE_PALETTE.brickRedText
              : PAGE_PALETTE.brickRed,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          {eyebrow}
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
        gridTemplateColumns: "0.95fr 1.05fr",
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
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.muted,
          }}
        >
          {subtitle}
        </p>
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: `1.5px solid ${PAGE_PALETTE.paperBorder}`,
            fontFamily: FONTS.mono,
            fontSize: "13px",
            color: PAGE_PALETTE.muted,
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
          padding: "44px 52px",
          boxShadow: "0 24px 48px rgba(28, 43, 58, 0.12)",
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
      tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_PALETTE.brickRed,
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
        : PAGE_PALETTE.chartSecondary,
    };
  }
  if (tone === "slate") {
    return {
      top: "#6390BC",
      left: PAGE_PALETTE.gold,
      right: "#274766",
      stroke: isOverFootage ? "#BFD6EA" : PAGE_PALETTE.navy,
      tagInk: isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : PAGE_PALETTE.gold,
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
  const stageW = mode === "page" ? 960 : width;
  const stageH = mode === "page" ? 720 : height;

  const modelBlocks = blocks && blocks.length > 0 ? blocks : DEFAULT_WHITE_MODEL_BLOCKS;

  // Deterministic subtle yaw oscillation (zero WebGL, zero canvas leak)
  const yawRad =
    Math.sin(elapsed * 0.022) * ((orbitAmplitudeDeg * Math.PI) / 180);
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);

  const unitScale = Math.min(stageW / 18.5, stageH / 13.5);
  const originX = stageW * 0.5;
  const originY = stageH * 0.63;
  const zScale = unitScale * 0.92;

  const projectIso = (wx: number, wy: number, wz: number): [number, number] => {
    const rx = wx * cosY - wy * sinY;
    const ry = wx * sinY + wy * cosY;
    const sx = originX + (rx - ry) * unitScale * 0.866;
    const sy = originY + (rx + ry) * unitScale * 0.5 - wz * zScale;
    return [sx, sy];
  };

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

  const plinthHalf = 5.4;
  const plinthDepth = 0.42;
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

  // Tier-2 inner podium slab
  const innerHalf = 4.3;
  const innerHeight = 0.18;
  const iTop = [
    projectIso(-innerHalf, -innerHalf, innerHeight),
    projectIso(innerHalf, -innerHalf, innerHeight),
    projectIso(innerHalf, innerHalf, innerHeight),
    projectIso(-innerHalf, innerHalf, innerHeight),
  ];

  const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let g = -5; g <= 5; g++) {
    const a1 = projectIso(g, -plinthHalf, 0.01);
    const a2 = projectIso(g, plinthHalf, 0.01);
    gridLines.push({ x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1] });
    const b1 = projectIso(-plinthHalf, g, 0.01);
    const b2 = projectIso(plinthHalf, g, 0.01);
    gridLines.push({ x1: b1[0], y1: b1[1], x2: b2[0], y2: b2[1] });
  }

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

      {/* Plinth Isometric Grid */}
      {gridLines.map((ln, idx) => (
        <line
          key={`plinth-grid-${idx}`}
          x1={ln.x1}
          y1={ln.y1}
          x2={ln.x2}
          y2={ln.y2}
          stroke={
            isOverFootage
              ? "rgba(191, 214, 234, 0.09)"
              : "rgba(28, 43, 58, 0.075)"
          }
          strokeWidth="0.9"
        />
      ))}

      {/* Inner Architectural Podium */}
      <polygon
        points={ptsToAttr(iTop)}
        fill={isOverFootage ? "rgba(37, 56, 76, 0.72)" : PAGE_PALETTE.paperLight}
        stroke={isOverFootage ? "rgba(191,214,234,0.28)" : PAGE_PALETTE.paperBorder}
        strokeWidth="1.1"
      />

      {/* Oblique Ground Cast Shadows */}
      {sortedBlocks.map((b, idx) => {
        const extrude = interpolate(
          studioSpring(elapsed, fps, "editorialSnap", idx * 4),
          [0, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const h = Math.max(0.15, b.heightUnits * extrude);
        const shDx = h * 0.34;
        const shDy = h * 0.24;
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

        const roofCenter = projectIso(
          (x0 + x1) * 0.5,
          (y0 + y1) * 0.5,
          z1
        );
        const elevTop = projectIso(x1, y0, z1);
        const elevBase = projectIso(x1, y0, z0);

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

            {/* Elevation Dimension Callout Line on Tallest/Primary Blocks */}
            {showElevationLines && b.heightUnits >= 4.5 && (
              <g opacity={extrude}>
                <line
                  x1={elevTop[0] + 10}
                  y1={elevTop[1]}
                  x2={elevTop[0] + 30}
                  y2={elevTop[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.3"
                />
                <line
                  x1={elevBase[0] + 10}
                  y1={elevBase[1]}
                  x2={elevBase[0] + 30}
                  y2={elevBase[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.3"
                />
                <line
                  x1={elevTop[0] + 22}
                  y1={elevTop[1]}
                  x2={elevBase[0] + 22}
                  y2={elevBase[1]}
                  stroke={faces.tagInk}
                  strokeWidth="1.3"
                  strokeDasharray="3 3"
                />
              </g>
            )}

            {/* Leader Pin + Architectural Callout Label */}
            <g opacity={extrude}>
              <line
                x1={roofCenter[0]}
                y1={roofCenter[1]}
                x2={roofCenter[0]}
                y2={roofCenter[1] - 20}
                stroke={faces.tagInk}
                strokeWidth="1.4"
              />
              <circle cx={roofCenter[0]} cy={roofCenter[1]} r="3" fill={faces.tagInk} />
              <rect
                x={roofCenter[0] - 58}
                y={roofCenter[1] - 46}
                width={116}
                height={24}
                rx={4}
                fill={
                  isOverFootage
                    ? "rgba(15, 25, 35, 0.88)"
                    : "rgba(250, 248, 243, 0.94)"
                }
                stroke={
                  isOverFootage
                    ? OVER_FOOTAGE_PALETTE.glassBorder
                    : PAGE_PALETTE.paperBorder
                }
                strokeWidth="1"
              />
              <text
                x={roofCenter[0]}
                y={roofCenter[1] - 30}
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontSize="10.5"
                fontWeight="700"
                fill={faces.tagInk}
                style={TABULAR_NUM_STYLE}
              >
                {b.valueLabel ? `${b.valueLabel}` : b.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* Corner Datum Caption */}
      <text
        x={22}
        y={stageH - 18}
        fontFamily={FONTS.mono}
        fontSize="10.5"
        fontWeight="600"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_PALETTE.muted}
        style={TABULAR_NUM_STYLE}
      >
        {datumLabel}
      </text>
    </svg>
  );

  if (mode !== "page") {
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
            isOverFootage ? OVER_FOOTAGE_PALETTE.glassBorder : COLORS.paperBorder
          }`,
          background: isOverFootage
            ? OVER_FOOTAGE_PALETTE.glassPrimary
            : COLORS.paperLight,
          backdropFilter: isOverFootage ? "blur(14px)" : undefined,
          WebkitBackdropFilter: isOverFootage ? "blur(14px)" : undefined,
          boxShadow: isOverFootage
            ? "0 22px 48px rgba(15, 25, 35, 0.46)"
            : "0 20px 44px rgba(28, 43, 58, 0.12)",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "18px",
            fontFamily: FONTS.mono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: isOverFootage
              ? OVER_FOOTAGE_PALETTE.brickRedText
              : PAGE_PALETTE.brickRed,
            zIndex: 2,
          }}
        >
          {eyebrow}
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
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.muted,
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
                  color:
                    blk.tone === "brick"
                      ? PAGE_PALETTE.brickRed
                      : PAGE_PALETTE.chartSecondary,
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
        stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : COLORS.muted}
        strokeWidth={2.2 * scaleX}
      />
      <path
        d={`M ${60 * scaleX} ${185 * scaleY} L ${250 * scaleX} ${140 * scaleY} L ${
          330 * scaleX
        } ${140 * scaleY} L ${520 * scaleX} ${185 * scaleY}`}
        fill="none"
        stroke={isOverFootage ? OVER_FOOTAGE_PALETTE.accentPrimary : COLORS.muted}
        strokeWidth={2.2 * scaleX}
      />
      <rect
        x={248 * scaleX}
        y={86 * scaleY}
        width={84 * scaleX}
        height={58 * scaleY}
        fill="none"
        stroke={
          isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_PALETTE.brickRed
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
        x={96 * scaleX}
        y={212 * scaleY}
        fontFamily={FONTS.mono}
        fontSize={10 * scaleX}
        fontWeight="700"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_PALETTE.muted}
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
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.brickRedText : PAGE_PALETTE.brickRed}
      >
        {chokepointLabel}
      </text>
      <text
        x={448 * scaleX}
        y={212 * scaleY}
        fontFamily={FONTS.mono}
        fontSize={10 * scaleX}
        fontWeight="700"
        fill={isOverFootage ? OVER_FOOTAGE_PALETTE.textMuted : PAGE_PALETTE.muted}
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
              : COLORS.brickRed,
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
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.muted,
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
            borderLeft: `5px solid ${PAGE_PALETTE.brickRed}`,
            borderRadius: "10px",
            fontFamily: FONTS.mono,
            fontSize: "24px",
            fontWeight: 700,
            color: PAGE_PALETTE.brickRed,
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
        atFrame={atFrame}
      />
      {!isOverFootage && (
        <div
          style={{
            position: "absolute",
            right: "64px",
            top: "148px",
            width: "390px",
            backgroundColor: "rgba(250, 248, 243, 0.96)",
            border: `1.5px solid ${PAGE_PALETTE.navy}`,
            borderRadius: "14px",
            padding: "24px 28px",
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
              color: PAGE_PALETTE.brickRed,
              marginBottom: "14px",
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
                padding: "12px 0",
                borderTop:
                  idx === 0 ? "none" : `1px solid ${PAGE_PALETTE.paperBorder}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: PAGE_PALETTE.navy,
                  }}
                >
                  {m.label}
                </div>
                {m.delta && (
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: "11.5px",
                      color: PAGE_PALETTE.muted,
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
                  fontSize: "24px",
                  fontWeight: 700,
                  color: PAGE_PALETTE.navy,
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
    <svg width={svgW} height={svgH} viewBox="0 0 760 620">
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
              fontSize="14.5"
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
              x2="628"
              y2="64"
              stroke={faces.tagInk}
              strokeWidth="1.8"
            />
            <text
              x="638"
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
            color: PAGE_PALETTE.brickRed,
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
            color: PAGE_PALETTE.muted,
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
                padding: "12px 18px",
                backgroundColor: PAGE_PALETTE.paper,
                border: `1px solid ${PAGE_PALETTE.paperBorder}`,
                borderRadius: "8px",
              }}
            >
              <span style={{ fontFamily: FONTS.sans, fontSize: "16px", fontWeight: 700, color: PAGE_PALETTE.navy }}>
                {ly.label} · <span style={{ fontWeight: 500, color: PAGE_PALETTE.muted }}>{ly.note}</span>
              </span>
              <span style={{ ...TABULAR_NUM_STYLE, fontFamily: FONTS.mono, fontSize: "16px", fontWeight: 700, color: PAGE_PALETTE.brickRed }}>
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
