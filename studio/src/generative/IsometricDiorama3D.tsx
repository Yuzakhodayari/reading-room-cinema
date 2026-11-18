import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../design/fonts";
import {
  BlueprintThemeRegister,
  BlueprintTone,
  IsometricBlockSpec,
} from "./blueprintTypes";
import { clamp01, hashStringSeed, mulberry32 } from "./physics2d";

/**
 * Pillar #13 — Memory-Safe Parametric 3D Isometric Architectural & Telemetry Stage
 *
 * Replaces legacy per-frame WebGLRenderer instantiation with a 100% synchronous,
 * vector-crisp, zero-leak parametric isometric 3D projection engine.
 * Works deterministically across all parallel headless Chrome workers with zero WebGL crashes.
 */

export interface IsoProjectedPoint {
  sx: number;
  sy: number;
  depth: number;
}

/**
 * Projects world 3D coordinates (wx, wy, wz) — where wy >= 0 is vertical elevation —
 * onto 2D screen space using true parametric axonometric/isometric angles.
 */
export function projectIsoPoint3D(
  wx: number,
  wy: number,
  wz: number,
  originX: number,
  originY: number,
  unitScalePx: number,
  azimuthDeg: number = 45,
  elevationDeg: number = 35.264
): IsoProjectedPoint {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;

  const cosAz = Math.cos(az);
  const sinAz = Math.sin(az);
  const sinEl = Math.sin(el);
  const cosEl = Math.cos(el);

  // Rotate ground (wx, wz) by azimuth
  const rx = wx * cosAz - wz * sinAz;
  const rz = wx * sinAz + wz * cosAz;

  // Orthographic tilt by elevation; wy rises upward (-sy)
  const sx = originX + rx * unitScalePx;
  const sy = originY + rz * sinEl * unitScalePx - wy * cosEl * unitScalePx;
  const depth = rz + wy * 0.002;

  return { sx, sy, depth };
}

function pointsToSvgPolygon(pts: IsoProjectedPoint[]): string {
  return pts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");
}

interface FaceShadingTriplet {
  top: string;
  left: string;
  right: string;
  stroke: string;
  windowLit: string;
  windowDim: string;
}

function resolveBlockFaceColors(
  tone: BlueprintTone,
  register: BlueprintThemeRegister,
  overFootage: boolean
): FaceShadingTriplet {
  const isDarkSurface =
    overFootage ||
    register === "midnight_telemetry" ||
    register === "drafting_blueprint" ||
    register === "vintage_newsreel";

  if (tone === "crimson") {
    return {
      top: "#C9553E",
      left: "#A3402E",
      right: "#7A2B1D",
      stroke: isDarkSurface ? "#F7D4C8" : "#5C1E13",
      windowLit: "#FFF6E5",
      windowDim: "rgba(250, 236, 212, 0.18)",
    };
  }
  if (tone === "teal") {
    return {
      top: "#4FB3AE",
      left: "#2F8F8B",
      right: "#1E6663",
      stroke: isDarkSurface ? "#D4F2F0" : "#154A48",
      windowLit: "#FFF6E5",
      windowDim: "rgba(250, 248, 243, 0.18)",
    };
  }
  if (tone === "sand") {
    return {
      top: "#EDE2CB",
      left: "#D8C8A8",
      right: "#B8A582",
      stroke: isDarkSurface ? "#FFF6E5" : "#4A3E2B",
      windowLit: "#1C2B3A",
      windowDim: "rgba(28, 43, 58, 0.16)",
    };
  }
  if (tone === "slate") {
    return {
      top: "#5B87B0",
      left: "#3E6A94",
      right: "#294B6B",
      stroke: isDarkSurface ? "#D8E8F7" : "#183047",
      windowLit: "#FFF6E5",
      windowDim: "rgba(255, 246, 229, 0.18)",
    };
  }
  if (tone === "muted") {
    return isDarkSurface
      ? {
          top: "#34495E",
          left: "#263849",
          right: "#1A2836",
          stroke: "rgba(191, 214, 234, 0.42)",
          windowLit: "#BFD6EA",
          windowDim: "rgba(191, 214, 234, 0.12)",
        }
      : {
          top: "#ECE9E0",
          left: "#DAD5C9",
          right: "#C2BCB0",
          stroke: "#5A6672",
          windowLit: "#2F8F8B",
          windowDim: "rgba(28, 43, 58, 0.12)",
        };
  }

  // Default "navy" hero architectural massing
  return isDarkSurface
    ? {
        top: "#3D5E7D",
        left: "#28425B",
        right: "#192C3E",
        stroke: "#BFD6EA",
        windowLit: "#FFF6E5",
        windowDim: "rgba(191, 214, 234, 0.16)",
      }
    : {
        top: "#2D445B",
        left: "#1C2B3A",
        right: "#111C27",
        stroke: "#0F1923",
        windowLit: "#FAECD4",
        windowDim: "rgba(250, 236, 212, 0.16)",
      };
}

function bilerpQuad(
  p00: IsoProjectedPoint,
  p10: IsoProjectedPoint,
  p11: IsoProjectedPoint,
  p01: IsoProjectedPoint,
  u: number,
  v: number
): IsoProjectedPoint {
  const sx =
    (1 - u) * (1 - v) * p00.sx +
    u * (1 - v) * p10.sx +
    u * v * p11.sx +
    (1 - u) * v * p01.sx;
  const sy =
    (1 - u) * (1 - v) * p00.sy +
    u * (1 - v) * p10.sy +
    u * v * p11.sy +
    (1 - u) * v * p01.sy;
  return { sx, sy, depth: p00.depth };
}

export interface IsometricDiorama3DProps {
  width?: number;
  height?: number;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  axisUnitLabel?: string;
  blocks?: IsometricBlockSpec[];
  gridSpan?: number;
  azimuthDeg?: number;
  elevationDeg?: number;
  orbitalSwayDeg?: number;
  themeRegister?: BlueprintThemeRegister;
  overFootage?: boolean;
  totalFrames?: number;
  showFrameChrome?: boolean;
}

const DEFAULT_DIORAMA_BLOCKS: IsometricBlockSpec[] = [
  {
    id: "substation-west",
    label: "HV Substation",
    calloutValue: "345 kV",
    gx: -2.4,
    gz: 0.8,
    widthUnits: 1.5,
    depthUnits: 1.5,
    heightUnits: 1.6,
    tone: "slate",
    windowMatrix: { rows: 3, cols: 3, activeRatio: 0.7 },
  },
  {
    id: "legacy-cloud",
    label: "Legacy Cloud Hall",
    calloutValue: "120 MW",
    gx: -0.4,
    gz: 1.1,
    widthUnits: 1.8,
    depthUnits: 1.6,
    heightUnits: 2.8,
    tone: "muted",
    windowMatrix: { rows: 5, cols: 4, activeRatio: 0.65 },
  },
  {
    id: "frontier-cluster",
    label: "Frontier AI Training Hall",
    calloutValue: "5.0 GW",
    gx: 1.2,
    gz: -0.9,
    widthUnits: 2.2,
    depthUnits: 2.0,
    heightUnits: 5.4,
    tone: "crimson",
    windowMatrix: { rows: 8, cols: 5, activeRatio: 0.92 },
    coolingPlume: true,
  },
];

export const IsometricDiorama3D: React.FC<IsometricDiorama3DProps> = ({
  width = 640,
  height = 460,
  eyebrow,
  title,
  subtitle,
  axisUnitLabel = "ELEV · GRID",
  blocks = DEFAULT_DIORAMA_BLOCKS,
  gridSpan = 4.2,
  azimuthDeg = 42,
  elevationDeg = 33,
  orbitalSwayDeg = 2.6,
  themeRegister = "paper_editorial",
  overFootage = false,
  totalFrames: propTotalFrames,
  showFrameChrome = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const totalFrames = propTotalFrames ?? durationInFrames;
  const progress = clamp01(frame / Math.max(30, totalFrames));

  const isDark =
    overFootage ||
    themeRegister === "midnight_telemetry" ||
    themeRegister === "drafting_blueprint" ||
    themeRegister === "vintage_newsreel";

  const surfaceBg = overFootage
    ? "rgba(15, 25, 35, 0.44)"
    : themeRegister === "midnight_telemetry"
      ? "#121E2B"
      : themeRegister === "drafting_blueprint"
        ? "#152638"
        : themeRegister === "vintage_newsreel"
          ? "#1E1A16"
          : themeRegister === "archival_parchment"
            ? "#EFE7D6"
            : "#FAF8F3";

  const surfaceBorder =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#5C4D3C"
      : isDark
        ? "rgba(191, 214, 234, 0.34)"
        : themeRegister === "archival_parchment"
          ? "#C9BEA8"
          : "#E1DED5";

  const primaryInk =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#EFE6CF"
      : isDark
        ? "#FFF6E5"
        : themeRegister === "archival_parchment"
          ? "#231D15"
          : "#1C2B3A";

  const secondaryInk =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#CBBFA4"
      : isDark
        ? "#FAECD4"
        : themeRegister === "archival_parchment"
          ? "#3B3125"
          : "#364554";

  const eyebrowInk =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#E6B055"
      : isDark
        ? "#BFD6EA"
        : "#8C2D1E";

  const plinthTopFill =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#241F1A"
      : isDark
        ? "#1B2E42"
        : themeRegister === "archival_parchment"
          ? "#E5DCC8"
          : "#F2F0EA";
  const plinthLeftFill =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#1A1613"
      : isDark
        ? "#142333"
        : "#E1DDD3";
  const plinthRightFill =
    themeRegister === "vintage_newsreel" && !overFootage
      ? "#120F0D"
      : isDark
        ? "#0F1B28"
        : "#CFCAC0";
  const gridStroke = isDark
    ? "rgba(191, 214, 234, 0.17)"
    : "rgba(28, 43, 58, 0.12)";
  const shadowFill = isDark
    ? "rgba(9, 15, 22, 0.48)"
    : "rgba(28, 43, 58, 0.14)";

  // Gentle deterministic architectural camera sway (zero WebGL leak!)
  const liveAzimuth =
    azimuthDeg + Math.sin((frame / Math.max(1, fps)) * 0.75) * orbitalSwayDeg;

  const headerOffset = title || eyebrow ? 58 : 16;
  const originX = width * 0.5;
  const originY = headerOffset + (height - headerOffset) * 0.64;

  // Auto-scale unit size so tall towers & wide grids always fit comfortably inside SVG viewport
  const maxTowerH = useMemo(() => {
    let m = 3.5;
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].heightUnits > m) m = blocks[i].heightUnits;
    }
    return m;
  }, [blocks]);

  const unitScale = useMemo(() => {
    const scaleByW = (width * 0.41) / Math.max(2.5, gridSpan);
    const scaleByH =
      ((height - headerOffset) * 0.54) / Math.max(3.2, maxTowerH + gridSpan * 0.45);
    return Math.max(14, Math.min(56, Math.min(scaleByW, scaleByH)));
  }, [width, height, headerOffset, gridSpan, maxTowerH]);

  // Sort blocks back-to-front by projected center depth (Painter's Algorithm)
  const sortedBlocks = useMemo(() => {
    return [...blocks]
      .map((b, idx) => {
        const centerProj = projectIsoPoint3D(
          b.gx + b.widthUnits * 0.5,
          0,
          b.gz + b.depthUnits * 0.5,
          originX,
          originY,
          unitScale,
          liveAzimuth,
          elevationDeg
        );
        return { block: b, idx, depth: centerProj.depth };
      })
      .sort((a, b) => {
        if (Math.abs(a.depth - b.depth) > 0.0001) return a.depth - b.depth;
        return a.idx - b.idx;
      });
  }, [blocks, originX, originY, unitScale, liveAzimuth, elevationDeg]);

  // Plinth slab corners (-gridSpan..+gridSpan, thickness = 0.28 units)
  const slabThick = 0.28;
  const sNWTop = projectIsoPoint3D(-gridSpan, 0, -gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sNETop = projectIsoPoint3D(gridSpan, 0, -gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sSETop = projectIsoPoint3D(gridSpan, 0, gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sSWTop = projectIsoPoint3D(-gridSpan, 0, gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);

  const sSWBot = projectIsoPoint3D(-gridSpan, -slabThick, gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sSEBot = projectIsoPoint3D(gridSpan, -slabThick, gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sNEBot = projectIsoPoint3D(gridSpan, -slabThick, -gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
  const sNWBot = projectIsoPoint3D(-gridSpan, -slabThick, -gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);

  // Grid lines on y = 0 plane
  const intSpan = Math.floor(gridSpan);
  const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; major: boolean }> = [];
  for (let g = -intSpan; g <= intSpan; g++) {
    const a1 = projectIsoPoint3D(g, 0, -gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
    const a2 = projectIsoPoint3D(g, 0, gridSpan, originX, originY, unitScale, liveAzimuth, elevationDeg);
    gridLines.push({ x1: a1.sx, y1: a1.sy, x2: a2.sx, y2: a2.sy, major: g === 0 });

    const b1 = projectIsoPoint3D(-gridSpan, 0, g, originX, originY, unitScale, liveAzimuth, elevationDeg);
    const b2 = projectIsoPoint3D(gridSpan, 0, g, originX, originY, unitScale, liveAzimuth, elevationDeg);
    gridLines.push({ x1: b1.sx, y1: b1.sy, x2: b2.sx, y2: b2.sy, major: g === 0 });
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: showFrameChrome ? surfaceBg : "transparent",
        border: showFrameChrome ? `1px solid ${surfaceBorder}` : "none",
        borderRadius: showFrameChrome ? "16px" : "0px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Top Editorial / Telemetry Header */}
      {(eyebrow || title) && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "20px",
            right: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: eyebrowInk,
                  marginBottom: "3px",
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: width < 480 ? "18px" : "22px",
                  fontWeight: 700,
                  color: primaryInk,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: "12px",
                  color: secondaryInk,
                  marginTop: "2px",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: "10px",
              fontWeight: 600,
              color: secondaryInk,
              padding: "4px 8px",
              borderRadius: "6px",
              border: `1px solid ${surfaceBorder}`,
              fontVariantNumeric: "tabular-nums lining-nums",
            }}
          >
            {axisUnitLabel}
          </div>
        </div>
      )}

      {/* Deterministic Parametric Isometric SVG Viewport */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {/* 1. Extruded Architectural Base Plinth */}
        <polygon
          points={pointsToSvgPolygon([sNWTop, sSWTop, sSWBot, sNWBot])}
          fill={plinthLeftFill}
          stroke={surfaceBorder}
          strokeWidth="1"
        />
        <polygon
          points={pointsToSvgPolygon([sSWTop, sSETop, sSEBot, sSWBot])}
          fill={plinthLeftFill}
          stroke={surfaceBorder}
          strokeWidth="1"
        />
        <polygon
          points={pointsToSvgPolygon([sSETop, sNETop, sNEBot, sSEBot])}
          fill={plinthRightFill}
          stroke={surfaceBorder}
          strokeWidth="1"
        />
        <polygon
          points={pointsToSvgPolygon([sNWTop, sNETop, sSETop, sSWTop])}
          fill={plinthTopFill}
          stroke={surfaceBorder}
          strokeWidth="1.2"
        />

        {/* 2. Isometric Ground Coordinate Grid */}
        {gridLines.map((gl, idx) => (
          <line
            key={`grid-${idx}`}
            x1={gl.x1}
            y1={gl.y1}
            x2={gl.x2}
            y2={gl.y2}
            stroke={gridStroke}
            strokeWidth={gl.major ? "1.35" : "0.8"}
            strokeDasharray={gl.major ? undefined : "3 3"}
          />
        ))}

        {/* 3. Cast Oblique Ground Shadows (Rendered on y=0 before block bodies) */}
        {sortedBlocks.map(({ block, idx }) => {
          const riseStartFrame = Math.round(
            (block.riseAtProgress ?? idx * 0.06) * totalFrames
          );
          const riseSpring = spring({
            frame: Math.max(0, frame - riseStartFrame),
            fps,
            config: { damping: 24, mass: 0.9, stiffness: 105, overshootClamping: true },
          });
          const initH = block.initialHeightUnits ?? 0;
          const liveH = initH + (block.heightUnits - initH) * riseSpring;
          if (liveH <= 0.02) return null;

          const shDx = liveH * 0.48;
          const shDz = liveH * 0.34;
          const x0 = block.gx;
          const x1 = block.gx + block.widthUnits;
          const z0 = block.gz;
          const z1 = block.gz + block.depthUnits;

          const pA = projectIsoPoint3D(x0, 0.01, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const pB = projectIsoPoint3D(x1, 0.01, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const pC = projectIsoPoint3D(x1, 0.01, z0, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const pD = projectIsoPoint3D(x1 + shDx, 0.01, z0 + shDz, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const pE = projectIsoPoint3D(x1 + shDx, 0.01, z1 + shDz, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const pF = projectIsoPoint3D(x0 + shDx, 0.01, z1 + shDz, originX, originY, unitScale, liveAzimuth, elevationDeg);

          return (
            <polygon
              key={`shadow-${block.id}`}
              points={pointsToSvgPolygon([pA, pB, pC, pD, pE, pF])}
              fill={shadowFill}
            />
          );
        })}

        {/* 4. Depth-Sorted Extruded 3D Blocks, Window/Server Matrices & Plumes */}
        {sortedBlocks.map(({ block, idx }) => {
          const riseStartFrame = Math.round(
            (block.riseAtProgress ?? idx * 0.06) * totalFrames
          );
          const riseSpring = spring({
            frame: Math.max(0, frame - riseStartFrame),
            fps,
            config: { damping: 24, mass: 0.9, stiffness: 105, overshootClamping: true },
          });
          const initH = block.initialHeightUnits ?? 0;
          const liveH = Math.max(0.04, initH + (block.heightUnits - initH) * riseSpring);

          const x0 = block.gx;
          const x1 = block.gx + block.widthUnits;
          const z0 = block.gz;
          const z1 = block.gz + block.depthUnits;

          // 8 vertices of the 3D prism
          const tNW = projectIsoPoint3D(x0, liveH, z0, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const tNE = projectIsoPoint3D(x1, liveH, z0, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const tSE = projectIsoPoint3D(x1, liveH, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const tSW = projectIsoPoint3D(x0, liveH, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);

          const bSW = projectIsoPoint3D(x0, 0, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const bSE = projectIsoPoint3D(x1, 0, z1, originX, originY, unitScale, liveAzimuth, elevationDeg);
          const bNE = projectIsoPoint3D(x1, 0, z0, originX, originY, unitScale, liveAzimuth, elevationDeg);

          const colors = resolveBlockFaceColors(
            block.tone ?? "navy",
            themeRegister,
            overFootage
          );

          // Parametric server/window LED quads on Front-Left (SW->SE) and Front-Right (SE->NE) faces
          const windowQuads: Array<{ pts: string; fill: string }> = [];
          if (block.windowMatrix && liveH > 0.45) {
            const { rows, cols, activeRatio = 0.75, powerDownAfterProgress } =
              block.windowMatrix;
            const poweredDown =
              powerDownAfterProgress !== undefined &&
              progress >= powerDownAfterProgress;
            const prng = mulberry32(hashStringSeed(block.id));

            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const u0 = (c + 0.22) / cols;
                const u1 = (c + 0.78) / cols;
                const v0 = (r + 0.2) / rows;
                const v1 = (r + 0.76) / rows;

                const roll = prng();
                const pulseShift = Math.sin(frame * 0.08 + r * 1.7 + c * 2.3);
                const isLit =
                  !poweredDown && roll < activeRatio && pulseShift > -0.75;
                const fill = isLit ? colors.windowLit : colors.windowDim;

                // Left facade quad (tSW -> tSE -> bSE -> bSW)
                const l00 = bilerpQuad(tSW, tSE, bSE, bSW, u0, v0);
                const l10 = bilerpQuad(tSW, tSE, bSE, bSW, u1, v0);
                const l11 = bilerpQuad(tSW, tSE, bSE, bSW, u1, v1);
                const l01 = bilerpQuad(tSW, tSE, bSE, bSW, u0, v1);
                windowQuads.push({
                  pts: pointsToSvgPolygon([l00, l10, l11, l01]),
                  fill,
                });

                // Right facade quad (tSE -> tNE -> bNE -> bSE)
                const r00 = bilerpQuad(tSE, tNE, bNE, bSE, u0, v0);
                const r10 = bilerpQuad(tSE, tNE, bNE, bSE, u1, v0);
                const r11 = bilerpQuad(tSE, tNE, bNE, bSE, u1, v1);
                const r01 = bilerpQuad(tSE, tNE, bNE, bSE, u0, v1);
                windowQuads.push({
                  pts: pointsToSvgPolygon([r00, r10, r11, r01]),
                  fill,
                });
              }
            }
          }

          const roofCenter = projectIsoPoint3D(
            (x0 + x1) * 0.5,
            liveH,
            (z0 + z1) * 0.5,
            originX,
            originY,
            unitScale,
            liveAzimuth,
            elevationDeg
          );

          // Callout elbow direction outward from center of canvas
          const dirRight = roofCenter.sx >= originX ? 1 : -1;
          const elbowX = roofCenter.sx + dirRight * 26;
          const elbowY = roofCenter.sy - 24;
          const labelAnchorX = elbowX + dirRight * 34;

          const calloutOpacity = interpolate(riseSpring, [0.45, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={block.id}>
              {/* Front-Left Face */}
              <polygon
                points={pointsToSvgPolygon([tSW, tSE, bSE, bSW])}
                fill={colors.left}
                stroke={colors.stroke}
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              {/* Front-Right Face */}
              <polygon
                points={pointsToSvgPolygon([tSE, tNE, bNE, bSE])}
                fill={colors.right}
                stroke={colors.stroke}
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              {/* Lit Top Roof Face */}
              <polygon
                points={pointsToSvgPolygon([tNW, tNE, tSE, tSW])}
                fill={colors.top}
                stroke={colors.stroke}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Server / Window Matrix Cells */}
              {windowQuads.map((wq, wIdx) => (
                <polygon key={`win-${wIdx}`} points={wq.pts} fill={wq.fill} />
              ))}

              {/* Rising Thermal / Cooling Plumes */}
              {block.coolingPlume &&
                [0, 1, 2].map((pIdx) => {
                  const cycle = ((frame / Math.max(1, fps)) * 0.55 + pIdx / 3) % 1;
                  const liftPx = cycle * 44;
                  const rx = 8 + cycle * 16;
                  const ry = 4.5 + cycle * 8;
                  const alpha = Math.sin(cycle * Math.PI) * (isDark ? 0.36 : 0.28);
                  return (
                    <ellipse
                      key={`plume-${pIdx}`}
                      cx={roofCenter.sx + Math.sin(cycle * 5 + pIdx) * 5}
                      cy={roofCenter.sy - 8 - liftPx}
                      rx={rx}
                      ry={ry}
                      fill={isDark ? "#BFD6EA" : "#6B7783"}
                      opacity={alpha * riseSpring}
                    />
                  );
                })}

              {/* Rooftop Callout Leader Line & Tabular Badge */}
              {(block.label || block.calloutValue) && (
                <g opacity={calloutOpacity}>
                  <circle
                    cx={roofCenter.sx}
                    cy={roofCenter.sy}
                    r="3.2"
                    fill={colors.stroke}
                  />
                  <polyline
                    points={`${roofCenter.sx.toFixed(1)},${roofCenter.sy.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${labelAnchorX.toFixed(1)},${elbowY.toFixed(1)}`}
                    fill="none"
                    stroke={primaryInk}
                    strokeWidth="1.25"
                    opacity={0.82}
                  />
                  <g
                    transform={`translate(${
                      dirRight > 0 ? labelAnchorX + 4 : labelAnchorX - 134
                    }, ${elbowY - 16})`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="130"
                      height="32"
                      rx="6"
                      fill={isDark ? "rgba(15, 25, 35, 0.88)" : "rgba(250, 248, 243, 0.94)"}
                      stroke={surfaceBorder}
                      strokeWidth="1"
                    />
                    {block.calloutValue && (
                      <text
                        x="8"
                        y="13"
                        fill={block.tone === "crimson" ? (isDark ? "#E27358" : "#8C2D1E") : primaryInk}
                        fontFamily={FONTS.mono}
                        fontSize="11"
                        fontWeight="700"
                        style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
                      >
                        {block.calloutValue}
                      </text>
                    )}
                    {block.label && (
                      <text
                        x="8"
                        y={block.calloutValue ? "25" : "19"}
                        fill={secondaryInk}
                        fontFamily={FONTS.sans}
                        fontSize="9.5"
                        fontWeight="600"
                      >
                        {block.label.slice(0, 20)}
                      </text>
                    )}
                  </g>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
