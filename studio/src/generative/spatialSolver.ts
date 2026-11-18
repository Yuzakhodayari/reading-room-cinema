import {
  BlueprintActor,
  BlueprintConnector,
  BlueprintSurfaceMode,
  OverFootagePlacement,
  PortSide,
  SceneBlueprint,
  SemanticZone,
} from "./blueprintTypes";

/**
 * Pillar #13 — The DeepSeek Auto-Polish & Collision Solver
 *
 * Resolves any declarative SceneBlueprint (even a terse 3-4 actor LLM draft)
 * into balanced 1920x1080 golden-ratio broadcast geometry inside the 96px safe frame,
 * guarantees zero actor/label collisions via deterministic iterative AABB repulsion,
 * routes orthogonal/curved connectors with port fan-out, and auto-injects cinema polish.
 */

export const GOLDEN_RATIO = 1.61803398875;

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface SolvedActorPorts {
  north: Point2D;
  south: Point2D;
  east: Point2D;
  west: Point2D;
  center: Point2D;
}

export interface SolvedActorLayout {
  id: string;
  actor: BlueprintActor;
  zone: SemanticZone;
  rect: Rect2D;
  ports: SolvedActorPorts;
  enterDelayFrames: number;
  anchorWeight: number;
  hasChiselHighlight: boolean;
}

export interface SolvedConnectorLayout {
  id: string;
  connector: BlueprintConnector;
  fromPort: Exclude<PortSide, "auto">;
  toPort: Exclude<PortSide, "auto">;
  startPoint: Point2D;
  endPoint: Point2D;
  midPoint: Point2D;
  tangentDeg: number;
  waypoints: Point2D[];
  svgPath: string;
  approxLengthPx: number;
  badgeRect?: Rect2D;
}

export interface SolvedPolishPlan {
  mastheadEyebrow: string;
  mastheadTitle: string;
  mastheadSubtitle?: string;
  mastheadFolio: string;
  sourceCitation?: string;
  sourceDocRef?: string;
  enableCameraPush: boolean;
  cameraPushScale: number;
  staggerFrames: number;
  chiselHighlightIds: string[];
}

export interface SolvedSceneLayout {
  canvasRect: Rect2D;
  outerSafeRect: Rect2D;
  glassContainerRect?: Rect2D;
  mastheadRect?: Rect2D;
  activeStageRect: Rect2D;
  surfaceMode: BlueprintSurfaceMode;
  overFootagePlacement: OverFootagePlacement;
  compactMode: boolean;
  actors: SolvedActorLayout[];
  actorMap: Record<string, SolvedActorLayout>;
  connectors: SolvedConnectorLayout[];
  polish: SolvedPolishPlan;
  residualOverlapCount: number;
}

export interface SpatialSolveOptions {
  canvasWidth?: number;
  canvasHeight?: number;
  safeMarginPx?: number;
  surfaceMode?: BlueprintSurfaceMode;
  overFootagePlacement?: OverFootagePlacement;
}

function computePorts(rect: Rect2D): SolvedActorPorts {
  return {
    north: { x: rect.x + rect.width * 0.5, y: rect.y },
    south: { x: rect.x + rect.width * 0.5, y: rect.y + rect.height },
    east: { x: rect.x + rect.width, y: rect.y + rect.height * 0.5 },
    west: { x: rect.x, y: rect.y + rect.height * 0.5 },
    center: { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.5 },
  };
}

function rectsOverlapWithGap(a: Rect2D, b: Rect2D, gap: number): boolean {
  return (
    a.x - gap < b.x + b.width &&
    a.x + a.width + gap > b.x &&
    a.y - gap < b.y + b.height &&
    a.y + a.height + gap > b.y
  );
}

function clampRectInsideStage(rect: Rect2D, bounds: Rect2D): Rect2D {
  const w = Math.min(rect.width, bounds.width);
  const h = Math.min(rect.height, bounds.height);
  const x = Math.max(bounds.x, Math.min(bounds.x + bounds.width - w, rect.x));
  const y = Math.max(bounds.y, Math.min(bounds.y + bounds.height - h, rect.y));
  return { x, y, width: w, height: h };
}

/**
 * Resolves the outer stage geometry for full-screen Page cutaways vs Over-Footage Liquid Glass.
 */
function resolveStageEnvelope(
  canvasWidth: number,
  canvasHeight: number,
  safeMarginPx: number,
  surfaceMode: BlueprintSurfaceMode,
  placement: OverFootagePlacement
): {
  outerSafeRect: Rect2D;
  glassContainerRect?: Rect2D;
  mastheadRect?: Rect2D;
  activeStageRect: Rect2D;
  compactMode: boolean;
} {
  const outerSafeRect: Rect2D = {
    x: safeMarginPx,
    y: safeMarginPx,
    width: canvasWidth - safeMarginPx * 2,
    height: canvasHeight - safeMarginPx * 2,
  };

  if (surfaceMode === "over-footage") {
    if (placement === "right-third") {
      const glass: Rect2D = {
        x: Math.round(canvasWidth * 0.585),
        y: safeMarginPx,
        width: canvasWidth - Math.round(canvasWidth * 0.585) - safeMarginPx,
        height: canvasHeight - safeMarginPx * 2,
      };
      const pad = 26;
      return {
        outerSafeRect,
        glassContainerRect: glass,
        mastheadRect: {
          x: glass.x + pad,
          y: glass.y + 22,
          width: glass.width - pad * 2,
          height: 68,
        },
        activeStageRect: {
          x: glass.x + pad,
          y: glass.y + 102,
          width: glass.width - pad * 2,
          height: glass.height - 148,
        },
        compactMode: true,
      };
    }

    if (placement === "bottom-dock") {
      const glass: Rect2D = {
        x: safeMarginPx,
        y: canvasHeight - safeMarginPx - 324,
        width: canvasWidth - safeMarginPx * 2,
        height: 324,
      };
      const pad = 24;
      return {
        outerSafeRect,
        glassContainerRect: glass,
        mastheadRect: {
          x: glass.x + pad,
          y: glass.y + 16,
          width: glass.width - pad * 2,
          height: 46,
        },
        activeStageRect: {
          x: glass.x + pad,
          y: glass.y + 70,
          width: glass.width - pad * 2,
          height: glass.height - 92,
        },
        compactMode: true,
      };
    }

    if (placement === "top-bar") {
      const glass: Rect2D = {
        x: safeMarginPx,
        y: safeMarginPx - 16,
        width: canvasWidth - safeMarginPx * 2,
        height: 248,
      };
      const pad = 22;
      return {
        outerSafeRect,
        glassContainerRect: glass,
        mastheadRect: {
          x: glass.x + pad,
          y: glass.y + 14,
          width: glass.width - pad * 2,
          height: 40,
        },
        activeStageRect: {
          x: glass.x + pad,
          y: glass.y + 62,
          width: glass.width - pad * 2,
          height: glass.height - 80,
        },
        compactMode: true,
      };
    }

    // "depth-sandwich": full-canvas contraption behind presenter foreground matte
    return {
      outerSafeRect,
      mastheadRect: {
        x: safeMarginPx,
        y: 68,
        width: canvasWidth - safeMarginPx * 2,
        height: 86,
      },
      activeStageRect: {
        x: safeMarginPx,
        y: 168,
        width: canvasWidth - safeMarginPx * 2,
        height: canvasHeight - 168 - 96,
      },
      compactMode: false,
    };
  }

  // Full-screen "page" mode: balanced 1920x1080 architectural composition inside 96px safe frame
  return {
    outerSafeRect,
    mastheadRect: {
      x: safeMarginPx,
      y: 64,
      width: canvasWidth - safeMarginPx * 2,
      height: 98,
    },
    activeStageRect: {
      x: safeMarginPx,
      y: 176,
      width: canvasWidth - safeMarginPx * 2,
      height: canvasHeight - 176 - 104,
    },
    compactMode: false,
  };
}

/**
 * Adaptive Golden-Ratio Semantic Zone Resolver.
 * Dynamically expands occupied zones so full-screen scenes NEVER leave awkward empty holes.
 */
function resolveOccupiedZoneRects(
  stage: Rect2D,
  actors: BlueprintActor[],
  compactMode: boolean,
  placement: OverFootagePlacement,
  surfaceMode: BlueprintSurfaceMode
): Record<SemanticZone, Rect2D> {
  const counts: Record<SemanticZone, number> = {
    "top-header": 0,
    "bottom-ledger": 0,
    "left-stage": 0,
    "center-hero": 0,
    "right-stage": 0,
    "split-left": 0,
    "split-right": 0,
  };
  for (let i = 0; i < actors.length; i++) {
    counts[actors[i].zone] += 1;
  }

  const gutter = compactMode ? 16 : 36;

  // Special vertical stack reflow when constrained inside narrow right-third over-footage glass
  if (surfaceMode === "over-footage" && placement === "right-third") {
    const activeZones: SemanticZone[] = [];
    const order: SemanticZone[] = [
      "top-header",
      "left-stage",
      "split-left",
      "center-hero",
      "split-right",
      "right-stage",
      "bottom-ledger",
    ];
    for (let i = 0; i < order.length; i++) {
      if (counts[order[i]] > 0) activeZones.push(order[i]);
    }
    const n = Math.max(1, activeZones.length);
    const bandH = (stage.height - gutter * (n - 1)) / n;
    const fallback: Rect2D = { ...stage };
    const map: Record<SemanticZone, Rect2D> = {
      "top-header": fallback,
      "bottom-ledger": fallback,
      "left-stage": fallback,
      "center-hero": fallback,
      "right-stage": fallback,
      "split-left": fallback,
      "split-right": fallback,
    };
    for (let idx = 0; idx < activeZones.length; idx++) {
      map[activeZones[idx]] = {
        x: stage.x,
        y: stage.y + idx * (bandH + gutter),
        width: stage.width,
        height: Math.max(88, bandH),
      };
    }
    return map;
  }

  // Standard 16:9 / wide stage golden-ratio vertical bands (top-header, mainBody, bottom-ledger)
  const hasTop = counts["top-header"] > 0;
  const hasBottom = counts["bottom-ledger"] > 0;
  const hasMiddle =
    counts["left-stage"] +
      counts["center-hero"] +
      counts["right-stage"] +
      counts["split-left"] +
      counts["split-right"] >
    0;

  let curY = stage.y;
  let remH = stage.height;

  let topRect: Rect2D = { x: stage.x, y: stage.y, width: stage.width, height: 140 };
  if (hasTop) {
    const h = hasMiddle || hasBottom ? Math.round(stage.height * 0.22) : stage.height;
    topRect = { x: stage.x, y: curY, width: stage.width, height: h };
    curY += h + (hasMiddle || hasBottom ? gutter : 0);
    remH = stage.y + stage.height - curY;
  }

  let bottomRect: Rect2D = {
    x: stage.x,
    y: stage.y + stage.height - 165,
    width: stage.width,
    height: 165,
  };
  if (hasBottom) {
    const h = hasMiddle ? Math.round(stage.height * 0.25) : remH;
    bottomRect = {
      x: stage.x,
      y: stage.y + stage.height - h,
      width: stage.width,
      height: h,
    };
    if (hasMiddle) {
      remH -= h + gutter;
    }
  }

  const bodyRect: Rect2D = {
    x: stage.x,
    y: curY,
    width: stage.width,
    height: Math.max(140, remH),
  };

  // Split zones (50/50 with central connector channel)
  const splitAlley = compactMode ? 24 : 72;
  const splitW = (bodyRect.width - splitAlley) * 0.5;
  const splitLeftRect: Rect2D = {
    x: bodyRect.x,
    y: bodyRect.y,
    width: splitW,
    height: bodyRect.height,
  };
  const splitRightRect: Rect2D = {
    x: bodyRect.x + splitW + splitAlley,
    y: bodyRect.y,
    width: splitW,
    height: bodyRect.height,
  };

  // Three-stage horizontal columns with Adaptive Occupancy Promotion
  const hasL = counts["left-stage"] > 0;
  const hasC = counts["center-hero"] > 0;
  const hasR = counts["right-stage"] > 0;

  let leftRect: Rect2D = { ...splitLeftRect };
  let centerRect: Rect2D = { ...bodyRect };
  let rightRect: Rect2D = { ...splitRightRect };

  if (hasL && hasC && hasR) {
    // Classic triptych: 1 : 1.42 : 1 golden-weighted hero center
    const totalWeight = 1 + 1.42 + 1;
    const availW = bodyRect.width - gutter * 2;
    const wSide = (availW * 1) / totalWeight;
    const wCenter = (availW * 1.42) / totalWeight;
    leftRect = { x: bodyRect.x, y: bodyRect.y, width: wSide, height: bodyRect.height };
    centerRect = {
      x: bodyRect.x + wSide + gutter,
      y: bodyRect.y,
      width: wCenter,
      height: bodyRect.height,
    };
    rightRect = {
      x: bodyRect.x + wSide + gutter + wCenter + gutter,
      y: bodyRect.y,
      width: wSide,
      height: bodyRect.height,
    };
  } else if (hasL && hasC && !hasR) {
    // Golden diptych: Left (1) + Center Hero (1.38)
    const availW = bodyRect.width - gutter;
    const wL = availW / (1 + 1.38);
    const wC = availW - wL;
    leftRect = { x: bodyRect.x, y: bodyRect.y, width: wL, height: bodyRect.height };
    centerRect = {
      x: bodyRect.x + wL + gutter,
      y: bodyRect.y,
      width: wC,
      height: bodyRect.height,
    };
  } else if (!hasL && hasC && hasR) {
    // Golden diptych: Center Hero (1.38) + Right (1)
    const availW = bodyRect.width - gutter;
    const wR = availW / (1 + 1.38);
    const wC = availW - wR;
    centerRect = { x: bodyRect.x, y: bodyRect.y, width: wC, height: bodyRect.height };
    rightRect = {
      x: bodyRect.x + wC + gutter,
      y: bodyRect.y,
      width: wR,
      height: bodyRect.height,
    };
  } else if (hasL && !hasC && hasR) {
    // Symmetric wide stage pair with generous central mechanism alley
    leftRect = { ...splitLeftRect };
    rightRect = { ...splitRightRect };
  } else if (hasC && !hasL && !hasR) {
    // Commanding centered stage (82% width of 1728px = ~1416px wide, zero tiny widget!)
    const soloW = compactMode ? bodyRect.width : Math.round(bodyRect.width * 0.84);
    centerRect = {
      x: bodyRect.x + Math.round((bodyRect.width - soloW) * 0.5),
      y: bodyRect.y,
      width: soloW,
      height: bodyRect.height,
    };
  }

  // If both split zones AND stage zones are mixed in an LLM draft, keep them separated cleanly
  if ((counts["split-left"] > 0 || counts["split-right"] > 0) && (hasL || hasC || hasR)) {
    const halfH = (bodyRect.height - gutter) * 0.5;
    leftRect = { ...leftRect, height: halfH };
    centerRect = { ...centerRect, height: halfH };
    rightRect = { ...rightRect, height: halfH };
    splitLeftRect.y = bodyRect.y + halfH + gutter;
    splitLeftRect.height = halfH;
    splitRightRect.y = bodyRect.y + halfH + gutter;
    splitRightRect.height = halfH;
  }

  return {
    "top-header": topRect,
    "bottom-ledger": bottomRect,
    "left-stage": leftRect,
    "center-hero": centerRect,
    "right-stage": rightRect,
    "split-left": splitLeftRect,
    "split-right": splitRightRect,
  };
}

/**
 * Subdivides a SemanticZone rectangle cleanly among all actors assigned to that zone.
 */
function subdivideZoneForActors(
  zone: SemanticZone,
  zoneRect: Rect2D,
  zoneActors: BlueprintActor[],
  compactMode: boolean
): Rect2D[] {
  const n = zoneActors.length;
  if (n === 0) return [];
  if (n === 1) {
    const solo = zoneActors[0];
    // Verdict stamps look sharpest as crisp wide-proportioned plaques rather than 760px-tall walls
    if (solo.kind === "verdict-stamp" && zoneRect.height > 250) {
      const h = Math.min(zoneRect.height, compactMode ? 150 : 220);
      const w = Math.min(zoneRect.width, compactMode ? zoneRect.width : 540);
      return [
        {
          x: zoneRect.x + (zoneRect.width - w) * 0.5,
          y: zoneRect.y + (zoneRect.height - h) * 0.5,
          width: w,
          height: h,
        },
      ];
    }
    return [{ ...zoneRect }];
  }

  const gap = compactMode ? 14 : 24;
  const horizontalZones =
    zone === "top-header" ||
    zone === "bottom-ledger" ||
    (zone === "center-hero" && zoneRect.width > zoneRect.height * 1.65 && n <= 3);

  const weights = zoneActors.map((a) => {
    if (a.sizeWeight !== undefined) return a.sizeWeight;
    if (a.kind === "verdict-stamp") return 0.55;
    if (a.kind === "metric-counter") return 0.78;
    return 1.0;
  });
  const totalWeight = weights.reduce((acc, w) => acc + w, 0) || n;

  const rects: Rect2D[] = [];
  if (horizontalZones) {
    const availW = Math.max(120, zoneRect.width - gap * (n - 1));
    let curX = zoneRect.x;
    for (let i = 0; i < n; i++) {
      const w = (availW * weights[i]) / totalWeight;
      rects.push({
        x: curX,
        y: zoneRect.y,
        width: w,
        height: zoneRect.height,
      });
      curX += w + gap;
    }
  } else {
    const availH = Math.max(120, zoneRect.height - gap * (n - 1));
    let curY = zoneRect.y;
    for (let i = 0; i < n; i++) {
      const h = (availH * weights[i]) / totalWeight;
      rects.push({
        x: zoneRect.x,
        y: curY,
        width: zoneRect.width,
        height: h,
      });
      curY += h + gap;
    }
  }

  return rects;
}

/**
 * Deterministic Iterative AABB Repulsion Solver.
 * Guarantees zero overlapping actor boxes inside stageBounds.
 */
function solveActorCollisionsAABB(
  boxes: Array<{ rect: Rect2D; anchorWeight: number }>,
  stageBounds: Rect2D,
  minGapPx: number
): { rects: Rect2D[]; residualOverlaps: number } {
  const rects = boxes.map((b) => clampRectInsideStage({ ...b.rect }, stageBounds));
  const n = rects.length;

  const maxIterations = 32;
  for (let iter = 0; iter < maxIterations; iter++) {
    let anyMoved = false;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = rects[i];
        const b = rects[j];

        const overlapX =
          Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) + minGapPx;
        const overlapY =
          Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) + minGapPx;

        if (overlapX > 0.05 && overlapY > 0.05) {
          anyMoved = true;
          const invWa = 1 / Math.max(0.2, boxes[i].anchorWeight);
          const invWb = 1 / Math.max(0.2, boxes[j].anchorWeight);
          const invSum = invWa + invWb;
          const shareA = invWa / invSum;
          const shareB = invWb / invSum;

          const centerAx = a.x + a.width * 0.5;
          const centerAy = a.y + a.height * 0.5;
          const centerBx = b.x + b.width * 0.5;
          const centerBy = b.y + b.height * 0.5;

          // Resolve along shallower penetration axis with deterministic tie-breaking
          if (overlapX <= overlapY) {
            const dir = centerAx <= centerBx ? -1 : 1;
            // If cannot push horizontally due to stage wall, shrink slightly or push vertically
            const nextAx = a.x + dir * overlapX * shareA;
            const nextBx = b.x - dir * overlapX * shareB;
            a.x = nextAx;
            b.x = nextBx;
          } else {
            const dir = centerAy <= centerBy ? -1 : 1;
            a.y += dir * overlapY * shareA;
            b.y -= dir * overlapY * shareB;
          }

          rects[i] = clampRectInsideStage(a, stageBounds);
          rects[j] = clampRectInsideStage(b, stageBounds);

          // If clamping against stage boundaries re-created overlap, gently compress along overlap axis
          const postOx =
            Math.min(rects[i].x + rects[i].width, rects[j].x + rects[j].width) -
            Math.max(rects[i].x, rects[j].x) +
            minGapPx;
          const postOy =
            Math.min(rects[i].y + rects[i].height, rects[j].y + rects[j].height) -
            Math.max(rects[i].y, rects[j].y) +
            minGapPx;

          if (postOx > 0.5 && postOy > 0.5 && iter > 12) {
            if (postOx <= postOy && rects[i].width > 180 && rects[j].width > 180) {
              const trim = Math.min(12, postOx * 0.52);
              rects[i].width -= trim;
              rects[j].width -= trim;
              if (rects[i].x <= rects[j].x) {
                rects[j].x += trim;
              } else {
                rects[i].x += trim;
              }
            } else if (rects[i].height > 110 && rects[j].height > 110) {
              const trim = Math.min(10, postOy * 0.52);
              rects[i].height -= trim;
              rects[j].height -= trim;
              if (rects[i].y <= rects[j].y) {
                rects[j].y += trim;
              } else {
                rects[i].y += trim;
              }
            }
            rects[i] = clampRectInsideStage(rects[i], stageBounds);
            rects[j] = clampRectInsideStage(rects[j], stageBounds);
          }
        }
      }
    }

    if (!anyMoved) break;
  }

  let residualOverlaps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (rectsOverlapWithGap(rects[i], rects[j], 0)) {
        residualOverlaps += 1;
      }
    }
  }

  return { rects, residualOverlaps };
}

/**
 * Selects cleanest cardinal exit & entry ports between two solved actors.
 */
function inferOptimalPorts(
  fromRect: Rect2D,
  toRect: Rect2D,
  requestedFrom?: PortSide,
  requestedTo?: PortSide,
  connectorKind?: BlueprintConnector["kind"]
): { fromPort: Exclude<PortSide, "auto">; toPort: Exclude<PortSide, "auto"> } {
  if (connectorKind === "veto-slash" && fromRect === toRect) {
    return { fromPort: "west", toPort: "east" };
  }

  const c1x = fromRect.x + fromRect.width * 0.5;
  const c1y = fromRect.y + fromRect.height * 0.5;
  const c2x = toRect.x + toRect.width * 0.5;
  const c2y = toRect.y + toRect.height * 0.5;
  const dx = c2x - c1x;
  const dy = c2y - c1y;

  let autoFrom: Exclude<PortSide, "auto"> = "east";
  let autoTo: Exclude<PortSide, "auto"> = "west";

  if (Math.abs(dx) >= Math.abs(dy) * 0.72) {
    if (dx >= 0) {
      autoFrom = "east";
      autoTo = "west";
    } else {
      autoFrom = "west";
      autoTo = "east";
    }
  } else {
    if (dy >= 0) {
      autoFrom = "south";
      autoTo = "north";
    } else {
      autoFrom = "north";
      autoTo = "south";
    }
  }

  return {
    fromPort:
      requestedFrom && requestedFrom !== "auto" ? requestedFrom : autoFrom,
    toPort: requestedTo && requestedTo !== "auto" ? requestedTo : autoTo,
  };
}

/**
 * Builds rounded-fillet SVG orthogonal path from ordered waypoints.
 */
function buildRoundedOrthogonalSvgPath(
  waypoints: Point2D[],
  cornerRadius: number = 16
): string {
  if (waypoints.length === 0) return "";
  if (waypoints.length === 1) {
    return `M ${waypoints[0].x.toFixed(1)} ${waypoints[0].y.toFixed(1)}`;
  }
  if (waypoints.length === 2) {
    return `M ${waypoints[0].x.toFixed(1)} ${waypoints[0].y.toFixed(1)} L ${waypoints[1].x.toFixed(1)} ${waypoints[1].y.toFixed(1)}`;
  }

  const parts: string[] = [
    `M ${waypoints[0].x.toFixed(1)} ${waypoints[0].y.toFixed(1)}`,
  ];

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const len1 = Math.hypot(v1x, v1y);

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 2 || len2 < 2) {
      parts.push(`L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`);
      continue;
    }

    const r = Math.min(cornerRadius, len1 * 0.42, len2 * 0.42);
    const pEnterX = curr.x - (v1x / len1) * r;
    const pEnterY = curr.y - (v1y / len1) * r;
    const pExitX = curr.x + (v2x / len2) * r;
    const pExitY = curr.y + (v2y / len2) * r;

    parts.push(`L ${pEnterX.toFixed(1)} ${pEnterY.toFixed(1)}`);
    parts.push(
      `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${pExitX.toFixed(1)} ${pExitY.toFixed(1)}`
    );
  }

  const last = waypoints[waypoints.length - 1];
  parts.push(`L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`);
  return parts.join(" ");
}

/**
 * Samples a 2D point and unit normal along a polyline at normalized parameter u in [0, 1].
 */
export function samplePointAlongWaypoints(
  waypoints: Point2D[],
  u: number
): { point: Point2D; normal: Point2D; tangentDeg: number } {
  if (waypoints.length === 0) {
    return { point: { x: 0, y: 0 }, normal: { x: 0, y: -1 }, tangentDeg: 0 };
  }
  if (waypoints.length === 1) {
    return { point: waypoints[0], normal: { x: 0, y: -1 }, tangentDeg: 0 };
  }

  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = Math.hypot(
      waypoints[i + 1].x - waypoints[i].x,
      waypoints[i + 1].y - waypoints[i].y
    );
    segLengths.push(d);
    totalLen += d;
  }

  if (totalLen <= 0.001) {
    return { point: waypoints[0], normal: { x: 0, y: -1 }, tangentDeg: 0 };
  }

  const clampedU = Math.max(0, Math.min(1, u));
  const targetDist = clampedU * totalLen;
  let accum = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const segLen = segLengths[i];
    if (accum + segLen >= targetDist || i === segLengths.length - 1) {
      const localT = segLen > 0.0001 ? (targetDist - accum) / segLen : 0;
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.max(0.0001, Math.hypot(dx, dy));
      return {
        point: {
          x: a.x + dx * localT,
          y: a.y + dy * localT,
        },
        normal: {
          x: -dy / len,
          y: dx / len,
        },
        tangentDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
      };
    }
    accum += segLen;
  }

  const endPt = waypoints[waypoints.length - 1];
  return { point: endPt, normal: { x: 0, y: -1 }, tangentDeg: 0 };
}

/**
 * Routes all connectors cleanly between solved actor ports and prevents connector badge collisions.
 */
function routeBlueprintConnectors(
  connectors: BlueprintConnector[],
  actorMap: Record<string, SolvedActorLayout>,
  allActorRects: Rect2D[],
  stageBounds: Rect2D
): SolvedConnectorLayout[] {
  // Count port usage so multiple connectors sharing a port fan out cleanly
  const portUsageTotal: Record<string, number> = {};
  const portUsageSeen: Record<string, number> = {};

  const resolvedPorts: Array<{
    fromPort: Exclude<PortSide, "auto">;
    toPort: Exclude<PortSide, "auto">;
  }> = [];

  for (let i = 0; i < connectors.length; i++) {
    const conn = connectors[i];
    const fromActor = actorMap[conn.fromActorId];
    const toActor = actorMap[conn.toActorId];
    if (!fromActor || !toActor) {
      resolvedPorts.push({ fromPort: "east", toPort: "west" });
      continue;
    }
    const pair = inferOptimalPorts(
      fromActor.rect,
      toActor.rect,
      conn.fromPort,
      conn.toPort,
      conn.kind
    );
    resolvedPorts.push(pair);
    const fKey = `${conn.fromActorId}:${pair.fromPort}`;
    const tKey = `${conn.toActorId}:${pair.toPort}`;
    portUsageTotal[fKey] = (portUsageTotal[fKey] ?? 0) + 1;
    portUsageTotal[tKey] = (portUsageTotal[tKey] ?? 0) + 1;
  }

  const badgeBoxes: Rect2D[] = [];
  const results: SolvedConnectorLayout[] = [];

  for (let i = 0; i < connectors.length; i++) {
    const conn = connectors[i];
    const fromActor = actorMap[conn.fromActorId];
    const toActor = actorMap[conn.toActorId];
    if (!fromActor || !toActor) continue;

    const { fromPort, toPort } = resolvedPorts[i];
    const fKey = `${conn.fromActorId}:${fromPort}`;
    const tKey = `${conn.toActorId}:${toPort}`;
    const fIdx = portUsageSeen[fKey] ?? 0;
    portUsageSeen[fKey] = fIdx + 1;
    const tIdx = portUsageSeen[tKey] ?? 0;
    portUsageSeen[tKey] = tIdx + 1;

    const fTotal = portUsageTotal[fKey] ?? 1;
    const tTotal = portUsageTotal[tKey] ?? 1;
    const fOffset = (fIdx - (fTotal - 1) * 0.5) * 26;
    const tOffset = (tIdx - (tTotal - 1) * 0.5) * 26;

    const rawStart = fromActor.ports[fromPort];
    const rawEnd = toActor.ports[toPort];

    const startPoint: Point2D =
      fromPort === "east" || fromPort === "west"
        ? { x: rawStart.x, y: rawStart.y + fOffset }
        : { x: rawStart.x + fOffset, y: rawStart.y };

    const endPoint: Point2D =
      toPort === "east" || toPort === "west"
        ? { x: rawEnd.x, y: rawEnd.y + tOffset }
        : { x: rawEnd.x + tOffset, y: rawEnd.y };

    // Self-targeted veto-slash across a single card/voucher
    if (conn.fromActorId === conn.toActorId && conn.kind === "veto-slash") {
      const r = toActor.rect;
      const p1: Point2D = { x: r.x + r.width * 0.1, y: r.y + r.height * 0.78 };
      const p2: Point2D = { x: r.x + r.width * 0.9, y: r.y + r.height * 0.22 };
      const mid: Point2D = { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      results.push({
        id: conn.id,
        connector: conn,
        fromPort: "west",
        toPort: "east",
        startPoint: p1,
        endPoint: p2,
        midPoint: mid,
        tangentDeg: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
        waypoints: [p1, p2],
        svgPath: `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
        approxLengthPx: len,
      });
      continue;
    }

    let waypoints: Point2D[] = [];
    let svgPath = "";

    if (conn.kind === "geodesic-arc") {
      const lift = conn.arcLiftPx ?? Math.min(130, Math.max(54, Math.abs(endPoint.x - startPoint.x) * 0.22));
      const ctrlX = (startPoint.x + endPoint.x) * 0.5;
      const ctrlY = Math.min(startPoint.y, endPoint.y) - lift;

      // Discretize quadratic Bezier into 16 deterministic waypoints for smooth particle sampling
      for (let s = 0; s <= 16; s++) {
        const t = s / 16;
        const omt = 1 - t;
        waypoints.push({
          x: omt * omt * startPoint.x + 2 * omt * t * ctrlX + t * t * endPoint.x,
          y: omt * omt * startPoint.y + 2 * omt * t * ctrlY + t * t * endPoint.y,
        });
      }
      svgPath = `M ${startPoint.x.toFixed(1)} ${startPoint.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endPoint.x.toFixed(1)} ${endPoint.y.toFixed(1)}`;
    } else if (
      conn.kind === "laser-scan" ||
      conn.kind === "veto-slash" ||
      conn.kind === "dimension-line"
    ) {
      const dimOffset = conn.kind === "dimension-line" ? -20 : 0;
      const sPt = { x: startPoint.x, y: startPoint.y + dimOffset };
      const ePt = { x: endPoint.x, y: endPoint.y + dimOffset };
      waypoints = [sPt, ePt];
      svgPath = `M ${sPt.x.toFixed(1)} ${sPt.y.toFixed(1)} L ${ePt.x.toFixed(1)} ${ePt.y.toFixed(1)}`;
    } else {
      // Orthogonal Manhattan routing for flow-pipe and guillotine-cut
      if (
        (fromPort === "east" && toPort === "west") ||
        (fromPort === "west" && toPort === "east")
      ) {
        if (Math.abs(startPoint.y - endPoint.y) < 6) {
          waypoints = [startPoint, endPoint];
        } else {
          const midX = (startPoint.x + endPoint.x) * 0.5;
          waypoints = [
            startPoint,
            { x: midX, y: startPoint.y },
            { x: midX, y: endPoint.y },
            endPoint,
          ];
        }
      } else if (
        (fromPort === "south" && toPort === "north") ||
        (fromPort === "north" && toPort === "south")
      ) {
        if (Math.abs(startPoint.x - endPoint.x) < 6) {
          waypoints = [startPoint, endPoint];
        } else {
          const midY = (startPoint.y + endPoint.y) * 0.5;
          waypoints = [
            startPoint,
            { x: startPoint.x, y: midY },
            { x: endPoint.x, y: midY },
            endPoint,
          ];
        }
      } else if (fromPort === "east" || fromPort === "west") {
        waypoints = [
          startPoint,
          { x: endPoint.x, y: startPoint.y },
          endPoint,
        ];
      } else {
        waypoints = [
          startPoint,
          { x: startPoint.x, y: endPoint.y },
          endPoint,
        ];
      }
      svgPath = buildRoundedOrthogonalSvgPath(waypoints, 16);
    }

    const sampledMid = samplePointAlongWaypoints(waypoints, 0.5);
    let approxLengthPx = 0;
    for (let k = 0; k < waypoints.length - 1; k++) {
      approxLengthPx += Math.hypot(
        waypoints[k + 1].x - waypoints[k].x,
        waypoints[k + 1].y - waypoints[k].y
      );
    }

    // Solve non-colliding connector badge rect if label or metricBadge is present
    let badgeRect: Rect2D | undefined;
    const textLabel = conn.metricBadge ?? conn.label;
    if (textLabel) {
      const estW = Math.min(240, Math.max(96, textLabel.length * 7.8 + 26));
      const estH = 28;
      let candidate: Rect2D = clampRectInsideStage(
        {
          x: sampledMid.point.x - estW * 0.5,
          y: sampledMid.point.y - estH - 10,
          width: estW,
          height: estH,
        },
        stageBounds
      );

      // Push candidate clear of existing connector badges and tight actor centers
      for (let step = 0; step < 8; step++) {
        let hit = false;
        for (let b = 0; b < badgeBoxes.length; b++) {
          if (rectsOverlapWithGap(candidate, badgeBoxes[b], 6)) {
            candidate = clampRectInsideStage(
              { ...candidate, y: badgeBoxes[b].y - estH - 8 },
              stageBounds
            );
            hit = true;
          }
        }
        // Keep badge off actor top title bars
        for (let a = 0; a < allActorRects.length; a++) {
          const titleBar: Rect2D = {
            x: allActorRects[a].x,
            y: allActorRects[a].y,
            width: allActorRects[a].width,
            height: 44,
          };
          if (rectsOverlapWithGap(candidate, titleBar, 4)) {
            candidate = clampRectInsideStage(
              { ...candidate, y: titleBar.y + titleBar.height + 6 },
              stageBounds
            );
            hit = true;
          }
        }
        if (!hit) break;
      }

      badgeBoxes.push(candidate);
      badgeRect = candidate;
    }

    results.push({
      id: conn.id,
      connector: conn,
      fromPort,
      toPort,
      startPoint,
      endPoint,
      midPoint: sampledMid.point,
      tangentDeg: sampledMid.tangentDeg,
      waypoints,
      svgPath,
      approxLengthPx: Math.max(1, approxLengthPx),
      badgeRect,
    });
  }

  return results;
}

/**
 * Main Entry Point: Solves spatial layout, collision-free AABBs, connector paths,
 * and auto-injected Reading Room cinema polish for any SceneBlueprint.
 */
export function solveSceneBlueprintLayout(
  blueprint: SceneBlueprint,
  options: SpatialSolveOptions = {}
): SolvedSceneLayout {
  const canvasWidth = options.canvasWidth ?? 1920;
  const canvasHeight = options.canvasHeight ?? 1080;
  const safeMarginPx = options.safeMarginPx ?? 96;
  const surfaceMode: BlueprintSurfaceMode =
    options.surfaceMode ?? blueprint.surfaceMode ?? "page";
  const overFootagePlacement: OverFootagePlacement =
    options.overFootagePlacement ?? blueprint.overFootagePlacement ?? "right-third";

  const envelope = resolveStageEnvelope(
    canvasWidth,
    canvasHeight,
    safeMarginPx,
    surfaceMode,
    overFootagePlacement
  );

  const zoneRects = resolveOccupiedZoneRects(
    envelope.activeStageRect,
    blueprint.actors,
    envelope.compactMode,
    overFootagePlacement,
    surfaceMode
  );

  // Group actors by zone preserving author declaration order
  const groupedByZone: Record<SemanticZone, BlueprintActor[]> = {
    "top-header": [],
    "bottom-ledger": [],
    "left-stage": [],
    "center-hero": [],
    "right-stage": [],
    "split-left": [],
    "split-right": [],
  };
  for (let i = 0; i < blueprint.actors.length; i++) {
    const actor = blueprint.actors[i];
    groupedByZone[actor.zone].push(actor);
  }

  const initialSeedBoxes: Array<{
    actor: BlueprintActor;
    rect: Rect2D;
    anchorWeight: number;
  }> = [];

  const allZones: SemanticZone[] = [
    "top-header",
    "left-stage",
    "split-left",
    "center-hero",
    "split-right",
    "right-stage",
    "bottom-ledger",
  ];

  for (let z = 0; z < allZones.length; z++) {
    const zoneName = allZones[z];
    const list = groupedByZone[zoneName];
    if (list.length === 0) continue;
    const subRects = subdivideZoneForActors(
      zoneName,
      zoneRects[zoneName],
      list,
      envelope.compactMode
    );
    for (let k = 0; k < list.length; k++) {
      initialSeedBoxes.push({
        actor: list[k],
        rect: subRects[k],
        anchorWeight: zoneName === "center-hero" ? 1.8 : 1.0,
      });
    }
  }

  const minGapPx = envelope.compactMode ? 12 : 22;
  const collisionSolved = solveActorCollisionsAABB(
    initialSeedBoxes.map((b) => ({ rect: b.rect, anchorWeight: b.anchorWeight })),
    envelope.activeStageRect,
    minGapPx
  );

  // Sort spatial reading order (top-to-bottom bands, left-to-right) for deterministic staggered entries
  const readingOrderIndices = initialSeedBoxes
    .map((_, idx) => idx)
    .sort((ia, ib) => {
      const ra = collisionSolved.rects[ia];
      const rb = collisionSolved.rects[ib];
      const rowDiff = Math.round((ra.y - rb.y) / 90);
      if (rowDiff !== 0) return rowDiff;
      return ra.x - rb.x;
    });

  const staggerStep = blueprint.polish?.staggerFrames ?? 5;
  const rankMap: Record<number, number> = {};
  for (let r = 0; r < readingOrderIndices.length; r++) {
    rankMap[readingOrderIndices[r]] = r;
  }

  // Auto-select chisel highlight targets if none explicitly specified
  const explicitChiselIds: string[] = blueprint.polish?.chiselHighlightIds
    ? [...blueprint.polish.chiselHighlightIds]
    : [];
  for (let i = 0; i < blueprint.actors.length; i++) {
    const a = blueprint.actors[i];
    if (
      (a.chiselHighlight || a.metricCounter?.highlightChisel) &&
      explicitChiselIds.indexOf(a.id) === -1
    ) {
      explicitChiselIds.push(a.id);
    }
  }
  if (explicitChiselIds.length === 0 && blueprint.actors.length > 0) {
    // Highlight primary metric-counter or center-hero actor automatically!
    const counterActor = blueprint.actors.find((a) => a.kind === "metric-counter");
    const heroActor = blueprint.actors.find((a) => a.zone === "center-hero");
    const chosen = counterActor ?? heroActor ?? blueprint.actors[0];
    explicitChiselIds.push(chosen.id);
  }

  const solvedActors: SolvedActorLayout[] = [];
  const actorMap: Record<string, SolvedActorLayout> = {};

  for (let i = 0; i < initialSeedBoxes.length; i++) {
    const item = initialSeedBoxes[i];
    const rect = collisionSolved.rects[i];
    const enterDelayFrames =
      item.actor.enterAtProgress !== undefined
        ? Math.round(item.actor.enterAtProgress * (blueprint.durationFrames ?? 180))
        : 3 + (rankMap[i] ?? i) * staggerStep;

    const layout: SolvedActorLayout = {
      id: item.actor.id,
      actor: item.actor,
      zone: item.actor.zone,
      rect,
      ports: computePorts(rect),
      enterDelayFrames,
      anchorWeight: item.anchorWeight,
      hasChiselHighlight: explicitChiselIds.indexOf(item.actor.id) !== -1,
    };
    solvedActors.push(layout);
    actorMap[layout.id] = layout;
  }

  const solvedConnectors = routeBlueprintConnectors(
    blueprint.connectors ?? [],
    actorMap,
    collisionSolved.rects,
    envelope.activeStageRect
  );

  const epTag = blueprint.episode
    ? `EP.${String(blueprint.episode).padStart(2, "0")}`
    : "MECHANISM LAB";

  const polish: SolvedPolishPlan = {
    mastheadEyebrow:
      blueprint.polish?.mastheadEyebrow ?? `${epTag} · READING ROOM CONTRAPTION`,
    mastheadTitle: blueprint.polish?.mastheadTitle ?? blueprint.title,
    mastheadSubtitle: blueprint.subtitle,
    mastheadFolio:
      blueprint.polish?.mastheadFolio ??
      `PLATE ${blueprint.id.slice(0, 18).toUpperCase()}`,
    sourceCitation: blueprint.polish?.sourceCitation,
    sourceDocRef: blueprint.polish?.sourceDocRef,
    enableCameraPush: blueprint.polish?.enableCameraPush ?? true,
    cameraPushScale: blueprint.polish?.cameraPushScale ?? 1.024,
    staggerFrames: staggerStep,
    chiselHighlightIds: explicitChiselIds,
  };

  return {
    canvasRect: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
    outerSafeRect: envelope.outerSafeRect,
    glassContainerRect: envelope.glassContainerRect,
    mastheadRect: envelope.mastheadRect,
    activeStageRect: envelope.activeStageRect,
    surfaceMode,
    overFootagePlacement,
    compactMode: envelope.compactMode,
    actors: solvedActors,
    actorMap,
    connectors: solvedConnectors,
    polish,
    residualOverlapCount: collisionSolved.residualOverlaps,
  };
}
