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
}

function getRegisterPalette(register: MapVisualRegister): RegisterPalette {
  if (register === "midnight-telemetry") {
    return {
      isDark: true,
      isGlass: false,
      canvasBg: "#111315",
      oceanWash: "radial-gradient(ellipse at 52% 48%, #17202B 0%, #111315 78%)",
      gridLine: "rgba(191, 214, 234, 0.045)",
      graticuleStroke: "rgba(191, 214, 234, 0.11)",
      sphereOutline: "rgba(191, 214, 234, 0.22)",
      landBase: "#1C242E",
      landStroke: "#2E3B4B",
      primaryFill: "#2B547E",
      primaryStroke: "#BFD6EA",
      secondaryFill: "#1F5E5B",
      secondaryStroke: "#4FB3AE",
      alertFill: "#6E2519",
      alertStroke: "#E27358",
      hatchStroke: "rgba(255, 246, 229, 0.24)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline, // #FFF6E5 (AAA ~17:1)
      inkBody: OVER_FOOTAGE_PALETTE.textBody, // #FAECD4 (AAA ~15:1)
      inkSecondary: "#C6D8EA", // AAA > 10:1 on #111315
      cardBg: "rgba(20, 27, 36, 0.92)",
      cardBorder: "rgba(191, 214, 234, 0.34)",
      accentPrimary: "#BFD6EA",
      accentSecondary: "#4FB3AE",
      accentAlert: "#E27358",
      accentCapital: "#FAECD4",
      pinRingBg: "#111315",
      shadow: "0 18px 42px rgba(8, 12, 18, 0.62)",
    };
  }

  if (register === "drafting-blueprint") {
    return {
      isDark: true,
      isGlass: false,
      canvasBg: "#0F2236",
      oceanWash: "radial-gradient(ellipse at 50% 48%, #16314D 0%, #0F2236 80%)",
      gridLine: "rgba(191, 214, 234, 0.065)",
      graticuleStroke: "rgba(191, 214, 234, 0.14)",
      sphereOutline: "rgba(191, 214, 234, 0.28)",
      landBase: "#17314B",
      landStroke: "#2D5073",
      primaryFill: "#316394",
      primaryStroke: "#FFF6E5",
      secondaryFill: "#236B68",
      secondaryStroke: "#67CFC9",
      alertFill: "#7B2B1E",
      alertStroke: "#EC8368",
      hatchStroke: "rgba(255, 246, 229, 0.26)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline, // #FFF6E5 (AAA ~14.5:1)
      inkBody: OVER_FOOTAGE_PALETTE.textBody, // #FAECD4 (AAA ~12.8:1)
      inkSecondary: "#CFE0F0", // AAA > 10:1
      cardBg: "rgba(15, 34, 54, 0.92)",
      cardBorder: "rgba(191, 214, 234, 0.42)",
      accentPrimary: "#BFD6EA",
      accentSecondary: "#4FB3AE",
      accentAlert: "#E27358",
      accentCapital: "#FFF6E5",
      pinRingBg: "#0F2236",
      shadow: "0 18px 42px rgba(7, 16, 26, 0.58)",
    };
  }

  if (register === "over-footage-glass") {
    return {
      isDark: true,
      isGlass: true,
      canvasBg: "rgba(15, 25, 35, 0.62)",
      oceanWash: OVER_FOOTAGE_PALETTE.glassPrimary,
      gridLine: "rgba(255, 246, 229, 0.05)",
      graticuleStroke: "rgba(191, 214, 234, 0.14)",
      sphereOutline: OVER_FOOTAGE_PALETTE.glassInnerHairline,
      landBase: "rgba(28, 43, 58, 0.72)",
      landStroke: "rgba(191, 214, 234, 0.28)",
      primaryFill: "#356696",
      primaryStroke: "#FFF6E5",
      secondaryFill: "#287571",
      secondaryStroke: "#4FB3AE",
      alertFill: "#8A2C1D",
      alertStroke: "#E27358",
      hatchStroke: "rgba(255, 246, 229, 0.28)",
      inkHeadline: OVER_FOOTAGE_PALETTE.textHeadline,
      inkBody: OVER_FOOTAGE_PALETTE.textBody,
      inkSecondary: OVER_FOOTAGE_PALETTE.textMuted,
      cardBg: OVER_FOOTAGE_PALETTE.glassDarkWell,
      cardBorder: OVER_FOOTAGE_PALETTE.glassBorder,
      accentPrimary: OVER_FOOTAGE_PALETTE.accentPrimary,
      accentSecondary: OVER_FOOTAGE_PALETTE.chartSecondary,
      accentAlert: OVER_FOOTAGE_PALETTE.brickRedText,
      accentCapital: OVER_FOOTAGE_PALETTE.accentWarm,
      pinRingBg: "#0F1923",
      shadow: "0 22px 48px rgba(15, 25, 35, 0.48)",
    };
  }

  // Default: "page-editorial" (#FAF8F3 warm milk paper + #1C2B3A deep navy ink)
  return {
    isDark: false,
    isGlass: false,
    canvasBg: PAGE_PALETTE.paperLight,
    oceanWash: "radial-gradient(ellipse at 52% 48%, #FAF8F3 0%, #F2EFE7 100%)",
    gridLine: COLORS.gridLine,
    graticuleStroke: "rgba(28, 43, 58, 0.085)",
    sphereOutline: PAGE_PALETTE.paperBorder,
    landBase: PAGE_PALETTE.paper,
    landStroke: "#D4CFC3",
    primaryFill: PAGE_PALETTE.navy,
    primaryStroke: PAGE_PALETTE.navyDeep,
    secondaryFill: PAGE_PALETTE.gold,
    secondaryStroke: PAGE_PALETTE.navy,
    alertFill: PAGE_PALETTE.brickRed,
    alertStroke: "#6E2316",
    hatchStroke: "rgba(250, 248, 243, 0.34)",
    inkHeadline: PAGE_PALETTE.navy, // #1C2B3A (12.8:1 AAA on #FAF8F3)
    inkBody: PAGE_PALETTE.navy,
    inkSecondary: "#364656", // 8.9:1 AAA on #FAF8F3
    cardBg: "rgba(250, 248, 243, 0.95)",
    cardBorder: PAGE_PALETTE.paperBorder,
    accentPrimary: PAGE_PALETTE.navy,
    accentSecondary: PAGE_PALETTE.chartSecondary,
    accentAlert: "#8A2C1D", // 8.04:1 AAA on #FAF8F3
    accentCapital: PAGE_PALETTE.gold,
    pinRingBg: PAGE_PALETTE.paperLight,
    shadow: "0 16px 36px rgba(28, 43, 58, 0.12)",
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

interface ProjectedPin {
  spec: MapPinSpec;
  x: number;
  y: number;
  calloutX: number;
  calloutY: number;
  alignRight: boolean;
}

interface ProjectedArc {
  spec: MapArcSpec;
  d: string;
  severX?: number;
  severY?: number;
  midX: number;
  midY: number;
}

interface ProjectedWarning {
  spec: MapWarningSpec;
  x: number;
  y: number;
  radiusPx: number;
}

function solveNonOverlappingCallouts(
  rawPins: Array<{ spec: MapPinSpec; x: number; y: number }>,
  centerX: number,
  scale: number
): ProjectedPin[] {
  // Counter-scale callout offsets so screen spacing stays generous at every zoom level
  const inv = 1 / Math.pow(Math.max(1, scale), 0.72);
  const minVerticalGap = 54 * inv;
  const dx = 44 * inv;

  const placed: ProjectedPin[] = rawPins.map((p, idx) => {
    const alignRight = p.x >= centerX ? idx % 2 === 0 : idx % 2 === 1;
    const dir = alignRight ? 1 : -1;
    const vertBias = ((idx % 3) - 1) * 24 * inv;
    return {
      spec: p.spec,
      x: p.x,
      y: p.y,
      calloutX: p.x + dir * dx,
      calloutY: p.y + vertBias - 14 * inv,
      alignRight,
    };
  });

  // Deterministic 2-pass vertical relaxation per side to eliminate overlapping callout cards
  for (let pass = 0; pass < 3; pass++) {
    for (let side = 0; side < 2; side++) {
      const isRight = side === 1;
      const indices: number[] = [];
      for (let i = 0; i < placed.length; i++) {
        if (placed[i].alignRight === isRight) indices.push(i);
      }
      indices.sort((a, b) => placed[a].calloutY - placed[b].calloutY);
      for (let k = 1; k < indices.length; k++) {
        const prev = placed[indices[k - 1]];
        const curr = placed[indices[k]];
        const overlap = minVerticalGap - (curr.calloutY - prev.calloutY);
        if (overlap > 0) {
          prev.calloutY -= overlap * 0.35;
          curr.calloutY += overlap * 0.65;
        }
      }
    }
  }

  return placed;
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
}) => {
  const frame = useCurrentFrame();
  const { fps = 30, width = 1920, height = 1080 } = useVideoConfig();

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
  const activeScope = scopeOverride ?? resolvedScene.scope;

  // Build TopoJSON features (filtered & strictly typed, zero `any`)
  const geoFeatures = useMemo<Array<Feature<Geometry, AtlasFeatureProps>>>(() => {
    if (activeScope === "usa") {
      const fc = topojson.feature(
        US_TOPOLOGY,
        US_TOPOLOGY.objects.states
      ) as FeatureCollection<Geometry, AtlasFeatureProps>;
      // Filter to 50 states + DC so AlbersUsa projects 100% cleanly
      return fc.features.filter((f) => {
        const idNum = Number(f.id);
        return Number.isFinite(idNum) && idNum <= 56;
      });
    }
    const fc = topojson.feature(
      WORLD_TOPOLOGY,
      WORLD_TOPOLOGY.objects.countries
    ) as FeatureCollection<Geometry, AtlasFeatureProps>;
    const wantsAntarctica =
      resolvedScene.primaryCountryIds.indexOf("010") !== -1;
    return fc.features.filter((f) => wantsAntarctica || String(f.id) !== "010");
  }, [activeScope, resolvedScene.primaryCountryIds]);

  const projection = useMemo(
    () => buildProjection(activeScope, resolvedScene.bbox, width, height),
    [activeScope, resolvedScene.bbox, width, height]
  );

  const pathGenerator = useMemo(
    () => d3.geoPath().projection(projection),
    [projection]
  );

  const graticulePath = useMemo(() => {
    if (activeScope === "usa") return null;
    const step: [number, number] =
      activeScope === "world" ? [20, 20] : [10, 10];
    const grat = d3.geoGraticule().step(step)();
    return pathGenerator(grat) ?? null;
  }, [activeScope, pathGenerator]);

  const spherePath = useMemo(() => {
    if (activeScope !== "world") return null;
    const sphere: d3.GeoSphere = { type: "Sphere" };
    return pathGenerator(sphere) ?? null;
  }, [activeScope, pathGenerator]);

  // Fast Sets for primary / secondary / alert polygon highlights (plus Kosovo/N.Cyprus/Somaliland name match)
  const highlightSets = useMemo(() => {
    const primary = new Set<string>(
      activeScope === "usa"
        ? resolvedScene.primaryStateFips
        : resolvedScene.primaryCountryIds
    );
    const secondary = new Set<string>(
      activeScope === "usa"
        ? resolvedScene.secondaryStateFips
        : resolvedScene.secondaryCountryIds
    );
    const alert = new Set<string>(
      activeScope === "usa"
        ? resolvedScene.alertStateFips
        : resolvedScene.alertCountryIds
    );
    return { primary, secondary, alert };
  }, [
    activeScope,
    resolvedScene.primaryStateFips,
    resolvedScene.secondaryStateFips,
    resolvedScene.alertStateFips,
    resolvedScene.primaryCountryIds,
    resolvedScene.secondaryCountryIds,
    resolvedScene.alertCountryIds,
  ]);

  // Precompute polygon SVG paths, auto-fitted screen focus point & optimal bounded zoom
  const {
    renderedPolygons,
    rawProjectedPins,
    projectedArcs,
    projectedWarnings,
    focusPoint,
    computedTargetZoom,
  } = useMemo(() => {
    const polys: Array<{
      key: string;
      d: string;
      tier: "base" | "secondary" | "primary" | "alert";
    }> = [];

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
      if (highlightSets.alert.has(syntheticId)) {
        tier = "alert";
      } else if (highlightSets.primary.has(syntheticId)) {
        tier = "primary";
      } else if (highlightSets.secondary.has(syntheticId)) {
        tier = "secondary";
      }

      if (tier === "primary" || tier === "alert") {
        const b = pathGenerator.bounds(f);
        // Avoid multi-continent France/Russia overseas island stretch skewing regional focus
        const spanW = b[1][0] - b[0][0];
        if (spanW > 0 && spanW < width * 0.58) {
          expandBounds(b[0][0], b[0][1]);
          expandBounds(b[1][0], b[1][1]);
        } else {
          const c = pathGenerator.centroid(f);
          expandBounds(c[0], c[1]);
        }
      }

      polys.push({
        key: `${activeScope}-${syntheticId || i}`,
        d,
        tier,
      });
    }

    const pinsOut: Array<{ spec: MapPinSpec; x: number; y: number }> = [];
    for (let i = 0; i < resolvedScene.pins.length; i++) {
      const pin = resolvedScene.pins[i];
      const pt = projection(pin.coordinates);
      if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
        pinsOut.push({ spec: pin, x: pt[0], y: pt[1] });
        expandBounds(pt[0], pt[1]);
      }
    }

    const arcsOut: ProjectedArc[] = [];
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
        arcsOut.push({
          spec: arc,
          d: dStr,
          severX: arc.severedAt !== undefined ? sx : undefined,
          severY: arc.severedAt !== undefined ? sy : undefined,
          midX: cx,
          midY: cy,
        });
      } else {
        // True spherical great-circle geodesic via d3.geoInterpolate & d3.geoPath
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
        arcsOut.push({
          spec: arc,
          d: dStr,
          severX,
          severY,
          midX: midPt[0],
          midY: midPt[1],
        });
      }
    }

    const warningsOut: ProjectedWarning[] = [];
    for (let i = 0; i < resolvedScene.warnings.length; i++) {
      const w = resolvedScene.warnings[i];
      const pt = projection(w.coordinates);
      if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
        const edgePt = projection([
          w.coordinates[0] + (w.radiusDeg ?? 1.0),
          w.coordinates[1],
        ]);
        const rPx = edgePt
          ? Math.max(20, Math.min(82, Math.hypot(edgePt[0] - pt[0], edgePt[1] - pt[1])))
          : 34;
        warningsOut.push({ spec: w, x: pt[0], y: pt[1], radiusPx: rPx });
        expandBounds(pt[0], pt[1]);
      }
    }

    // Fallback to projected center if bounds were empty
    const centerProjected = projection(resolvedScene.center);
    if (!Number.isFinite(minX) && centerProjected) {
      expandBounds(centerProjected[0] - 90, centerProjected[1] - 60);
      expandBounds(centerProjected[0] + 90, centerProjected[1] + 60);
    }

    let fx = width * 0.5;
    let fy = height * 0.52;
    let zoomFit = resolvedScene.targetZoom;

    if (Number.isFinite(minX) && Number.isFinite(maxX)) {
      fx = (minX + maxX) * 0.5;
      fy = (minY + maxY) * 0.5;
      const boxW = Math.max(140, maxX - minX);
      const boxH = Math.max(100, maxY - minY);
      const autoZ = Math.min((width * 0.56) / boxW, (height * 0.54) / boxH);
      // Blend curated corridor targetZoom with safe bounding-box auto-fit so pins never clip
      zoomFit = Math.max(1.0, Math.min(resolvedScene.targetZoom, Math.max(1.18, autoZ)));
    }

    // Clamp camera center so zoomed viewport edges stay within canvas frame
    const maxPanX = ((width * (zoomFit - 1)) / (2 * zoomFit)) * 0.85;
    const maxPanY = ((height * (zoomFit - 1)) / (2 * zoomFit)) * 0.85;
    fx = Math.max(width * 0.5 - maxPanX, Math.min(width * 0.5 + maxPanX, fx));
    fy = Math.max(height * 0.5 - maxPanY, Math.min(height * 0.5 + maxPanY, fy));

    return {
      renderedPolygons: polys,
      rawProjectedPins: pinsOut,
      projectedArcs: arcsOut,
      projectedWarnings: warningsOut,
      focusPoint: [fx, fy] as [number, number],
      computedTargetZoom: zoomFit,
    };
  }, [
    geoFeatures,
    pathGenerator,
    projection,
    highlightSets,
    resolvedScene.pins,
    resolvedScene.arcs,
    resolvedScene.warnings,
    resolvedScene.center,
    resolvedScene.targetZoom,
    activeScope,
    width,
    height,
  ]);

  const elapsed = Math.max(0, frame - atFrame);

  // Smooth critically-damped camera fly-in (zoom 1.0 -> computedTargetZoom)
  const cameraProgress = enableCameraFlyIn
    ? spring({
        frame: Math.max(0, elapsed - 4),
        fps,
        config: SPRINGS.smoothFocus ?? {
          damping: 30,
          mass: 1.15,
          stiffness: 72,
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
    [resolvedScene.initialZoom, computedTargetZoom],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const camX = interpolate(clampedCam, [0, 1], [width * 0.5, focusPoint[0]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camY = interpolate(clampedCam, [0, 1], [height * 0.5, focusPoint[1]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const invScale = 1 / Math.pow(Math.max(1, scale), 0.72);

  const solvedPins = useMemo(
    () => solveNonOverlappingCallouts(rawProjectedPins, focusPoint[0], computedTargetZoom),
    [rawProjectedPins, focusPoint, computedTargetZoom]
  );

  const headerProgress = spring({
    frame: Math.max(0, elapsed - 2),
    fps,
    config: SPRINGS.cardGlide ?? {
      damping: 28,
      mass: 1,
      stiffness: 95,
      overshootClamping: true,
    },
  });

  const arcRevealOpacity = interpolate(elapsed, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayEyebrow = eyebrowOverride ?? resolvedScene.eyebrow;
  const displayTitle = titleOverride ?? resolvedScene.title;
  const displaySubtitle = subtitleOverride ?? resolvedScene.subtitle;
  const displaySource = sourceCitation ?? resolvedScene.sourceNote;
  const routeAccent = toneToColor(resolvedScene.routeTone, pal);
  const hatchPatternId = `atlas-alert-hatch-${resolvedScene.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          <pattern
            id={hatchPatternId}
            width={10 * invScale}
            height={10 * invScale}
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={10 * invScale}
              height={10 * invScale}
              fill={pal.alertFill}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={10 * invScale}
              stroke={pal.hatchStroke}
              strokeWidth={2.2 * invScale}
            />
          </pattern>
        </defs>

        <g
          transform={`translate(${(width * 0.5).toFixed(2)}, ${(height * 0.5).toFixed(2)}) scale(${scale.toFixed(4)}) translate(${(-camX).toFixed(2)}, ${(-camY).toFixed(2)})`}
        >
          {/* 1. Spherical Rim & Graticule Coordinate Lines */}
          {spherePath && (
            <path
              d={spherePath}
              fill="none"
              stroke={pal.sphereOutline}
              strokeWidth={1.4 * invScale}
            />
          )}
          {graticulePath && (
            <path
              d={graticulePath}
              fill="none"
              stroke={pal.graticuleStroke}
              strokeWidth={0.95 * invScale}
              strokeDasharray={`${(3.5 * invScale).toFixed(1)} ${(3.5 * invScale).toFixed(1)}`}
            />
          )}

          {/* 2. Base & Highlighted Sovereign / US State Polygons */}
          <g>
            {renderedPolygons.map((poly) => {
              const fill =
                poly.tier === "alert"
                  ? `url(#${hatchPatternId})`
                  : poly.tier === "primary"
                    ? pal.primaryFill
                    : poly.tier === "secondary"
                      ? pal.secondaryFill
                      : pal.landBase;
              const stroke =
                poly.tier === "alert"
                  ? pal.alertStroke
                  : poly.tier === "primary"
                    ? pal.primaryStroke
                    : poly.tier === "secondary"
                      ? pal.secondaryStroke
                      : pal.landStroke;
              const sw =
                poly.tier === "base" ? 1.05 * invScale : 1.95 * invScale;

              return (
                <path
                  key={poly.key}
                  d={poly.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={sw}
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* 3. Cable-Cut / Blockade / Chokepoint Warning Zones */}
          {projectedWarnings.map((warn, idx) => {
            const warnPop = spring({
              frame: Math.max(0, elapsed - 14 - idx * 4),
              fps,
              config: SPRINGS.documentSnap ?? {
                damping: 22,
                mass: 0.85,
                stiffness: 120,
                overshootClamping: true,
              },
            });
            const pulseWave = 0.88 + Math.sin((elapsed + idx * 9) * 0.14) * 0.12;
            const r = warn.radiusPx * invScale * warnPop;
            return (
              <g
                key={`warn-${warn.spec.id}`}
                transform={`translate(${warn.x.toFixed(1)}, ${warn.y.toFixed(1)})`}
                opacity={interpolate(warnPop, [0, 1], [0, 0.96], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              >
                <circle
                  r={r * pulseWave}
                  fill="rgba(163, 64, 46, 0.16)"
                  stroke={pal.accentAlert}
                  strokeWidth={1.8 * invScale}
                  strokeDasharray={`${(5 * invScale).toFixed(1)} ${(4 * invScale).toFixed(1)}`}
                />
                {/* Crisp Cable-Cut / Blockade Cross-Slash */}
                <g transform={`scale(${invScale.toFixed(3)})`}>
                  <line
                    x1={-7}
                    y1={-7}
                    x2={7}
                    y2={7}
                    stroke={pal.accentAlert}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                  />
                  <line
                    x1={7}
                    y1={-7}
                    x2={-7}
                    y2={7}
                    stroke={pal.accentAlert}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                  />
                </g>
              </g>
            );
          })}

          {/* 4. Animated Geodesic Shipping / Capital / Submarine-Cable Arcs */}
          {projectedArcs.map((arc, idx) => {
            const strokeColor = toneToColor(arc.spec.tone ?? resolvedScene.routeTone, pal);
            const dashUnit = (arc.spec.dashed === false ? 12 : 8.5) * invScale;
            const gapUnit = (arc.spec.dashed === false ? 5 : 6) * invScale;
            const dashOffset = -elapsed * 1.85 * invScale;

            return (
              <g key={`arc-${arc.spec.id}`} opacity={arcRevealOpacity}>
                {/* Subtle optical casing under-stroke for crisp contrast over borders */}
                <path
                  d={arc.d}
                  fill="none"
                  stroke={pal.pinRingBg}
                  strokeWidth={5.2 * invScale}
                  strokeLinecap="round"
                  opacity={0.65}
                />
                <path
                  d={arc.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2.85 * invScale}
                  strokeDasharray={`${dashUnit.toFixed(2)} ${gapUnit.toFixed(2)}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
                {/* Severance Flash Marker on Cut Subsea Cables */}
                {arc.severX !== undefined && arc.severY !== undefined && (
                  <g
                    transform={`translate(${arc.severX.toFixed(1)}, ${arc.severY.toFixed(1)}) scale(${invScale.toFixed(3)})`}
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

          {/* 5. Pulsing Facility / Substation / Port Pins & Non-Overlapping Leader Callouts */}
          {solvedPins.slice(0, compactCard ? 3 : 6).map((pin, idx) => {
            const pinSpring = spring({
              frame: Math.max(0, elapsed - 10 - idx * 3),
              fps,
              config: SPRINGS.dockSnap ?? {
                damping: 24,
                mass: 0.8,
                stiffness: 130,
                overshootClamping: true,
              },
            });
            const pinOpacity = interpolate(pinSpring, [0, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pinColor = toneToColor(pin.spec.tone ?? resolvedScene.routeTone, pal);
            const pulseR =
              (13 + Math.sin((elapsed + idx * 11) * 0.15) * 3.8) * invScale;

            const cardWidth = (pin.spec.metric ? 214 : 186) * invScale;
            const cardHeight = (pin.spec.metric ? 54 : 40) * invScale;
            const boxX = pin.alignRight ? pin.calloutX : pin.calloutX - cardWidth;
            const boxY = pin.calloutY - cardHeight * 0.5;
            const elbowX =
              pin.x + (pin.alignRight ? 18 * invScale : -18 * invScale);

            return (
              <g key={`pin-${pin.spec.id}`} opacity={pinOpacity}>
                {/* Leader Line */}
                <polyline
                  points={`${pin.x.toFixed(1)},${pin.y.toFixed(1)} ${elbowX.toFixed(1)},${pin.calloutY.toFixed(1)} ${pin.calloutX.toFixed(1)},${pin.calloutY.toFixed(1)}`}
                  fill="none"
                  stroke={pinColor}
                  strokeWidth={1.45 * invScale}
                  opacity={0.88}
                />

                {/* Pulsing Target Ring + Precision Bullseye */}
                {(pin.spec.pulse ?? idx === 0) && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={pulseR}
                    fill={
                      pin.spec.tone === "alert"
                        ? "rgba(163, 64, 46, 0.25)"
                        : "rgba(47, 143, 139, 0.22)"
                    }
                  />
                )}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={5.8 * invScale}
                  fill={pinColor}
                  stroke={pal.pinRingBg}
                  strokeWidth={2.1 * invScale}
                />

                {/* Crisp Editorial / Telemetry Callout Plate */}
                <g transform={`translate(${boxX.toFixed(1)}, ${boxY.toFixed(1)})`}>
                  <rect
                    width={cardWidth}
                    height={cardHeight}
                    rx={6 * invScale}
                    fill={pal.cardBg}
                    stroke={pal.cardBorder}
                    strokeWidth={1.15 * invScale}
                  />
                  <rect
                    x={pin.alignRight ? 0 : cardWidth - 3.4 * invScale}
                    y={0}
                    width={3.4 * invScale}
                    height={cardHeight}
                    rx={1.5 * invScale}
                    fill={pinColor}
                  />
                  <text
                    x={11 * invScale}
                    y={17.5 * invScale}
                    fill={pal.inkHeadline}
                    fontFamily={FONTS.sans}
                    fontWeight={700}
                    fontSize={12.5 * invScale}
                  >
                    {pin.spec.label}
                  </text>
                  <text
                    x={11 * invScale}
                    y={32 * invScale}
                    fill={pal.inkSecondary}
                    fontFamily={FONTS.mono}
                    fontWeight={500}
                    fontSize={9.6 * invScale}
                  >
                    {pin.spec.sublabel ??
                      `${pin.spec.coordinates[1].toFixed(1)}°, ${pin.spec.coordinates[0].toFixed(1)}°`}
                  </text>
                  {pin.spec.metric && (
                    <text
                      x={11 * invScale}
                      y={46.5 * invScale}
                      fill={pinColor}
                      fontFamily={FONTS.mono}
                      fontWeight={700}
                      fontSize={10.4 * invScale}
                      style={TABULAR_NUM_STYLE}
                    >
                      {pin.spec.metric}
                    </text>
                  )}
                </g>
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
            top: compactCard ? "24px" : "44px",
            left: compactCard ? "24px" : "64px",
            maxWidth: compactCard ? "88%" : "680px",
            backgroundColor: pal.cardBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${pal.cardBorder}`,
            borderLeft: `4px solid ${routeAccent}`,
            borderRadius: "12px",
            padding: compactCard ? "14px 18px" : "18px 26px",
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
              fontSize: compactCard ? "10.5px" : "11.5px",
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
              fontSize: compactCard ? "20px" : "27px",
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
