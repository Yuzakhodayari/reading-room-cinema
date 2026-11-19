import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import usAtlasJson from "us-atlas/states-10m.json" with { type: "json" };
import worldAtlasJson from "world-atlas/countries-110m.json" with { type: "json" };
import { FONTS, TABULAR_NUM_STYLE, getOpticalTracking } from "../design/fonts";
import {
  CINEMA_SPRINGS,
  COLORS,
  OVER_FOOTAGE_PALETTE,
  PAGE_PALETTE,
  SPRINGS,
} from "../design/tokens";
import {
  GeoQueryTarget,
  ResolvedGeoScene,
  resolveGeoQuery,
} from "./atlasResolver";
import {
  CorridorId,
  GeoBoundingBox,
  LonLat,
  MapArcSpec,
  MapPinSpec,
  MapScope,
  MapTone,
  MapVisualRegister,
  MapWarningSpec,
} from "./geoDatabase";

// ============================================================================
// Pillar #3 Cartography — CinemaMapStage (D3 + TopoJSON War-Room & Editorial Atlas)
// ============================================================================

interface AtlasFeatureProps {
  name?: string;
}

interface WorldTopologyObjects {
  countries: GeometryCollection<AtlasFeatureProps>;
  land: GeometryCollection<AtlasFeatureProps>;
  [key: string]: GeometryCollection<AtlasFeatureProps>;
}

interface UsTopologyObjects {
  states: GeometryCollection<AtlasFeatureProps>;
  nation: GeometryCollection<AtlasFeatureProps>;
  [key: string]: GeometryCollection<AtlasFeatureProps>;
}

const WORLD_TOPOLOGY = worldAtlasJson as unknown as Topology<WorldTopologyObjects>;
const US_TOPOLOGY = usAtlasJson as unknown as Topology<UsTopologyObjects>;

export interface ScreenObstacleRect {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface SolvedPinCallout {
  spec: MapPinSpec;
  /** Pin coordinates in pre-camera D3 map projection space */
  mapX: number;
  mapY: number;
  /** Target settled screen coordinates in stageWidth x stageHeight space */
  screenX: number;
  screenY: number;
  /** Solved callout box top-left in stageWidth x stageHeight space */
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
  /** Attachment point on callout edge */
  anchorX: number;
  anchorY: number;
  /** Intermediate elbow coordinate for clean orthogonal/chamfered leader */
  elbowX: number;
  elbowY: number;
  /** Colored accent bar side facing the pin */
  accentSide: "left" | "right";
}

export interface SolveCalloutsOptions {
  stageWidth: number;
  stageHeight: number;
  focusPoint: readonly [number, number];
  targetZoom: number;
  showChrome: boolean;
  compactCard: boolean;
  extraReservedRects?: ReadonlyArray<ScreenObstacleRect>;
  arcMidpoints?: ReadonlyArray<readonly [number, number]>;
  minCardGap?: number;
  minPinRadius?: number;
}

export interface CinemaMapStageProps {
  /** Free-text entity/sentence, CorridorId, or structured GeoQueryTarget */
  target?: string | CorridorId | GeoQueryTarget;
  /** Optional pre-resolved scene override */
  scene?: ResolvedGeoScene;
  /** Visual register override ("page-editorial" | "midnight-telemetry" | "drafting-blueprint" | "over-footage-glass") */
  register?: MapVisualRegister;
  /** Dual-palette shorthand compatibility ("page" | "over-footage") */
  paletteMode?: "page" | "over-footage";
  /** Explicit scope override */
  scope?: MapScope;
  /** Optional title/subtitle/source overrides */
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  sourceCitation?: string;
  /** Legacy compatibility props from MapExplainer */
  highlightStateFips?: string;
  highlightStatesFips?: string[];
  region?: "us" | "usa" | "world";
  highlightLabel?: string;
  routeTone?: MapTone;
  /** Enable smooth critically-damped camera fly-in (1.0 -> targetZoom) */
  enableCameraFlyIn?: boolean;
  /** Beat-local start frame */
  atFrame?: number;
  /** Show top header card & bottom coordinate telemetry bar */
  showChrome?: boolean;
  /** Compact framing for over-footage right-third card when true */
  compactCard?: boolean;
  /** Explicit SVG viewport dimensions (defaults to 640x620 when compactCard, else video config 1920x1080) */
  stageWidth?: number;
  stageHeight?: number;
  /** Additional screen-space obstacle rects to avoid when placing pin callout cards */
  reservedRects?: ReadonlyArray<ScreenObstacleRect>;
}

interface RegisterPalette {
  isDark: boolean;
  isGlass: boolean;
  canvasBg: string;
  oceanWash: string;
  gridLine: string;
  graticuleStroke: string;
  sphereOutline: string;
  landBase: string;
  landStroke: string;
  primaryFill: string;
  primaryStroke: string;
  primaryInnerRim: string;
  secondaryFill: string;
  secondaryStroke: string;
  alertFill: string;
  alertStroke: string;
  hatchStroke: string;
  inkHeadline: string;
  inkBody: string;
  inkSecondary: string;
  cardBg: string;
  cardBorder: string;
  accentPrimary: string;
  accentSecondary: string;
  accentAlert: string;
  accentCapital: string;
  pinRingBg: string;
  shadow: string;
  shadowColor: string;
  shadowOpacity: number;
}

function getRegisterPalette(register: MapVisualRegister): RegisterPalette {
  if (register === "midnight-telemetry") {
    return {
      isDark: true,
      isGlass: false,
      canvasBg: "#111315",
      oceanWash: "radial-gradient(ellipse at 52% 48%, #18222E 0%, #111315 80%)",
      gridLine: "rgba(191, 214, 234, 0.045)",
      graticuleStroke: "rgba(191, 214, 234, 0.12)",
      sphereOutline: "rgba(191, 214, 234, 0.24)",
      landBase: "#1B232D",
      landStroke: "rgba(191, 214, 234, 0.28)",
      primaryFill: "#285078",
      primaryStroke: "#BFD6EA",
      primaryInnerRim: "rgba(255, 246, 229, 0.22)",
      secondaryFill: "#1E5B58",
      secondaryStroke: "#4FB3AE",
      alertFill: "#6E2519",
      alertStroke: "#E27358",
      hatchStroke: "rgba(255, 246, 229, 0.18)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkSecondary: "#C6D8EA",
      cardBg: "rgba(18, 25, 34, 0.96)",
      cardBorder: "rgba(191, 214, 234, 0.36)",
      accentPrimary: "#BFD6EA",
      accentSecondary: "#4FB3AE",
      accentAlert: "#E27358",
      accentCapital: "#FAECD4",
      pinRingBg: "#111315",
      shadow: "0 18px 42px rgba(8, 12, 18, 0.62)",
      shadowColor: "#070B10",
      shadowOpacity: 0.55,
    };
  }

  if (register === "drafting-blueprint") {
    return {
      isDark: true,
      isGlass: false,
      canvasBg: "#0F2236",
      oceanWash: "radial-gradient(ellipse at 50% 48%, #173350 0%, #0F2236 82%)",
      gridLine: "rgba(191, 214, 234, 0.065)",
      graticuleStroke: "rgba(191, 214, 234, 0.15)",
      sphereOutline: "rgba(191, 214, 234, 0.28)",
      landBase: "#16304A",
      landStroke: "rgba(191, 214, 234, 0.32)",
      primaryFill: "#2F6192",
      primaryStroke: "#FFF6E5",
      primaryInnerRim: "rgba(255, 246, 229, 0.26)",
      secondaryFill: "#226966",
      secondaryStroke: "#67CFC9",
      alertFill: "#7B2B1E",
      alertStroke: "#EC8368",
      hatchStroke: "rgba(255, 246, 229, 0.20)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkSecondary: "#CFE0F0",
      cardBg: "rgba(14, 32, 50, 0.96)",
      cardBorder: "rgba(191, 214, 234, 0.44)",
      accentPrimary: "#BFD6EA",
      accentSecondary: "#4FB3AE",
      accentAlert: "#E27358",
      accentCapital: "#FFF6E5",
      pinRingBg: "#0F2236",
      shadow: "0 18px 42px rgba(7, 16, 26, 0.58)",
      shadowColor: "#06101B",
      shadowOpacity: 0.52,
    };
  }

  if (register === "over-footage-glass") {
    return {
      isDark: true,
      isGlass: true,
      canvasBg: "rgba(15, 25, 35, 0.62)",
      oceanWash: OVER_FOOTAGE_PALETTE.glassPrimary,
      gridLine: "rgba(255, 246, 229, 0.05)",
      graticuleStroke: "rgba(191, 214, 234, 0.15)",
      sphereOutline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
      landBase: "rgba(28, 43, 58, 0.72)",
      landStroke: "rgba(191, 214, 234, 0.34)",
      primaryFill: "#336494",
      primaryStroke: "#FFF6E5",
      primaryInnerRim: "rgba(255, 246, 229, 0.28)",
      secondaryFill: "#27736F",
      secondaryStroke: "#4FB3AE",
      alertFill: "#8A2C1D",
      alertStroke: "#E27358",
      hatchStroke: "rgba(255, 246, 229, 0.20)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkSecondary: OVER_FOOTAGE_PALETTE.textMuted,
      cardBg: "rgba(15, 25, 35, 0.92)",
      cardBorder: OVER_FOOTAGE_PALETTE.glassBorder,
      accentPrimary: OVER_FOOTAGE_PALETTE.accentPrimary,
      accentSecondary: OVER_FOOTAGE_PALETTE.chartSecondary,
      accentAlert: OVER_FOOTAGE_PALETTE.brickRedText,
      accentCapital: OVER_FOOTAGE_PALETTE.accentWarm,
      pinRingBg: "#0F1923",
      shadow: "0 22px 48px rgba(15, 25, 35, 0.48)",
      shadowColor: "#0A121A",
      shadowOpacity: 0.48,
    };
  }

  // Default: "page-editorial" (#FAF8F3 warm milk ocean + #F4F1E8 paper land + #1C2B3A deep navy ink)
  return {
    isDark: false,
    isGlass: false,
    canvasBg: PAGE_PALETTE.paperLight,
    oceanWash: "radial-gradient(ellipse at 52% 48%, #FCFBF7 0%, #F7F5EE 62%, #EFECE2 100%)",
    gridLine: COLORS.gridLine,
    graticuleStroke: "rgba(28, 43, 58, 0.085)",
    sphereOutline: PAGE_PALETTE.paperBorder,
    landBase: "#F4F1E8",
    landStroke: "rgba(28, 43, 58, 0.24)",
    primaryFill: PAGE_PALETTE.navy,
    primaryStroke: PAGE_PALETTE.navyDeep,
    primaryInnerRim: "rgba(191, 214, 234, 0.28)",
    secondaryFill: PAGE_PALETTE.gold,
    secondaryStroke: PAGE_PALETTE.navy,
    alertFill: "#9B3827",
    alertStroke: "#5E1E14",
    hatchStroke: "rgba(250, 248, 243, 0.20)",
    inkHeadline: PAGE_PALETTE.navy,
    inkBody: PAGE_PALETTE.navy,
    inkSecondary: "#364656",
    cardBg: "#FAF8F3",
    cardBorder: "#D7D2C6",
    accentPrimary: PAGE_PALETTE.navy,
    accentSecondary: PAGE_PALETTE.chartSecondary,
    accentAlert: "#8A2C1D",
    accentCapital: PAGE_PALETTE.gold,
    pinRingBg: PAGE_PALETTE.paperLight,
    shadow: "0 16px 36px rgba(28, 43, 58, 0.13)",
    shadowColor: "#14202C",
    shadowOpacity: 0.16,
  };
}

function toneToColor(tone: MapTone | undefined, pal: RegisterPalette): string {
  if (tone === "alert") return pal.accentAlert;
  if (tone === "secondary") return pal.accentSecondary;
  if (tone === "capital") return pal.accentCapital;
  return pal.accentPrimary;
}

const SCOPE_ENVELOPES: Readonly<Record<Exclude<MapScope, "usa" | "world" | "bbox">, GeoBoundingBox>> = {
  europe: [
    [-15, 34],
    [40, 67],
  ],
  "east-asia": [
    [93, -7],
    [148, 47],
  ],
  "middle-east": [
    [24, 9],
    [64, 42],
  ],
  americas: [
    [-126, -54],
    [-34, 54],
  ],
};

function makeEnvelopeFeature(bbox: GeoBoundingBox): Feature<Geometry> {
  const minLon = bbox[0][0];
  const minLat = bbox[0][1];
  const maxLon = bbox[1][0];
  const maxLat = bbox[1][1];
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "MultiPoint",
      coordinates: [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [(minLon + maxLon) * 0.5, (minLat + maxLat) * 0.5],
      ],
    },
  };
}

function buildProjection(
  scope: MapScope,
  bbox: GeoBoundingBox,
  width: number,
  height: number
): d3.GeoProjection {
  const padX = Math.round(width * 0.065);
  const padTop = Math.round(height * 0.13);
  const padBottom = Math.round(height * 0.1);

  if (scope === "usa") {
    const fc = topojson.feature(
      US_TOPOLOGY,
      US_TOPOLOGY.objects.nation
    ) as FeatureCollection<Geometry, AtlasFeatureProps>;
    return d3.geoAlbersUsa().fitExtent(
      [
        [padX, padTop],
        [width - padX, height - padBottom],
      ],
      fc
    );
  }

  if (scope === "world") {
    const sphere: d3.GeoSphere = { type: "Sphere" };
    return d3.geoNaturalEarth1().fitExtent(
      [
        [padX, padTop],
        [width - padX, height - padBottom],
      ],
      sphere
    );
  }

  const targetBox = scope === "bbox" ? bbox : SCOPE_ENVELOPES[scope];
  const envFeature = makeEnvelopeFeature(targetBox);
  return d3.geoNaturalEarth1().fitExtent(
    [
      [padX, padTop],
      [width - padX, height - padBottom],
    ],
    envFeature
  );
}

interface ProjectedArc {
  spec: MapArcSpec;
  d: string;
  severX?: number;
  severY?: number;
  midX: number;
  midY: number;
  fromPx: readonly [number, number];
  toPx: readonly [number, number];
  ctrlPx?: readonly [number, number];
  isUsaBezier: boolean;
}

interface ProjectedWarning {
  spec: MapWarningSpec;
  x: number;
  y: number;
  radiusPx: number;
}

// ============================================================================
// Pure 2D Computational Geometry Helpers for Callout Solver
// ============================================================================

function clampNum(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function aabbOverlapArea(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): number {
  const ox = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
  const oy = Math.min(ay + ah, by + bh) - Math.max(ay, by);
  if (ox <= 0 || oy <= 0) return 0;
  return ox * oy;
}

function distPointToBox(
  px: number,
  py: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): number {
  const cx = clampNum(px, bx, bx + bw);
  const cy = clampNum(py, by, by + bh);
  return Math.hypot(px - cx, py - cy);
}

function ccw(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function segmentsIntersect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): boolean {
  // Ignore coincident endpoints
  if (
    (Math.abs(ax - cx) < 1e-3 && Math.abs(ay - cy) < 1e-3) ||
    (Math.abs(ax - dx) < 1e-3 && Math.abs(ay - dy) < 1e-3) ||
    (Math.abs(bx - cx) < 1e-3 && Math.abs(by - cy) < 1e-3) ||
    (Math.abs(bx - dx) < 1e-3 && Math.abs(by - dy) < 1e-3)
  ) {
    return false;
  }
  const d1 = ccw(cx, cy, dx, dy, ax, ay);
  const d2 = ccw(cx, cy, dx, dy, bx, by);
  const d3 = ccw(ax, ay, bx, by, cx, cy);
  const d4 = ccw(ax, ay, bx, by, dx, dy);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function segmentIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  if (
    (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) ||
    (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh)
  ) {
    return true;
  }
  return (
    segmentsIntersect(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
    segmentsIntersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
    segmentsIntersect(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
    segmentsIntersect(x1, y1, x2, y2, rx, ry + rh, rx, ry)
  );
}

function estimateCalloutDimensions(
  pin: MapPinSpec,
  uiScale: number
): { width: number; height: number } {
  const labelW = pin.label.length * 8.2;
  const subStr =
    pin.sublabel ?? `${pin.coordinates[1].toFixed(1)}°, ${pin.coordinates[0].toFixed(1)}°`;
  const subW = subStr.length * 6.45;
  const metricW = pin.metric ? pin.metric.length * 7.2 : 0;
  const rawW = Math.max(labelW, subW, metricW) + 34;
  const width = Math.round(clampNum(rawW, 206, 298) * uiScale);
  const height = Math.round((pin.metric ? 64 : 48) * uiScale);
  return { width, height };
}

function computeLeaderAnchorAndElbow(
  px: number,
  py: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  uiScale: number
): {
  anchorX: number;
  anchorY: number;
  elbowX: number;
  elbowY: number;
  accentSide: "left" | "right";
} {
  const cx = boxX + boxW * 0.5;
  const cy = boxY + boxH * 0.5;
  const dx = cx - px;
  const dy = cy - py;

  const normX = Math.abs(dx) / Math.max(1, boxW * 0.5);
  const normY = Math.abs(dy) / Math.max(1, boxH * 0.5);

  if (normX >= normY * 0.92) {
    // East or West edge attachment
    const isEast = dx >= 0;
    const anchorX = isEast ? boxX : boxX + boxW;
    const anchorY = cy;
    const span = Math.abs(anchorX - px);
    const step = Math.min(24 * uiScale, span * 0.45);
    const elbowX = isEast ? px + step : px - step;
    const elbowY = anchorY;
    return {
      anchorX,
      anchorY,
      elbowX,
      elbowY,
      accentSide: isEast ? "left" : "right",
    };
  }

  // North or South edge attachment
  const isSouth = dy >= 0;
  const pad = Math.min(28 * uiScale, boxW * 0.25);
  const anchorX = clampNum(px, boxX + pad, boxX + boxW - pad);
  const anchorY = isSouth ? boxY : boxY + boxH;
  const spanY = Math.abs(anchorY - py);
  const stepY = Math.min(22 * uiScale, spanY * 0.45);
  const elbowX = anchorX;
  const elbowY = isSouth ? py + stepY : py - stepY;

  return {
    anchorX,
    anchorY,
    elbowX,
    elbowY,
    accentSide: "left",
  };
}

export function buildScreenChromeObstacles(
  stageWidth: number,
  stageHeight: number,
  showChrome: boolean,
  compactCard: boolean,
  extraReservedRects?: ReadonlyArray<ScreenObstacleRect>
): ScreenObstacleRect[] {
  const obs: ScreenObstacleRect[] = [];
  if (showChrome && !compactCard) {
    // Top-left editorial title card (strictly guards x < 680, y < 185 & full 64+680 plate)
    obs.push({
      x: 0,
      y: 0,
      width: Math.min(stageWidth * 0.46, 760),
      height: Math.min(stageHeight * 0.22, 204),
      label: "top-left-title-card",
    });
    // Top-right metric badge & chapter pill (strictly guards x > 1360, y < 200)
    const trLeft = Math.min(stageWidth - 460, 1348);
    obs.push({
      x: Math.max(0, trLeft),
      y: 0,
      width: stageWidth - Math.max(0, trLeft),
      height: Math.min(stageHeight * 0.24, 214),
      label: "top-right-metric-card",
    });
    // Bottom telemetry strip & source badge (strictly guards y > 950)
    const bottomTop = Math.min(stageHeight - 110, 944);
    obs.push({
      x: 0,
      y: Math.max(0, bottomTop),
      width: stageWidth,
      height: stageHeight - Math.max(0, bottomTop),
      label: "bottom-telemetry-bar",
    });
  } else if (showChrome && compactCard) {
    obs.push({
      x: 0,
      y: 0,
      width: stageWidth * 0.94,
      height: Math.min(116, stageHeight * 0.22),
      label: "compact-title-card",
    });
    obs.push({
      x: 0,
      y: stageHeight - 36,
      width: stageWidth,
      height: 36,
      label: "compact-bottom-safe",
    });
  }

  if (extraReservedRects && extraReservedRects.length > 0) {
    for (let i = 0; i < extraReservedRects.length; i++) {
      obs.push(extraReservedRects[i]);
    }
  }
  return obs;
}

const CANDIDATE_ANGLES_RAD: readonly number[] = [
  0,
  -Math.PI / 4,
  Math.PI / 4,
  Math.PI,
  (-3 * Math.PI) / 4,
  (3 * Math.PI) / 4,
  -Math.PI / 2,
  Math.PI / 2,
  -Math.PI / 8,
  Math.PI / 8,
  (-3 * Math.PI) / 8,
  (3 * Math.PI) / 8,
  (-5 * Math.PI) / 8,
  (5 * Math.PI) / 8,
  (-7 * Math.PI) / 8,
  (7 * Math.PI) / 8,
];

/**
 * True 2D Multi-Slot & Force-Repulsion Callout Solver in Screen Space.
 * Guarantees zero 2D AABB overlap (>= 18px padding), zero overlap with top-left/top-right/bottom chrome,
 * zero overlap with any pin marker dot (radius >= 26px), and minimal leader crossings.
 */
export function solveScreenSpaceCallouts(
  rawPins: ReadonlyArray<{ spec: MapPinSpec; x: number; y: number }>,
  options: SolveCalloutsOptions
): SolvedPinCallout[] {
  if (rawPins.length === 0) return [];

  const {
    stageWidth,
    stageHeight,
    focusPoint,
    targetZoom,
    showChrome,
    compactCard,
    extraReservedRects,
    arcMidpoints = [],
  } = options;

  const uiScale = stageWidth < 1000 ? clampNum(stageWidth / 960, 0.72, 1.0) : 1.0;
  const minCardGap = options.minCardGap ?? 22 * uiScale;
  const minPinRadius = options.minPinRadius ?? 28 * uiScale;
  const safeMarginX = 28 * uiScale;
  const safeMarginY = 28 * uiScale;

  const obstacles = buildScreenChromeObstacles(
    stageWidth,
    stageHeight,
    showChrome,
    compactCard,
    extraReservedRects
  );

  interface WorkingNode {
    origIdx: number;
    spec: MapPinSpec;
    mapX: number;
    mapY: number;
    screenX: number;
    screenY: number;
    boxW: number;
    boxH: number;
    boxX: number;
    boxY: number;
    anchorX: number;
    anchorY: number;
    elbowX: number;
    elbowY: number;
    accentSide: "left" | "right";
    placed: boolean;
  }

  const nodes: WorkingNode[] = rawPins.map((p, idx) => {
    const sx = stageWidth * 0.5 + targetZoom * (p.x - focusPoint[0]);
    const sy = stageHeight * 0.5 + targetZoom * (p.y - focusPoint[1]);
    const dims = estimateCalloutDimensions(p.spec, uiScale);
    return {
      origIdx: idx,
      spec: p.spec,
      mapX: p.x,
      mapY: p.y,
      screenX: sx,
      screenY: sy,
      boxW: dims.width,
      boxH: dims.height,
      boxX: sx,
      boxY: sy,
      anchorX: sx,
      anchorY: sy,
      elbowX: sx,
      elbowY: sy,
      accentSide: "left",
      placed: false,
    };
  });

  // Compute pin cluster centroid so cards naturally fan outward from dense hubs
  let centroidX = 0;
  let centroidY = 0;
  for (let i = 0; i < nodes.length; i++) {
    centroidX += nodes[i].screenX;
    centroidY += nodes[i].screenY;
  }
  centroidX /= nodes.length;
  centroidY /= nodes.length;

  // Deterministic order: highest local congestion first
  const order = nodes.map((_, i) => i);
  const congestion = nodes.map((n, i) => {
    let c = 0;
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = Math.hypot(nodes[j].screenX - n.screenX, nodes[j].screenY - n.screenY);
      c += 1000 / (d + 24);
    }
    return c;
  });
  order.sort((a, b) => {
    const diff = congestion[b] - congestion[a];
    if (Math.abs(diff) > 1e-4) return diff;
    return a - b;
  });

  const rings = [38, 68, 108, 158, 218, 282].map((r) => r * uiScale);

  const scoreCandidate = (
    idx: number,
    candX: number,
    candY: number
  ): {
    score: number;
    anchorX: number;
    anchorY: number;
    elbowX: number;
    elbowY: number;
    accentSide: "left" | "right";
  } => {
    const node = nodes[idx];
    const w = node.boxW;
    const h = node.boxH;
    const routing = computeLeaderAnchorAndElbow(
      node.screenX,
      node.screenY,
      candX,
      candY,
      w,
      h,
      uiScale
    );

    let penalty = 0;

    // 1. Card-to-card overlap penalty with required >= 18px (here 22px) padding
    for (let j = 0; j < nodes.length; j++) {
      if (j === idx || !nodes[j].placed) continue;
      const other = nodes[j];
      const area = aabbOverlapArea(
        candX - minCardGap * 0.5,
        candY - minCardGap * 0.5,
        w + minCardGap,
        h + minCardGap,
        other.boxX - minCardGap * 0.5,
        other.boxY - minCardGap * 0.5,
        other.boxW + minCardGap,
        other.boxH + minCardGap
      );
      if (area > 0) {
        penalty += 140000 + area * 35;
      }
    }

    // 2. Chrome obstacle overlap penalty
    const obsPad = 8 * uiScale;
    for (let o = 0; o < obstacles.length; o++) {
      const ob = obstacles[o];
      const area = aabbOverlapArea(
        candX - obsPad,
        candY - obsPad,
        w + obsPad * 2,
        h + obsPad * 2,
        ob.x,
        ob.y,
        ob.width,
        ob.height
      );
      if (area > 0) {
        penalty += 110000 + area * 28;
      }
    }

    // 3. Pin marker dot exclusion (radius >= 26px against EVERY pin)
    for (let k = 0; k < nodes.length; k++) {
      const pk = nodes[k];
      const dPin = distPointToBox(pk.screenX, pk.screenY, candX, candY, w, h);
      if (dPin < minPinRadius) {
        const pen = minPinRadius - dPin;
        penalty += 120000 + pen * 5500;
      }
    }

    // 4. Leader-line crossings & leader-through-card intersections
    const s1x1 = node.screenX;
    const s1y1 = node.screenY;
    const s1x2 = routing.elbowX;
    const s1y2 = routing.elbowY;
    const s2x1 = routing.elbowX;
    const s2y1 = routing.elbowY;
    const s2x2 = routing.anchorX;
    const s2y2 = routing.anchorY;

    const leaderRectPad = 4 * uiScale;
    for (let j = 0; j < nodes.length; j++) {
      if (j === idx || !nodes[j].placed) continue;
      const other = nodes[j];
      const o1x1 = other.screenX;
      const o1y1 = other.screenY;
      const o1x2 = other.elbowX;
      const o1y2 = other.elbowY;
      const o2x1 = other.elbowX;
      const o2y1 = other.elbowY;
      const o2x2 = other.anchorX;
      const o2y2 = other.anchorY;

      let crosses = 0;
      if (segmentsIntersect(s1x1, s1y1, s1x2, s1y2, o1x1, o1y1, o1x2, o1y2)) crosses++;
      if (segmentsIntersect(s1x1, s1y1, s1x2, s1y2, o2x1, o2y1, o2x2, o2y2)) crosses++;
      if (segmentsIntersect(s2x1, s2y1, s2x2, s2y2, o1x1, o1y1, o1x2, o1y2)) crosses++;
      if (segmentsIntersect(s2x1, s2y1, s2x2, s2y2, o2x1, o2y1, o2x2, o2y2)) crosses++;
      if (crosses > 0) {
        penalty += crosses * 24000;
      }

      if (
        segmentIntersectsRect(
          s1x1,
          s1y1,
          s1x2,
          s1y2,
          other.boxX - leaderRectPad,
          other.boxY - leaderRectPad,
          other.boxW + leaderRectPad * 2,
          other.boxH + leaderRectPad * 2
        ) ||
        segmentIntersectsRect(
          s2x1,
          s2y1,
          s2x2,
          s2y2,
          other.boxX - leaderRectPad,
          other.boxY - leaderRectPad,
          other.boxW + leaderRectPad * 2,
          other.boxH + leaderRectPad * 2
        )
      ) {
        penalty += 26000;
      }

      if (
        segmentIntersectsRect(
          o1x1,
          o1y1,
          o1x2,
          o1y2,
          candX - leaderRectPad,
          candY - leaderRectPad,
          w + leaderRectPad * 2,
          h + leaderRectPad * 2
        ) ||
        segmentIntersectsRect(
          o2x1,
          o2y1,
          o2x2,
          o2y2,
          candX - leaderRectPad,
          candY - leaderRectPad,
          w + leaderRectPad * 2,
          h + leaderRectPad * 2
        )
      ) {
        penalty += 26000;
      }
    }

    // 5. Gentle avoidance of geodesic arc midpoints so routes stay clearly visible
    for (let m = 0; m < arcMidpoints.length; m++) {
      const am = arcMidpoints[m];
      const sx = stageWidth * 0.5 + targetZoom * (am[0] - focusPoint[0]);
      const sy = stageHeight * 0.5 + targetZoom * (am[1] - focusPoint[1]);
      if (distPointToBox(sx, sy, candX, candY, w, h) < 16 * uiScale) {
        penalty += 950;
      }
    }

    // 6. Leader length & outward fanning bias
    const leaderLen =
      Math.hypot(routing.elbowX - node.screenX, routing.elbowY - node.screenY) +
      Math.hypot(routing.anchorX - routing.elbowX, routing.anchorY - routing.elbowY);
    penalty += leaderLen * 1.45;

    const outVecX = node.screenX - centroidX;
    const outVecY = node.screenY - centroidY;
    const outNorm = Math.hypot(outVecX, outVecY);
    if (outNorm > 4 && nodes.length > 1) {
      const boxVecX = candX + w * 0.5 - node.screenX;
      const boxVecY = candY + h * 0.5 - node.screenY;
      const boxNorm = Math.hypot(boxVecX, boxVecY) || 1;
      const dot = (outVecX / outNorm) * (boxVecX / boxNorm) + (outVecY / outNorm) * (boxVecY / boxNorm);
      penalty -= dot * 32;
    }

    return {
      score: penalty,
      ...routing,
    };
  };

  const evaluateBestSlotForPin = (idx: number) => {
    const node = nodes[idx];
    const halfW = node.boxW * 0.5;
    const halfH = node.boxH * 0.5;
    let bestScore = Infinity;
    let bestBoxX = clampNum(
      node.screenX + 38 * uiScale,
      safeMarginX,
      stageWidth - safeMarginX - node.boxW
    );
    let bestBoxY = clampNum(
      node.screenY - halfH,
      safeMarginY,
      stageHeight - safeMarginY - node.boxH
    );
    let bestRouting = computeLeaderAnchorAndElbow(
      node.screenX,
      node.screenY,
      bestBoxX,
      bestBoxY,
      node.boxW,
      node.boxH,
      uiScale
    );

    for (let rIdx = 0; rIdx < rings.length; rIdx++) {
      const gap = rings[rIdx];
      for (let aIdx = 0; aIdx < CANDIDATE_ANGLES_RAD.length; aIdx++) {
        const theta = CANDIDATE_ANGLES_RAD[aIdx];
        const ux = Math.cos(theta);
        const uy = Math.sin(theta);
        const boxExtent = Math.min(
          Math.abs(ux) > 1e-4 ? halfW / Math.abs(ux) : 1e9,
          Math.abs(uy) > 1e-4 ? halfH / Math.abs(uy) : 1e9
        );
        const centerCandX = node.screenX + ux * (gap + boxExtent);
        const centerCandY = node.screenY + uy * (gap + boxExtent);
        const candX = clampNum(
          centerCandX - halfW,
          safeMarginX,
          stageWidth - safeMarginX - node.boxW
        );
        const candY = clampNum(
          centerCandY - halfH,
          safeMarginY,
          stageHeight - safeMarginY - node.boxH
        );

        const evaluated = scoreCandidate(idx, candX, candY);
        const angleBias = aIdx < 6 ? -14 : aIdx < 8 ? -6 : 0;
        const total = evaluated.score + angleBias;

        if (total < bestScore) {
          bestScore = total;
          bestBoxX = candX;
          bestBoxY = candY;
          bestRouting = {
            anchorX: evaluated.anchorX,
            anchorY: evaluated.anchorY,
            elbowX: evaluated.elbowX,
            elbowY: evaluated.elbowY,
            accentSide: evaluated.accentSide,
          };
        }
      }
    }

    node.boxX = bestBoxX;
    node.boxY = bestBoxY;
    node.anchorX = bestRouting.anchorX;
    node.anchorY = bestRouting.anchorY;
    node.elbowX = bestRouting.elbowX;
    node.elbowY = bestRouting.elbowY;
    node.accentSide = bestRouting.accentSide;
    node.placed = true;
  };

  // Phase 1: Multi-slot greedy assignment in congestion-first order
  for (let oi = 0; oi < order.length; oi++) {
    evaluateBestSlotForPin(order[oi]);
  }

  // Phase 2: 2 coordinate-descent refinement passes across full pin set
  for (let pass = 0; pass < 2; pass++) {
    for (let oi = 0; oi < order.length; oi++) {
      const idx = order[oi];
      nodes[idx].placed = false;
      evaluateBestSlotForPin(idx);
    }
  }

  // Phase 3: Deterministic 60-iteration 2D force-repulsion & hard constraint projection
  for (let iter = 0; iter < 60; iter++) {
    const isFinalProjection = iter >= 44;
    const gain = isFinalProjection ? 1.0 : 0.65;

    // 3A. Pairwise AABB repulsion with >= minCardGap
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const acx = a.boxX + a.boxW * 0.5;
        const acy = a.boxY + a.boxH * 0.5;
        const bcx = b.boxX + b.boxW * 0.5;
        const bcy = b.boxY + b.boxH * 0.5;
        const dx = bcx - acx;
        const dy = bcy - acy;
        const reqX = (a.boxW + b.boxW) * 0.5 + minCardGap;
        const reqY = (a.boxH + b.boxH) * 0.5 + minCardGap;
        const penX = reqX - Math.abs(dx);
        const penY = reqY - Math.abs(dy);

        if (penX > 0 && penY > 0) {
          if (penY <= penX * 1.15) {
            const dirY = Math.abs(dy) > 1e-3 ? Math.sign(dy) : a.origIdx < b.origIdx ? 1 : -1;
            const shift = penY * 0.52 * gain * dirY;
            a.boxY -= shift;
            b.boxY += shift;
          } else {
            const dirX = Math.abs(dx) > 1e-3 ? Math.sign(dx) : a.origIdx < b.origIdx ? 1 : -1;
            const shift = penX * 0.52 * gain * dirX;
            a.boxX -= shift;
            b.boxX += shift;
          }
        }
      }
    }

    // 3B. Pin marker exclusion (every pin circle radius >= minPinRadius)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let k = 0; k < nodes.length; k++) {
        const pk = nodes[k];
        const closestX = clampNum(pk.screenX, a.boxX, a.boxX + a.boxW);
        const closestY = clampNum(pk.screenY, a.boxY, a.boxY + a.boxH);
        const vx = closestX - pk.screenX;
        const vy = closestY - pk.screenY;
        const dist = Math.hypot(vx, vy);
        if (dist < minPinRadius) {
          const push = (minPinRadius - dist + 0.5) * gain;
          if (dist > 1e-3) {
            a.boxX += (vx / dist) * push;
            a.boxY += (vy / dist) * push;
          } else {
            const cVecX = a.boxX + a.boxW * 0.5 - pk.screenX;
            const cVecY = a.boxY + a.boxH * 0.5 - pk.screenY;
            const cd = Math.hypot(cVecX, cVecY);
            if (cd > 1e-3) {
              a.boxX += (cVecX / cd) * push;
              a.boxY += (cVecY / cd) * push;
            } else {
              a.boxX += push;
              a.boxY -= push;
            }
          }
        }
      }
    }

    // 3C. Chrome obstacle push-out
    const obsMargin = 6 * uiScale;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let o = 0; o < obstacles.length; o++) {
        const ob = obstacles[o];
        const ox1 = ob.x - obsMargin;
        const oy1 = ob.y - obsMargin;
        const ox2 = ob.x + ob.width + obsMargin;
        const oy2 = ob.y + ob.height + obsMargin;
        if (
          a.boxX < ox2 &&
          a.boxX + a.boxW > ox1 &&
          a.boxY < oy2 &&
          a.boxY + a.boxH > oy1
        ) {
          const pushLeft = a.boxX + a.boxW - ox1;
          const pushRight = ox2 - a.boxX;
          const pushUp = a.boxY + a.boxH - oy1;
          const pushDown = oy2 - a.boxY;

          const choices: Array<{ axis: "x" | "y"; delta: number; mag: number }> = [];
          if (ox1 - a.boxW >= safeMarginX) choices.push({ axis: "x", delta: -pushLeft, mag: pushLeft });
          if (ox2 + a.boxW <= stageWidth - safeMarginX) choices.push({ axis: "x", delta: pushRight, mag: pushRight });
          if (oy1 - a.boxH >= safeMarginY) choices.push({ axis: "y", delta: -pushUp, mag: pushUp });
          if (oy2 + a.boxH <= stageHeight - safeMarginY) choices.push({ axis: "y", delta: pushDown, mag: pushDown });

          if (choices.length > 0) {
            choices.sort((c1, c2) => c1.mag - c2.mag);
            const best = choices[0];
            if (best.axis === "x") a.boxX += best.delta * gain;
            else a.boxY += best.delta * gain;
          }
        }
      }

      // 3D. Viewport safe clamp
      a.boxX = clampNum(a.boxX, safeMarginX, stageWidth - safeMarginX - a.boxW);
      a.boxY = clampNum(a.boxY, safeMarginY, stageHeight - safeMarginY - a.boxH);
    }
  }

  // Finalize leader routing anchors after all repulsion passes
  return nodes.map((n) => {
    const routing = computeLeaderAnchorAndElbow(
      n.screenX,
      n.screenY,
      n.boxX,
      n.boxY,
      n.boxW,
      n.boxH,
      uiScale
    );
    return {
      spec: n.spec,
      mapX: n.mapX,
      mapY: n.mapY,
      screenX: n.screenX,
      screenY: n.screenY,
      boxX: n.boxX,
      boxY: n.boxY,
      boxWidth: n.boxW,
      boxHeight: n.boxH,
      anchorX: routing.anchorX,
      anchorY: routing.anchorY,
      elbowX: routing.elbowX,
      elbowY: routing.elbowY,
      accentSide: routing.accentSide,
    };
  });
}

/**
 * Deterministic layout builder used both by CinemaMapStage and automated multi-corridor verification.
 */
export function computeCinemaMapLayout(
  resolvedScene: ResolvedGeoScene,
  options?: {
    scopeOverride?: MapScope;
    stageWidth?: number;
    stageHeight?: number;
    showChrome?: boolean;
    compactCard?: boolean;
    reservedRects?: ReadonlyArray<ScreenObstacleRect>;
  }
) {
  const compactCard = options?.compactCard ?? false;
  const showChrome = options?.showChrome ?? true;
  const stageWidth = options?.stageWidth ?? (compactCard ? 640 : 1920);
  const stageHeight = options?.stageHeight ?? (compactCard ? 620 : 1080);
  const activeScope = options?.scopeOverride ?? resolvedScene.scope;

  const geoFeatures: Array<Feature<Geometry, AtlasFeatureProps>> = (() => {
    if (activeScope === "usa") {
      const fc = topojson.feature(
        US_TOPOLOGY,
        US_TOPOLOGY.objects.states
      ) as FeatureCollection<Geometry, AtlasFeatureProps>;
      return fc.features.filter((f) => {
        const idNum = Number(f.id);
        return Number.isFinite(idNum) && idNum <= 56;
      });
    }
    const fc = topojson.feature(
      WORLD_TOPOLOGY,
      WORLD_TOPOLOGY.objects.countries
    ) as FeatureCollection<Geometry, AtlasFeatureProps>;
    const wantsAntarctica = resolvedScene.primaryCountryIds.indexOf("010") !== -1;
    return fc.features.filter((f) => wantsAntarctica || String(f.id) !== "010");
  })();

  const projection = buildProjection(activeScope, resolvedScene.bbox, stageWidth, stageHeight);
  const pathGenerator = d3.geoPath().projection(projection);

  const graticulePath = (() => {
    if (activeScope === "usa") return null;
    const step: [number, number] = activeScope === "world" ? [20, 20] : [10, 10];
    const grat = d3.geoGraticule().step(step)();
    return pathGenerator(grat) ?? null;
  })();

  const spherePath = (() => {
    if (activeScope !== "world") return null;
    const sphere: d3.GeoSphere = { type: "Sphere" };
    return pathGenerator(sphere) ?? null;
  })();

  const primarySet = new Set<string>(
    activeScope === "usa" ? resolvedScene.primaryStateFips : resolvedScene.primaryCountryIds
  );
  const secondarySet = new Set<string>(
    activeScope === "usa" ? resolvedScene.secondaryStateFips : resolvedScene.secondaryCountryIds
  );
  const alertSet = new Set<string>(
    activeScope === "usa" ? resolvedScene.alertStateFips : resolvedScene.alertCountryIds
  );

  const basePolygons: Array<{ key: string; d: string; tier: "base" }> = [];
  const secondaryPolygons: Array<{ key: string; d: string; tier: "secondary" }> = [];
  const primaryPolygons: Array<{ key: string; d: string; tier: "primary" }> = [];
  const alertPolygons: Array<{ key: string; d: string; tier: "alert" }> = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const expandBounds = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (let i = 0; i < geoFeatures.length; i++) {
    const f = geoFeatures[i];
    const rawId = f.id !== undefined && f.id !== null ? String(f.id) : "";
    const propName = f.properties?.name ?? "";
    const syntheticId =
      propName === "Kosovo"
        ? "X01"
        : propName === "N. Cyprus"
          ? "X02"
          : propName === "Somaliland"
            ? "X03"
            : rawId;

    const d = pathGenerator(f);
    if (!d) continue;

    let tier: "base" | "secondary" | "primary" | "alert" = "base";
    if (alertSet.has(syntheticId)) {
      tier = "alert";
    } else if (primarySet.has(syntheticId)) {
      tier = "primary";
    } else if (secondarySet.has(syntheticId)) {
      tier = "secondary";
    }

    if (tier === "primary" || tier === "alert") {
      const b = pathGenerator.bounds(f);
      const spanW = b[1][0] - b[0][0];
      if (spanW > 0 && spanW < stageWidth * 0.58) {
        expandBounds(b[0][0], b[0][1]);
        expandBounds(b[1][0], b[1][1]);
      } else {
        const c = pathGenerator.centroid(f);
        expandBounds(c[0], c[1]);
      }
    }

    const key = `${activeScope}-${syntheticId || i}`;
    if (tier === "alert") alertPolygons.push({ key, d, tier });
    else if (tier === "primary") primaryPolygons.push({ key, d, tier });
    else if (tier === "secondary") secondaryPolygons.push({ key, d, tier });
    else basePolygons.push({ key, d, tier });
  }

  const rawProjectedPins: Array<{ spec: MapPinSpec; x: number; y: number }> = [];
  for (let i = 0; i < resolvedScene.pins.length; i++) {
    const pin = resolvedScene.pins[i];
    const pt = projection(pin.coordinates);
    if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
      rawProjectedPins.push({ spec: pin, x: pt[0], y: pt[1] });
      expandBounds(pt[0], pt[1]);
    }
  }

  const projectedArcs: ProjectedArc[] = [];
  const arcMidpoints: Array<readonly [number, number]> = [];
  for (let i = 0; i < resolvedScene.arcs.length; i++) {
    const arc = resolvedScene.arcs[i];
    const pFrom = projection(arc.from);
    const pTo = projection(arc.to);
    if (!pFrom || !pTo) continue;

    expandBounds(pFrom[0], pFrom[1]);
    expandBounds(pTo[0], pTo[1]);

    if (activeScope === "usa") {
      const dx = pTo[0] - pFrom[0];
      const dy = pTo[1] - pFrom[1];
      const dist = Math.hypot(dx, dy);
      const lift = Math.min(72, Math.max(18, dist * 0.22));
      const cx = (pFrom[0] + pTo[0]) * 0.5;
      const cy = (pFrom[1] + pTo[1]) * 0.5 - lift;
      const dStr = `M ${pFrom[0].toFixed(1)} ${pFrom[1].toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${pTo[0].toFixed(1)} ${pTo[1].toFixed(1)}`;
      const u = arc.severedAt ?? 0.5;
      const om = 1 - u;
      const sx = om * om * pFrom[0] + 2 * om * u * cx + u * u * pTo[0];
      const sy = om * om * pFrom[1] + 2 * om * u * cy + u * u * pTo[1];
      arcMidpoints.push([0.25 * pFrom[0] + 0.5 * cx + 0.25 * pTo[0], 0.25 * pFrom[1] + 0.5 * cy + 0.25 * pTo[1]]);
      projectedArcs.push({
        spec: arc,
        d: dStr,
        severX: arc.severedAt !== undefined ? sx : undefined,
        severY: arc.severedAt !== undefined ? sy : undefined,
        midX: cx,
        midY: cy,
        fromPx: [pFrom[0], pFrom[1]],
        toPx: [pTo[0], pTo[1]],
        ctrlPx: [cx, cy],
        isUsaBezier: true,
      });
    } else {
      const geoLine: Feature<Geometry> = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [arc.from, arc.to],
        },
      };
      const dStr = pathGenerator(geoLine);
      if (!dStr) continue;
      const interp = d3.geoInterpolate(arc.from, arc.to);
      const midLonLat = interp(0.5);
      const midPt = projection(midLonLat) ?? [
        (pFrom[0] + pTo[0]) * 0.5,
        (pFrom[1] + pTo[1]) * 0.5,
      ];
      let severX: number | undefined;
      let severY: number | undefined;
      if (arc.severedAt !== undefined) {
        const sevPt = projection(interp(arc.severedAt));
        if (sevPt) {
          severX = sevPt[0];
          severY = sevPt[1];
        }
      }
      arcMidpoints.push([midPt[0], midPt[1]]);
      projectedArcs.push({
        spec: arc,
        d: dStr,
        severX,
        severY,
        midX: midPt[0],
        midY: midPt[1],
        fromPx: [pFrom[0], pFrom[1]],
        toPx: [pTo[0], pTo[1]],
        isUsaBezier: false,
      });
    }
  }

  const projectedWarnings: ProjectedWarning[] = [];
  for (let i = 0; i < resolvedScene.warnings.length; i++) {
    const w = resolvedScene.warnings[i];
    const pt = projection(w.coordinates);
    if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
      const edgePt = projection([
        w.coordinates[0] + (w.radiusDeg ?? 1.0),
        w.coordinates[1],
      ]);
      const rPx = edgePt
        ? Math.max(20, Math.min(76, Math.hypot(edgePt[0] - pt[0], edgePt[1] - pt[1])))
        : 32;
      projectedWarnings.push({ spec: w, x: pt[0], y: pt[1], radiusPx: rPx });
      expandBounds(pt[0], pt[1]);
    }
  }

  const centerProjected = projection(resolvedScene.center);
  if (!Number.isFinite(minX) && centerProjected) {
    expandBounds(centerProjected[0] - 90, centerProjected[1] - 60);
    expandBounds(centerProjected[0] + 90, centerProjected[1] + 60);
  }

  let fx = stageWidth * 0.5;
  let fy = stageHeight * 0.52;
  let zoomFit = resolvedScene.targetZoom;

  if (Number.isFinite(minX) && Number.isFinite(maxX)) {
    fx = (minX + maxX) * 0.5;
    fy = (minY + maxY) * 0.5;
    const boxW = Math.max(140, maxX - minX);
    const boxH = Math.max(100, maxY - minY);
    const autoZ = Math.min((stageWidth * 0.56) / boxW, (stageHeight * 0.54) / boxH);
    zoomFit = Math.max(1.0, Math.min(resolvedScene.targetZoom, Math.max(1.18, autoZ)));
  }

  const maxPanX = ((stageWidth * (zoomFit - 1)) / (2 * zoomFit)) * 0.85;
  const maxPanY = ((stageHeight * (zoomFit - 1)) / (2 * zoomFit)) * 0.85;
  fx = Math.max(stageWidth * 0.5 - maxPanX, Math.min(stageWidth * 0.5 + maxPanX, fx));
  fy = Math.max(stageHeight * 0.5 - maxPanY, Math.min(stageHeight * 0.5 + maxPanY, fy));
  const focusPoint: [number, number] = [fx, fy];

  const activePins = rawProjectedPins.slice(0, compactCard ? 3 : 6);
  const solvedCallouts = solveScreenSpaceCallouts(activePins, {
    stageWidth,
    stageHeight,
    focusPoint,
    targetZoom: zoomFit,
    showChrome,
    compactCard,
    extraReservedRects: options?.reservedRects,
    arcMidpoints,
  });

  const obstacles = buildScreenChromeObstacles(
    stageWidth,
    stageHeight,
    showChrome,
    compactCard,
    options?.reservedRects
  );

  return {
    stageWidth,
    stageHeight,
    activeScope,
    projection,
    graticulePath,
    spherePath,
    basePolygons,
    secondaryPolygons,
    primaryPolygons,
    alertPolygons,
    projectedArcs,
    projectedWarnings,
    focusPoint,
    computedTargetZoom: zoomFit,
    solvedCallouts,
    obstacles,
  };
}

function sampleArcPointAt(
  arc: ProjectedArc,
  u: number,
  projection: d3.GeoProjection
): readonly [number, number] | null {
  if (arc.isUsaBezier && arc.ctrlPx) {
    const om = 1 - u;
    const x = om * om * arc.fromPx[0] + 2 * om * u * arc.ctrlPx[0] + u * u * arc.toPx[0];
    const y = om * om * arc.fromPx[1] + 2 * om * u * arc.ctrlPx[1] + u * u * arc.toPx[1];
    return [x, y];
  }
  const interp = d3.geoInterpolate(arc.spec.from as LonLat, arc.spec.to as LonLat);
  const pt = projection(interp(u));
  if (!pt || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) return null;
  return [pt[0], pt[1]];
}

export const CinemaMapStage: React.FC<CinemaMapStageProps> = ({
  target,
  scene: explicitScene,
  register: registerOverride,
  paletteMode,
  scope: scopeOverride,
  title: titleOverride,
  subtitle: subtitleOverride,
  eyebrow: eyebrowOverride,
  sourceCitation,
  highlightStateFips,
  highlightStatesFips,
  region,
  highlightLabel,
  routeTone,
  enableCameraFlyIn = true,
  atFrame = 0,
  showChrome = true,
  compactCard = false,
  stageWidth: stageWidthProp,
  stageHeight: stageHeightProp,
  reservedRects,
}) => {
  const frame = useCurrentFrame();
  const { fps = 30, width = 1920, height = 1080 } = useVideoConfig();

  const stageW = stageWidthProp ?? (compactCard ? 640 : width);
  const stageH = stageHeightProp ?? (compactCard ? 620 : height);
  const uiScale = stageW < 1000 ? clampNum(stageW / 960, 0.72, 1.0) : 1.0;

  const resolvedScene = useMemo<ResolvedGeoScene>(() => {
    if (explicitScene) return explicitScene;
    if (typeof target === "string") {
      return resolveGeoQuery({
        query: target,
        label: highlightLabel,
        title: titleOverride,
        subtitle: subtitleOverride,
        scope: scopeOverride,
        region,
        register: registerOverride,
        routeTone,
        highlightStateFips,
        highlightStatesFips,
        sourceNote: sourceCitation,
      });
    }
    if (target && typeof target === "object") {
      return resolveGeoQuery({
        ...target,
        title: titleOverride ?? target.title,
        subtitle: subtitleOverride ?? target.subtitle,
        scope: scopeOverride ?? target.scope,
        register: registerOverride ?? target.register,
        routeTone: routeTone ?? target.routeTone,
        sourceNote: sourceCitation ?? target.sourceNote,
      });
    }
    return resolveGeoQuery({
      label: highlightLabel,
      title: titleOverride,
      subtitle: subtitleOverride,
      scope: scopeOverride,
      region,
      register: registerOverride,
      routeTone,
      highlightStateFips,
      highlightStatesFips,
      sourceNote: sourceCitation,
    });
  }, [
    explicitScene,
    target,
    highlightLabel,
    titleOverride,
    subtitleOverride,
    scopeOverride,
    region,
    registerOverride,
    routeTone,
    highlightStateFips,
    highlightStatesFips,
    sourceCitation,
  ]);

  const activeRegister: MapVisualRegister =
    registerOverride ??
    (paletteMode === "over-footage" ? "over-footage-glass" : resolvedScene.register);

  const pal = useMemo(() => getRegisterPalette(activeRegister), [activeRegister]);

  const layout = useMemo(
    () =>
      computeCinemaMapLayout(resolvedScene, {
        scopeOverride,
        stageWidth: stageW,
        stageHeight: stageH,
        showChrome,
        compactCard,
        reservedRects,
      }),
    [resolvedScene, scopeOverride, stageW, stageH, showChrome, compactCard, reservedRects]
  );

  const elapsed = Math.max(0, frame - atFrame);

  // Critically-damped camera fly-in (zoom 1.0 -> computedTargetZoom)
  const cameraProgress = enableCameraFlyIn
    ? spring({
        frame: Math.max(0, elapsed - 4),
        fps,
        config: CINEMA_SPRINGS.cameraGlide ?? {
          damping: 33.5,
          mass: 2.2,
          stiffness: 105,
          overshootClamping: true,
        },
      })
    : 1;

  const clampedCam = interpolate(cameraProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(
    clampedCam,
    [0, 1],
    [resolvedScene.initialZoom, layout.computedTargetZoom],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const camX = interpolate(clampedCam, [0, 1], [stageW * 0.5, layout.focusPoint[0]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camY = interpolate(clampedCam, [0, 1], [stageH * 0.5, layout.focusPoint[1]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const invScale = 1 / Math.max(1, scale);
  const strokeInv = 1 / Math.pow(Math.max(1, scale), 0.78);

  const headerProgress = spring({
    frame: Math.max(0, elapsed - 2),
    fps,
    config: SPRINGS.cardGlide ?? {
      damping: 30,
      mass: 1.1,
      stiffness: 90,
      overshootClamping: true,
    },
  });

  const arcRevealOpacity = interpolate(elapsed, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayEyebrow = eyebrowOverride ?? resolvedScene.eyebrow;
  const displayTitle = titleOverride ?? resolvedScene.title;
  const displaySubtitle = subtitleOverride ?? resolvedScene.subtitle;
  const displaySource = sourceCitation ?? resolvedScene.sourceNote;
  const routeAccent = toneToColor(resolvedScene.routeTone, pal);

  const safeId = `${resolvedScene.id.replace(/[^a-zA-Z0-9_-]/g, "")}-${activeRegister}`;
  const hatchPatternId = `atlas-alert-hatch-${safeId}`;
  const territoryShadowId = `atlas-territory-shadow-${safeId}`;
  const calloutShadowId = `atlas-callout-shadow-${safeId}`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: pal.canvasBg,
        backgroundImage: pal.oceanWash,
        borderRadius: compactCard || pal.isGlass ? "20px" : "0px",
        border: compactCard || pal.isGlass ? `1px solid ${pal.cardBorder}` : "none",
        boxShadow: compactCard || pal.isGlass ? pal.shadow : "none",
        backdropFilter: pal.isGlass ? "blur(14px) saturate(165%)" : undefined,
        WebkitBackdropFilter: pal.isGlass ? "blur(14px) saturate(165%)" : undefined,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Architectural Coordinate Grid Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${pal.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${pal.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: compactCard ? "48px 48px" : "72px 72px",
          pointerEvents: "none",
        }}
      />

      {/* Main D3 + TopoJSON SVG Cartographic Stage */}
      <svg
        width={stageW}
        height={stageH}
        viewBox={`0 0 ${stageW} ${stageH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          {/* Crisp Subtle Diagonal Warning Hatch for Strained Sub-Regions */}
          <pattern
            id={hatchPatternId}
            width={11 * strokeInv}
            height={11 * strokeInv}
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={11 * strokeInv}
              height={11 * strokeInv}
              fill={pal.alertFill}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={11 * strokeInv}
              stroke={pal.hatchStroke}
              strokeWidth={1.35 * strokeInv}
            />
          </pattern>

          {/* Soft Tactile Elevation Shadow Under Highlighted Territories */}
          <filter
            id={territoryShadowId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feDropShadow
              dx={0}
              dy={4 * invScale}
              stdDeviation={6 * invScale}
              floodColor={pal.shadowColor}
              floodOpacity={pal.isDark ? 0.55 : 0.24}
            />
          </filter>

          {/* Sharp Broadcast Drop Shadow for Editorial Callout Cards */}
          <filter
            id={calloutShadowId}
            x="-20%"
            y="-20%"
            width="145%"
            height="160%"
          >
            <feDropShadow
              dx={0}
              dy={5 * uiScale}
              stdDeviation={6.5 * uiScale}
              floodColor={pal.shadowColor}
              floodOpacity={pal.shadowOpacity}
            />
          </filter>
        </defs>

        {/* Camera-Transformed Cartographic Layer */}
        <g
          transform={`translate(${(stageW * 0.5).toFixed(2)}, ${(stageH * 0.5).toFixed(2)}) scale(${scale.toFixed(4)}) translate(${(-camX).toFixed(2)}, ${(-camY).toFixed(2)})`}
        >
          {/* 1. Spherical Rim & Graticule Coordinate Lines */}
          {layout.spherePath && (
            <path
              d={layout.spherePath}
              fill="none"
              stroke={pal.sphereOutline}
              strokeWidth={1.4 * strokeInv}
            />
          )}
          {layout.graticulePath && (
            <path
              d={layout.graticulePath}
              fill="none"
              stroke={pal.graticuleStroke}
              strokeWidth={0.95 * strokeInv}
              strokeDasharray={`${(3.5 * strokeInv).toFixed(1)} ${(3.5 * strokeInv).toFixed(1)}`}
            />
          )}

          {/* 2A. Base Non-Highlighted Land Polygons (Warm Paper + Crisp Stroke) */}
          <g>
            {layout.basePolygons.map((poly) => (
              <path
                key={poly.key}
                d={poly.d}
                fill={pal.landBase}
                stroke={pal.landStroke}
                strokeWidth={1.1 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* 2B. Highlighted Corridor Territories with Elevation Shadow & Inner Rim */}
          <g filter={`url(#${territoryShadowId})`}>
            {layout.secondaryPolygons.map((poly) => (
              <path
                key={poly.key}
                d={poly.d}
                fill={pal.secondaryFill}
                stroke={pal.secondaryStroke}
                strokeWidth={1.7 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
            {layout.primaryPolygons.map((poly) => (
              <path
                key={poly.key}
                d={poly.d}
                fill={pal.primaryFill}
                stroke={pal.primaryStroke}
                strokeWidth={2.05 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
            {layout.alertPolygons.map((poly) => (
              <path
                key={poly.key}
                d={poly.d}
                fill={`url(#${hatchPatternId})`}
                stroke={pal.alertStroke}
                strokeWidth={2.15 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* 2C. Crisp Inner Rim & Internal State Division Hairline on Highlighted Polygons */}
          <g pointerEvents="none">
            {layout.primaryPolygons.map((poly) => (
              <path
                key={`${poly.key}-rim`}
                d={poly.d}
                fill="none"
                stroke={pal.primaryInnerRim}
                strokeWidth={0.95 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
            {layout.alertPolygons.map((poly) => (
              <path
                key={`${poly.key}-rim`}
                d={poly.d}
                fill="none"
                stroke="rgba(255, 246, 229, 0.24)"
                strokeWidth={0.95 * strokeInv}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* 3. Cable-Cut / Blockade / Chokepoint Warning Zones */}
          {layout.projectedWarnings.map((warn, idx) => {
            const warnPop = spring({
              frame: Math.max(0, elapsed - 14 - idx * 4),
              fps,
              config: SPRINGS.documentSnap ?? {
                damping: 24,
                mass: 0.9,
                stiffness: 110,
                overshootClamping: true,
              },
            });
            const pulseWave = 0.9 + Math.sin((elapsed + idx * 9) * 0.14) * 0.1;
            const r = warn.radiusPx * strokeInv * warnPop;
            const isPhysicalCut =
              warn.spec.kind === "cable-cut" ||
              warn.spec.kind === "blockade" ||
              warn.spec.kind === "chokepoint-alert";
            return (
              <g
                key={`warn-${warn.spec.id}`}
                transform={`translate(${warn.x.toFixed(1)}, ${warn.y.toFixed(1)})`}
                opacity={interpolate(warnPop, [0, 1], [0, 0.92], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              >
                <circle
                  r={r * pulseWave}
                  fill="rgba(163, 64, 46, 0.11)"
                  stroke={pal.accentAlert}
                  strokeWidth={1.45 * strokeInv}
                  strokeDasharray={`${(5 * strokeInv).toFixed(1)} ${(4.5 * strokeInv).toFixed(1)}`}
                />
                {isPhysicalCut && (
                  <g transform={`scale(${strokeInv.toFixed(3)})`}>
                    <line
                      x1={-6.5}
                      y1={-6.5}
                      x2={6.5}
                      y2={6.5}
                      stroke={pal.accentAlert}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                    <line
                      x1={6.5}
                      y1={-6.5}
                      x2={-6.5}
                      y2={6.5}
                      stroke={pal.accentAlert}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* 4. Animated Dashed Great-Circle Geodesic Arcs + Traveling Pulse Bead */}
          {layout.projectedArcs.map((arc, idx) => {
            const strokeColor = toneToColor(arc.spec.tone ?? resolvedScene.routeTone, pal);
            const dashUnit = (arc.spec.dashed === false ? 12 : 8.5) * strokeInv;
            const gapUnit = (arc.spec.dashed === false ? 5 : 6) * strokeInv;
            const dashOffset = -elapsed * 1.85 * strokeInv;

            const maxTravel = arc.spec.severedAt !== undefined ? Math.max(0.15, arc.spec.severedAt - 0.04) : 1.0;
            const travelU = ((elapsed * 0.015 + idx * 0.31) % 1) * maxTravel;
            const tracerPt = sampleArcPointAt(arc, travelU, layout.projection);

            return (
              <g key={`arc-${arc.spec.id}`} opacity={arcRevealOpacity}>
                {/* Subtle Luminous Glow Halo */}
                <path
                  d={arc.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={6.4 * strokeInv}
                  strokeLinecap="round"
                  opacity={0.18}
                />
                {/* Crisp Contrast Under-Casing */}
                <path
                  d={arc.d}
                  fill="none"
                  stroke={pal.pinRingBg}
                  strokeWidth={4.1 * strokeInv}
                  strokeLinecap="round"
                  opacity={0.55}
                />
                {/* Animated Dashed Geodesic Core */}
                <path
                  d={arc.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2.55 * strokeInv}
                  strokeDasharray={`${dashUnit.toFixed(2)} ${gapUnit.toFixed(2)}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
                {/* Glowing Traveling Signal Node Pulse */}
                {tracerPt && (
                  <g>
                    <circle
                      cx={tracerPt[0]}
                      cy={tracerPt[1]}
                      r={7.5 * strokeInv}
                      fill={strokeColor}
                      opacity={0.28}
                    />
                    <circle
                      cx={tracerPt[0]}
                      cy={tracerPt[1]}
                      r={3.1 * strokeInv}
                      fill={OVER_FOOTAGE_PALETTE.textHeadline}
                      stroke={strokeColor}
                      strokeWidth={1.35 * strokeInv}
                    />
                  </g>
                )}
                {/* Severance Flash Marker on Cut Subsea Cables */}
                {arc.severX !== undefined && arc.severY !== undefined && (
                  <g
                    transform={`translate(${arc.severX.toFixed(1)}, ${arc.severY.toFixed(1)}) scale(${strokeInv.toFixed(3)})`}
                  >
                    <circle
                      r={11 + Math.sin((elapsed + idx * 7) * 0.2) * 2.5}
                      fill="rgba(163, 64, 46, 0.28)"
                    />
                    <rect
                      x={-8}
                      y={-8}
                      width={16}
                      height={16}
                      rx={3}
                      fill={PAGE_PALETTE.brickRed}
                      stroke={OVER_FOOTAGE_PALETTE.textHeadline}
                      strokeWidth={1.6}
                    />
                    <path
                      d="M -4 -4 L 4 4 M 4 -4 L -4 4"
                      stroke={OVER_FOOTAGE_PALETTE.textHeadline}
                      strokeWidth={2.1}
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Screen-Space Callout Layer: Orthogonal/Elbow Leaders, Pin Markers & Drop-Shadowed Editorial Cards */}
        <g>
          {/* Pass A: Leader Lines Under Cards & Pins */}
          {layout.solvedCallouts.map((pin, idx) => {
            const pinSpring = spring({
              frame: Math.max(0, elapsed - 10 - idx * 3),
              fps,
              config: SPRINGS.dockSnap ?? {
                damping: 26,
                mass: 0.75,
                stiffness: 140,
                overshootClamping: true,
              },
            });
            const pinOpacity = interpolate(pinSpring, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pinColor = toneToColor(pin.spec.tone ?? resolvedScene.routeTone, pal);
            const liveX = stageW * 0.5 + scale * (pin.mapX - camX);
            const liveY = stageH * 0.5 + scale * (pin.mapY - camY);
            const pts = `${liveX.toFixed(1)},${liveY.toFixed(1)} ${pin.elbowX.toFixed(1)},${pin.elbowY.toFixed(1)} ${pin.anchorX.toFixed(1)},${pin.anchorY.toFixed(1)}`;

            return (
              <g key={`leader-${pin.spec.id}`} opacity={pinOpacity}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke={pal.pinRingBg}
                  strokeWidth={3.6 * uiScale}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.78}
                />
                <polyline
                  points={pts}
                  fill="none"
                  stroke={pinColor}
                  strokeWidth={1.65 * uiScale}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.94}
                />
                <circle
                  cx={pin.anchorX}
                  cy={pin.anchorY}
                  r={2.8 * uiScale}
                  fill={pinColor}
                />
              </g>
            );
          })}

          {/* Pass B: Pulsing Facility / Substation / Port Bullseye Pins */}
          {layout.solvedCallouts.map((pin, idx) => {
            const pinSpring = spring({
              frame: Math.max(0, elapsed - 10 - idx * 3),
              fps,
              config: SPRINGS.dockSnap ?? {
                damping: 26,
                mass: 0.75,
                stiffness: 140,
                overshootClamping: true,
              },
            });
            const pinOpacity = interpolate(pinSpring, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pinColor = toneToColor(pin.spec.tone ?? resolvedScene.routeTone, pal);
            const liveX = stageW * 0.5 + scale * (pin.mapX - camX);
            const liveY = stageH * 0.5 + scale * (pin.mapY - camY);
            const pulsePhase = ((elapsed * 0.032 + idx * 0.37) % 1);
            const pulseR = (7 + pulsePhase * 15) * uiScale;
            const pulseAlpha = (1 - pulsePhase) * 0.42;
            const haloR = (11.5 + Math.sin((elapsed + idx * 11) * 0.14) * 2.5) * uiScale;

            return (
              <g key={`marker-${pin.spec.id}`} opacity={pinOpacity}>
                {(pin.spec.pulse ?? idx === 0) && (
                  <>
                    <circle
                      cx={liveX}
                      cy={liveY}
                      r={pulseR}
                      fill="none"
                      stroke={pinColor}
                      strokeWidth={1.6 * uiScale}
                      opacity={pulseAlpha}
                    />
                    <circle
                      cx={liveX}
                      cy={liveY}
                      r={haloR}
                      fill={pinColor}
                      opacity={0.22}
                    />
                  </>
                )}
                <circle
                  cx={liveX}
                  cy={liveY}
                  r={6.2 * uiScale}
                  fill={pinColor}
                  stroke={pal.pinRingBg}
                  strokeWidth={2.2 * uiScale}
                />
                <circle
                  cx={liveX}
                  cy={liveY}
                  r={2.0 * uiScale}
                  fill={OVER_FOOTAGE_PALETTE.textHeadline}
                />
              </g>
            );
          })}

          {/* Pass C: Sharp Drop-Shadowed Editorial Callout Cards */}
          {layout.solvedCallouts.map((pin, idx) => {
            const pinSpring = spring({
              frame: Math.max(0, elapsed - 10 - idx * 3),
              fps,
              config: SPRINGS.dockSnap ?? {
                damping: 26,
                mass: 0.75,
                stiffness: 140,
                overshootClamping: true,
              },
            });
            const cardOpacity = interpolate(pinSpring, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const slideY = interpolate(pinSpring, [0, 1], [8 * uiScale, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pinColor = toneToColor(pin.spec.tone ?? resolvedScene.routeTone, pal);
            const padLeft = (pin.accentSide === "left" ? 13 : 11) * uiScale;
            const barW = 4 * uiScale;
            const subLabel =
              pin.spec.sublabel ??
              `${pin.spec.coordinates[1].toFixed(1)}°, ${pin.spec.coordinates[0].toFixed(1)}°`;

            return (
              <g
                key={`card-${pin.spec.id}`}
                transform={`translate(${pin.boxX.toFixed(1)}, ${(pin.boxY + slideY).toFixed(1)})`}
                opacity={cardOpacity}
                filter={`url(#${calloutShadowId})`}
              >
                <rect
                  width={pin.boxWidth}
                  height={pin.boxHeight}
                  rx={7 * uiScale}
                  fill={pal.cardBg}
                  stroke={pal.cardBorder}
                  strokeWidth={1.15 * uiScale}
                />
                <rect
                  x={pin.accentSide === "left" ? 0 : pin.boxWidth - barW}
                  y={0}
                  width={barW}
                  height={pin.boxHeight}
                  rx={2 * uiScale}
                  fill={pinColor}
                />
                <text
                  x={padLeft}
                  y={20.5 * uiScale}
                  fill={pal.inkHeadline}
                  fontFamily={FONTS.sans}
                  fontWeight={700}
                  fontSize={13 * uiScale}
                >
                  {pin.spec.label}
                </text>
                <text
                  x={padLeft}
                  y={37 * uiScale}
                  fill={pal.inkSecondary}
                  fontFamily={FONTS.mono}
                  fontWeight={500}
                  fontSize={10 * uiScale}
                >
                  {subLabel}
                </text>
                {pin.spec.metric && (
                  <text
                    x={padLeft}
                    y={53.5 * uiScale}
                    fill={pinColor}
                    fontFamily={FONTS.mono}
                    fontWeight={700}
                    fontSize={11 * uiScale}
                    style={TABULAR_NUM_STYLE}
                  >
                    {pin.spec.metric}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Top-Left / Top-Right Editorial & War-Room Header Plate */}
      {showChrome && (
        <div
          style={{
            position: "absolute",
            top: compactCard ? "20px" : "44px",
            left: compactCard ? "20px" : "64px",
            maxWidth: compactCard ? "90%" : "672px",
            backgroundColor: pal.cardBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${pal.cardBorder}`,
            borderLeft: `4px solid ${routeAccent}`,
            borderRadius: "12px",
            padding: compactCard ? "12px 16px" : "18px 26px",
            boxShadow: pal.shadow,
            opacity: interpolate(headerProgress, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(headerProgress, [0, 1], [-14, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }).toFixed(1)}px)`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: compactCard ? "10px" : "11.5px",
              fontWeight: 700,
              letterSpacing: getOpticalTracking(11.5, "mono"),
              textTransform: "uppercase",
              color: routeAccent,
              marginBottom: "5px",
            }}
          >
            {displayEyebrow}
          </div>
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: compactCard ? "19px" : "27px",
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: getOpticalTracking(27, "serif"),
              color: pal.inkHeadline,
            }}
          >
            {displayTitle}
          </div>
          {!compactCard && displaySubtitle && (
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: 1.4,
                color: pal.inkSecondary,
                marginTop: "6px",
              }}
            >
              {displaySubtitle}
            </div>
          )}
        </div>
      )}

      {/* Bottom Coordinate Telemetry & Warning Pill Strip */}
      {showChrome && !compactCard && (
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "64px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: pal.cardBg,
            border: `1px solid ${pal.cardBorder}`,
            borderRadius: "8px",
            padding: "9px 16px",
            boxShadow: pal.shadow,
            zIndex: 20,
          }}
        >
          {resolvedScene.warnings.length > 0 && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: "11px",
                fontWeight: 700,
                color: OVER_FOOTAGE_PALETTE.textHeadline,
                backgroundColor: PAGE_PALETTE.brickRed,
                padding: "3px 8px",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {resolvedScene.warnings[0].label}
            </span>
          )}
          <span
            style={{
              ...TABULAR_NUM_STYLE,
              fontFamily: FONTS.mono,
              fontSize: "11.5px",
              fontWeight: 600,
              color: pal.inkBody,
            }}
          >
            {`${Math.abs(resolvedScene.center[1]).toFixed(2)}°${resolvedScene.center[1] >= 0 ? "N" : "S"}  ${Math.abs(resolvedScene.center[0]).toFixed(2)}°${resolvedScene.center[0] >= 0 ? "E" : "W"}  •  ZOOM ${scale.toFixed(2)}x`}
          </span>
          {displaySource && (
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: "11.5px",
                fontWeight: 500,
                color: pal.inkSecondary,
                borderLeft: `1px solid ${pal.cardBorder}`,
                paddingLeft: "12px",
              }}
            >
              {displaySource}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
